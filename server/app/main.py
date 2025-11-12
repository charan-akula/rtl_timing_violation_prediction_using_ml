from fastapi import FastAPI
from app.routes import router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="RTL Graph Analyzer API")

# ---- Allow your frontend to connect ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)
# ---- Simple health check ----
@app.get("/")
async def root():
    return {"message": "RTL Graph Analyzer Backend is running 🚀"}
