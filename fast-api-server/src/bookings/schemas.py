from pydantic import BaseModel, Field, field_validator
from uuid import UUID

from src.db.models import CarReservation, Payment, Promo, User, Catering, Decoration, Venue, Promo, PaymentMethod
from datetime import datetime
from src.db.models import BookingStatus
from src.users.schemas import UserModel


class BookingModel(BaseModel):
    booking_id: UUID
    booking_date: datetime
    booking_event_date: datetime
    booking_guest_count: int = Field(ge=1)
    booking_status: BookingStatus
    user: UserModel  # exlcudes the password
    venue: Venue
    payment: Payment
    catering: Catering | None = None
    decoration: Decoration | None = None
    car_reservations: list[CarReservation]
    promo: Promo | None = None


class PaymentModel(BaseModel):
    payment_id: UUID
    amount_payed: int = Field(ge=0)
    total_amount: int = Field(ge=0)
    payment_method: PaymentMethod
    discount: float = Field(ge=0)


class CreateBookingModel(BaseModel):
    booking_event_date: datetime
    booking_guest_count: int = Field(ge=1)
    booking_status: BookingStatus = BookingStatus.pending
    user_id: UUID
    venue_id: UUID
    catering_id: UUID | None = None
    decoration_id: UUID | None = None
    promo_id: UUID | None = None

    @field_validator("booking_event_date")
    def validate_promo_expiry(cls, value):
        if value.tzinfo is not None:
            value = value.replace(tzinfo=None)
        if not (value > datetime.now().replace(tzinfo=None)):
            raise ValueError("booking_event_date cannot be in the past")
        return value


class CreatePaymentModel(BaseModel):
    amount_payed: int = Field(ge=0)
    total_amount: int = Field(ge=0)
    payment_method: PaymentMethod
    discount: float = Field(ge=0)


class UpdateBookingModel(BaseModel):
    booking_event_date: datetime | None = None
    booking_guest_count: int | None = Field(ge=1, default=None)
    booking_status: BookingStatus | None = None
    user_id: UUID | None = None
    venue_id: UUID | None = None
    catering_id: UUID | None = None
    decoration_id: UUID | None = None
    promo_id: UUID | None = None

    @field_validator("booking_event_date")
    def validate_promo_expiry(cls, value):
        if value.tzinfo is not None:
            value = value.replace(tzinfo=None)
        if not (value > datetime.now().replace(tzinfo=None)):
            raise ValueError("booking_event_date cannot be in the past")
        return value


class UpdatePaymentModel(BaseModel):
    amount_payed: int | None = Field(ge=0, default=None)
    total_amount: int | None = Field(ge=0, default=None)
    payment_method: PaymentMethod | None = None
    discount: float | None = Field(ge=0, default=None)


class CreateBookingWithPaymentModel(BaseModel):
    booking: CreateBookingModel
    payment: CreatePaymentModel


class UpdateBookingWithPaymentModel(BaseModel):
    booking: UpdateBookingModel
    payment: UpdatePaymentModel
