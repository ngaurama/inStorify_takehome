# ./schermas.py
from pydantic import BaseModel, ConfigDict, Field, field_validator
from datetime import datetime
from typing import Dict, Optional, Literal


# base
class TodoBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    completed: bool = False
    priority: Literal["low", "medium", "high"] = "medium"

    @field_validator("title")
    def title_not_empty(cls, value):
        if not value or not value.strip():
            raise ValueError("Title cannot be empty")
        return value.strip()


# create todo
class TodoCreate(TodoBase):
    pass


# update todo (everything should be optional)
class TodoUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    completed: Optional[bool] = None
    priority: Optional[Literal["low", "medium", "high"]] = None

    @field_validator("title")
    def title_not_empty(cls, value):
        if value is not None and not value.strip():
            raise ValueError("Title cannot be empty")
        return value.strip() if value else value


# stats response
class TodoStats(BaseModel):
    total: int
    completed: int
    pending: int
    priority: Dict[str, int]


# respnse
class Todo(TodoBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
