from typing import ClassVar as _ClassVar
from typing import Optional as _Optional

from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message

from ...state.hints import hints_types_pb2 as _hints_types_pb2

DESCRIPTOR: _descriptor.FileDescriptor

class HintsKeyPublicationTransactionBody(_message.Message):
    __slots__ = ("party_id", "num_parties", "hints_key")
    PARTY_ID_FIELD_NUMBER: _ClassVar[int]
    NUM_PARTIES_FIELD_NUMBER: _ClassVar[int]
    HINTS_KEY_FIELD_NUMBER: _ClassVar[int]
    party_id: int
    num_parties: int
    hints_key: bytes
    def __init__(
        self,
        party_id: _Optional[int] = ...,
        num_parties: _Optional[int] = ...,
        hints_key: _Optional[bytes] = ...,
    ) -> None: ...
