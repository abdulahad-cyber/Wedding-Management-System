from fastapi import APIRouter, Depends, HTTPException, status, File, Form, UploadFile
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.main import get_session
from src.users.schemas import UserModel
from src.decorations.service import DecorationService
from src.decorations.schemas import DecorationModel, CreateDecorationModel
from uuid import UUID
from src.users.JWTAuthMiddleware import JWTAuthMiddleware
from src.config import Config
from src.utils import upload_image


decoration_router = APIRouter(prefix="/decorations")
decoration_service = DecorationService()


@decoration_router.get("/", response_model=list[DecorationModel], status_code=status.HTTP_200_OK)
async def get_all_decorations(session: AsyncSession = Depends(get_session)):
    decorations = await decoration_service.get_all_decorations(session)
    return decorations


@decoration_router.get("/{decoration_id}", response_model=DecorationModel, status_code=status.HTTP_200_OK)
async def get_decoration(decoration_id: UUID, session: AsyncSession = Depends(get_session)):
    decoration = await decoration_service.get_decoration(decoration_id, session)
    if decoration:
        return decoration
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                        detail="Decoration not found")




@decoration_router.post("/", response_model=DecorationModel, status_code=status.HTTP_201_CREATED)
async def create_decoration(
    decoration_name: str = Form(...),
    decoration_price: int = Form(...),
    decoration_description: str = Form(...),
    # Handle image file upload
    decoration_image: UploadFile | None = File(None),
    user: UserModel = Depends(JWTAuthMiddleware),
    session: AsyncSession = Depends(get_session),
):
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )

    # Upload the image and get the file path
    image_name = await upload_image(decoration_image)
    # Create new decoration
    decoration_data = CreateDecorationModel(
        decoration_name=decoration_name,
        decoration_price=decoration_price,
        decoration_description=decoration_description,
        decoration_image=None if not image_name else f"{Config.SERVER_BASE_URL}images/{image_name}",

    )
    decoration = await decoration_service.create_decoration(decoration_data, session)
    return decoration


@decoration_router.delete("/{decoration_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_decoration(
    decoration_id: UUID,
    user: UserModel = Depends(JWTAuthMiddleware),
    session: AsyncSession = Depends(get_session),
):
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    deleted = await decoration_service.delete_decoration(decoration_id, session)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Decoration not found")
    return deleted
