from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"Hello": "World"}


@app.get("/stats")
def stats():
    return {
        "participants": 16415,
        "raw_columns": 693,
        "selected_vars": 111,
        "domains": 5
    }


@app.get("/variables")
def variables():
    return {
        "hearing_loss": 38,
        "health_comorbidities": 35,
        "potential_mediators": 15,
        "sociodemographic": 9,
        "physical_activity": 8
    }
