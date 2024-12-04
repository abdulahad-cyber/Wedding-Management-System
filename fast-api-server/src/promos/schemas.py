from pydantic import BaseModel, Field, field_validator
import uuid
from datetime import datetime


class PromoModel(BaseModel):
    promo_id: uuid.UUID
    promo_name: str
    promo_expiry: datetime
    promo_discount: float = Field(gt=0)

    


class CreatePromoModel(BaseModel):
    promo_name: str
    # expects new dateObject.toISOString() string from JS frontend as ISO 8601
    promo_expiry: datetime
    promo_discount: float = Field(gt=0)

    @field_validator("promo_expiry")
    def validate_promo_expiry(cls, value):
        if value.tzinfo is not None:
            value = value.replace(tzinfo=None)
        if not (value > datetime.now().replace(tzinfo=None)):
            raise ValueError("promo_expiry cannot be in the past")
        return value
