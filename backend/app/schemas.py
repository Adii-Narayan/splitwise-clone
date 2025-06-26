from pydantic import BaseModel
from typing import List, Optional


# ===== USER SCHEMAS =====
class UserBase(BaseModel):
    name: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int

    class Config:
        from_attributes = True


# ===== GROUP SCHEMAS =====
class GroupBase(BaseModel):
    name: str

class UserInGroup(BaseModel):
    name: str

class GroupCreate(GroupBase):
    users: List[UserInGroup]

class Group(GroupBase):
    id: int
    users: List[User] = []

    class Config:
        from_attributes = True


# ===== EXPENSE SCHEMAS =====
class SplitRatio(BaseModel):
    user_id: int
    percentage: Optional[float] = None  # Required for percentage-based splits only

class ExpenseCreate(BaseModel):
    description: str
    amount: float
    paid_by: int
    split_type: str  # "equal" or "percentage"
    splits: List[SplitRatio]  # Only IDs + optional percentage

class SplitResponse(BaseModel):
    user_id: int
    amount: float
    percentage: Optional[float] = None

class Expense(BaseModel):
    id: int
    description: str
    amount: float
    paid_by: int
    split_type: str
    splits: List[SplitResponse]

    class Config:
        from_attributes = True


# ===== BALANCE SCHEMA =====
class BalanceResponse(BaseModel):
    from_: int
    to: int
    amount: float
