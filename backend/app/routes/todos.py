# ./routes/todos.py
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List, Literal, Optional

from app.database import get_db
from app import models, schemas

router = APIRouter()


@router.post("/todos", response_model=schemas.Todo,
             status_code=status.HTTP_201_CREATED)
def create_todo(todo: schemas.TodoCreate, db: Session = Depends(get_db)):
    """Create a new Todo item"""
    db_todo = models.Todo(
        title=todo.title,
        completed=todo.completed,
        priority=todo.priority
    )
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)

    return db_todo


@router.get("/todos", response_model=List[schemas.Todo])
def get_todos(
    db: Session = Depends(get_db),
    completed: Optional[bool] = Query(
        None, description="Filter by completion status"
    ),
    priority: Optional[Literal["low", "medium", "high"]] = Query(
        None, description="Filter by priority"
    ),
    search: Optional[str] = Query(None, description="Search todos by title"),
):
    """Get all todo items, sorted by newest one first.
    Along with options to filter by completed, priority, or search by title.
    """
    query = db.query(models.Todo)

    if completed is not None:
        query = query.filter(models.Todo.completed.is_(completed))

    if priority is not None:
        query = query.filter(models.Todo.priority == priority)

    if search is not None:
        query = query.filter(models.Todo.title.ilike(f"%{search}%"))

    return query.order_by(models.Todo.created_at.desc()).all()


# had to place before /{todo_id} to avoid route conflict in type matching
@router.get("/todos/stats", response_model=schemas.TodoStats)
def get_stats(db: Session = Depends(get_db)):
    """Get todo stats (part of the bonus)"""
    total = db.query(models.Todo).count()
    completed = db.query(models.Todo).filter(
        models.Todo.completed.is_(True)).count()

    by_priority = db.query(
        models.Todo.priority,
        func.count(models.Todo.priority).label('count')
    ).group_by(models.Todo.priority).all()

    return schemas.TodoStats(
        total=total,
        completed=completed,
        pending=total - completed,
        priority={priority: count for priority, count in by_priority}
    )


@router.get("/todos/{todo_id}", response_model=schemas.Todo)
def get_todo(todo_id: int, db: Session = Depends(get_db)):
    """Get a specific todo item"""
    todo_item = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if not todo_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo item with id: {todo_id} not found"
        )

    return todo_item


@router.put("/todos/{todo_id}", response_model=schemas.Todo)
def update_todo(todo_id: int, todo_update: schemas.TodoUpdate,
                db: Session = Depends(get_db)):
    """Update a specific todo item"""
    todo_item = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if not todo_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo item with id: {todo_id} not found"
        )

    update_data = todo_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(todo_item, key, value)

    db.commit()
    db.refresh(todo_item)
    return todo_item


@router.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    """Delete a specific todo item"""
    todo_item = db.query(models.Todo).filter(models.Todo.id == todo_id).first()
    if not todo_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo item with id: {todo_id} not found"
        )

    db.delete(todo_item)
    db.commit()
    return None
