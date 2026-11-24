# CanchaYa – Sistema de reservas de canchas

Proyecto final – Desarrollo Web
Universidad Autónoma del Caribe · Profesor: Edwin Campbell

**Grupo No. 3:** Jesús Escobar Jerónimo, Santiago Villalobos y Dayner Hernández

CanchaYa es una aplicación web para reservar canchas de fútbol en Barranquilla. Integra una base de datos en PostgreSQL, una API REST en FastAPI y una interfaz en Next.js con Tailwind CSS.

## Tecnologías

| Capa | Tecnología | Puerto |
|---|---|---|
| Frontend | Next.js (React + TypeScript) + Tailwind CSS | 3000 |
| Backend | Python + FastAPI + Uvicorn | 8000 |
| Base de datos | PostgreSQL | 5432 |

## Estructura

```
canchaya/
├── backend/          API en FastAPI (main.py, requirements.txt)
├── frontend/         Proyecto Next.js (src/app/page.tsx)
├── database/         Script SQL (database.sql)
└── docs/             Documento del proyecto (PDF)
```

## Cómo ejecutar el proyecto

### 1. Base de datos

En DBeaver (o psql), conectarse a PostgreSQL en `localhost:5432` y ejecutar `database/database.sql` sobre la base `postgres`.

### 2. Backend (puerto 8000)

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # En Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
copy .env.example .env         # En Linux/Mac: cp .env.example .env
```

Abrir `backend/.env` y poner la contraseña de PostgreSQL en `DB_PASSWORD`. Luego:

```bash
uvicorn main:app --reload
```

Verificar que `http://localhost:8000` responda con `{"estado": "OK", ...}`. La documentación interactiva de la API está en `http://localhost:8000/docs`.

### 3. Frontend (puerto 3000)

```bash
cd frontend
npm install
npm run dev
```

Abrir `http://localhost:3000` en el navegador.

## Endpoints de la API

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/` | Verifica que el servidor esté activo |
| GET | `/canchas` | Lista todas las canchas |
| GET | `/reservas` | Lista las reservas con el nombre y la zona de la cancha (JOIN) |
| POST | `/reservas` | Registra una reserva nueva |

Ejemplo de cuerpo para `POST /reservas`:

```json
{
  "cancha_id": 2,
  "cliente_nombre": "Prueba base",
  "fecha_hora": "2026-11-23 18:00"
}
```

## Variables de entorno

| Variable | Dónde | Valor por defecto |
|---|---|---|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | `backend/.env` | `localhost`, `5432`, `postgres`, `postgres`, *(vacía)* |
| `CORS_ORIGINS` | `backend/.env` | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | `frontend/.env.local` | `http://localhost:8000` |

Los archivos `.env` no se suben al repositorio; se usan los `.env.example` como plantilla.

## Despliegue (página alojada)

- **Backend y base de datos:** Render ([render.com](https://render.com)) con el archivo `render.yaml` (New → Blueprint → seleccionar este repositorio). Las tablas y los datos de prueba se crean solos al iniciar el backend.
- **Frontend:** Vercel ([vercel.com](https://vercel.com)), importando este repositorio con *Root Directory* = `frontend` y la variable `NEXT_PUBLIC_API_URL` = URL del backend en Render.
- Después, en Render, poner en `CORS_ORIGINS` la URL que entregue Vercel.
