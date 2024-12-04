from pydantic import BaseModel, Field
import uuid


class UserModel(BaseModel):  # this is the response model
    user_id: uuid.UUID  
    username: str
    email: str
    password_hash: str = Field(exclude=True)
    is_admin: bool

 

class CreateUserModel(BaseModel):
    username: str
    email: str
    password: str


class LoginUserModel(BaseModel):
    email: str
    password: str
