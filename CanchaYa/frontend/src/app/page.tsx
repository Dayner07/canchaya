"use client";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Cancha {
  id: number;
  nombre: string;
  zona: string;
  tipo: string;
  precio_hora: number;
}

interface Reserva {
  id: number;
  cliente_nombre: string;
  fecha_hora: string;
  cancha_nombre: string;
  zona: string;
}

export default function Home() {
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [canchaId, setCanchaId] = useState<number>(1);
  const [clienteNombre, setClienteNombre] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const cargarDatos = async () => {
    try {
      const [resCanchas, resReservas] = await Promise.all([
        fetch(`${API_URL}/canchas`),
        fetch(`${API_URL}/reservas`),
      ]);
      const dataCanchas = await resCanchas.json();
      const dataReservas = await resReservas.json();
      setCanchas(dataCanchas);
      setReservas(dataReservas);
      if (dataCanchas.length > 0) setCanchaId(dataCanchas[0].id);
    } catch {
      setError(`Error: No se pudo conectar con el servidor backend en ${API_URL}`);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleReservar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    try {
      const res = await fetch(`${API_URL}/reservas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cancha_id: Number(canchaId),
          cliente_nombre: clienteNombre,
          fecha_hora: fechaHora,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Error al registrar la reserva");
        return;
      }

      setMensaje("¡Reserva registrada correctamente en PostgreSQL!");
      setClienteNombre("");
      setFechaHora("");
      cargarDatos();
    } catch {
      setError("Error de red al intentar guardar la reserva.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-8 text-slate-800">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="bg-emerald-700 text-white p-6 rounded-xl shadow">
          <h1 className="text-3xl font-bold">CanchaYa - Sistema de Reservas</h1>
          <p className="text-emerald-100 mt-1">
            Integración Next.js + Tailwind CSS + FastAPI + PostgreSQL
          </p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {mensaje && (
          <div className="bg-emerald-100 border border-emerald-400 text-emerald-800 px-4 py-3 rounded">
            {mensaje}
          </div>
        )}

        {/* Listado de Canchas desde PostgreSQL */}
        <section>
          <h2 className="text-xl font-bold mb-4">Canchas Disponibles</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {canchas.map((c) => (
              <div key={c.id} className="bg-white p-5 rounded-xl shadow border border-slate-200">
                <span className="text-xs font-semibold uppercase bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                  {c.tipo}
                </span>
                <h3 className="text-lg font-bold mt-2">{c.nombre}</h3>
                <p className="text-slate-500 text-sm">Zona: {c.zona}</p>
                <p className="text-emerald-700 font-bold text-lg mt-3">
                  ${c.precio_hora.toLocaleString()} / hora
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Formulario de Prueba POST */}
        <section className="bg-white p-6 rounded-xl shadow border border-slate-200">
          <h2 className="text-xl font-bold mb-4">Registrar Nueva Reserva (Prueba POST)</h2>
          <form onSubmit={handleReservar} className="grid gap-4 md:grid-cols-4">
            <select
              value={canchaId}
              onChange={(e) => setCanchaId(Number(e.target.value))}
              className="border p-2.5 rounded-lg"
            >
              {canchas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Nombre del cliente"
              value={clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
              className="border p-2.5 rounded-lg"
              required
            />

            <input
              type="text"
              placeholder="Ej: 2026-11-22 20:00"
              value={fechaHora}
              onChange={(e) => setFechaHora(e.target.value)}
              className="border p-2.5 rounded-lg"
              required
            />

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-lg transition"
            >
              Reservar Cancha
            </button>
          </form>
        </section>

        {/* Tabla de Reservas Guardadas */}
        <section className="bg-white p-6 rounded-xl shadow border border-slate-200">
          <h2 className="text-xl font-bold mb-4">Reservas Registradas en Base de Datos</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="p-3">ID</th>
                  <th className="p-3">Cancha</th>
                  <th className="p-3">Zona</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Fecha y Hora</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-slate-50">
                    <td className="p-3 font-medium">#{r.id}</td>
                    <td className="p-3">{r.cancha_nombre}</td>
                    <td className="p-3">{r.zona}</td>
                    <td className="p-3">{r.cliente_nombre}</td>
                    <td className="p-3">{r.fecha_hora}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}