from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from collections import defaultdict

from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/groups",
    tags=["Balances"]
)

# === Get Group Balances ===
@router.get("/{group_id}/balances", response_model=List[schemas.BalanceResponse])
def get_group_balances(group_id: int, db: Session = Depends(get_db)):
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    expenses = db.query(models.Expense).filter(models.Expense.group_id == group_id).all()

    # Track balances: balances[from_user][to_user] = amount owed
    balances: Dict[int, Dict[int, float]] = defaultdict(lambda: defaultdict(float))

    for expense in expenses:
        payer = expense.paid_by
        total_amount = expense.amount
        splits = db.query(models.Split).filter(models.Split.expense_id == expense.id).all()

        for split in splits:
            if split.user_id == payer:
                continue  # Skip if user paid for their own share

            split_amount = split.amount
            if split_amount is None and split.percentage is not None:
                split_amount = (split.percentage / 100.0) * total_amount

            if split_amount:
                balances[split.user_id][payer] += round(split_amount, 2)

    # Convert to regular dict for safe iteration
    balances_copy = {k: dict(v) for k, v in balances.items()}
    simplified_balances = []
    processed_pairs = set()

    for from_user in balances_copy:
        for to_user in balances_copy[from_user]:
            if (from_user, to_user) in processed_pairs or (to_user, from_user) in processed_pairs:
                continue

            forward = balances_copy[from_user][to_user]
            backward = balances_copy.get(to_user, {}).get(from_user, 0)
            net = round(forward - backward, 2)

            if net > 0:
                simplified_balances.append(schemas.BalanceResponse(
                    from_=from_user,
                    to=to_user,
                    amount=net
                ))
            elif net < 0:
                simplified_balances.append(schemas.BalanceResponse(
                    from_=to_user,
                    to=from_user,
                    amount=abs(net)
                ))

            processed_pairs.add((from_user, to_user))
            processed_pairs.add((to_user, from_user))

    return simplified_balances
