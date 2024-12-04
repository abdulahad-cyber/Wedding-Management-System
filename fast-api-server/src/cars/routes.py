from fastapi import APIRouter, Depends, HTTPException, status, File, Form, UploadFile
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.main import get_session
from src.users.schemas import UserModel
from src.cars.service import CarService
from src.cars.schemas import CarModel, CreateCarModel, CarReservationModel
from uuid import UUID
from src.users.JWTAuthMiddleware import JWTAuthMiddleware
from src.config import Config
from src.utils import upload_image

car_router = APIRouter(prefix="/cars")
car_service = CarService()


@car_router.get("/", response_model=list[CarModel], status_code=status.HTTP_200_OK)
async def get_all_cars(session: AsyncSession = Depends(get_session)):
    cars = await car_service.get_all_cars(session)
    return cars


@car_router.get("/reservations",  response_model=list[CarReservationModel], status_code=status.HTTP_200_OK)
async def get_all_reservations(session: AsyncSession = Depends(get_session), user: UserModel = Depends(JWTAuthMiddleware)):
    print("hey")
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )
    # Fetch all car reservations
    car_reservations = await car_service.get_all_car_reservations(session)
    return car_reservations


@car_router.get("/{car_id}", response_model=CarModel, status_code=status.HTTP_200_OK)
async def get_car(car_id: UUID, session: AsyncSession = Depends(get_session)):
    car = await car_service.get_car(car_id, session)
    if car:
        return car
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                        detail="Car not found")


@car_router.post("/", response_model=CarModel, status_code=status.HTTP_201_CREATED)
async def create_car(
    car_make: str = Form(...),
    car_model: str = Form(...),
    car_year: int = Form(...),
    car_rental_price: int = Form(...),
    car_image: UploadFile | None = File(None),
    car_quantity: int | None = Form(None),
    user: UserModel = Depends(JWTAuthMiddleware),
    session: AsyncSession = Depends(get_session),
):
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )

    # Upload the image and get the file path
    image_name = await upload_image(car_image)
    # Create new car
    car_data = CreateCarModel(
        car_make=car_make,
        car_model=car_model,
        car_year=car_year,
        car_rental_price=car_rental_price,
        car_image=None if not image_name else f"{Config.SERVER_BASE_URL}images/{image_name}",
        car_quantity=car_quantity if car_quantity is not None else 0
    )
    car = await car_service.create_car(car_data, session)
    return car


@car_router.delete("/{car_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_car(
    car_id: UUID,
    user: UserModel = Depends(JWTAuthMiddleware),
    session: AsyncSession = Depends(get_session),
):
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )
    deleted = await car_service.delete_car(car_id, session)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Car not found"
        )
    return deleted


@car_router.post("/{car_id}/{booking_id}", response_model=CarReservationModel, status_code=status.HTTP_201_CREATED)
async def add_car_reservation(
    car_id: UUID,
    booking_id: UUID,
    user: UserModel = Depends(JWTAuthMiddleware),
    session: AsyncSession = Depends(get_session),
):

    # Add car reservation using path parameters
    car_reservation = await car_service.add_car_reservation(car_id, booking_id, session)
    if not car_reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Car not available"
        )
    return car_reservation


@car_router.delete("/reservations/{car_reservation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_car_reservation(
    car_reservation_id: UUID,
    session: AsyncSession = Depends(get_session),
):

    # Remove car reservation using car_reservation_id
    deleted_reservation = await car_service.remove_car_reservation(car_reservation_id, session)
    if not deleted_reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Car reservation not found"
        )

    return deleted_reservation


# @car_router.patch("/{booking_id}", response_model=CarModel, status_code=status.HTTP_200_OK)
# async def update_car_quantity(
#     car_id: UUID,
#     car_quantity: int,
#     user: UserModel = Depends(JWTAuthMiddleware),
#     session: AsyncSession = Depends(get_session),
# ):
#     if not user.is_admin:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
#         )

#     car = await car_service.update_car_quantity(car_id, car_quantity, session)
#     if not car:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND, detail="car not found"
#         )
#     return car
