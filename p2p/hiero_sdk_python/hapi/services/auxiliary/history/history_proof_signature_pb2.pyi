from typing import ClassVar as _ClassVar
from typing import Mapping as _Mapping
from typing import Optional as _Optional
from typing import Union as _Union

from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message

from ...state.history import history_types_pb2 as _history_types_pb2

DESCRIPTOR: _descriptor.FileDescriptor

class HistoryProofSignatureTransactionBody(_message.Message):
    __slots__ = ("construction_id", "signature")
    CONSTRUCTION_ID_FIELD_NUMBER: _ClassVar[int]
    SIGNATURE_FIELD_NUMBER: _ClassVar[int]
    construction_id: int
    signature: _history_types_pb2.HistorySignature
    def __init__(
        self,
        construction_id: _Optional[int] = ...,
        signature: _Optional[
            _Union[_history_types_pb2.HistorySignature, _Mapping]
        ] = ...,
    ) -> None: ...
