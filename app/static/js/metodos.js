// Objeto para almacenar las instancias de Chart.js
const charts = {};

function actualizarMetricas() {
    const formData = new FormData(document.getElementById("metricasForm"));

    fetch("/calcular", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Mostrar los valores debajo de la gráfica
        document.getElementById("resultados").innerHTML = `
            <p><strong>Tasa de defectos:</strong> ${data.tasa_defec}</p>
            <p><strong>Eficiencia de producción:</strong> ${data.efic_produc}</p>
            <p><strong>Tiempo de fabricación:</strong> ${data.tiempo_fabric}</p>
            <p><strong>Desperdicio de material:</strong> ${data.desp_material}</p>
            <p><strong>Costos de operación:</strong> ${data.cost_oper}</p>
        `;

        // Actualizar las gráficas de líneas
        const graficasContainer = document.getElementById("graficas-individuales-container");

        for (const [nombre, valores] of Object.entries(data.historial)) {
            if (!charts[nombre]) {
                // Crear un nuevo gráfico si no existe
                const canvas = document.createElement("canvas");
                canvas.id = `chart-${nombre}`;
                graficasContainer.appendChild(canvas);

                charts[nombre] = new Chart(canvas, {
                    type: "line",
                    data: {
                        labels: Array.from({ length: valores.length }, (_, i) => i + 1),
                        datasets: [{
                            label: nombre,
                            data: valores,
                            borderColor: getRandomColor(),
                            fill: false
                        }]
                    },
                    options: {
                        responsive: true,
                        animation: {
                            duration: 1000 // Duración de la animación
                        },
                        scales: {
                            x: {
                                display: true,
                                title: {
                                    display: true,
                                    text: "Tiempo"
                                }
                            },
                            y: {
                                display: true,
                                title: {
                                    display: true,
                                    text: "Valor"
                                }
                            }
                        }
                    }
                });
            } else {
                // Actualizar el gráfico existente
                charts[nombre].data.labels = Array.from({ length: valores.length }, (_, i) => i + 1);
                charts[nombre].data.datasets[0].data = valores;
                charts[nombre].update();
            }
        }
    })
    .catch(error => console.error("Error:", error));
}

// Función para generar colores aleatorios
function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
}