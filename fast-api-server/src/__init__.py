from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from src.db.main import init_db
from fastapi.middleware.cors import CORSMiddleware
from src.users.routes import user_router
from src.caterings.routes import catering_router
from src.venues.routes import venue_router
from src.decorations.routes import decoration_router
from src.promos.routes import promo_router
from src.cars.routes import car_router
from src.bookings.routes import booking_router
import logging
from fastapi.responses import FileResponse
from src.config import Config


@asynccontextmanager
async def life_span(app: FastAPI):
    print(f"Server starting up...")
    await init_db()  # creates the tables
    yield
    print(f"Stopping server...")


app = FastAPI(lifespan=life_span)


app.add_middleware(
    CORSMiddleware,
    # Replace with your React app's URL
    allow_origins=[str(Config.CLIENT_BASE_URL), "http://localhost:3001"],
    allow_credentials=True,  # allow client to send cookies
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)


app.include_router(user_router)
app.include_router(catering_router)
app.include_router(venue_router)
app.include_router(decoration_router)
app.include_router(promo_router)
app.include_router(car_router)
app.include_router(booking_router)


# Serve images from the "images" directory


@app.get("/images/{image_name}", response_class=FileResponse)
async def serve_image(image_name: str):
    file_path = Path("images") / image_name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(file_path)

# Global exception handler


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logging.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": f"An unexpected error occurred. {exc}"},
    )
