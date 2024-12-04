from pydantic import BaseModel, Field, field_validator
from uuid import UUID
from src.db.models import CarReservation
from datetime import datetime


class CarModel(BaseModel):
    car_id: UUID
    car_make: str
    car_model: str
    car_year: int
    car_rental_price: int = Field(ge=0)
    car_image: str | None
    car_quantity: int = Field(ge=0)
    # Assuming you have the CarReservation model
    car_reservations: list["CarReservation"]

    @field_validator("car_year")
    def validate_car_year(cls, value):
        current_year = datetime.now().year
        if not (1886 <= value <= current_year + 1):
            raise ValueError(
                f"car_year must be between 1886 and {current_year + 1}")
        return value


class CreateCarModel(BaseModel):
    car_make: str
    car_model: str
    car_year: int
    car_rental_price: int = Field(ge=0)
    car_image: str | None
    car_quantity: int = Field(ge=0)
    @field_validator("car_year")
    def validate_car_year(cls, value):
        current_year = datetime.now().year
        if not (1886 <= value <= current_year + 1):
            raise ValueError(
                f"car_year must be between 1886 and {current_year + 1}")
        return value


class CarReservationModel(BaseModel):
    car_reservation_id: UUID
    car_id: UUID
    booking_id: UUID
