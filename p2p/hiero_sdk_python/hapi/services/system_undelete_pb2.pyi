from typing import ClassVar as _ClassVar
from typing import Mapping as _Mapping
from typing import Optional as _Optional
from typing import Union as _Union

from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message

from . import basic_types_pb2 as _basic_types_pb2

DESCRIPTOR: _descriptor.FileDescriptor

class SystemUndeleteTransactionBody(_message.Message):
    __slots__ = ("fileID", "contractID")
    FILEID_FIELD_NUMBER: _ClassVar[int]
    CONTRACTID_FIELD_NUMBER: _ClassVar[int]
    fileID: _basic_types_pb2.FileID
    contractID: _basic_types_pb2.ContractID
    def __init__(
        self,
        fileID: _Optional[_Union[_basic_types_pb2.FileID, _Mapping]] = ...,
        contractID: _Optional[_Union[_basic_types_pb2.ContractID, _Mapping]] = ...,
    ) -> None: ...
