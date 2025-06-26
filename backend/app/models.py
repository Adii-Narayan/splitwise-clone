from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

# ===== USER =====
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)


# ===== GROUP =====
class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    users = relationship("GroupUser", back_populates="group", cascade="all, delete-orphan")


# ===== GROUP-USER JOIN TABLE =====
class GroupUser(Base):
    __tablename__ = "group_users"

    id = Column(Integer, primary_key=True, index=True)
    group_id = Column(Integer, ForeignKey("groups.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    group = relationship("Group", back_populates="users")
    user = relationship("User")


# ===== EXPENSE =====
class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String)
    amount = Column(Float)
    paid_by = Column(Integer, ForeignKey("users.id"))
    group_id = Column(Integer, ForeignKey("groups.id"))
    split_type = Column(String)

    splits = relationship("Split", back_populates="expense", cascade="all, delete-orphan")


# ===== SPLIT =====
class Split(Base):
    __tablename__ = "splits"

    id = Column(Integer, primary_key=True, index=True)
    expense_id = Column(Integer, ForeignKey("expenses.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float, nullable=True)
    percentage = Column(Float, nullable=True)

    expense = relationship("Expense", back_populates="splits")
