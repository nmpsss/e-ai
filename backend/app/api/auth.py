"""
认证相关API
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import UserCreate, UserLogin, UserResponse, Token
from ..services import AuthService
from ..utils import get_current_user
from ..models import User

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    用户注册

    Args:
        user_data: 用户注册数据
        db: 数据库会话

    Returns:
        UserResponse: 用户信息
    """
    user = AuthService.register(db, user_data)
    return user


@router.post("/login", response_model=Token)
def login(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):
    """
    用户登录

    Args:
        login_data: 登录数据
        db: 数据库会话

    Returns:
        Token: JWT Token
    """
    return AuthService.login(db, login_data)


@router.post("/login/form", response_model=Token)
def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    表单登录(用于OAuth2密码流)

    Args:
        form_data: 表单数据
        db: 数据库会话

    Returns:
        Token: JWT Token
    """
    login_data = UserLogin(username=form_data.username, password=form_data.password)
    return AuthService.login(db, login_data)


@router.post("/refresh", response_model=Token)
def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """
    刷新Token

    Args:
        refresh_token: 刷新Token
        db: 数据库会话

    Returns:
        Token: 新的JWT Token
    """
    return AuthService.refresh_token(db, refresh_token)


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    获取当前用户信息

    Args:
        current_user: 当前用户

    Returns:
        UserResponse: 用户信息
    """
    return current_user
