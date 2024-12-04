from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.main import get_session
from src.users.schemas import UserModel
from src.promos.service import PromoService
from src.promos.schemas import PromoModel, CreatePromoModel
from uuid import UUID
from src.users.JWTAuthMiddleware import JWTAuthMiddleware

promo_router = APIRouter(prefix="/promos")
promo_service = PromoService()


@promo_router.get("/", response_model=list[PromoModel], status_code=status.HTTP_200_OK)
async def get_all_promos(session: AsyncSession = Depends(get_session)):
    promos = await promo_service.get_all_promos(session)
    return promos


@promo_router.get("/{promo_id}", response_model=PromoModel, status_code=status.HTTP_200_OK)
async def get_promo(promo_id: UUID, session: AsyncSession = Depends(get_session)):
    promo = await promo_service.get_promo(promo_id, session)
    if promo:
        return promo
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail="Promo not found"
    )


@promo_router.post("/", response_model=PromoModel, status_code=status.HTTP_201_CREATED)
async def create_promo(
    promo_data: CreatePromoModel,
    user: UserModel = Depends(JWTAuthMiddleware),
    session: AsyncSession = Depends(get_session),
):
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )

    promo = await promo_service.create_promo(promo_data, session)
    return promo


@promo_router.delete("/{promo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_promo(
    promo_id: UUID,
    user: UserModel = Depends(JWTAuthMiddleware),
    session: AsyncSession = Depends(get_session),
):
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )
    deleted = await promo_service.delete_promo(promo_id, session)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Promo not found"
        )
    return deleted
