"""
LLM服务
统一封装不同LLM提供商的接口
"""
from typing import List, Dict, AsyncGenerator
import openai
from anthropic import Anthropic, AsyncAnthropic
from ..config import settings


class LLMService:
    """LLM服务类"""

    def __init__(self):
        """初始化LLM客户端"""
        self.openai_client = None
        self.anthropic_client = None
        self.anthropic_async_client = None

        # 初始化OpenAI客户端
        if settings.OPENAI_API_KEY:
            openai.api_key = settings.OPENAI_API_KEY
            self.openai_client = openai

        # 初始化Anthropic客户端
        if settings.ANTHROPIC_API_KEY:
            self.anthropic_client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            self.anthropic_async_client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: str = "gpt-3.5-turbo",
        stream: bool = False
    ) -> str | AsyncGenerator[str, None]:
        """
        聊天接口

        Args:
            messages: 消息列表
            model: 模型名称
            stream: 是否流式响应

        Returns:
            str | AsyncGenerator: 回复内容或流式生成器
        """
        # 判断模型类型
        if model.startswith("gpt"):
            return await self._openai_chat(messages, model, stream)
        elif model.startswith("claude"):
            return await self._anthropic_chat(messages, model, stream)
        elif model.startswith("deepseek"):
            return await self._deepseek_chat(messages, model, stream)
        else:
            raise ValueError(f"不支持的模型: {model}")

    async def _openai_chat(
        self,
        messages: List[Dict[str, str]],
        model: str,
        stream: bool
    ) -> str | AsyncGenerator[str, None]:
        """OpenAI聊天"""
        if not self.openai_client:
            raise ValueError("OpenAI API密钥未配置")

        if stream:
            return self._openai_stream(messages, model)
        else:
            response = await self.openai_client.ChatCompletion.acreate(
                model=model,
                messages=messages
            )
            return response.choices[0].message.content

    async def _openai_stream(
        self,
        messages: List[Dict[str, str]],
        model: str
    ) -> AsyncGenerator[str, None]:
        """OpenAI流式响应"""
        response = await self.openai_client.ChatCompletion.acreate(
            model=model,
            messages=messages,
            stream=True
        )

        async for chunk in response:
            if chunk.choices[0].delta.get("content"):
                yield chunk.choices[0].delta.content

    async def _anthropic_chat(
        self,
        messages: List[Dict[str, str]],
        model: str,
        stream: bool
    ) -> str | AsyncGenerator[str, None]:
        """Anthropic聊天"""
        if not self.anthropic_async_client:
            raise ValueError("Anthropic API密钥未配置")

        # 转换消息格式
        anthropic_messages = []
        system_message = None

        for msg in messages:
            if msg["role"] == "system":
                system_message = msg["content"]
            else:
                anthropic_messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })

        if stream:
            return self._anthropic_stream(anthropic_messages, model, system_message)
        else:
            response = await self.anthropic_async_client.messages.create(
                model=model,
                max_tokens=4096,
                system=system_message,
                messages=anthropic_messages
            )
            return response.content[0].text

    async def _anthropic_stream(
        self,
        messages: List[Dict[str, str]],
        model: str,
        system_message: str = None
    ) -> AsyncGenerator[str, None]:
        """Anthropic流式响应"""
        async with self.anthropic_async_client.messages.stream(
            model=model,
            max_tokens=4096,
            system=system_message,
            messages=messages
        ) as stream:
            async for text in stream.text_stream:
                yield text

    async def _deepseek_chat(
        self,
        messages: List[Dict[str, str]],
        model: str,
        stream: bool
    ) -> str | AsyncGenerator[str, None]:
        """
        DeepSeek聊天
        DeepSeek使用OpenAI兼容接口
        """
        # DeepSeek使用OpenAI兼容的API
        # 这里需要设置自定义的base_url
        raise NotImplementedError("DeepSeek集成待实现")

    def estimate_tokens(self, text: str) -> int:
        """
        估算Token数量
        简单估算: 中文1字=2tokens, 英文1词≈1.3tokens

        Args:
            text: 文本内容

        Returns:
            int: 估算的Token数量
        """
        # 简单估算逻辑
        chinese_chars = sum(1 for c in text if '\u4e00' <= c <= '\u9fff')
        other_chars = len(text) - chinese_chars
        return int(chinese_chars * 2 + other_chars * 0.3)


# 创建全局实例
llm_service = LLMService()
