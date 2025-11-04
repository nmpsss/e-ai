"""
聊天相关API
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import AsyncGenerator
import json
from ..database import get_db
from ..schemas import ChatRequest, ChatResponse, MessageResponse
from ..services import ChatService
from ..utils import get_current_user
from ..models import User

router = APIRouter()


@router.post("/", response_model=ChatResponse)
async def chat(
    chat_request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    发送消息(非流式)

    Args:
        chat_request: 聊天请求
        db: 数据库会话
        current_user: 当前用户

    Returns:
        ChatResponse: 聊天响应
    """
    # 强制非流式
    chat_request.stream = False

    conversation, user_message, response = await ChatService.send_message(
        db, current_user, chat_request
    )

    # 保存助手回复
    assistant_message = await ChatService.save_assistant_message(
        db,
        conversation.id,
        response,
        chat_request.model,
        current_user.id
    )

    return ChatResponse(
        conversation_id=conversation.id,
        message=MessageResponse.model_validate(user_message),
        assistant_message=MessageResponse.model_validate(assistant_message)
    )


@router.post("/stream")
async def chat_stream(
    chat_request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    发送消息(流式)

    Args:
        chat_request: 聊天请求
        db: 数据库会话
        current_user: 当前用户

    Returns:
        StreamingResponse: 服务器发送事件流
    """
    # 强制流式
    chat_request.stream = True

    conversation, user_message, response_stream = await ChatService.send_message(
        db, current_user, chat_request
    )

    async def event_generator() -> AsyncGenerator[str, None]:
        """生成SSE事件流"""
        try:
            # 发送会话ID和用户消息
            init_data = {
                "type": "init",
                "conversation_id": conversation.id,
                "message": MessageResponse.model_validate(user_message).model_dump()
            }
            yield f"data: {json.dumps(init_data, ensure_ascii=False)}\n\n"

            # 流式发送AI回复
            full_content = ""
            async for chunk in response_stream:
                full_content += chunk
                chunk_data = {
                    "type": "chunk",
                    "content": chunk
                }
                yield f"data: {json.dumps(chunk_data, ensure_ascii=False)}\n\n"

            # 保存完整的助手回复
            assistant_message = await ChatService.save_assistant_message(
                db,
                conversation.id,
                full_content,
                chat_request.model,
                current_user.id
            )

            # 发送完成事件
            done_data = {
                "type": "done",
                "assistant_message": MessageResponse.model_validate(assistant_message).model_dump()
            }
            yield f"data: {json.dumps(done_data, ensure_ascii=False)}\n\n"

        except Exception as e:
            error_data = {
                "type": "error",
                "message": str(e)
            }
            yield f"data: {json.dumps(error_data, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@router.post("/stop")
async def stop_generation(
    current_user: User = Depends(get_current_user)
):
    """
    停止生成

    Note: 实际实现需要维护一个生成任务的映射表
    这里仅提供接口示例
    """
    # TODO: 实现停止生成的逻辑
    return {"message": "停止生成请求已发送"}
