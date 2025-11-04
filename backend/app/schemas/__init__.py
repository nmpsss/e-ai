"""
Pydantic Schemas模块
用于数据验证和序列化
"""
from .user import (
    UserCreate,
    UserLogin,
    UserResponse,
    UserUpdate,
    Token,
    TokenData
)
from .conversation import (
    ConversationCreate,
    ConversationUpdate,
    ConversationResponse,
    ConversationListResponse
)
from .message import (
    MessageCreate,
    MessageResponse,
    ChatRequest,
    ChatResponse
)

__all__ = [
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "UserUpdate",
    "Token",
    "TokenData",
    "ConversationCreate",
    "ConversationUpdate",
    "ConversationResponse",
    "ConversationListResponse",
    "MessageCreate",
    "MessageResponse",
    "ChatRequest",
    "ChatResponse",
]
