// Objeto para almacenar las instancias de Chart.js
const charts = {};

// Intervalo para actualización automática
let intervaloActualizacion;

// Nombres de métricas con descripciones mejoradas
const metricas = [
    {
        nombre: "Tasa de defectos",
        descripcion: "Porcentaje de unidades defectuosas por lote",
        umbralVerde: 5,
        umbralAmarillo: 10
    },
    {
        nombre: "Eficiencia de producción",
        descripcion: "Porcentaje de unidades que cumplen con los estándares de calidad",
        umbralVerde: 90,
        umbralAmarillo: 80
    },
    {
        nombre: "Tiempo de fabricación",
        descripcion: "Tiempo promedio de producción por unidad (minutos)",
        umbralVerde: 15,
        umbralAmarillo: 25
    },
    {
        nombre: "Desperdicio de material",
        descripcion: "Porcentaje de material desechado durante la producción",
        umbralVerde: 8,
        umbralAmarillo: 15
    },
    {
        nombre: "Costos de operación",
        descripcion: "Costo promedio por unidad producida ($)",
        umbralVerde: 25,
        umbralAmarillo: 40
    }
];

// Inicializar la actualización automática cuando se carga la página
window.onload = function() {
    // Inicializar los contenedores de gráficas
    inicializarContenedoresGraficas();
    
    // Configurar la actualización automática cada 1 segundo
    intervaloActualizacion = setInterval(actualizarMetricas, 1000);
    
    // Ajustar tamaño de gráficas cuando cambie el tamaño de la ventana
    window.addEventListener('resize', function() {
        Object.keys(charts).forEach(key => {
            if (charts[key]) {
                charts[key].resize();
            }
        });
    });
};

// Función para inicializar los contenedores de gráficas
function inicializarContenedoresGraficas() {
    const row1 = document.getElementById("graficas-row-1");
    const row2 = document.getElementById("graficas-row-2");
    
    // Limpiar los contenedores
    row1.innerHTML = "";
    row2.innerHTML = "";
    
    // Crear contenedores para cada gráfica
    metricas.forEach((metrica, index) => {
        const container = document.createElement("div");
        container.className = (index < 3) ? "grafica-item" : "grafica-item-grande";
        
        const canvas = document.createElement("canvas");
        canvas.id = `chart-${metrica.nombre.replace(/ /g, "-")}`;
        container.appendChild(canvas);
        
        if (index < 3) {
            row1.appendChild(container);
        } else {
            row2.appendChild(container);
        }
    });
}

// Función para actualizar el valor mostrado en el span del slider
function actualizarValorSlider(id, valor) {
    document.getElementById(`valor-${id}`).textContent = valor;
}

// Función para determinar el color de la métrica según su valor
function getMetricaClass(nombre, valor) {
    const metrica = metricas.find(m => m.nombre === nombre);
    
    if (!metrica) return "";
    
    // Para métricas donde menor es mejor (tasa de defectos, tiempo, desperdicio, costos)
    if (nombre === "Tasa de defectos" || nombre === "Tiempo de fabricación" || 
        nombre === "Desperdicio de material" || nombre === "Costos de operación") {
        if (valor <= metrica.umbralVerde) return "metrica-verde";
        if (valor <= metrica.umbralAmarillo) return "metrica-amarilla";
        return "metrica-roja";
    } 
    // Para métricas donde mayor es mejor (eficiencia)
    else {
        if (valor >= metrica.umbralVerde) return "metrica-verde";
        if (valor >= metrica.umbralAmarillo) return "metrica-amarilla";
        return "metrica-roja";
    }
}

// Función para generar recomendaciones basadas en las métricas
function generarRecomendaciones(data) {
    const recomendaciones = [];
    
    // Analizar cada métrica
    if (parseFloat(data.tasa_defec) > 10) {
        recomendaciones.push("<strong>Tasa de defectos alta:</strong> Revisar controles de calidad y parámetros de máquinas.");
    }
    
    if (parseFloat(data.efic_produc) < 80) {
        recomendaciones.push("<strong>Baja eficiencia:</strong> Programar mantenimiento preventivo y revisar procesos de producción.");
    }
    
    if (parseFloat(data.tiempo_fabric) > 25) {
        recomendaciones.push("<strong>Tiempo elevado:</strong> Revisar cuellos de botella en la línea de producción.");
    }
    
    if (parseFloat(data.desp_material) > 15) {
        recomendaciones.push("<strong>Alto desperdicio:</strong> Optimizar procesos de corte y calibrar equipamiento.");
    }
    
    if (parseFloat(data.cost_oper) > 40) {
        recomendaciones.push("<strong>Costos altos:</strong> Revisar consumo de energía y eficiencia de recursos.");
    }
    
    // Si todas las métricas están bien
    if (recomendaciones.length === 0) {
        return "<p class='metrica-verde'><strong>✓ Todos los indicadores están dentro de rangos aceptables.</strong> Continuar con el monitoreo regular.</p>";
    }
    
    // Devolver lista de recomendaciones
    return "<ul class='mb-0'>" + recomendaciones.map(rec => `<li>${rec}</li>`).join("") + "</ul>";
}

