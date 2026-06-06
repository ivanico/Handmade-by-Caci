import asyncio

import bcrypt
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.product import Category


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

CATEGORIES = [
    {"name": "Jewelry", "slug": "jewelry"},
    {"name": "Gift Cards", "slug": "gift-cards"},
    {"name": "Wedding Decorations", "slug": "wedding-decorations"},
    {"name": "Home Decor", "slug": "home-decor"},
    {"name": "Accessories", "slug": "accessories"},
]


async def seed() -> None:
    async with AsyncSessionLocal() as session:
        async with session.begin():
            existing_admin = await session.scalar(select(User).where(User.email == "admin@shop.com"))
            if not existing_admin:
                session.add(User(
                    email="admin@shop.com",
                    hashed_password=hash_password("admin123"),
                    full_name="Admin",
                    role="admin",
                    is_active=True,
                ))
                print("Created admin user")
            else:
                print("Admin user already exists, skipping")

            for cat in CATEGORIES:
                existing = await session.scalar(select(Category).where(Category.slug == cat["slug"]))
                if not existing:
                    session.add(Category(name=cat["name"], slug=cat["slug"], is_active=True))
                    print(f"Created category: {cat['slug']}")
                else:
                    print(f"Category '{cat['slug']}' already exists, skipping")


if __name__ == "__main__":
    asyncio.run(seed())