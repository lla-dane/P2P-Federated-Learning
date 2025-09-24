// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;


/// @title Federated Training Reward Contract
/// @notice Create a training task by providing IPFS hashes for model & dataset, number of chunks, and depositing reward funds.
/// Trainers publish final weights (IPFS hash) and receive reward = totalDeposit / numChunks per accepted submission.
contract FederatedTrainingReward {
uint256 public taskCount;


struct Task {
address payable depositor;
string modelHash; // IPFS hash of model
string datasetHash; // IPFS hash of dataset
uint256 numChunks; // total number of chunks
uint256 remainingChunks; // how many chunk-rewards remain
uint256 perChunkReward; // wei per chunk
bool exists;
}

// taskId => Task
mapping(uint256 => Task) public tasks;
// taskId => trainer address => hasSubmitted
mapping(uint256 => mapping(address => bool)) public hasSubmitted;
// pending withdrawals for trainers if transfers fail or for refunds
mapping(address => uint256) public pendingWithdrawals;


/// @dev emitted when a task is created
event TaskCreated(
uint256 indexed taskId,
address indexed depositor,
string modelHash,
string datasetHash,
uint256 numChunks,
uint256 totalReward
);


/// @dev emitted when a trainer publishes weights and receives reward (or credited)
event WeightsSubmitted(
uint256 indexed taskId,
address indexed trainer,
string weightsHash,
uint256 rewardAmount,
uint256 remainingChunks
);


/// @dev emitted when someone withdraws pending balance
event Withdrawn(address indexed who, uint256 amount);


/// @notice Create a new training task and deposit reward funds.
/// @param modelHash IPFS hash of the model (string)
/// @param datasetHash IPFS hash of the dataset (string)
/// @param numChunks Number of chunks the dataset is divided into (must be > 0)
/// Requirements: msg.value must be > 0 and divisible by numChunks to ensure exact per-chunk reward.
function createTask(
string calldata modelHash,
string calldata datasetHash,
uint256 numChunks
) external payable returns (uint256) {
require(numChunks > 0, "numChunks must be > 0");
require(msg.value > 0, "deposit required");
require(msg.value % numChunks == 0, "deposit must be divisible by numChunks");


taskCount += 1;
uint256 taskId = taskCount;


uint256 perChunk = msg.value / numChunks;


tasks[taskId] = Task({
depositor: payable(msg.sender),
modelHash: modelHash,
datasetHash: datasetHash,
numChunks: numChunks,
remainingChunks: numChunks,
perChunkReward: perChunk,
exists: true
});


emit TaskCreated(taskId, msg.sender, modelHash, datasetHash, numChunks, msg.value);
return taskId;
}

/// @notice Trainer submits final weights (IPFS hash) for a task and claims the per-chunk reward.
/// Each address can only submit once per task. Rewards are paid out immediately if the transfer succeeds,
/// otherwise credited to pendingWithdrawals which can be withdrawn with withdrawPending().
/// @param taskId The id of the task
/// @param weightsHash IPFS hash of the published weights
function submitWeights(uint256 taskId, string calldata weightsHash) external {
Task storage t = tasks[taskId];
require(t.exists, "task does not exist");
require(t.remainingChunks > 0, "no rewards remaining for this task");
require(!hasSubmitted[taskId][msg.sender], "already submitted for this task");


// mark as submitted first to avoid reentrancy issues
hasSubmitted[taskId][msg.sender] = true;
t.remainingChunks -= 1;


uint256 reward = t.perChunkReward;


// attempt to send reward; if it fails, credit pendingWithdrawals
(bool sent, ) = payable(msg.sender).call{value: reward}('');
if (!sent) {
// credit so trainer can withdraw later
pendingWithdrawals[msg.sender] += reward;
}


emit WeightsSubmitted(taskId, msg.sender, weightsHash, reward, t.remainingChunks);
}


/// @notice Withdraw any pending balance credited to the caller (e.g., failed transfers)
function withdrawPending() external {
uint256 amount = pendingWithdrawals[msg.sender];
require(amount > 0, "no pending balance");
pendingWithdrawals[msg.sender] = 0;


(bool sent, ) = payable(msg.sender).call{value: amount}('');
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
require(t.remainingChunks == t.numChunks, "cannot cancel after submissions started");


uint256 refund = t.perChunkReward * t.remainingChunks;
// delete task to free storage
delete tasks[taskId];


(bool sent, ) = t.depositor.call{value: refund}('');
require(sent, "refund transfer failed");
}


/// @notice Allow contract to accept ETH deposits (not used directly by this contract logic)
receive() external payable {}

function setPendingWithdrawal(address _address, uint256 _amount) public {
    pendingWithdrawals[_address] = _amount;
}




fallback() external payable {}
}