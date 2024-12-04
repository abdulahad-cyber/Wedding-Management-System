import uuid
from datetime import datetime, timedelta

import jwt
from passlib.context import CryptContext

from src.config import Config

passwd_context = CryptContext(schemes=["bcrypt"])


def generate_passwd_hash(password: str) -> str:
    hash = passwd_context.hash(password)
    return hash


def verify_password(password: str, hash: str) -> bool:
    return passwd_context.verify(password, hash)


def create_access_token(
    # we are not implementing refresh tokens
    user_id: uuid.UUID
):

    token = jwt.encode(
        payload={"user_id": str(user_id), "exp": datetime.now() + timedelta(seconds=float(Config.ACCESS_TOKEN_EXPIRY)), "jti": str(uuid.uuid4())}, key=Config.JWT_SECRET
    )

    return token
