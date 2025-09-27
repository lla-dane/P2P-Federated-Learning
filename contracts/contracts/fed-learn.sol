// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract FederatedTrainingReward {
    uint256 public taskCount;
    uint256 public count = 0;
    address public owner;

    mapping(uint256 => string []) public taskWeights;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not contract owner");
        _;
    }

    mapping(address => bool) public whitelist;

    event Whitelisted(address indexed account, bool status);

    function addToWhitelist(address _account) external onlyOwner {
        whitelist[_account] = true;
        emit Whitelisted(_account, true);
    }

    function removeFromWhitelist(address _account) external onlyOwner {
        whitelist[_account] = false;
        emit Whitelisted(_account, false);
    }

    function isWhitelisted(address _account) external view returns (bool) {
        return whitelist[_account];
    }

    function getCount() public view returns (uint256) {
        return count;
    }

    function getTaskId() public view returns (uint256) {
        return taskCount;
    }

    function taskExists(uint256 taskId) public view returns (bool) {
        return tasks[taskId].exists;
    }

    function incrementCount() public {
        count += 1;
    }

    struct Task {
        address payable depositor;
        string modelUrl; // Akave url of model
        string datasetUrl; // Akave url of dataset
        uint256 numChunks; // total number of chunks
        uint256 remainingChunks; // how many chunk-rewards remain
        uint256 perChunkReward; // hbar per chunk
        bool exists;
    }

    // taskId => Task
    mapping(uint256 => Task) public tasks;
    // pending withdrawals for trainers if transfers fail or for refunds
    mapping(address => uint256) public pendingWithdrawals;

    /// @dev emitted when a task is created
    event TaskCreated(
        uint256 indexed taskId,
        address indexed depositor,
        string modelUrl,
        string datasetUrl,
        uint256 numChunks,
        uint256 totalReward
    );


    event TaskCompleted(uint256 indexed taskId);

    /// @dev emitted when a trainer publishes weights and receives reward (or credited)
    event WeightsSubmitted(
        uint256 indexed taskId,
        address indexed trainer,
        string weight_hash_1,
        string weight_hash_2,
        string weight_hash_3,
        uint256 rewardAmount,
        uint256 remainingChunks
    );

    /// @dev emitted when someone withdraws pending balance
    event Withdrawn(address indexed who, uint256 amount);

    /// @notice Create a new training task and deposit reward funds.
    /// @param modelUrl akave url of the model (string)
    /// @param datasetUrl akave url of the dataset (string)
    /// @param numChunks Number of chunks the dataset is divided into (must be > 0)
    /// Requirements: msg.value must be > 0 and divisible by numChunks to ensure exact per-chunk reward.
    function createTask(
        string calldata modelUrl,
        string calldata datasetUrl,
        uint256 numChunks
    ) external payable returns (uint256) {
        require(numChunks > 0, "numChunks must be > 0");
        require(msg.value > 0, "deposit required");

        taskCount += 1;
        uint256 taskId = taskCount;

        uint256 perChunk = msg.value / numChunks;

        tasks[taskId] = Task({
            depositor: payable(msg.sender),
            modelUrl: modelUrl,
            datasetUrl: datasetUrl,
            numChunks: numChunks,
            remainingChunks: numChunks,
            perChunkReward: perChunk,
            exists: true
        });

        emit TaskCreated(
            taskId,
            msg.sender,
            modelUrl,
            datasetUrl,
            numChunks,
            msg.value
        );
        return taskId;
    }

    /// @notice Trainer submits final weights (Encrypted url hash) for a task and claims the per-chunk reward.
    /// Rewards are paid out immediately if the transfer succeeds,
    /// otherwise credited to pendingWithdrawals which can be withdrawn with withdrawPending().
    /// @param taskId The id of the task
    /// @param weight_hash_1 Encrypted url hash of the published weights
    /// @param weight_hash_2 Encrypted url hash of the published weights
    /// @param weight_hash_3 Encrypted url hash of the published weights
    function submitWeights(
        uint256 taskId,
        string calldata weight_hash_1,
        string calldata weight_hash_2,
        string calldata weight_hash_3
    ) external {
        Task storage t = tasks[taskId];
        require(t.exists, "task does not exist");
        require(t.remainingChunks > 0, "no rewards remaining for this task");
        require(whitelist[msg.sender], "not whitelisted");

        t.remainingChunks -= 1;

        uint256 reward = t.perChunkReward;

        // attempt to send reward; if it fails, credit pendingWithdrawals
        (bool sent, ) = payable(msg.sender).call{value: reward}("");
        if (!sent) {
            // credit so trainer can withdraw later
            pendingWithdrawals[msg.sender] += reward;
        }

        emit WeightsSubmitted(
            taskId,
            msg.sender,
            weight_hash_1,
            weight_hash_2,
            weight_hash_3,
            reward,
            t.remainingChunks
        );

        if (t.remainingChunks == 0){
            emit TaskCompleted(taskId);
            tasks[taskId].exists=false;
        }
        
    }

    /// @notice Withdraw any pending balance credited to the caller (e.g., failed transfers)
    function withdrawPending() external {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "no pending balance");
        pendingWithdrawals[msg.sender] = 0;

        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "withdraw transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    /// @notice Cancel a task and refund remaining funds to depositor.
    /// Only allowed if no submissions have happened (i.e., remainingChunks == numChunks).
    /// This protects trainers' expectations once submissions begin.
    /// @param taskId id of the task to cancel
    function cancelTask(uint256 taskId) external {
        Task storage t = tasks[taskId];
        require(t.exists, "task does not exist");
        require(msg.sender == t.depositor, "only depositor can cancel");
        require(
            t.remainingChunks == t.numChunks,
            "cannot cancel after submissions started"
        );

        uint256 refund = t.perChunkReward * t.remainingChunks;
        // delete task to free storage
        delete tasks[taskId];

        (bool sent, ) = t.depositor.call{value: refund}("");
        require(sent, "refund transfer failed");
    }

    /// @notice Allow contract to accept ETH deposits (not used directly by this contract logic)
    receive() external payable {}

    function setPendingWithdrawal(address _address, uint256 _amount) public {
        pendingWithdrawals[_address] = _amount;
    }

    fallback() external payable {}
}