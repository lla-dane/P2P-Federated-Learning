from typing import ClassVar as _ClassVar
from typing import Mapping as _Mapping
from typing import Optional as _Optional
from typing import Union as _Union

from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from google.protobuf import wrappers_pb2 as _wrappers_pb2

from . import basic_types_pb2 as _basic_types_pb2
from . import duration_pb2 as _duration_pb2
from . import timestamp_pb2 as _timestamp_pb2

DESCRIPTOR: _descriptor.FileDescriptor

class CryptoUpdateTransactionBody(_message.Message):
    __slots__ = (
        "accountIDToUpdate",
        "key",
        "proxyAccountID",
        "proxyFraction",
        "sendRecordThreshold",
        "sendRecordThresholdWrapper",
        "receiveRecordThreshold",
        "receiveRecordThresholdWrapper",
        "autoRenewPeriod",
        "expirationTime",
        "receiverSigRequired",
        "receiverSigRequiredWrapper",
        "memo",
        "max_automatic_token_associations",
        "staked_account_id",
        "staked_node_id",
        "decline_reward",
    )
    ACCOUNTIDTOUPDATE_FIELD_NUMBER: _ClassVar[int]
    KEY_FIELD_NUMBER: _ClassVar[int]
    PROXYACCOUNTID_FIELD_NUMBER: _ClassVar[int]
    PROXYFRACTION_FIELD_NUMBER: _ClassVar[int]
    SENDRECORDTHRESHOLD_FIELD_NUMBER: _ClassVar[int]
    SENDRECORDTHRESHOLDWRAPPER_FIELD_NUMBER: _ClassVar[int]
    RECEIVERECORDTHRESHOLD_FIELD_NUMBER: _ClassVar[int]
    RECEIVERECORDTHRESHOLDWRAPPER_FIELD_NUMBER: _ClassVar[int]
    AUTORENEWPERIOD_FIELD_NUMBER: _ClassVar[int]
    EXPIRATIONTIME_FIELD_NUMBER: _ClassVar[int]
    RECEIVERSIGREQUIRED_FIELD_NUMBER: _ClassVar[int]
    RECEIVERSIGREQUIREDWRAPPER_FIELD_NUMBER: _ClassVar[int]
    MEMO_FIELD_NUMBER: _ClassVar[int]
    MAX_AUTOMATIC_TOKEN_ASSOCIATIONS_FIELD_NUMBER: _ClassVar[int]
    STAKED_ACCOUNT_ID_FIELD_NUMBER: _ClassVar[int]
    STAKED_NODE_ID_FIELD_NUMBER: _ClassVar[int]
    DECLINE_REWARD_FIELD_NUMBER: _ClassVar[int]
    accountIDToUpdate: _basic_types_pb2.AccountID
    key: _basic_types_pb2.Key
    proxyAccountID: _basic_types_pb2.AccountID
    proxyFraction: int
    sendRecordThreshold: int
    sendRecordThresholdWrapper: _wrappers_pb2.UInt64Value
    receiveRecordThreshold: int
    receiveRecordThresholdWrapper: _wrappers_pb2.UInt64Value
    autoRenewPeriod: _duration_pb2.Duration
    expirationTime: _timestamp_pb2.Timestamp
    receiverSigRequired: bool
    receiverSigRequiredWrapper: _wrappers_pb2.BoolValue
    memo: _wrappers_pb2.StringValue
    max_automatic_token_associations: _wrappers_pb2.Int32Value
    staked_account_id: _basic_types_pb2.AccountID
    staked_node_id: int
    decline_reward: _wrappers_pb2.BoolValue
    def __init__(
        self,
        accountIDToUpdate: _Optional[
            _Union[_basic_types_pb2.AccountID, _Mapping]
        ] = ...,
        key: _Optional[_Union[_basic_types_pb2.Key, _Mapping]] = ...,
        proxyAccountID: _Optional[_Union[_basic_types_pb2.AccountID, _Mapping]] = ...,
        proxyFraction: _Optional[int] = ...,
        sendRecordThreshold: _Optional[int] = ...,
        sendRecordThresholdWrapper: _Optional[
            _Union[_wrappers_pb2.UInt64Value, _Mapping]
        ] = ...,
        receiveRecordThreshold: _Optional[int] = ...,
        receiveRecordThresholdWrapper: _Optional[
            _Union[_wrappers_pb2.UInt64Value, _Mapping]
        ] = ...,
        autoRenewPeriod: _Optional[_Union[_duration_pb2.Duration, _Mapping]] = ...,
        expirationTime: _Optional[_Union[_timestamp_pb2.Timestamp, _Mapping]] = ...,
        receiverSigRequired: bool = ...,
        receiverSigRequiredWrapper: _Optional[
            _Union[_wrappers_pb2.BoolValue, _Mapping]
        ] = ...,
        memo: _Optional[_Union[_wrappers_pb2.StringValue, _Mapping]] = ...,
        max_automatic_token_associations: _Optional[
            _Union[_wrappers_pb2.Int32Value, _Mapping]
        ] = ...,
        staked_account_id: _Optional[
            _Union[_basic_types_pb2.AccountID, _Mapping]
        ] = ...,
        staked_node_id: _Optional[int] = ...,
        decline_reward: _Optional[_Union[_wrappers_pb2.BoolValue, _Mapping]] = ...,
    ) -> None: ...
