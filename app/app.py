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

# Inicializar el historial con ceros para evitar errores
for key in historial_metricas:
    historial_metricas[key].append(0)

@app.route('/')
def index():
    return render_template('index.html')

@app.route("/calcular", methods=["POST"])
def calcular():
    try:
        # Obtener datos de los sliders
        productos_defectuosos = int(request.form.get("productos_defectuosos", 0))
        productos_totales = max(int(request.form.get("productos_totales", 1)), 1)  # Evitar división por cero
        productos_buenos = int(request.form.get("productos_buenos", 0))
        tiempo_total = int(request.form.get("tiempo_total", 0))
        material_desperdiciado = int(request.form.get("material_desperdiciado", 0))
        material_total = max(int(request.form.get("material_total", 1)), 1)  # Evitar división por cero
        costos_totales = int(request.form.get("costos_totales", 0))

        # Cálculo de métricas
        tasa_defec = (productos_defectuosos / productos_totales) * 100
        efic_produc = (productos_buenos / productos_totales) * 100
        tiempo_fabric = tiempo_total / productos_totales
        desp_material = (material_desperdiciado / material_total) * 100
        cost_oper = costos_totales / productos_totales

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
        # En caso de error, devolver un historial vacío pero válido
        return jsonify({
            "error": str(e),
            "tasa_defec": "0.00 %",
            "efic_produc": "0.00 %",
            "tiempo_fabric": "0.00 min/unidad",
            "desp_material": "0.00 %",
            "cost_oper": "0.00 $/unidad",
            "historial": {k: list(v) for k, v in historial_metricas.items()}
        })

if __name__ == '__main__':
    app.run(debug=True)