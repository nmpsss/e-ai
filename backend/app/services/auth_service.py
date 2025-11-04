"""
认证服务
处理用户注册、登录等业务逻辑
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..models import User
from ..schemas import UserCreate, UserLogin, Token
from ..utils.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token
)


class AuthService:
    """认证服务类"""

    @staticmethod
    def register(db: Session, user_data: UserCreate) -> User:
        """
        用户注册

        Args:
            db: 数据库会话
            user_data: 用户注册数据

        Returns:
            User: 新创建的用户

        Raises:
            HTTPException: 如果用户名或邮箱已存在
        """
        # 检查用户名是否已存在
        if db.query(User).filter(User.username == user_data.username).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="用户名已存在"
            )

        # 检查邮箱是否已存在
        if db.query(User).filter(User.email == user_data.email).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="邮箱已被注册"
            )

        # 创建新用户
        db_user = User(
            username=user_data.username,
            email=user_data.email,
            password_hash=get_password_hash(user_data.password)
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def login(db: Session, login_data: UserLogin) -> Token:
        """
        用户登录

        Args:
            db: 数据库会话
            login_data: 登录数据

        Returns:
            Token: JWT Token

        Raises:
            HTTPException: 如果用户名或密码错误
        """
        # 查找用户
        user = db.query(User).filter(User.username == login_data.username).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="用户名或密码错误"
            )

        # 验证密码
        if not verify_password(login_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="用户名或密码错误"
            )

        # 检查用户是否激活
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="用户已被禁用"
            )

        # 生成Token
        token_data = {"user_id": user.id, "username": user.username}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        return Token(
            access_token=access_token,
            refresh_token=refresh_token
        )

    @staticmethod
    def refresh_token(db: Session, refresh_token: str) -> Token:
        """
        刷新Token

        Args:
            db: 数据库会话
            refresh_token: 刷新Token

        Returns:
            Token: 新的JWT Token

        Raises:
            HTTPException: 如果Token无效
        """
        from ..utils.security import decode_token

        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="无效的刷新Token"
            )

        user_id = payload.get("user_id")
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="用户不存在或已被禁用"
            )

        # 生成新Token
        token_data = {"user_id": user.id, "username": user.username}
        new_access_token = create_access_token(token_data)
        new_refresh_token = create_refresh_token(token_data)

        return Token(
            access_token=new_access_token,
            refresh_token=new_refresh_token
        )
