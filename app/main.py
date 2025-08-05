# app/main.py (actualizado)
from fastapi import FastAPI, Query, HTTPException
from datetime import time
import json
import os

from app.scraper import parse_excel, save_json

app = FastAPI()


# Cargar datos desde el JSON
def load_schedule_data():
    file_path = "output/horarios.json"
    if not os.path.exists(file_path):
        return None
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)


@app.get("/parse")
def parse():
    data = parse_excel("pdfs/horarios-tren-belgrano-norte.xlsx")
    save_json(data, "output/horarios.json")

    total_trips = 0
    for day in data["days"]:
        for direction in day["directions"]:
            total_trips += len(direction["trips"])

    return {
        "status": "ok",
        "days": len(data["days"]),
        "directions": sum(len(day["directions"]) for day in data["days"]),
        "total_trips": total_trips
    }


@app.get("/horarios")
def get_horarios(
        dia: str = Query(..., description="Tipo de día: LUNES A VIERNES, SÁBADOS, DOMINGOS Y FERIADOS"),
        origen: str = Query(..., description="Estación de origen"),
        destino: str = Query(..., description="Estación de destino"),
        horario_desde: str = Query(None, description="Horario de inicio (HH:MM)"),
        horario_hasta: str = Query(None, description="Horario de fin (HH:MM)")
):
    # Cargar datos de horarios
    data = load_schedule_data()
    if not data:
        raise HTTPException(status_code=404, detail="Datos de horarios no encontrados")

    # Buscar el día solicitado
    day_data = next((d for d in data["days"] if d["day_type"].upper() == dia.upper()), None)
    if not day_data:
        raise HTTPException(status_code=400, detail=f"Día '{dia}' no encontrado")

    # Determinar dirección basada en origen y destino
    direction_data = None
    direction_type = None

    for direction in day_data["directions"]:
        stations_order = direction["stations_order"]
        if origen in stations_order and destino in stations_order:
            idx_origen = stations_order.index(origen)
            idx_destino = stations_order.index(destino)

            # Determinar dirección basada en el orden de las estaciones
            if idx_origen < idx_destino:
                direction_data = direction
                direction_type = direction["direction"]
                break

    if not direction_data:
        raise HTTPException(status_code=400, detail="No se encontró ruta entre las estaciones especificadas")

    # Filtrar viajes por horario
    filtered_trips = []

    for trip in direction_data["trips"]:
        schedule = trip["schedule"]
        origen_time = schedule.get(origen)
        destino_time = schedule.get(destino)

        if not origen_time or not destino_time:
            continue

        # Convertir a objetos time para comparación
        try:
            origen_t = time.fromisoformat(origen_time)
            destino_t = time.fromisoformat(destino_time)
        except ValueError:
            continue

        # Verificar si está dentro del rango horario
        within_time_range = True
        if horario_desde:
            try:
                desde_t = time.fromisoformat(horario_desde)
                within_time_range = within_time_range and (origen_t >= desde_t)
            except ValueError:
                pass

        if horario_hasta:
            try:
                hasta_t = time.fromisoformat(horario_hasta)
                within_time_range = within_time_range and (origen_t <= hasta_t)
            except ValueError:
                pass

        if within_time_range:
            filtered_trips.append({
                "trip_id": trip["trip_id"],
                "origen": origen_time,
                "destino": destino_time,
                "duracion": calcular_duracion(origen_t, destino_t)
            })

    # Ordenar por horario de salida
    filtered_trips.sort(key=lambda x: x["origen"])

    return {
        "dia": dia,
        "direccion": direction_type,
        "origen": origen,
        "destino": destino,
        "total_viajes": len(filtered_trips),
        "viajes": filtered_trips
    }


def calcular_duracion(salida: time, llegada: time) -> str:
    """Calcula la duración del viaje en formato HH:MM"""
    salida_min = salida.hour * 60 + salida.minute
    llegada_min = llegada.hour * 60 + llegada.minute

    # Manejar viajes que pasan la medianoche
    if llegada_min < salida_min:
        llegada_min += 24 * 60

    duracion_min = llegada_min - salida_min
    horas = duracion_min // 60
    minutos = duracion_min % 60
    return f"{horas:02d}:{minutos:02d}"