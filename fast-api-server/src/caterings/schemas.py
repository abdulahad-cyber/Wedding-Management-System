from pydantic import BaseModel, Field
import uuid
from src.db.models import Booking, CateringMenuItem, DishType

# Dish Model Schema


class DishModel(BaseModel):
    dish_id: uuid.UUID
    dish_name: str
    dish_description: str
    dish_image: str | None = None
    dish_type: DishType
    dish_cost_per_serving: int = Field(ge=0)
    catering_menu_items: list[CateringMenuItem]

# Catering Model Schema


class CateringModel(BaseModel):
    catering_id: uuid.UUID
    catering_name: str
    catering_description: str
    catering_image: str | None = None
    catering_menu_items: list[CateringMenuItem]
    bookings: list[Booking]
# Create Catering Schema


class CreateCateringModel(BaseModel):
    catering_name: str
    catering_description: str
    catering_image: str | None = None

# Create Dish Schema


class CreateDishModel(BaseModel):
    dish_name: str
    dish_description: str
    dish_type: DishType
    dish_cost_per_serving: int = Field(ge=0)
    dish_image: str | None = None


class CateringMenuItemModel(BaseModel):
    catering_id: uuid.UUID
    dish_id: uuid.UUID
