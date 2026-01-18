from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, date as date_type
from enum import Enum


class RecurrenceType(str, Enum):
    NONE = "none"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


# Database Models
class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    username: str = Field(unique=True, index=True)
    hashed_password: str
    full_name: Optional[str] = None
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    incomes: List["Income"] = Relationship(back_populates="user")
    expenses: List["Expense"] = Relationship(back_populates="user")
    assets: List["Asset"] = Relationship(back_populates="user")
    savings: List["Saving"] = Relationship(back_populates="user")


class Income(SQLModel, table=True):
    __tablename__ = "incomes"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    title: str
    amount: float
    date: date_type
    recurrence_type: RecurrenceType = Field(default=RecurrenceType.NONE)
    recurrence_end_date: Optional[date_type] = None
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    user: Optional[User] = Relationship(back_populates="incomes")


class Expense(SQLModel, table=True):
    __tablename__ = "expenses"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    title: str
    amount: float
    date: date_type
    category: Optional[str] = None
    recurrence_type: RecurrenceType = Field(default=RecurrenceType.NONE)
    recurrence_end_date: Optional[date_type] = None
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    user: Optional[User] = Relationship(back_populates="expenses")


class Asset(SQLModel, table=True):
    __tablename__ = "assets"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    name: str
    amount: float
    contributed: float = Field(default=0.0)
    target_date: Optional[date_type] = None
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    user: Optional[User] = Relationship(back_populates="assets")
    savings: List["Saving"] = Relationship(back_populates="asset")


class Saving(SQLModel, table=True):
    __tablename__ = "savings"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    asset_id: Optional[int] = Field(default=None, foreign_key="assets.id", index=True)
    title: str
    amount: float
    date: date_type
    recurrence_type: RecurrenceType = Field(default=RecurrenceType.NONE)
    recurrence_end_date: Optional[date_type] = None
    description: Optional[str] = None
    percentage: float = Field(default=100.0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    user: Optional[User] = Relationship(back_populates="savings")
    asset: Optional[Asset] = Relationship(back_populates="savings")


# API Request/Response Models
class UserCreate(SQLModel):
    email: str = Field(min_length=5, max_length=255)
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8, max_length=128)
    full_name: Optional[str] = Field(default=None, max_length=100)


class UserLogin(SQLModel):
    username: str
    password: str


class UserResponse(SQLModel):
    id: int
    email: str
    username: str
    full_name: Optional[str] = None
    is_active: bool


class IncomeCreate(SQLModel):
    title: str
    amount: float
    date: date_type
    recurrence_type: RecurrenceType = RecurrenceType.NONE
    recurrence_end_date: Optional[date_type] = None
    description: Optional[str] = None


class IncomeUpdate(SQLModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[date_type] = None
    recurrence_type: Optional[RecurrenceType] = None
    recurrence_end_date: Optional[date_type] = None
    description: Optional[str] = None


class IncomeResponse(SQLModel):
    id: int
    user_id: int
    title: str
    amount: float
    date: date_type
    recurrence_type: RecurrenceType
    recurrence_end_date: Optional[date_type] = None
    description: Optional[str] = None


class ExpenseCreate(SQLModel):
    title: str
    amount: float
    date: date_type
    category: Optional[str] = None
    recurrence_type: RecurrenceType = RecurrenceType.NONE
    recurrence_end_date: Optional[date_type] = None
    description: Optional[str] = None


class ExpenseUpdate(SQLModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[date_type] = None
    category: Optional[str] = None
    recurrence_type: Optional[RecurrenceType] = None
    recurrence_end_date: Optional[date_type] = None
    description: Optional[str] = None


class ExpenseResponse(SQLModel):
    id: int
    user_id: int
    title: str
    amount: float
    date: date_type
    category: Optional[str] = None
    recurrence_type: RecurrenceType
    recurrence_end_date: Optional[date_type] = None
    description: Optional[str] = None


class AssetCreate(SQLModel):
    name: str
    amount: float
    contributed: float = 0.0
    target_date: Optional[date_type] = None
    description: Optional[str] = None


class AssetUpdate(SQLModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    contributed: Optional[float] = None
    target_date: Optional[date_type] = None
    description: Optional[str] = None


class AssetResponse(SQLModel):
    id: int
    user_id: int
    name: str
    amount: float
    contributed: float
    target_date: Optional[date_type] = None
    description: Optional[str] = None


class SavingCreate(SQLModel):
    asset_id: Optional[int] = None
    title: str
    amount: float
    date: date_type
    recurrence_type: RecurrenceType = RecurrenceType.NONE
    recurrence_end_date: Optional[date_type] = None
    description: Optional[str] = None
    percentage: float = 100.0


class SavingUpdate(SQLModel):
    asset_id: Optional[int] = None
    title: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[date_type] = None
    recurrence_type: Optional[RecurrenceType] = None
    recurrence_end_date: Optional[date_type] = None
    description: Optional[str] = None
    percentage: Optional[float] = None


class SavingResponse(SQLModel):
    id: int
    user_id: int
    asset_id: Optional[int] = None
    title: str
    amount: float
    date: date_type
    recurrence_type: RecurrenceType
    recurrence_end_date: Optional[date_type] = None
    description: Optional[str] = None
    percentage: float


class Token(SQLModel):
    access_token: str
    token_type: str


class TokenData(SQLModel):
    username: Optional[str] = None
