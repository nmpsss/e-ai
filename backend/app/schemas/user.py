"""
用户相关的Pydantic Schemas
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    """用户注册Schema"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)


class UserLogin(BaseModel):
    """用户登录Schema"""
    username: str
    password: str


class UserUpdate(BaseModel):
    """用户更新Schema"""
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6, max_length=100)


class UserResponse(BaseModel):
    """用户响应Schema"""
    id: int
    username: str
    email: str
    is_active: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    """Token响应Schema"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token数据Schema"""
    user_id: Optional[int] = None
    username: Optional[str] = None
