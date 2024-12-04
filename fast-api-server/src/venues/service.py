from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.models import Venue, VenueReview
from src.venues.schemas import CreateVenueModel, CreateVenueReviewModel
from uuid import UUID
from src.utils import delete_image


class VenueService:
    async def get_all_venues(self, session: AsyncSession):
        query = select(Venue)
        result = await session.exec(query)
        venues = result.all()
        new_venues = []
        for venue in venues:
            # need to add array
            await session.refresh(venue, ["venue_reviews"])

            for review in venue.venue_reviews:
                await session.refresh(review, ["user"])

            new_venues.append(venue)
        return new_venues

    async def get_venue(self, venue_id: UUID, session: AsyncSession):
        query = select(Venue).where(Venue.venue_id == venue_id)
        result = await session.exec(query)
        venue = result.first()
        return venue if venue else None

    async def create_venue(self, venue_data: CreateVenueModel, session: AsyncSession):
        new_venue = Venue(**venue_data.model_dump())
        session.add(new_venue)
        await session.commit()
        await session.refresh(new_venue)
        return new_venue

    async def delete_venue(self, venue_id: UUID, session: AsyncSession):

        query = select(Venue).where(Venue.venue_id == venue_id)
        results = await session.exec(query)
        venue = results.first()
        if not venue:
            return None
        await delete_image(venue.venue_image)
        await session.delete(venue)
        await session.commit()
        return venue

    async def get_venue_reviews(self, venue_id: UUID, session: AsyncSession):
        venue = await self.get_venue(venue_id, session)
        if venue:
            return venue.venue_reviews
        return None

    async def create_review(self, venue_id: UUID, user_id: UUID, venue_review_data: CreateVenueReviewModel, session: AsyncSession):
        # Create a new venue review
        new_review = VenueReview(
            **venue_review_data.model_dump(), venue_id=venue_id, user_id=user_id)
        # Add the review to the session and commit the transaction
        session.add(new_review)
        await session.commit()
        # Refresh the instance to get the updated data
        await session.refresh(new_review)

        return new_review

    async def delete_review(self, venue_review_id: UUID, session: AsyncSession):

        query = select(VenueReview).where(
            VenueReview.venue_review_id == venue_review_id)
        results = await session.exec(query)
        venue_review = results.first()
        if not venue_review:
            return None
        await session.delete(venue_review)
        await session.commit()
        return venue_review
