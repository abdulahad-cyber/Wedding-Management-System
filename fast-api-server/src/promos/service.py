from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.models import Promo
from uuid import UUID
from src.promos.schemas import CreatePromoModel


class PromoService:
    async def get_all_promos(self, session: AsyncSession):
        query = select(Promo)
        result = await session.exec(query)
        promos = result.all()
        return promos

    async def get_promo(self, promo_id: UUID, session: AsyncSession):
        query = select(Promo).where(Promo.promo_id == promo_id)
        result = await session.exec(query)
        promo = result.first()
        return promo if promo else None

    async def create_promo(self, promo_data: CreatePromoModel, session: AsyncSession):
        new_promo = Promo(**promo_data.model_dump())
        session.add(new_promo)
        await session.commit()
        await session.refresh(new_promo)

        return new_promo

    async def delete_promo(self, promo_id: UUID, session: AsyncSession):
        query = select(Promo).where(Promo.promo_id == promo_id)
        results = await session.exec(query)
        promo = results.first()
        if not promo:
            return None
        await session.delete(promo)
        await session.commit()
        return promo
