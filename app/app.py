from flask import Flask, render_template, request, jsonify
import matplotlib.pyplot as plt
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

# Ruta para procesar datos y generar la gráfica
@app.route("/calcular", methods=["POST"])
def calcular():
    try:
        # Obtener datos del formulario
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

        # Crear la gráfica
        labels = ["Tasa defectos", "Efic. producción", "Tiempo fabricación", "Desp. material", "Costos operación"]
        values = [tasa_defec, efic_produc, tiempo_fabric, desp_material, cost_oper]

        plt.figure(figsize=(12, 9))
        plt.bar(labels, values, color=['blue', 'green', 'orange', 'yellow', 'red'])
        plt.ylabel("Porcentaje (%) / Costo ($)")
        plt.title("Sistema de Control de Calidad")

        # Guardar la imagen en la carpeta static
        img_path = os.path.join(app.static_folder, "grafica.png")
        plt.savefig(img_path)
        plt.close()

        # Enviar la imagen y los valores calculados
        return jsonify({
            "image": "/static/grafica.png",
            "tasa_defec": f"{tasa_defec:.2f} %",
            "efic_produc": f"{efic_produc:.2f} %",
            "tiempo_fabric": f"{tiempo_fabric:.2f} min/unidad",
            "desp_material": f"{desp_material:.2f} %",
            "cost_oper": f"{cost_oper:.2f} $/unidad"
        })

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)