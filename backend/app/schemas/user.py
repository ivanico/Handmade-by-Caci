from pydantic import BaseModel


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str | None = None
    role: str
    phone: str | None = None

    model_config = {"from_attributes": True}