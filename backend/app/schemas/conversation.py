"""
会话相关的Pydantic Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ConversationCreate(BaseModel):
    """创建会话Schema"""
    title: Optional[str] = "新对话"
    model: str = Field(default="gpt-3.5-turbo")


class ConversationUpdate(BaseModel):
    """更新会话Schema"""
    title: Optional[str] = None
    model: Optional[str] = None


class ConversationResponse(BaseModel):
    """会话响应Schema"""
    id: int
    user_id: int
    title: str
    model: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ConversationListResponse(BaseModel):
    """会话列表响应Schema"""
    total: int
    conversations: List[ConversationResponse]