function actualizarMetricas() {
    const formData = new FormData(document.getElementById("metricasForm"));

    fetch("/calcular", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Verificar si los datos recibidos son válidos
        if (!data || data.error) {
            console.error("Error en los datos recibidos:", data ? data.error : "Datos no disponibles");
            return;
        }
        
        // Extraer valores numéricos para clasificación
        const valoresNumericos = {
            "Tasa de defectos": parseFloat(data.tasa_defec),
            "Eficiencia de producción": parseFloat(data.efic_produc),
            "Tiempo de fabricación": parseFloat(data.tiempo_fabric),
            "Desperdicio de material": parseFloat(data.desp_material),
            "Costos de operación": parseFloat(data.cost_oper)
        };
        
        // Mostrar los valores con código de colores - layout compacto
        document.getElementById("resultados").innerHTML = `
            <div class="row g-2">
                <div class="col-md-4">
                    <p class="mb-0"><strong>Tasa de defectos:</strong> <span class="${getMetricaClass("Tasa de defectos", valoresNumericos["Tasa de defectos"])}">${data.tasa_defec}</span>
                    <small class="d-block">${metricas[0].descripcion}</small></p>
                </div>
                <div class="col-md-4">
                    <p class="mb-0"><strong>Eficiencia:</strong> <span class="${getMetricaClass("Eficiencia de producción", valoresNumericos["Eficiencia de producción"])}">${data.efic_produc}</span>
                    <small class="d-block">${metricas[1].descripcion}</small></p>
                </div>
                <div class="col-md-4">
                    <p class="mb-0"><strong>Tiempo:</strong> <span class="${getMetricaClass("Tiempo de fabricación", valoresNumericos["Tiempo de fabricación"])}">${data.tiempo_fabric}</span>
                    <small class="d-block">${metricas[2].descripcion}</small></p>
                </div>
            </div>
            <div class="row g-2 mt-2">
                <div class="col-md-6">
                    <p class="mb-0"><strong>Desperdicio:</strong> <span class="${getMetricaClass("Desperdicio de material", valoresNumericos["Desperdicio de material"])}">${data.desp_material}</span>
                    <small class="d-block">${metricas[3].descripcion}</small></p>
                </div>
                <div class="col-md-6">
                    <p class="mb-0"><strong>Costos:</strong> <span class="${getMetricaClass("Costos de operación", valoresNumericos["Costos de operación"])}">${data.cost_oper}</span>
                    <small class="d-block">${metricas[4].descripcion}</small></p>
                </div>
            </div>
        `;
        
        // Actualizar recomendaciones
        document.getElementById("recomendaciones").innerHTML = generarRecomendaciones(data);

        // Verificar si historial existe en la respuesta
        if (!data.historial) {
            console.error("Error: La respuesta no contiene datos de historial");
            return;
        }

        // Actualizar o crear gráficas
        metricas.forEach((metrica, index) => {
            const nombre = metrica.nombre;
            // Verificar si el historial para esta métrica existe
            const valores = data.historial[nombre] || [];
            
            if (valores.length === 0) {
                console.warn(`No hay datos históricos para ${nombre}`);
                return;
            }
            
            const canvasId = `chart-${nombre.replace(/ /g, "-")}`;
            const canvas = document.getElementById(canvasId);
            
            if (!canvas) {
                console.error(`Canvas no encontrado para ${nombre}`);
                return;
            }
            
            if (!charts[nombre]) {
                // Determinar el color según el tipo de métrica
                let borderColor, backgroundColor;
                if (nombre === "Eficiencia de producción") {
                    // Para eficiencia, mayor es mejor
                    borderColor = "rgba(40, 167, 69, 1)";
                    backgroundColor = "rgba(40, 167, 69, 0.1)";
                } else {
                    // Para defectos, tiempo, etc., menor es mejor
                    borderColor = "rgba(220, 53, 69, 1)";
                    backgroundColor = "rgba(220, 53, 69, 0.1)";
                }

                charts[nombre] = new Chart(canvas, {
                    type: "line",
                    data: {
                        labels: Array.from({ length: valores.length }, (_, i) => i + 1),
                        datasets: [{
                            label: nombre,
                            data: valores,
                            borderColor: borderColor,
                            backgroundColor: backgroundColor,
                            borderWidth: 2,
                            tension: 0.4,
                            fill: true,
                            color: "white"
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: {
                            duration: 1000
                        },
                        scales: {
                            x: {
                                display: true,
                                title: {
                                    display: true,
                                    text: "Mediciones",
                                    color: "white"  // Añade esta línea
                                },
                                ticks: {
                                    color: "white"  // Añade esta línea
                                },
                                grid: {
                                    color: "rgba(255, 255, 255, 0.1)"  // Opcional: grilla más visible
                                }
                            },
                            y: {
                                display: true,
                                title: {
                                    display: true,
                                    text: "Valor",
                                    color: "white"  // Añade esta línea
                                },
                                ticks: {
                                    color: "white"  // Añade esta línea
                                },
                                grid: {
                                    color: "rgba(255, 255, 255, 0.1)"  // Opcional: grilla más visible
                                }
                            }
                        },
                        plugins: {
                            title: {
                                display: true,
                                text: metrica.descripcion,
                                font: {
                                    size: 12,
                                    color: "white"
                                },
                                padding: {
                                    top: 5,
                                    bottom: 5,
                                    color: "white"
                                },
                                color: "white"  // Añade esta línea
                            },
                            legend: {
                                display: true,
                                position: 'top',
                                labels: {
                                    boxWidth: 12,
                                    padding: 5,
                                    color: "white"  // Añade esta línea
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
        });
    })
    .catch(error => {
        console.error("Error en la actualización de métricas:", error);
    });
}

// Función para generar colores aleatorios
function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
}