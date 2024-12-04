from enum import Enum
from typing import Optional
from sqlmodel import SQLModel, Field, Column, Relationship  # type: ignore
from datetime import datetime
import sqlalchemy.dialects.postgresql as pg
import uuid
from sqlalchemy import Enum as PgEnum, ForeignKey, CheckConstraint, UniqueConstraint,  text, Index


# Enums


class BookingStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    declined = "declined"


class PaymentMethod(str, Enum):
    debit_card = "debit_card"
    credit_card = "credit_card"
    easypaisa = "easypaisa"
    jazzcash = "jazzcash"
    other = "other"


class DishType(str, Enum):
    starter = "starter"
    main = "main"
    dessert = "dessert"


# Tables

class User(SQLModel, table=True):
    __tablename__: str = "user"  # type: ignore

    user_id: uuid.UUID = Field(
        sa_column=Column(
            pg.UUID,
            primary_key=True,
            default=uuid.uuid4
        )
    )
    username: str = Field(sa_column=Column(
        pg.VARCHAR(255),
        nullable=False,
        unique=False
    ))
    email: str = Field(sa_column=Column(
        pg.VARCHAR(255),
        nullable=False,
        unique=True
    ))
    password_hash: str = Field(sa_column=Column(
        pg.VARCHAR(255),
        nullable=False
    ))
    is_admin: bool = Field(sa_column=Column(
        pg.BOOLEAN,
        nullable=False,
        default=False
    ))

    # one-many relationship with user_contact
    user_contacts: list["UserContact"] = Relationship(back_populates="user", sa_relationship_kwargs={
                                                      "cascade": "all, delete-orphan", "lazy": "selectin"})
    # one-many relationship with venue_review
    venue_reviews: list["VenueReview"] = Relationship(
        back_populates="user", sa_relationship_kwargs={"cascade": "all, delete-orphan", "lazy": "selectin"})

    # one-many relationship with booking
    bookings: list["Booking"] = Relationship(
        back_populates="user", sa_relationship_kwargs={"cascade": "all, delete-orphan", "lazy": "selectin"})
    # "cascade": "all, delete-orphan" is to delete/modify/add child entities when parent entity's 'child referencing property' is deleted/modified/add
    # eg: catering.catering_menu_items[0].dish = Dish(...)
    # eg: catering.catering_menu_items[0].pop(0)


class UserContact(SQLModel, table=True):
    __tablename__: str = "user_contact"
    # user_id and user_contact_number are composite primary keys

    user_contact_number: str = Field(
        sa_column=Column(pg.VARCHAR(15), primary_key=True, nullable=False)
    )
    # one-many relationship with user
    user_id: uuid.UUID = Field(sa_column=Column(pg.UUID, ForeignKey(
        "user.user_id", ondelete="CASCADE"), nullable=False, primary_key=True))
    # ondelete="CASCADE", if user gets deleted, then user_contact also gets deleted
    user: "User" = Relationship(back_populates="user_contacts")


class Venue(SQLModel, table=True):
    __tablename__: str = "venue"

    venue_id: uuid.UUID = Field(
        sa_column=Column(pg.UUID, primary_key=True,
                         nullable=False, default=uuid.uuid4)
    )
    venue_name: str = Field(sa_column=Column(pg.VARCHAR(255), nullable=False))
    venue_address: str = Field(
        sa_column=Column(pg.VARCHAR(255), nullable=False))

    venue_capacity: int = Field(sa_column=Column(pg.INTEGER, nullable=False))

    venue_price_per_day: int = Field(
        sa_column=Column(pg.INTEGER, nullable=False))

    venue_image: str = Field(sa_column=Column(pg.VARCHAR(255), nullable=True))

    # one-many relationship with venue_review
    venue_reviews: list["VenueReview"] = Relationship(
        back_populates="venue", sa_relationship_kwargs={"cascade": "all, delete-orphan", "lazy": "selectin"})
    # in list["Type"], Type should be class name not table name(VenueReview, not venue_review)

    # one-many relationship with booking
    bookings: list["Booking"] = Relationship(back_populates="venue", sa_relationship_kwargs={
                                             "cascade": "all, delete-orphan", "lazy": "selectin"})

    # check constraint for venue_rating
    # check constraint for venue_capacity
    __table_args__ = tuple([
                           CheckConstraint("venue_capacity > 0", name="check_venue_capacity")])


