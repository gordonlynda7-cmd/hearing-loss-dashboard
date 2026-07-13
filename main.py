from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db_connection():
    conn = sqlite3.connect('hearing_data.db')
    conn.row_factory = sqlite3.Row
    return conn


@app.get("/")
def root():
    return {"Hello": "World"}


@app.get("/stats")
def stats():
    conn = get_db_connection()
    row = conn.execute('SELECT * FROM stats').fetchone()
    conn.close()
    return dict(row)


@app.get("/variables")
def variables():
    conn = get_db_connection()
    rows = conn.execute('SELECT * FROM domain_variables').fetchall()
    conn.close()
    return {row['domain']: row['variable_count'] for row in rows}
