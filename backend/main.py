import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Any

from config import AIS_API_KEY, OPENWEATHER_API_KEY, STORMGLASS_API_KEY, MARINE_WEATHER_API_KEY, PORT, HOST
from engine.sar_engine import characterize_oil_slick
from engine.drift_engine import run_backward_hindcast, run_forward_forecast
from engine.attribution_engine import rank_suspect_vessels
from engine.ml_engine import predict_sar_spill_mask
from services.weather_service import get_live_marine_weather
from services.ais_service import ais_bridge

app = FastAPI(
    title="AquaSentinel AI - Python FastAPI Backend",
    description="Marine Oil Spill Satellite Detection, 2D Ocean Drift Physics & AIS Attribution Engine",
    version="3.0.0"
)

# CORS Middleware for Vite React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event: Initiate background AISStream WebSocket bridge task
@app.on_event("startup")
async def startup_event():
    print(f"AquaSentinel AI Python FastAPI Backend starting on http://{HOST}:{PORT}")
    asyncio.create_task(ais_bridge.connect_to_aisstream())

# Request Models
class SarCharacterizeRequest(BaseModel):
    polygonCoords: List[List[float]]
    opticCode: Optional[int] = 4
    acquisitionTime: Optional[int] = None

class DriftHindcastRequest(BaseModel):
    slickCentroid: List[float]
    estimatedAgeHours: Optional[int] = 12
    currentSpeedKnots: Optional[float] = 1.4
    currentDirDeg: Optional[int] = 320
    windSpeedKnots: Optional[float] = 14.0
    windDirDeg: Optional[int] = 210

class DriftForecastRequest(BaseModel):
    slickCentroid: List[float]
    forecastHours: Optional[int] = 48
    currentSpeedKnots: Optional[float] = 1.4
    currentDirDeg: Optional[int] = 320
    windSpeedKnots: Optional[float] = 14.0
    windDirDeg: Optional[int] = 210
    initialVolumeM3: Optional[float] = 120.0

class VesselAttributionRequest(BaseModel):
    vessels: List[dict]
    originCentroid: List[float]
    originTimestamp: int
    driftVector: dict

# 1. Health & API Key Status Endpoint
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AquaSentinel AI Python FastAPI Backend",
        "apiKeysConfigured": {
            "aisStreamApiKey": bool(AIS_API_KEY and "your_" not in AIS_API_KEY),
            "openWeatherApiKey": bool(OPENWEATHER_API_KEY and "your_" not in OPENWEATHER_API_KEY),
            "stormGlassApiKey": bool(STORMGLASS_API_KEY and "your_" not in STORMGLASS_API_KEY),
            "customMarineApiKey": bool(MARINE_WEATHER_API_KEY and "your_" not in MARINE_WEATHER_API_KEY)
        },
        "aisStreamConnected": ais_bridge.is_connected
    }

# 2. Live Weather Endpoint (Consumes OpenWeather & StormGlass API keys)
@app.get("/api/weather/live")
async def get_weather(lat: float = 2.45, lng: float = 101.40):
    weather = await get_live_marine_weather(lat, lng)
    return {"status": "success", "weather": weather}

# 3. Python SAR Image Characterization Endpoint
@app.post("/api/sar/characterize")
async def sar_characterize(req: SarCharacterizeRequest):
    result = characterize_oil_slick(req.polygonCoords, req.opticCode, req.acquisitionTime)
    return {"status": "success", "data": result}

# 4. Python Reverse Drift Hindcast Engine Endpoint
@app.post("/api/drift/hindcast")
async def drift_hindcast(req: DriftHindcastRequest):
    result = run_backward_hindcast(
        slick_centroid=req.slickCentroid,
        estimated_age_hours=req.estimatedAgeHours,
        current_speed_knots=req.currentSpeedKnots,
        current_dir_deg=req.currentDirDeg,
        wind_speed_knots=req.windSpeedKnots,
        wind_dir_deg=req.windDirDeg
    )
    return {"status": "success", "data": result}

# 5. Python Forward Drift Forecast Engine Endpoint
@app.post("/api/drift/forecast")
async def drift_forecast(req: DriftForecastRequest):
    result = run_forward_forecast(
        slick_centroid=req.slickCentroid,
        forecast_hours=req.forecastHours,
        current_speed_knots=req.currentSpeedKnots,
        current_dir_deg=req.currentDirDeg,
        wind_speed_knots=req.windSpeedKnots,
        wind_dir_deg=req.windDirDeg,
        initial_volume_m3=req.initialVolumeM3
    )
    return {"status": "success", "data": result}

# 6. Python AIS Vessel Attribution Engine Endpoint
@app.post("/api/vessel/attribution")
async def vessel_attribution(req: VesselAttributionRequest):
    ranked = rank_suspect_vessels(
        vessels=req.vessels,
        origin_centroid=req.originCentroid,
        origin_timestamp=req.originTimestamp,
        drift_vector=req.driftVector
    )
    return {"status": "success", "rankedVessels": ranked}

# 7. Real-Time AIS WebSocket Bridge
@app.websocket("/ws/ais")
async def ais_websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    await ais_bridge.register_client(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        await ais_bridge.unregister_client(websocket)

# 8. Python SAR Image Prediction Endpoint using Trained UNet Model
@app.post("/api/sar/predict-image")
async def sar_predict_image(file: UploadFile = File(...)):
    image_bytes = await file.read()
    try:
        result = predict_sar_spill_mask(image_bytes)
        return {"status": "success", "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}

