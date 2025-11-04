"""
聊天服务
处理对话相关的业务逻辑
"""
from typing import List, AsyncGenerator
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from ..models import User, Conversation, Message, ApiUsage
from ..schemas import ChatRequest
from .llm_service import llm_service


class ChatService:
    """聊天服务类"""

    @staticmethod
    async def send_message(
        db: Session,
        user: User,
        chat_request: ChatRequest
    ) -> tuple[Conversation, Message, str | AsyncGenerator[str, None]]:
        """
        发送消息并获取回复

        Args:
            db: 数据库会话
            user: 当前用户
            chat_request: 聊天请求

        Returns:
            tuple: (会话, 用户消息, AI回复或流)

        Raises:
            HTTPException: 如果会话不存在或不属于当前用户
        """
        # 获取或创建会话
        if chat_request.conversation_id:
            conversation = db.query(Conversation).filter(
                Conversation.id == chat_request.conversation_id,
                Conversation.user_id == user.id
            ).first()
            if not conversation:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="会话不存在"
                )
        else:
            # 创建新会话
            conversation = Conversation(
                user_id=user.id,
                title="新对话",
                model=chat_request.model
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)

        # 保存用户消息
        user_message = Message(
            conversation_id=conversation.id,
            role="user",
            content=chat_request.message,
            tokens=llm_service.estimate_tokens(chat_request.message)
        )
        db.add(user_message)
        db.commit()
        db.refresh(user_message)

        # 获取历史消息
        messages = ChatService._get_conversation_messages(db, conversation.id)

        # 调用LLM获取回复
        response = await llm_service.chat(
            messages=messages,
            model=chat_request.model,
            stream=chat_request.stream
        )

        return conversation, user_message, response

    @staticmethod
    async def save_assistant_message(
        db: Session,
        conversation_id: int,
        content: str,
        model: str,
        user_id: int
    ) -> Message:
        """
        保存AI回复消息

        Args:
            db: 数据库会话
            conversation_id: 会话ID
            content: 消息内容
            model: 模型名称
            user_id: 用户ID

        Returns:
            Message: 保存的消息
        """
        tokens = llm_service.estimate_tokens(content)

        # 保存助手消息
        assistant_message = Message(
            conversation_id=conversation_id,
            role="assistant",
            content=content,
            tokens=tokens
        )
        db.add(assistant_message)

        # 记录API使用情况
        api_usage = ApiUsage(
            user_id=user_id,
            model=model,
            tokens=tokens,
            cost=ChatService._calculate_cost(model, tokens)
        )
        db.add(api_usage)

        # 更新会话标题(如果是第一条消息)
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id
        ).first()
        if conversation and conversation.title == "新对话":
            # 使用用户第一条消息作为标题(截取前30个字符)
            first_user_message = db.query(Message).filter(
                Message.conversation_id == conversation_id,
                Message.role == "user"
            ).first()
            if first_user_message:
                conversation.title = first_user_message.content[:30]

        db.commit()
        db.refresh(assistant_message)
        return assistant_message

    @staticmethod
    def _get_conversation_messages(db: Session, conversation_id: int) -> List[dict]:
        """
        获取会话的历史消息

        Args:
            db: 数据库会话
            conversation_id: 会话ID

        Returns:
            List[dict]: 消息列表
        """
        messages = db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at.asc()).all()

        return [
            {"role": msg.role, "content": msg.content}
            for msg in messages
        ]

    @staticmethod
    def _calculate_cost(model: str, tokens: int) -> float:
        """
        计算API调用成本

        Args:
            model: 模型名称
            tokens: Token数量

        Returns:
            float: 成本(美元)
        """
        # 简化的成本计算,实际应该根据不同模型有不同的价格
        price_per_1k_tokens = {
            "gpt-3.5-turbo": 0.002,
            "gpt-4": 0.03,
            "gpt-4-turbo": 0.01,
            "claude-3-opus": 0.015,
            "claude-3-sonnet": 0.003,
            "claude-3-haiku": 0.00025,
        }

        base_model = model.split("-")[0:2]
        base_model_name = "-".join(base_model) if len(base_model) > 1 else model

        price = price_per_1k_tokens.get(base_model_name, 0.002)
        return (tokens / 1000) * price

    @staticmethod
    def get_conversation_messages(
        db: Session,
        user: User,
        conversation_id: int
    ) -> List[Message]:
        """
        获取会话的所有消息

        Args:
            db: 数据库会话
            user: 当前用户
            conversation_id: 会话ID

        Returns:
            List[Message]: 消息列表

        Raises:
            HTTPException: 如果会话不存在或不属于当前用户
        """
        # 验证会话所有权
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == user.id
        ).first()
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="会话不存在"
            )

        messages = db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at.asc()).all()

        return messages
