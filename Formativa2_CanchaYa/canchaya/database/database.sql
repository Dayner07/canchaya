DROP TABLE IF EXISTS reservas;
DROP TABLE IF EXISTS canchas;

-- Crear tabla de canchas
CREATE TABLE canchas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    zona VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    precio_hora INT NOT NULL
);

-- Crear tabla de reservas relacionada con canchas
CREATE TABLE reservas (
    id SERIAL PRIMARY KEY,
    cancha_id INT NOT NULL REFERENCES canchas(id) ON DELETE CASCADE,
    cliente_nombre VARCHAR(100) NOT NULL,
    fecha_hora VARCHAR(50) NOT NULL
);

-- Insertar canchas de prueba en Barranquilla
INSERT INTO canchas (nombre, zona, tipo, precio_hora) VALUES
('Cancha La 84', 'Norte', 'Fútbol 5', 90000),
('Complejo El Prado', 'Centro', 'Fútbol 7', 120000),
('Arena Buenavista', 'Alto Prado', 'Fútbol 5', 110000);

-- Insertar una reserva inicial de prueba
INSERT INTO reservas (cancha_id, cliente_nombre, fecha_hora) VALUES
(1, 'Jesús Escobar', '2026-11-21 19:00');

SELECT * FROM canchas;
SELECT * FROM reservas;