class VenueReview(SQLModel, table=True):
    __tablename__: str = "venue_review"

    venue_review_id: uuid.UUID = Field(
        sa_column=Column(pg.UUID, primary_key=True,
                         nullable=False, default=uuid.uuid4)
    )
    # review text length can only be of 1000 characters
    venue_review_text: str = Field(
        sa_column=Column(pg.VARCHAR(1000), nullable=False))
    venue_review_created_at: datetime = Field(
        sa_column=Column(pg.TIMESTAMP, nullable=False, default=datetime.now)
    )
    venue_rating: int = Field(sa_column=Column(
        pg.FLOAT,  nullable=False, default=0))
    # one-many relationship with venue
    venue_id: uuid.UUID = Field(
        sa_column=Column(pg.UUID, ForeignKey(
            "venue.venue_id", ondelete="CASCADE"), nullable=False)
    )
    venue: "Venue" = Relationship(back_populates="venue_reviews")
    # one-many relationship with users
    user_id: uuid.UUID = Field(
        sa_column=Column(pg.UUID, ForeignKey(
            "user.user_id", ondelete="CASCADE"), nullable=False)
    )
    user: "User" = Relationship(back_populates="venue_reviews")
    __table_args__ = tuple(
        [CheckConstraint("venue_rating >= 1", name="check_venue_rating")])


class Payment(SQLModel, table=True):
    __tablename__: str = "payment"

    payment_id: uuid.UUID = Field(
        sa_column=Column(pg.UUID, primary_key=True,
                         nullable=False, default=uuid.uuid4)
    )
    amount_payed: int = Field(sa_column=Column(pg.INTEGER,   nullable=False))
    discount: float = Field(sa_column=Column(pg.FLOAT, nullable=False))
    total_amount: int = Field(sa_column=Column(pg.INTEGER, nullable=False))

    payment_method: PaymentMethod = Field(
        sa_column=Column(PgEnum(PaymentMethod), nullable=False,
                         default=PaymentMethod.debit_card)
    )
    # one-one relationship with booking
    booking: "Booking" = Relationship(back_populates="payment")

    booking_id: uuid.UUID = Field(
        sa_column=Column(pg.UUID, ForeignKey(
            "booking.booking_id", ondelete="CASCADE"), nullable=False)
    )

    # check constraint for amount_payed
    # check constraint for total_amount
    __table_args__ = tuple([CheckConstraint(
        "amount_payed >= 0", name="check_payment_amount_payed"), CheckConstraint(
        "total_amount >= 0", name="check_payment_total_amount"), CheckConstraint(
        "discount >= 0", name="check_payment_discount")])


class Decoration(SQLModel, table=True):
    __tablename__: str = "decoration"

    decoration_id: uuid.UUID = Field(
        sa_column=Column(pg.UUID, primary_key=True,
                         nullable=False, default=uuid.uuid4)
    )
    decoration_name: str = Field(
        sa_column=Column(pg.VARCHAR(255), nullable=False))
    decoration_price: int = Field(
        sa_column=Column(pg.INTEGER,   nullable=False))
    decoration_description: str = Field(
        sa_column=Column(pg.VARCHAR(255), nullable=False))
    decoration_image: str = Field(
        sa_column=Column(pg.VARCHAR(255), nullable=True))

    # one-many relationship with booking
    bookings: list["Booking"] = Relationship(
        back_populates="decoration", sa_relationship_kwargs={"cascade": "all, delete-orphan", "lazy": "selectin"})

    # check constraint for decoration_price
    __table_args__ = tuple([CheckConstraint(
        "decoration_price >= 0", name="check_decoration_price")])


class Car(SQLModel, table=True):
    __tablename__: str = "car"

    car_id: uuid.UUID = Field(
        sa_column=Column(pg.UUID, primary_key=True,
                         nullable=False, default=uuid.uuid4)
    )
    car_make: str = Field(sa_column=Column(pg.VARCHAR(255), nullable=False))
    car_model: str = Field(sa_column=Column(pg.VARCHAR(255), nullable=False))
    car_year: int = Field(sa_column=Column(pg.INTEGER,
                                           nullable=False))
    car_rental_price: int = Field(
        sa_column=Column(pg.INTEGER,  nullable=False))
    car_image: str = Field(sa_column=Column(pg.VARCHAR(255), nullable=True))
    car_quantity: int = Field(sa_column=Column(pg.INTEGER, nullable=False))

    # one-many relationship with car_reservation
    car_reservations: list["CarReservation"] = Relationship(
        back_populates="car", sa_relationship_kwargs={"cascade": "all, delete-orphan", "lazy": "selectin"})

    # check constraint for car_rental_price
    # check constraint for car_quantity
    # check constraint for car_year
    __table_args__ = tuple([CheckConstraint("car_rental_price >= 0", name="check_car_rental_price"), CheckConstraint(
        "car_quantity >= 0", name="check_car_quantity"), CheckConstraint(f"car_year BETWEEN 1886 AND EXTRACT(YEAR FROM CURRENT_DATE) + 1", name="check_car_year_valid")])
