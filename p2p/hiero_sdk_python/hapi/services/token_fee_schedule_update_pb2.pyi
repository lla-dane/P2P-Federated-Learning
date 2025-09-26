from typing import ClassVar as _ClassVar
from typing import Iterable as _Iterable
from typing import Mapping as _Mapping
from typing import Optional as _Optional
from typing import Union as _Union

from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from google.protobuf.internal import containers as _containers

from . import basic_types_pb2 as _basic_types_pb2
from . import custom_fees_pb2 as _custom_fees_pb2

DESCRIPTOR: _descriptor.FileDescriptor

class TokenFeeScheduleUpdateTransactionBody(_message.Message):
    __slots__ = ("token_id", "custom_fees")
    TOKEN_ID_FIELD_NUMBER: _ClassVar[int]
    CUSTOM_FEES_FIELD_NUMBER: _ClassVar[int]
    token_id: _basic_types_pb2.TokenID
    custom_fees: _containers.RepeatedCompositeFieldContainer[_custom_fees_pb2.CustomFee]
    def __init__(
        self,
        token_id: _Optional[_Union[_basic_types_pb2.TokenID, _Mapping]] = ...,
        custom_fees: _Optional[
            _Iterable[_Union[_custom_fees_pb2.CustomFee, _Mapping]]
        ] = ...,
    ) -> None: ...
