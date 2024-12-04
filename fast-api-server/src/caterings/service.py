from fastapi import HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.models import Catering, Dish, CateringMenuItem, DishType
from src.caterings.schemas import CreateCateringModel, CreateDishModel
from uuid import UUID
from src.utils import delete_image


class CateringService:

    async def get_all_caterings(self, session: AsyncSession):
        query = select(Catering)
        result = await session.exec(query)
        caterings = result.all()
        return caterings

        # can make whatever modifications to the relationship objects ie: catering_menu_items, can pop items from it, can modify it, can add new ones, and all changes will be saved on commit

        # catering =  result.first()
        # if catering:
        #     catering.catering_menu_items[0].dish =  Dish(**{"dish_name":"test", "dish_description":"test","dish_type":DishType.main, "dish_cost_per_serving":100})
        #     await session.commit()
        #     await session.refresh(catering)
        #     return [catering]

    async def get_catering(self, catering_id: UUID, session: AsyncSession):
        query = select(Catering).where(Catering.catering_id == catering_id)
        result = await session.exec(query)
        return result.first()

    async def create_catering(
        self,
        catering_data: CreateCateringModel,
        session: AsyncSession
    ):
        new_catering = Catering(**catering_data.model_dump())

        session.add(new_catering)
        await session.commit()

        await session.refresh(new_catering)

        return new_catering

    async def delete_catering(self, catering_id: UUID, session: AsyncSession):
        catering = await self.get_catering(catering_id, session)
        if catering:
            await delete_image(catering.catering_image)
            await session.delete(catering)
            await session.commit()
            return catering
        return None

    async def create_dish(self, dish_data: CreateDishModel, session: AsyncSession):
        new_dish = Dish(**dish_data.model_dump())
        session.add(new_dish)
        await session.commit()
        await session.refresh(new_dish)
        return new_dish

    async def delete_dish(self, dish_id: UUID, session: AsyncSession):
        dish = await self.get_dish(dish_id, session)
        if dish:
            await delete_image(dish.dish_image)
            await session.delete(dish)
            await session.commit()
            return dish
        return None

    async def get_dish(self, dish_id: UUID, session: AsyncSession):
        query = select(Dish).where(Dish.dish_id == dish_id)
        result = await session.exec(query)
        dish = result.first()
        return dish if dish else None

    async def get_all_dishes(self, session: AsyncSession):
        query = select(Dish)
        result = await session.exec(query)
        dishes = result.all()
        return dishes

    async def add_dish_to_catering(self, catering_id: UUID, dish_id: UUID, session: AsyncSession):
        catering = await self.get_catering(catering_id, session)
        dish = await self.get_dish(dish_id, session)

        if catering and dish:
            query = select(CateringMenuItem).where(
                CateringMenuItem.catering_id == catering_id, CateringMenuItem.dish_id == dish_id)
            result = await session.exec(query)
            if result.first():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Dish already exists in catering"
                )
            catering_menu_item = CateringMenuItem(
                catering_id=catering_id, dish_id=dish_id)
            session.add(catering_menu_item)
            await session.commit()
            await session.refresh(catering_menu_item)
            return catering_menu_item
        return None

    async def remove_dish_from_catering(self, catering_id: UUID, dish_id: UUID, session: AsyncSession):
        query = select(CateringMenuItem).where(
            CateringMenuItem.catering_id == catering_id, CateringMenuItem.dish_id == dish_id)
        result = await session.exec(query)
        menu_item = result.first()
        if menu_item:
            await session.delete(menu_item)
            await session.commit()
            return menu_item
        return None
