from fastapi import HTTPException, status
from sqlalchemy import func
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.models import Booking, Payment, Car, Venue
from uuid import UUID
from src.bookings.schemas import CreateBookingWithPaymentModel, UpdateBookingWithPaymentModel


class BookingService:
    async def get_all_bookings(self, session: AsyncSession):
        query = select(Booking)
        result = await session.exec(query)
        bookings = result.all()
        new_bookings = []
        for booking in bookings:
            # need to add array
            await session.refresh(booking, ["user", "venue", "car_reservations", "decoration", "catering", "payment", "promo"])
            new_bookings.append(booking)
        return new_bookings

    async def get_my_bookings(self, user_id: UUID, session: AsyncSession):
        query = select(Booking).where(Booking.user_id == user_id)
        result = await session.exec(query)
        bookings = result.all()
        new_bookings = []
        for booking in bookings:
            # need to add array
            await session.refresh(booking, ["user", "venue", "car_reservations", "decoration", "catering", "payment", "promo"])
            new_bookings.append(booking)
        return new_bookings

    async def get_booking(self, booking_id: UUID, session: AsyncSession):
        query = select(Booking).where(Booking.booking_id == booking_id)
        result = await session.exec(query)
        booking = result.first()

        await session.refresh(booking, ["user", "venue", "car_reservations", "decoration", "catering", "payment", "promo"])
        return booking if booking else None

    async def create_booking_with_payment(self, booking_and_payment_data: CreateBookingWithPaymentModel, session: AsyncSession):
        query = select(Booking).where(func.date(Booking.booking_event_date) == booking_and_payment_data.booking.booking_event_date.date(),
                                      Booking.venue_id == booking_and_payment_data.booking.venue_id)
        result = await session.exec(query)
        booking = result.first()
        if booking:
            return None

        query2 = select(Venue).where(Venue.venue_id ==
                                     booking_and_payment_data.booking.venue_id)
        result2 = await session.exec(query2)
        venue = result2.first()
        if venue and booking_and_payment_data.booking.booking_guest_count > venue.venue_capacity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Guest count exceeds venue capacity"
            )

        # Create the Booking object
        new_booking = Booking(
            **booking_and_payment_data.booking.model_dump()
        )
        session.add(new_booking)
        await session.commit()
        await session.refresh(new_booking, ["user", "venue", "car_reservations", "decoration", "catering", "payment", "promo"])

        # Create the Payment object and associate it with the Booking
        new_payment = Payment(
            **booking_and_payment_data.payment.model_dump(),
            booking=new_booking  # Link the payment to the booking
        )

        session.add(new_payment)
        await session.commit()
        # refersh booking again to get payment data also
        await session.refresh(new_booking, ["user", "venue", "car_reservations", "decoration", "catering", "payment", "promo"])

        return new_booking

    async def delete_booking(self, booking_id: UUID, session: AsyncSession):
        booking = await self.get_booking(booking_id, session)
        if not booking:
            return None

        # increment the car quantity of each car used in this booking's car reservations
        for car_reservation in booking.car_reservations:
            query = select(Car).where(Car.car_id == car_reservation.car_id)
            result = await session.exec(query)
            car = result.first()
            if car:
                setattr(car, "car_quantity", car.car_quantity + 1)

        print("\n\n", "awda", "\n\n")
        # all car reservations will be deleted because of on delete cascade relationship set in db/models
        await session.delete(booking)
        await session.commit()
        # await session.refresh(booking, ["user", "venue", "car_reservations", "decoration", "catering", "payment", "promo"])
        return booking

    # update booking status using this

    async def update_booking_with_payment(self, booking_id: UUID,  booking_and_payment_data: UpdateBookingWithPaymentModel, session: AsyncSession):

        booking = await self.get_booking(booking_id, session)
        if not booking:
            return None

        # Update the booking fields
        for field, value in booking_and_payment_data.booking.model_dump(exclude_unset=True).items():
            setattr(booking, field, value)
            # Update the payment fields
        if booking.payment:
            for field, value in booking_and_payment_data.payment.model_dump(exclude_unset=True).items():
                setattr(booking.payment, field, value)

        await session.commit()
        await session.refresh(booking, ["user", "venue", "car_reservations", "decoration", "catering", "payment", "promo"])
        return booking
