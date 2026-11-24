import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

app = FastAPI(title="API CanchaYa - Formativa 2")

# Habilitar CORS para permitir peticiones desde Next.js (localhost:3000)
origenes_permitidos = [
    o.strip()
    for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origenes_permitidos,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelo de validación para recibir una nueva reserva
class ReservaCreate(BaseModel):
    cancha_id: int
    cliente_nombre: str
    fecha_hora: str

# Función de conexión a PostgreSQL usando la base 'postgres'
def get_db_connection():
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return psycopg2.connect(database_url, cursor_factory=RealDictCursor)
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "5432")),
        database=os.getenv("DB_NAME", "postgres"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", ""),
        cursor_factory=RealDictCursor
    )

# Crear las tablas y los datos de prueba si la base está vacía
@app.on_event("startup")
def preparar_base_de_datos():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS canchas (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            zona VARCHAR(100) NOT NULL,
            tipo VARCHAR(50) NOT NULL,
            precio_hora INT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS reservas (
            id SERIAL PRIMARY KEY,
            cancha_id INT NOT NULL REFERENCES canchas(id) ON DELETE CASCADE,
            cliente_nombre VARCHAR(100) NOT NULL,
            fecha_hora VARCHAR(50) NOT NULL
        );
    """)
    cur.execute("SELECT COUNT(*) AS total FROM canchas;")
    if cur.fetchone()["total"] == 0:
        cur.execute("""
            INSERT INTO canchas (nombre, zona, tipo, precio_hora) VALUES
            ('Cancha La 84', 'Norte', 'Fútbol 5', 90000),
            ('Complejo El Prado', 'Centro', 'Fútbol 7', 120000),
            ('Arena Buenavista', 'Alto Prado', 'Fútbol 5', 110000);
        """)
    conn.commit()
    cur.close()
    conn.close()

# Endpoint raíz para comprobar que el servidor localhost está activo
@app.get("/")
def verificar_servidor():
    return {"estado": "OK", "mensaje": "Servidor Backend de CanchaYa corriendo"}

# Endpoint GET para listar todas las canchas disponibles
@app.get("/canchas")
def obtener_canchas():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM canchas ORDER BY id ASC;")
    canchas = cur.fetchall()
    cur.close()
    conn.close()
    return canchas

# Endpoint GET para listar reservas junto con el nombre de la cancha (JOIN)
@app.get("/reservas")
def obtener_reservas():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT r.id, r.cliente_nombre, r.fecha_hora, c.nombre AS cancha_nombre, c.zona
        FROM reservas r
        JOIN canchas c ON r.cancha_id = c.id
        ORDER BY r.id DESC;
    """)
    reservas = cur.fetchall()
    cur.close()
    conn.close()
    return reservas

# Endpoint POST para crear una nueva reserva en PostgreSQL
@app.post("/reservas")
def crear_reserva(reserva: ReservaCreate):
    if not reserva.cliente_nombre.strip() or not reserva.fecha_hora.strip():
        raise HTTPException(status_code=400, detail="Todos los campos son obligatorios")

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO reservas (cancha_id, cliente_nombre, fecha_hora) VALUES (%s, %s, %s) RETURNING *;",
            (reserva.cancha_id, reserva.cliente_nombre, reserva.fecha_hora)
        )
        nueva_reserva = cur.fetchone()
        conn.commit()
        return {"mensaje": "Reserva creada con éxito", "reserva": nueva_reserva}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Error al crear reserva: {str(e)}")
    finally:
        cur.close()
        conn.close()