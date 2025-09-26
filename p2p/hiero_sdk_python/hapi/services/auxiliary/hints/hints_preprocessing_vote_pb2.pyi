from typing import ClassVar as _ClassVar
from typing import Mapping as _Mapping
from typing import Optional as _Optional
from typing import Union as _Union

from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message

from ...state.hints import hints_types_pb2 as _hints_types_pb2

DESCRIPTOR: _descriptor.FileDescriptor

class HintsPreprocessingVoteTransactionBody(_message.Message):
    __slots__ = ("construction_id", "vote")
    CONSTRUCTION_ID_FIELD_NUMBER: _ClassVar[int]
    VOTE_FIELD_NUMBER: _ClassVar[int]
    construction_id: int
    vote: _hints_types_pb2.PreprocessingVote
    def __init__(
        self,
        construction_id: _Optional[int] = ...,
        vote: _Optional[_Union[_hints_types_pb2.PreprocessingVote, _Mapping]] = ...,
    ) -> None: ...
