from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.models import Decoration
from uuid import UUID
from src.utils import delete_image

from src.decorations.schemas import CreateDecorationModel


class DecorationService:
    async def get_all_decorations(self, session: AsyncSession):
        query = select(Decoration)
        result = await session.exec(query)
        decorations = result.all()
        return decorations

    async def get_decoration(self, decoration_id: UUID, session: AsyncSession):
        query = select(Decoration).where(
            Decoration.decoration_id == decoration_id)
        result = await session.exec(query)
        decoration = result.first()
        return decoration if decoration else None

    async def create_decoration(self, decoration_data: CreateDecorationModel, session: AsyncSession):
        new_decoration = Decoration(**decoration_data.model_dump())
        session.add(new_decoration)
        await session.commit()
        await session.refresh(new_decoration)
        return new_decoration

    async def delete_decoration(self, decoration_id: UUID, session: AsyncSession):
        query = select(Decoration).where(
            Decoration.decoration_id == decoration_id)
        results = await session.exec(query)
        decoration = results.first()
        if not decoration:
            return None
        # Extract and delete the associated image file, if it exists
        await delete_image(decoration.decoration_image)
        await session.delete(decoration)
        await session.commit()
        return decoration
