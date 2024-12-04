from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.main import get_session
from src.users.schemas import UserModel
from src.bookings.service import BookingService
from src.bookings.schemas import CreateBookingWithPaymentModel, UpdateBookingWithPaymentModel, BookingModel
from uuid import UUID
from src.users.JWTAuthMiddleware import JWTAuthMiddleware

booking_router = APIRouter(prefix="/bookings")
booking_service = BookingService()


@booking_router.get("/", response_model=list[BookingModel], status_code=status.HTTP_200_OK)
async def get_all_bookings(user: UserModel = Depends(JWTAuthMiddleware), session: AsyncSession = Depends(get_session)):
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )
    bookings = await booking_service.get_all_bookings(session)
    return bookings


@booking_router.get("/me", response_model=list[BookingModel], status_code=status.HTTP_200_OK)
async def get_my_bookings(user: UserModel = Depends(JWTAuthMiddleware), session: AsyncSession = Depends(get_session)):
    bookings = await booking_service.get_my_bookings(user.user_id, session)
    return bookings


@booking_router.get("/{booking_id}", response_model=BookingModel, status_code=status.HTTP_200_OK)
async def get_booking(booking_id: UUID, session: AsyncSession = Depends(get_session)):
    booking = await booking_service.get_booking(booking_id, session)
    if booking:
        return booking
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                        detail="booking not found")


@booking_router.post("/", response_model=BookingModel, status_code=status.HTTP_201_CREATED)
async def create_booking_with_payment(
    booking_and_payment_data: CreateBookingWithPaymentModel,
    user: UserModel = Depends(JWTAuthMiddleware),
    session: AsyncSession = Depends(get_session),
):

    booking = await booking_service.create_booking_with_payment(booking_and_payment_data, session)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="The chosen Venue is already reserved for another booking on the provided date"
        )
    return booking


@booking_router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_booking(
    booking_id: UUID,
    session: AsyncSession = Depends(get_session),
):
  

    deleted = await booking_service.delete_booking(booking_id, session)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="booking not found"
        )
    return deleted


@booking_router.patch("/{booking_id}", response_model=BookingModel, status_code=status.HTTP_200_OK)
async def update_booking_with_payment(
    booking_id: UUID,
    booking_and_payment_data: UpdateBookingWithPaymentModel,
    session: AsyncSession = Depends(get_session),
):

    booking = await booking_service.update_booking_with_payment(booking_id, booking_and_payment_data, session)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="booking not found"
        )
    return booking
