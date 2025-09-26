from typing import ClassVar as _ClassVar
from typing import Mapping as _Mapping
from typing import Optional as _Optional
from typing import Union as _Union

from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message

from . import basic_types_pb2 as _basic_types_pb2

DESCRIPTOR: _descriptor.FileDescriptor

class SignedTransaction(_message.Message):
    __slots__ = ("bodyBytes", "sigMap")
    BODYBYTES_FIELD_NUMBER: _ClassVar[int]
    SIGMAP_FIELD_NUMBER: _ClassVar[int]
    bodyBytes: bytes
    sigMap: _basic_types_pb2.SignatureMap
    def __init__(
        self,
        bodyBytes: _Optional[bytes] = ...,
        sigMap: _Optional[_Union[_basic_types_pb2.SignatureMap, _Mapping]] = ...,
    ) -> None: ...
