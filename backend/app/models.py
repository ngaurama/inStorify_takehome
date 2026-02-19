# ./models.py
from sqlalchemy import (
    Column,
    DateTime,
    Integer,
    String,
    Boolean,
    func
)
from app.database import Base


class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    completed = Column(Boolean, default=False, nullable=False)
    priority = Column(String, default="medium", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(),
                        nullable=False)

    def __repr__(self):
        return f"<Todo {self.id}, {self.title}>"
