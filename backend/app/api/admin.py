"""
管理后台相关API
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta
from ..database import get_db
from ..schemas import UserResponse
from ..models import User, Conversation, Message, ApiUsage
from ..utils import get_current_admin_user

router = APIRouter()


@router.get("/users", response_model=List[UserResponse])
def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    """
    获取用户列表(管理员权限)

    Args:
        skip: 跳过的记录数
        limit: 返回的记录数
        db: 数据库会话
        admin_user: 管理员用户

    Returns:
        List[UserResponse]: 用户列表
    """
    users = db.query(User).order_by(
        User.created_at.desc()
    ).offset(skip).limit(limit).all()

    return [UserResponse.model_validate(user) for user in users]


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    """
    获取系统统计数据

    Args:
        db: 数据库会话
        admin_user: 管理员用户

    Returns:
        dict: 统计数据
    """
    # 用户统计
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()

    # 会话统计
    total_conversations = db.query(Conversation).count()
    total_messages = db.query(Message).count()

    # 今日新增
    today = datetime.utcnow().date()
    today_users = db.query(User).filter(
        func.date(User.created_at) == today
    ).count()
    today_conversations = db.query(Conversation).filter(
        func.date(Conversation.created_at) == today
    ).count()

    # API使用统计
    total_tokens = db.query(func.sum(ApiUsage.tokens)).scalar() or 0
    total_cost = db.query(func.sum(ApiUsage.cost)).scalar() or 0

    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "today_new": today_users
        },
        "conversations": {
            "total": total_conversations,
            "today_new": today_conversations
        },
        "messages": {
            "total": total_messages
        },
        "api_usage": {
            "total_tokens": int(total_tokens),
            "total_cost": float(total_cost)
        }
    }


@router.get("/usage")
def get_usage_stats(
    days: int = Query(7, ge=1, le=90),
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    """
    获取API使用统计

    Args:
        days: 统计天数
        db: 数据库会话
        admin_user: 管理员用户

    Returns:
        dict: 使用统计
    """
    start_date = datetime.utcnow() - timedelta(days=days)

    # 按模型统计
    model_stats = db.query(
        ApiUsage.model,
        func.sum(ApiUsage.tokens).label("total_tokens"),
        func.sum(ApiUsage.cost).label("total_cost"),
        func.count(ApiUsage.id).label("request_count")
    ).filter(
        ApiUsage.created_at >= start_date
    ).group_by(ApiUsage.model).all()

    # 按日期统计
    daily_stats = db.query(
        func.date(ApiUsage.created_at).label("date"),
        func.sum(ApiUsage.tokens).label("tokens"),
        func.sum(ApiUsage.cost).label("cost")
    ).filter(
        ApiUsage.created_at >= start_date
    ).group_by(func.date(ApiUsage.created_at)).all()

    return {
        "by_model": [
            {
                "model": stat.model,
                "total_tokens": int(stat.total_tokens),
                "total_cost": float(stat.total_cost),
                "request_count": stat.request_count
            }
            for stat in model_stats
        ],
        "by_date": [
            {
                "date": stat.date.isoformat(),
                "tokens": int(stat.tokens),
                "cost": float(stat.cost)
            }
            for stat in daily_stats
        ]
    }


@router.put("/users/{user_id}/toggle-active")
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(get_current_admin_user)
):
    """
    切换用户激活状态

    Args:
        user_id: 用户ID
        db: 数据库会话
        admin_user: 管理员用户

    Returns:
        dict: 操作结果
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"success": False, "message": "用户不存在"}

    user.is_active = not user.is_active
    db.commit()

    return {
        "success": True,
        "message": f"用户已{'激活' if user.is_active else '禁用'}",
        "is_active": user.is_active
    }
