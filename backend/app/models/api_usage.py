"""
API使用统计模型
记录用户的API调用情况
"""
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class ApiUsage(Base):
    """API使用统计表模型"""

    __tablename__ = "api_usages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    model = Column(String(50), nullable=False)  # 使用的模型
    tokens = Column(Integer, default=0)  # Token消耗
    cost = Column(Float, default=0.0)  # 成本
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 关系
    user = relationship("User", back_populates="api_usages")

    def __repr__(self):
        return f"<ApiUsage(id={self.id}, model='{self.model}', tokens={self.tokens})>"
