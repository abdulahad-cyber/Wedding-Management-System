import os
from uuid import uuid4
from fastapi import UploadFile, HTTPException
import shutil
from pathlib import Path


async def upload_image(image_file: UploadFile | None, upload_dir: str = "images"):
    # Restrict allowed file types
    if image_file is None:
        return None
    allowed_types = {"image/jpeg", "image/webp", "image/png", "image/gif"}
    if image_file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, detail="Invalid file type. Only JPEG, PNG, and GIF are allowed."
        )

    # Create upload directory(images) if not exists
    Path(upload_dir).mkdir(parents=True, exist_ok=True)

    # Generate unique file name
    file_extension = Path(
        image_file.filename).suffix if image_file.filename else ""

    # Generate a random UUID for the file name
    # Append the extension to the UUID
    file_name = str(uuid4()) + file_extension

    # Create the full file path
    file_path = Path(upload_dir) / file_name
    # Save the file to the server
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(image_file.file, buffer)

    return file_name


async def delete_image(image: str):
    if image:
        # Extract image name from the URL
        image_name = Path(image).name
        image_path = Path("images") / image_name
        if image_path.exists():
            os.remove(image_path)  # Delete the file
