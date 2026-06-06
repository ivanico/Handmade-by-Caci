from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.core.security import verify_password
from app.models.user import User
from app.repositories import user_repository
from app.schemas.auth import RegisterRequest


async def register(db: AsyncSession, data: RegisterRequest) -> User:
    existing = await user_repository.get_by_email(db, data.email)
    if existing:
        raise ValueError("Email already registered")

    hashed = hash_password(data.password)
    return await user_repository.create_user(
        db,
        email=data.email,
        hashed_password=hashed,
        full_name=data.full_name,
        phone=data.phone,
    )


async def authenticate(db: AsyncSession, email: str, password: str) -> User:
    user = await user_repository.get_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        raise ValueError("Invalid credentials")
    return user


async def get_user(db: AsyncSession, user_id: int) -> User | None:
    return await user_repository.get_by_id(db, user_id)