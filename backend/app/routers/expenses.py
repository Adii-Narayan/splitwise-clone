from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/groups",
    tags=["Expenses"]
)

# === Add Expense ===
@router.post("/{group_id}/expenses", response_model=schemas.Expense)
def add_expense(group_id: int, expense: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    # ✅ Check if group exists
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # ✅ Create the expense record
    new_expense = models.Expense(
        description=expense.description,
        amount=expense.amount,
        paid_by=expense.paid_by,
        group_id=group_id,
        split_type=expense.split_type,
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    total_amount = expense.amount
    splits = []

    # === Equal Split ===
    if expense.split_type == "equal":
        num_users = len(expense.splits)
        if num_users == 0:
            raise HTTPException(status_code=400, detail="At least one user must be provided for splitting.")

        share = round(total_amount / num_users, 2)

        for s in expense.splits:
            split = models.Split(
                expense_id=new_expense.id,
                user_id=s.user_id,
                amount=share,
                percentage=None
            )
            db.add(split)
            splits.append(split)

    # === Percentage Split ===
    elif expense.split_type == "percentage":
        total_percentage = sum(s.percentage or 0 for s in expense.splits)
        if round(total_percentage, 2) != 100.0:
            raise HTTPException(status_code=400, detail="Percentages must total 100%")

        for s in expense.splits:
            if s.percentage is None:
                raise HTTPException(status_code=400, detail="Percentage missing for a user.")
            amount = round((s.percentage / 100) * total_amount, 2)
            split = models.Split(
                expense_id=new_expense.id,
                user_id=s.user_id,
                amount=amount,
                percentage=s.percentage
            )
            db.add(split)
            splits.append(split)

    else:
        raise HTTPException(status_code=400, detail="Invalid split_type. Use 'equal' or 'percentage'.")

    db.commit()
    db.refresh(new_expense)
    new_expense.splits = splits  # Attach splits manually for API response

    return new_expense
