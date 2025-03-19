from flask import Flask, render_template, request, jsonify
from collections import deque
import random

app = Flask(__name__)

# Almacenar un historial de métricas (últimos 10 valores)
historial_metricas = {
    "Tasa de defectos": deque(maxlen=10),
    "Eficiencia de producción": deque(maxlen=10),
    "Tiempo de fabricación": deque(maxlen=10),
    "Desperdicio de material": deque(maxlen=10),
    "Costos de operación": deque(maxlen=10)
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route("/calcular", methods=["POST"])
def calcular():
    try:
        # Obtener datos de los sliders
        productos_defectuosos = int(request.form["productos_defectuosos"])
        productos_totales = int(request.form["productos_totales"])
        productos_buenos = int(request.form["productos_buenos"])
        tiempo_total = int(request.form["tiempo_total"])
        material_desperdiciado = int(request.form["material_desperdiciado"])
        material_total = int(request.form["material_total"])
        costos_totales = int(request.form["costos_totales"])

        # Cálculo de métricas
        tasa_defec = (productos_defectuosos / productos_totales) * 100 if productos_totales > 0 else 0
        efic_produc = (productos_buenos / productos_totales) * 100 if productos_totales > 0 else 0
        tiempo_fabric = tiempo_total / productos_totales if productos_totales > 0 else 0
        desp_material = (material_desperdiciado / material_total) * 100 if material_total > 0 else 0
        cost_oper = costos_totales / productos_totales if productos_totales > 0 else 0

        # Actualizar el historial de métricas
        historial_metricas["Tasa de defectos"].append(tasa_defec)
        historial_metricas["Eficiencia de producción"].append(efic_produc)
        historial_metricas["Tiempo de fabricación"].append(tiempo_fabric)
        historial_metricas["Desperdicio de material"].append(desp_material)
        historial_metricas["Costos de operación"].append(cost_oper)

        # Enviar el historial de métricas al frontend
        return jsonify({
            "tasa_defec": f"{tasa_defec:.2f} %",
            "efic_produc": f"{efic_produc:.2f} %",
            "tiempo_fabric": f"{tiempo_fabric:.2f} min/unidad",
            "desp_material": f"{desp_material:.2f} %",
            "cost_oper": f"{cost_oper:.2f} $/unidad",
            "historial": {k: list(v) for k, v in historial_metricas.items()}
        })

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)