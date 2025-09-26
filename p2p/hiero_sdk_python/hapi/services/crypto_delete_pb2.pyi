from typing import ClassVar as _ClassVar
from typing import Mapping as _Mapping
from typing import Optional as _Optional
from typing import Union as _Union

from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message

from . import basic_types_pb2 as _basic_types_pb2

DESCRIPTOR: _descriptor.FileDescriptor

class CryptoDeleteTransactionBody(_message.Message):
    __slots__ = ("transferAccountID", "deleteAccountID")
    TRANSFERACCOUNTID_FIELD_NUMBER: _ClassVar[int]
    DELETEACCOUNTID_FIELD_NUMBER: _ClassVar[int]
    transferAccountID: _basic_types_pb2.AccountID
    deleteAccountID: _basic_types_pb2.AccountID
    def __init__(
        self,
        transferAccountID: _Optional[
            _Union[_basic_types_pb2.AccountID, _Mapping]
        ] = ...,
        deleteAccountID: _Optional[_Union[_basic_types_pb2.AccountID, _Mapping]] = ...,
    ) -> None: ...