# Car reservation table = many to many relation b/w car and booking


class CarReservation(SQLModel, table=True):
    __tablename__: str = "car_reservation"

    car_reservation_id: uuid.UUID = Field(
        sa_column=Column(pg.UUID, primary_key=True,
                         nullable=False, default=uuid.uuid4)
    )
    # one-many relationship with car
    car_id: uuid.UUID = Field(sa_column=Column(
        pg.UUID, ForeignKey("car.car_id", ondelete="CASCADE"), nullable=False))
    car: "Car" = Relationship(back_populates="car_reservations")
    # one-many relationship with booking
    booking_id: uuid.UUID = Field(sa_column=Column(
        pg.UUID, ForeignKey("booking.booking_id", ondelete="CASCADE"), nullable=False))
    booking: "Booking" = Relationship(back_populates="car_reservations")


class Catering(SQLModel, table=True):
    __tablename__: str = "catering"

    catering_id: uuid.UUID = Field(
        sa_column=Column(pg.UUID, primary_key=True,
                         nullable=False, default=uuid.uuid4)
    )
    catering_description: str = Field(
        sa_column=Column(pg.VARCHAR(1000), nullable=False))
    catering_name: str = Field(
        sa_column=Column(pg.VARCHAR(255), nullable=False))
    catering_image: str = Field(
        sa_column=Column(pg.VARCHAR(255), nullable=True))

    # one-many relationship with booking
    bookings: list["Booking"] = Relationship(back_populates="catering", sa_relationship_kwargs={
        "cascade": "all, delete-orphan", "lazy": "selectin"})

    # one-many relationship with CateringMenuItem
    catering_menu_items: list["CateringMenuItem"] = Relationship(
        back_populates="catering", sa_relationship_kwargs={"cascade": "all, delete-orphan", "lazy": "selectin"})


class Dish(SQLModel, table=True):
    __tablename__: str = "dish"

    dish_id: uuid.UUID = Field(
        sa_column=Column(pg.UUID, primary_key=True,
                         nullable=False, default=uuid.uuid4)
    )
    dish_name: str = Field(sa_column=Column(pg.VARCHAR(255), nullable=False))
    dish_description: str = Field(
        sa_column=Column(pg.VARCHAR(1000), nullable=False))
    dish_type: DishType = Field(
        sa_column=Column(PgEnum(DishType), nullable=False,
                         default=DishType.main)
    )
    dish_image: str = Field(sa_column=Column(pg.VARCHAR(255), nullable=True))
    dish_cost_per_serving: int = Field(
        sa_column=Column(pg.INTEGER,  nullable=False))

    # one-many relationship with dishes
    catering_menu_items: list["CateringMenuItem"] = Relationship(
        back_populates="dish", sa_relationship_kwargs={"cascade": "all, delete-orphan", "lazy": "selectin"})

    # check constraint for dish_cost_per_serving
    __table_args__ = tuple([CheckConstraint(
        "dish_cost_per_serving >= 0", name="check_dish_cost_per_serving")])


# Catering Menu Item = many to many realtion b/w catering and dish
class CateringMenuItem(SQLModel, table=True):
    __tablename__: str = "catering_menu_item"
    # catering_id and booking_id are composite primary keys
    # one-many relationship with car
    catering_id: uuid.UUID = Field(sa_column=Column(pg.UUID, ForeignKey(
        "catering.catering_id", ondelete="CASCADE"), nullable=False, primary_key=True))
    catering: "Catering" = Relationship(back_populates="catering_menu_items")
    # one-many relationship with booking
    dish_id: uuid.UUID = Field(sa_column=Column(pg.UUID, ForeignKey(
        "dish.dish_id", ondelete="CASCADE"), nullable=False, primary_key=True))
    dish: "Dish" = Relationship(back_populates="catering_menu_items")


