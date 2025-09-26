from typing import ClassVar as _ClassVar
from typing import Iterable as _Iterable
from typing import Mapping as _Mapping
from typing import Optional as _Optional
from typing import Union as _Union

from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from google.protobuf.internal import containers as _containers

from . import basic_types_pb2 as _basic_types_pb2
from . import query_header_pb2 as _query_header_pb2
from . import response_header_pb2 as _response_header_pb2

DESCRIPTOR: _descriptor.FileDescriptor

class CryptoGetStakersQuery(_message.Message):
    __slots__ = ("header", "accountID")
    HEADER_FIELD_NUMBER: _ClassVar[int]
    ACCOUNTID_FIELD_NUMBER: _ClassVar[int]
    header: _query_header_pb2.QueryHeader
    accountID: _basic_types_pb2.AccountID
    def __init__(
        self,
        header: _Optional[_Union[_query_header_pb2.QueryHeader, _Mapping]] = ...,
        accountID: _Optional[_Union[_basic_types_pb2.AccountID, _Mapping]] = ...,
    ) -> None: ...

class ProxyStaker(_message.Message):
    __slots__ = ("accountID", "amount")
    ACCOUNTID_FIELD_NUMBER: _ClassVar[int]
    AMOUNT_FIELD_NUMBER: _ClassVar[int]
    accountID: _basic_types_pb2.AccountID
    amount: int
    def __init__(
        self,
        accountID: _Optional[_Union[_basic_types_pb2.AccountID, _Mapping]] = ...,
        amount: _Optional[int] = ...,
    ) -> None: ...

class AllProxyStakers(_message.Message):
    __slots__ = ("accountID", "proxyStaker")
    ACCOUNTID_FIELD_NUMBER: _ClassVar[int]
    PROXYSTAKER_FIELD_NUMBER: _ClassVar[int]
    accountID: _basic_types_pb2.AccountID
    proxyStaker: _containers.RepeatedCompositeFieldContainer[ProxyStaker]
    def __init__(
        self,
        accountID: _Optional[_Union[_basic_types_pb2.AccountID, _Mapping]] = ...,
        proxyStaker: _Optional[_Iterable[_Union[ProxyStaker, _Mapping]]] = ...,
    ) -> None: ...

class CryptoGetStakersResponse(_message.Message):
    __slots__ = ("header", "stakers")
    HEADER_FIELD_NUMBER: _ClassVar[int]
    STAKERS_FIELD_NUMBER: _ClassVar[int]
    header: _response_header_pb2.ResponseHeader
    stakers: AllProxyStakers
    def __init__(
        self,
        header: _Optional[_Union[_response_header_pb2.ResponseHeader, _Mapping]] = ...,
        stakers: _Optional[_Union[AllProxyStakers, _Mapping]] = ...,
    ) -> None: ...
