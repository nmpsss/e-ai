"""
消息相关的Pydantic Schemas
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class MessageCreate(BaseModel):
    """创建消息Schema"""
    conversation_id: int
    role: str  # user, assistant, system
    content: str
    tokens: Optional[int] = 0


class MessageResponse(BaseModel):
    """消息响应Schema"""
    id: int
    conversation_id: int
    role: str
    content: str
    tokens: int
    created_at: datetime

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    """聊天请求Schema"""
    conversation_id: Optional[int] = None  # 如果为None则创建新会话
    message: str
    model: Optional[str] = "gpt-3.5-turbo"
    stream: bool = False  # 是否使用流式响应


class ChatResponse(BaseModel):
    """聊天响应Schema"""
    conversation_id: int
    message: MessageResponse
    assistant_message: MessageResponse
