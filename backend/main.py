from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from datetime import timedelta, date
from dateutil.relativedelta import relativedelta
from typing import List
import calendar

from database import create_db_and_tables, get_session
from models import (
    User, UserCreate, UserResponse,
    Income, IncomeCreate, IncomeUpdate, IncomeResponse,
    Expense, ExpenseCreate, ExpenseUpdate, ExpenseResponse,
    Asset, AssetCreate, AssetUpdate, AssetResponse,
    Saving, SavingCreate, SavingUpdate, SavingResponse,
    Token, RecurrenceType
)
from auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_active_user, ACCESS_TOKEN_EXPIRE_MINUTES
)

app = FastAPI(title="Nassets - Financial Planner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/")
def read_root():
    return {"message": "Nassets API is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


# Auth endpoints
@app.post("/api/auth/register", response_model=UserResponse)
def register(user_data: UserCreate, session: Session = Depends(get_session)):
    statement = select(User).where(
        (User.email == user_data.email) | (User.username == user_data.username)
    )
    existing_user = session.exec(statement).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )
    
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password,
        full_name=user_data.full_name
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


@app.post("/api/auth/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session)
):
    statement = select(User).where(User.username == form_data.username)
    user = session.exec(statement).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/auth/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user


# Income endpoints
@app.post("/api/incomes", response_model=IncomeResponse)
def create_income(
    income: IncomeCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    db_income = Income(**income.dict(), user_id=current_user.id)
    session.add(db_income)
    session.commit()
    session.refresh(db_income)
    return db_income


@app.get("/api/incomes", response_model=List[IncomeResponse])
def get_incomes(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    statement = select(Income).where(Income.user_id == current_user.id)
    incomes = session.exec(statement).all()
    return incomes


@app.get("/api/incomes/{income_id}", response_model=IncomeResponse)
def get_income(
    income_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    income = session.get(Income, income_id)
    if not income or income.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Income not found")
    return income


@app.put("/api/incomes/{income_id}", response_model=IncomeResponse)
def update_income(
    income_id: int,
    income_update: IncomeUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    income = session.get(Income, income_id)
    if not income or income.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Income not found")
    
    income_data = income_update.dict(exclude_unset=True)
    for key, value in income_data.items():
        setattr(income, key, value)
    
    session.add(income)
    session.commit()
    session.refresh(income)
    return income


@app.delete("/api/incomes/{income_id}")
def delete_income(
    income_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    income = session.get(Income, income_id)
    if not income or income.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Income not found")
    
    session.delete(income)
    session.commit()
    return {"message": "Income deleted"}


# Expense endpoints
@app.post("/api/expenses", response_model=ExpenseResponse)
def create_expense(
    expense: ExpenseCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    db_expense = Expense(**expense.dict(), user_id=current_user.id)
    session.add(db_expense)
    session.commit()
    session.refresh(db_expense)
    return db_expense


@app.get("/api/expenses", response_model=List[ExpenseResponse])
def get_expenses(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    statement = select(Expense).where(Expense.user_id == current_user.id)
    expenses = session.exec(statement).all()
    return expenses


@app.get("/api/expenses/{expense_id}", response_model=ExpenseResponse)
def get_expense(
    expense_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    expense = session.get(Expense, expense_id)
    if not expense or expense.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@app.put("/api/expenses/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    expense_update: ExpenseUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    expense = session.get(Expense, expense_id)
    if not expense or expense.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    expense_data = expense_update.dict(exclude_unset=True)
    for key, value in expense_data.items():
        setattr(expense, key, value)
    
    session.add(expense)
    session.commit()
    session.refresh(expense)
    return expense


@app.delete("/api/expenses/{expense_id}")
def delete_expense(
    expense_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    expense = session.get(Expense, expense_id)
    if not expense or expense.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    session.delete(expense)
    session.commit()
    return {"message": "Expense deleted"}


# Asset endpoints
@app.post("/api/assets", response_model=AssetResponse)
def create_asset(
    asset: AssetCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    db_asset = Asset(**asset.dict(), user_id=current_user.id)
    session.add(db_asset)
    session.commit()
    session.refresh(db_asset)
    return db_asset


@app.get("/api/assets", response_model=List[AssetResponse])
def get_assets(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    statement = select(Asset).where(Asset.user_id == current_user.id)
    assets = session.exec(statement).all()
    return assets


@app.get("/api/assets/{asset_id}", response_model=AssetResponse)
def get_asset(
    asset_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    asset = session.get(Asset, asset_id)
    if not asset or asset.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset


@app.put("/api/assets/{asset_id}", response_model=AssetResponse)
def update_asset(
    asset_id: int,
    asset_update: AssetUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    asset = session.get(Asset, asset_id)
    if not asset or asset.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    asset_data = asset_update.dict(exclude_unset=True)
    for key, value in asset_data.items():
        setattr(asset, key, value)
    
    session.add(asset)
    session.commit()
    session.refresh(asset)
    return asset


@app.delete("/api/assets/{asset_id}")
def delete_asset(
    asset_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    asset = session.get(Asset, asset_id)
    if not asset or asset.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    session.delete(asset)
    session.commit()
    return {"message": "Asset deleted"}


# Saving endpoints
@app.post("/api/savings", response_model=SavingResponse)
def create_saving(
    saving: SavingCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    if saving.asset_id:
        asset = session.get(Asset, saving.asset_id)
        if not asset or asset.user_id != current_user.id:
            raise HTTPException(status_code=404, detail="Asset not found")
    
    db_saving = Saving(**saving.dict(), user_id=current_user.id)
    session.add(db_saving)
    
    if saving.asset_id:
        asset = session.get(Asset, saving.asset_id)
        if asset:
            asset.contributed += saving.amount
            session.add(asset)
    
    session.commit()
    session.refresh(db_saving)
    return db_saving


@app.get("/api/savings", response_model=List[SavingResponse])
def get_savings(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    statement = select(Saving).where(Saving.user_id == current_user.id)
    savings = session.exec(statement).all()
    return savings


@app.get("/api/savings/{saving_id}", response_model=SavingResponse)
def get_saving(
    saving_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    saving = session.get(Saving, saving_id)
    if not saving or saving.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Saving not found")
    return saving


@app.put("/api/savings/{saving_id}", response_model=SavingResponse)
def update_saving(
    saving_id: int,
    saving_update: SavingUpdate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    saving = session.get(Saving, saving_id)
    if not saving or saving.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Saving not found")
    
    old_amount = saving.amount
    old_asset_id = saving.asset_id
    
    saving_data = saving_update.dict(exclude_unset=True)
    for key, value in saving_data.items():
        setattr(saving, key, value)
    
    if old_asset_id and old_asset_id != saving.asset_id:
        old_asset = session.get(Asset, old_asset_id)
        if old_asset:
            old_asset.contributed -= old_amount
            session.add(old_asset)
    
    if saving.asset_id:
        asset = session.get(Asset, saving.asset_id)
        if asset:
            if old_asset_id == saving.asset_id:
                asset.contributed += (saving.amount - old_amount)
            else:
                asset.contributed += saving.amount
            session.add(asset)
    
    session.add(saving)
    session.commit()
    session.refresh(saving)
    return saving


@app.delete("/api/savings/{saving_id}")
def delete_saving(
    saving_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    saving = session.get(Saving, saving_id)
    if not saving or saving.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Saving not found")
    
    if saving.asset_id:
        asset = session.get(Asset, saving.asset_id)
        if asset:
            asset.contributed -= saving.amount
            session.add(asset)
    
    session.delete(saving)
    session.commit()
    return {"message": "Saving deleted"}


# Calendar and budget overview
def expand_recurring_items(items, start_date: date, end_date: date, item_type: str = "transaction"):
    expanded = []
    
    for item in items:
        item_dict = item.dict()
        
        if item.recurrence_type == RecurrenceType.NONE:
            if start_date <= item.date <= end_date:
                expanded.append({
                    **item_dict,
                    "occurrence_date": item.date.isoformat(),
                    "is_recurring": False
                })
        else:
            current_date = item.date
            recurrence_end = item.recurrence_end_date or end_date
            
            while current_date <= min(recurrence_end, end_date):
                if current_date >= start_date:
                    expanded.append({
                        **item_dict,
                        "occurrence_date": current_date.isoformat(),
                        "is_recurring": True
                    })
                
                if item.recurrence_type == RecurrenceType.DAILY:
                    current_date += relativedelta(days=1)
                elif item.recurrence_type == RecurrenceType.WEEKLY:
                    current_date += relativedelta(weeks=1)
                elif item.recurrence_type == RecurrenceType.MONTHLY:
                    current_date += relativedelta(months=1)
                elif item.recurrence_type == RecurrenceType.YEARLY:
                    current_date += relativedelta(years=1)
    
    return expanded


@app.get("/api/calendar")
def get_calendar(
    year: int,
    month: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    start_date = date(year, month, 1)
    last_day = calendar.monthrange(year, month)[1]
    end_date = date(year, month, last_day)
    
    income_statement = select(Income).where(Income.user_id == current_user.id)
    expense_statement = select(Expense).where(Expense.user_id == current_user.id)
    saving_statement = select(Saving).where(Saving.user_id == current_user.id)
    
    incomes = session.exec(income_statement).all()
    expenses = session.exec(expense_statement).all()
    savings = session.exec(saving_statement).all()
    
    expanded_incomes = expand_recurring_items(incomes, start_date, end_date)
    expanded_expenses = expand_recurring_items(expenses, start_date, end_date)
    expanded_savings = expand_recurring_items(savings, start_date, end_date)
    
    return {
        "incomes": expanded_incomes,
        "expenses": expanded_expenses,
        "savings": expanded_savings,
        "month": month,
        "year": year
    }


@app.get("/api/budget/summary")
def get_budget_summary(
    year: int,
    month: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    start_date = date(year, month, 1)
    last_day = calendar.monthrange(year, month)[1]
    end_date = date(year, month, last_day)
    
    income_statement = select(Income).where(Income.user_id == current_user.id)
    expense_statement = select(Expense).where(Expense.user_id == current_user.id)
    saving_statement = select(Saving).where(Saving.user_id == current_user.id)
    
    incomes = session.exec(income_statement).all()
    expenses = session.exec(expense_statement).all()
    savings = session.exec(saving_statement).all()
    
    expanded_incomes = expand_recurring_items(incomes, start_date, end_date)
    expanded_expenses = expand_recurring_items(expenses, start_date, end_date)
    expanded_savings = expand_recurring_items(savings, start_date, end_date)
    
    total_income = sum(item["amount"] for item in expanded_incomes)
    total_expenses = sum(item["amount"] for item in expanded_expenses)
    total_savings = sum(item["amount"] for item in expanded_savings)
    remaining = total_income - total_expenses - total_savings
    
    daily_balance = {}
    for day in range(1, last_day + 1):
        current_date = date(year, month, day)
        current_date_str = current_date.isoformat()
        
        day_incomes = [i for i in expanded_incomes if i["occurrence_date"] == current_date_str]
        day_expenses = [e for e in expanded_expenses if e["occurrence_date"] == current_date_str]
        day_savings = [s for s in expanded_savings if s["occurrence_date"] == current_date_str]
        
        day_income_total = sum(i["amount"] for i in day_incomes)
        day_expense_total = sum(e["amount"] for e in day_expenses)
        day_savings_total = sum(s["amount"] for s in day_savings)
        
        daily_balance[day] = {
            "date": current_date_str,
            "incomes": day_income_total,
            "expenses": day_expense_total,
            "savings": day_savings_total,
            "net": day_income_total - day_expense_total - day_savings_total
        }
    
    return {
        "month": month,
        "year": year,
        "total_income": total_income,
        "total_expenses": total_expenses,
        "total_savings": total_savings,
        "remaining": remaining,
        "daily_balance": daily_balance
    }
