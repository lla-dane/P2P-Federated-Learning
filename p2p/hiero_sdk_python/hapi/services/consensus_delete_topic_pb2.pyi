from typing import ClassVar as _ClassVar
from typing import Mapping as _Mapping
from typing import Optional as _Optional
from typing import Union as _Union

from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message

from . import basic_types_pb2 as _basic_types_pb2

DESCRIPTOR: _descriptor.FileDescriptor

class ConsensusDeleteTopicTransactionBody(_message.Message):
    __slots__ = ("topicID",)
    TOPICID_FIELD_NUMBER: _ClassVar[int]
    topicID: _basic_types_pb2.TopicID
    def __init__(
        self, topicID: _Optional[_Union[_basic_types_pb2.TopicID, _Mapping]] = ...
    ) -> None: ...
