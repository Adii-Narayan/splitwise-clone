from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/groups",
    tags=["Groups"]
)


# === Create a Group ===
@router.post("/", response_model=schemas.Group)
def create_group(group: schemas.GroupCreate, db: Session = Depends(get_db)):
    new_group = models.Group(name=group.name)
    db.add(new_group)
    db.commit()
    db.refresh(new_group)

    for user in group.users:
        existing_user = db.query(models.User).filter(models.User.name == user.name).first()
        if not existing_user:
            existing_user = models.User(name=user.name)
            db.add(existing_user)
            db.commit()
            db.refresh(existing_user)

        group_user = models.GroupUser(group_id=new_group.id, user_id=existing_user.id)
        db.add(group_user)

    db.commit()
    db.refresh(new_group)

    users = (
        db.query(models.User)
        .join(models.GroupUser, models.User.id == models.GroupUser.user_id)
        .filter(models.GroupUser.group_id == new_group.id)
        .all()
    )

    return schemas.Group(
        id=new_group.id,
        name=new_group.name,
        users=[schemas.User.from_orm(u) for u in users]
    )


# === Get Group Details ===
@router.get("/{group_id}", response_model=schemas.Group)
def get_group(group_id: int, db: Session = Depends(get_db)):
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    users = (
        db.query(models.User)
        .join(models.GroupUser, models.User.id == models.GroupUser.user_id)
        .filter(models.GroupUser.group_id == group.id)
        .all()
    )

    return schemas.Group(
        id=group.id,
        name=group.name,
        users=[schemas.User.from_orm(u) for u in users]
    )


# === Get All Groups ===
@router.get("/", response_model=List[schemas.Group])
def get_all_groups(db: Session = Depends(get_db)):
    groups = db.query(models.Group).all()
    result = []
    for group in groups:
        users = (
            db.query(models.User)
            .join(models.GroupUser, models.User.id == models.GroupUser.user_id)
            .filter(models.GroupUser.group_id == group.id)
            .all()
        )
        result.append(schemas.Group(
            id=group.id,
            name=group.name,
            users=[schemas.User.from_orm(u) for u in users]
        ))
    return result
