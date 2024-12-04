from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.models import Car, CarReservation
from uuid import UUID, uuid4
from src.utils import delete_image
from src.cars.schemas import CreateCarModel


class CarService:
    async def get_all_cars(self, session: AsyncSession):
        query = select(Car)
        result = await session.exec(query)
        cars = result.all()
        return cars

    async def get_car(self, car_id: UUID, session: AsyncSession):
        query = select(Car).where(Car.car_id == car_id)
        result = await session.exec(query)
        car = result.first()
        return car if car else None

    async def create_car(self, car_data: CreateCarModel, session: AsyncSession):
        new_car = Car(**car_data.model_dump())
        session.add(new_car)
        await session.commit()
        await session.refresh(new_car)

        return new_car

    async def delete_car(self, car_id: UUID, session: AsyncSession):
        query = select(Car).where(Car.car_id == car_id)
        results = await session.exec(query)
        car = results.first()
        if not car:
            return None
        # Extract and delete the associated image file, if it exists
        await delete_image(car.car_image)
        await session.delete(car)
        await session.commit()
        return car

    async def get_all_car_reservations(self, session: AsyncSession):
        # Query to get all car reservations
        query = select(CarReservation)
        result = await session.exec(query)
        car_reservations = result.all()
        return car_reservations

    async def add_car_reservation(self, car_id: UUID, booking_id: UUID, session: AsyncSession):
        query = select(Car).where(Car.car_id == car_id)
        result = await session.exec(query)
        car = result.first()
        if (car and car.car_quantity > 0):
            new_car_reservation = CarReservation(
                car_id=car_id, booking_id=booking_id, car_reservation_id=uuid4())
            session.add(new_car_reservation)
            await session.commit()
            await session.refresh(new_car_reservation)
            return new_car_reservation
        return None

    async def remove_car_reservation(self, car_reservation_id: UUID, session: AsyncSession):
        query = select(CarReservation).where(
            CarReservation.car_reservation_id == car_reservation_id)
        result = await session.exec(query)
        car_reservation = result.first()
        if not car_reservation:
            return None
        await session.delete(car_reservation)
        # Increment car quantity
        car = await self.get_car(car_reservation.car_id, session)
        if car:
            await self.update_car_quantity(car.car_id, car.car_quantity + 1, session)
        await session.commit()
        return car_reservation

    async def update_car_quantity(self, car_id: UUID, car_quantity: int, session: AsyncSession):
        car = await self.get_car(car_id, session)
        setattr(car, "car_quantity", car_quantity)
        await session.commit()
        await session.refresh(car)
        return car if car else None
