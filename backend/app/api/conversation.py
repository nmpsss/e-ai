"""
会话管理相关API
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..schemas import (
    ConversationCreate,
    ConversationUpdate,
    ConversationResponse,
    ConversationListResponse,
    MessageResponse
)
from ..models import User, Conversation, Message
from ..utils import get_current_user
from ..services import ChatService

router = APIRouter()


@router.get("/", response_model=ConversationListResponse)
def get_conversations(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    获取用户的会话列表

    Args:
        skip: 跳过的记录数
        limit: 返回的记录数
        db: 数据库会话
        current_user: 当前用户

    Returns:
        ConversationListResponse: 会话列表
    """
    total = db.query(Conversation).filter(
        Conversation.user_id == current_user.id
    ).count()

    conversations = db.query(Conversation).filter(
        Conversation.user_id == current_user.id
    ).order_by(
        Conversation.updated_at.desc()
    ).offset(skip).limit(limit).all()

    return ConversationListResponse(
        total=total,
        conversations=[ConversationResponse.model_validate(c) for c in conversations]
    )


@router.post("/", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
def create_conversation(
    conversation_data: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    创建新会话

    Args:
        conversation_data: 会话数据
        db: 数据库会话
        current_user: 当前用户

    Returns:
        ConversationResponse: 新创建的会话
    """
    conversation = Conversation(
        user_id=current_user.id,
        title=conversation_data.title,
        model=conversation_data.model
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


@router.get("/{conversation_id}", response_model=ConversationResponse)
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    获取会话详情

    Args:
        conversation_id: 会话ID
        db: 数据库会话
        current_user: 当前用户

    Returns:
        ConversationResponse: 会话详情
    """
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="会话不存在"
        )

    return conversation


@router.put("/{conversation_id}", response_model=ConversationResponse)
def update_conversation(
    conversation_id: int,
    conversation_data: ConversationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    更新会话

    Args:
        conversation_id: 会话ID
        conversation_data: 更新数据
        db: 数据库会话
        current_user: 当前用户

    Returns:
        ConversationResponse: 更新后的会话
    """
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="会话不存在"
        )

    # 更新字段
    if conversation_data.title is not None:
        conversation.title = conversation_data.title
    if conversation_data.model is not None:
        conversation.model = conversation_data.model

    db.commit()
    db.refresh(conversation)
    return conversation


@router.delete("/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    删除会话

    Args:
        conversation_id: 会话ID
        db: 数据库会话
        current_user: 当前用户
    """
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="会话不存在"
        )

    db.delete(conversation)
    db.commit()


@router.get("/{conversation_id}/messages", response_model=List[MessageResponse])
def get_conversation_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    获取会话的所有消息

    Args:
        conversation_id: 会话ID
        db: 数据库会话
        current_user: 当前用户

    Returns:
        List[MessageResponse]: 消息列表
    """
    messages = ChatService.get_conversation_messages(db, current_user, conversation_id)
    return [MessageResponse.model_validate(msg) for msg in messages]


@router.get("/search/", response_model=ConversationListResponse)
def search_conversations(
    q: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    搜索会话

    Args:
        q: 搜索关键词
        skip: 跳过的记录数
        limit: 返回的记录数
        db: 数据库会话
        current_user: 当前用户

    Returns:
        ConversationListResponse: 搜索结果
    """
    query = db.query(Conversation).filter(
        Conversation.user_id == current_user.id,
        Conversation.title.contains(q)
    )

    total = query.count()
    conversations = query.order_by(
        Conversation.updated_at.desc()
    ).offset(skip).limit(limit).all()

    return ConversationListResponse(
        total=total,
        conversations=[ConversationResponse.model_validate(c) for c in conversations]
    )
