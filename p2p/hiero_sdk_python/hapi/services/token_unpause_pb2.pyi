from typing import ClassVar as _ClassVar
from typing import Mapping as _Mapping
from typing import Optional as _Optional
from typing import Union as _Union

from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message

from . import basic_types_pb2 as _basic_types_pb2

DESCRIPTOR: _descriptor.FileDescriptor

class TokenUnpauseTransactionBody(_message.Message):
    __slots__ = ("token",)
    TOKEN_FIELD_NUMBER: _ClassVar[int]
    token: _basic_types_pb2.TokenID
    def __init__(
        self, token: _Optional[_Union[_basic_types_pb2.TokenID, _Mapping]] = ...
    ) -> None: ...
