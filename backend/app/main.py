from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import groups, expenses, balances
from .database import Base, engine

# Initialize app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://splitwise-frontend-6jxy.onrender.com/"],  # Or ["*"] for dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

# Register routers
app.include_router(groups.router)
app.include_router(expenses.router)
app.include_router(balances.router)

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Splitwise Clone API is running"}
