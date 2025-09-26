from typing import ClassVar as _ClassVar
from typing import Iterable as _Iterable
from typing import Mapping as _Mapping
from typing import Optional as _Optional
from typing import Union as _Union

from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from google.protobuf.internal import containers as _containers

from . import basic_types_pb2 as _basic_types_pb2

DESCRIPTOR: _descriptor.FileDescriptor

class CryptoDeleteAllowanceTransactionBody(_message.Message):
    __slots__ = ("nftAllowances",)
    NFTALLOWANCES_FIELD_NUMBER: _ClassVar[int]
    nftAllowances: _containers.RepeatedCompositeFieldContainer[NftRemoveAllowance]
    def __init__(
        self,
        nftAllowances: _Optional[_Iterable[_Union[NftRemoveAllowance, _Mapping]]] = ...,
    ) -> None: ...

class NftRemoveAllowance(_message.Message):
    __slots__ = ("token_id", "owner", "serial_numbers")
    TOKEN_ID_FIELD_NUMBER: _ClassVar[int]
    OWNER_FIELD_NUMBER: _ClassVar[int]
    SERIAL_NUMBERS_FIELD_NUMBER: _ClassVar[int]
    token_id: _basic_types_pb2.TokenID
    owner: _basic_types_pb2.AccountID
    serial_numbers: _containers.RepeatedScalarFieldContainer[int]
    def __init__(
        self,
        token_id: _Optional[_Union[_basic_types_pb2.TokenID, _Mapping]] = ...,
        owner: _Optional[_Union[_basic_types_pb2.AccountID, _Mapping]] = ...,
        serial_numbers: _Optional[_Iterable[int]] = ...,
    ) -> None: ...
