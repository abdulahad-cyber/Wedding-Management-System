from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pyparsing import C
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.main import get_session
from uuid import UUID
from src.caterings.service import CateringService
from src.caterings.schemas import CateringModel, CreateCateringModel, DishModel, CreateDishModel, CateringMenuItemModel
from src.users.JWTAuthMiddleware import JWTAuthMiddleware
from src.users.schemas import UserModel
from src.utils import upload_image
from src.config import Config
from src.db.models import DishType

catering_router = APIRouter(prefix="/caterings")
catering_service = CateringService()


# Get all caterings along with their menu items
@catering_router.get("/", response_model=list[CateringModel], status_code=status.HTTP_200_OK)
async def get_all_caterings(session: AsyncSession = Depends(get_session)):
    caterings = await catering_service.get_all_caterings(session)
    return caterings

# Get all  dishes


@catering_router.get("/dishes", response_model=list[DishModel], status_code=status.HTTP_200_OK)
async def get_all_dishes(session: AsyncSession = Depends(get_session)):
    dishes = await catering_service.get_all_dishes(session)
    return dishes

# Get dish


@catering_router.get("/dishes/{dish_id}", response_model=DishModel, status_code=status.HTTP_200_OK)
async def get_dish(dish_id: UUID, session: AsyncSession = Depends(get_session)):
    dish = await catering_service.get_dish(dish_id, session)
    if not dish:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Dish not found")
    return dish


# Add a new catering
@catering_router.post("/", response_model=CateringModel, status_code=status.HTTP_201_CREATED)
async def create_catering(
    catering_name: str = Form(...),
    catering_description: str = Form(...),
    catering_image: UploadFile | None = File(None),  # Handle image file upload
    user: UserModel = Depends(JWTAuthMiddleware),
    session: AsyncSession = Depends(get_session),
):
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )

    # Upload the image and get the file path
    image_name = await upload_image(catering_image)
    # Create new decoration
    catering_data = CreateCateringModel(
        catering_name=catering_name,
        catering_description=catering_description,
        catering_image=None if not image_name else f"{Config.SERVER_BASE_URL}images/{image_name}",
    )
    catering = await catering_service.create_catering(catering_data, session)
    return catering


# Delete a catering
@catering_router.delete("/{catering_id}",  status_code=status.HTTP_204_NO_CONTENT)
async def delete_catering(catering_id: UUID, user: UserModel = Depends(JWTAuthMiddleware), session: AsyncSession = Depends(get_session)):
    if (not user.is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    deleted_catering = await catering_service.delete_catering(catering_id, session)
    if not deleted_catering:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Catering not found")
    return deleted_catering


# Add a new dish
@catering_router.post("/dishes", response_model=DishModel, status_code=status.HTTP_201_CREATED)
async def create_dish(dish_name: str = Form(...),
                      dish_description: str = Form(...),
                      dish_cost_per_serving: int = Form(...),
                      dish_type: DishType = Form(
                          DishType.main),  # defaulted to main

                      # Handle image file upload
                      dish_image: UploadFile | None = File(None),
                      user: UserModel = Depends(JWTAuthMiddleware),
                      session: AsyncSession = Depends(get_session),):
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )

    # Upload the image and get the file path
    image_name = await upload_image(dish_image)
    # Create new decoration
    dish_data = CreateDishModel(
        dish_name=dish_name,
        dish_description=dish_description,
        dish_cost_per_serving=dish_cost_per_serving,
        dish_type=dish_type,
        dish_image=None if not image_name else f"{Config.SERVER_BASE_URL}images/{image_name}",
    )
    dish = await catering_service.create_dish(dish_data, session)
    return dish


# Delete a dish
@catering_router.delete("/dishes/{dish_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dish(dish_id: UUID, user: UserModel = Depends(JWTAuthMiddleware), session: AsyncSession = Depends(get_session)):
    if (not user.is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    deleted_dish = await catering_service.delete_dish(dish_id, session)
    if not deleted_dish:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Dish not found")
    return deleted_dish


# Add a dish to a catering
@catering_router.post("/{catering_id}/dishes/{dish_id}", response_model=CateringMenuItemModel, status_code=status.HTTP_201_CREATED)
async def add_dish_to_catering(catering_id: UUID,  dish_id: UUID, user: UserModel = Depends(JWTAuthMiddleware),  session: AsyncSession = Depends(get_session)):
    if (not user.is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    catering_menu_item = await catering_service.add_dish_to_catering(catering_id, dish_id, session)
    if not catering_menu_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Catering or Dish not found")
    return catering_menu_item


# Remove a dish to a catering
@catering_router.delete("/{catering_id}/dishes/{dish_id}",  status_code=status.HTTP_204_NO_CONTENT)
async def remove_dish_to_catering(catering_id: UUID,  dish_id: UUID, user: UserModel = Depends(JWTAuthMiddleware),  session: AsyncSession = Depends(get_session)):
    if (not user.is_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    catering_menu_item = await catering_service.remove_dish_from_catering(catering_id, dish_id, session)
    if not catering_menu_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Catering Menu Item not found")
    return catering_menu_item