class Promo(SQLModel, table=True):
    __tablename__: str = "promo"

    promo_id: uuid.UUID = Field(
        sa_column=Column(pg.UUID, primary_key=True,
                         nullable=False, default=uuid.uuid4)
    )
    promo_name: str = Field(sa_column=Column(pg.VARCHAR(255), nullable=False))
    promo_expiry: datetime = Field(
        sa_column=Column(pg.TIMESTAMP,  nullable=False))

    # check constraint for promo_discount
    promo_discount: float = Field(sa_column=Column(pg.FLOAT,  nullable=False))

    # one-many relationship with booking
    bookings: list["Booking"] = Relationship(back_populates="promo", sa_relationship_kwargs={
        "cascade": "all, delete-orphan", "lazy": "selectin"})

    # Adding the constraint to ensure the promo_expiry is greater than the current date
    # check constraint for promo_discount
    __table_args__ = tuple([CheckConstraint("promo_expiry > CURRENT_TIMESTAMP", name="check_promo_expiry"),
                           CheckConstraint("promo_discount > 0", name="check_promo_discount")])


class Booking(SQLModel, table=True):
    __tablename__: str = "booking"

    booking_id: uuid.UUID = Field(
        sa_column=Column(pg.UUID, primary_key=True,
                         nullable=False, default=uuid.uuid4)
    )
    booking_date: datetime = Field(
        sa_column=Column(pg.TIMESTAMP, nullable=False, default=datetime.now)
    )

    booking_event_date: datetime = Field(
        sa_column=Column(pg.TIMESTAMP, nullable=False))

    booking_guest_count: int = Field(
        sa_column=Column(pg.INTEGER,  nullable=False))

    booking_status: BookingStatus = Field(
        sa_column=Column(PgEnum(BookingStatus), nullable=False,
                         default=BookingStatus.pending)
    )

    # one-many relationship with user(COMPULSORY)
    user_id: uuid.UUID = Field(
        sa_column=Column(pg.UUID, ForeignKey(
            "user.user_id", ondelete="CASCADE"), nullable=False)
    )
    user: "User" = Relationship(back_populates="bookings")

    # one-one relationship with payment(COMPULSORY)
    payment: Payment | None = Relationship(back_populates="booking", sa_relationship_kwargs={
        "cascade": "all, delete-orphan", "lazy": "selectin"})

    # one-many relationship with venue(COMPULSORY)
    venue_id: uuid.UUID = Field(
        sa_column=Column(pg.UUID, ForeignKey(
            "venue.venue_id", ondelete="CASCADE"), nullable=False)
    )
    venue: "Venue" = Relationship(back_populates="bookings")

    # one-many relationship with catering(OPTIONAL)
    catering_id: uuid.UUID = Field(
        sa_column=Column(pg.UUID, ForeignKey(
            "catering.catering_id", ondelete="CASCADE"), nullable=True)
    )
    catering: "Catering" = Relationship(back_populates="bookings")

    # one-many relationship with Decoration(OPTIONAL)
    decoration_id: uuid.UUID = Field(
        sa_column=Column(pg.UUID, ForeignKey(
            "decoration.decoration_id", ondelete="CASCADE"), nullable=True)
    )
    decoration: "Decoration" = Relationship(back_populates="bookings")

    # one-many relationship with car_reservation
    car_reservations: list["CarReservation"] = Relationship(
        back_populates="booking", sa_relationship_kwargs={"cascade": "all, delete-orphan", "lazy": "selectin"})

    # one-many relationship with promo(OPTIONAL)
    promo_id: uuid.UUID = Field(
        sa_column=Column(pg.UUID, ForeignKey(
            "promo.promo_id", ondelete="CASCADE"), nullable=True)
    )
    promo: "Promo" = Relationship(back_populates="bookings")

    # check to see if booking event date is not in the past
    # check constraint for booking_guest_count, there must be atleast 1 guest
    # check constraint for booking_total_cost
    # check constraint for booking_discount
    __table_args__ = tuple([Index(
        'unique_venue_reservation_day',
        "venue_id",
        text('DATE(booking_event_date)'),
        unique=True
    ),  CheckConstraint("booking_event_date > CURRENT_TIMESTAMP",
                        name="check_booking_event_date"), CheckConstraint("booking_guest_count > 0", name="check_booking_guest_count")])

    # unique index for venue and booking_event_date
# PostgreSQL doesn't allow functions in UNIQUE constraints, but it does allow them in unique indexes
# A unique index provides the same guarantee as a unique constraint while also improving query performance
