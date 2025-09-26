from typing import ClassVar as _ClassVar
from typing import Iterable as _Iterable
from typing import Mapping as _Mapping
from typing import Optional as _Optional
from typing import Union as _Union

from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from google.protobuf.internal import containers as _containers

from . import event_core_pb2 as _event_core_pb2
from . import event_descriptor_pb2 as _event_descriptor_pb2

DESCRIPTOR: _descriptor.FileDescriptor

class GossipEvent(_message.Message):
    __slots__ = ("event_core", "signature", "transactions", "parents")
    EVENT_CORE_FIELD_NUMBER: _ClassVar[int]
    SIGNATURE_FIELD_NUMBER: _ClassVar[int]
    TRANSACTIONS_FIELD_NUMBER: _ClassVar[int]
    PARENTS_FIELD_NUMBER: _ClassVar[int]
    event_core: _event_core_pb2.EventCore
    signature: bytes
    transactions: _containers.RepeatedScalarFieldContainer[bytes]
    parents: _containers.RepeatedCompositeFieldContainer[
        _event_descriptor_pb2.EventDescriptor
    ]
    def __init__(
        self,
        event_core: _Optional[_Union[_event_core_pb2.EventCore, _Mapping]] = ...,
        signature: _Optional[bytes] = ...,
        transactions: _Optional[_Iterable[bytes]] = ...,
        parents: _Optional[
            _Iterable[_Union[_event_descriptor_pb2.EventDescriptor, _Mapping]]
        ] = ...,
    ) -> None: ...
