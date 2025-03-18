document.getElementById("metricasForm").addEventListener("submit", function(event) {
    event.preventDefault();

    // Capturar los datos del formulario
    let formData = new FormData(this);

    // Enviar datos al servidor Flask
    fetch("/calcular", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Actualizar la imagen con la nueva gráfica
        document.getElementById("grafica-container").innerHTML = `
            <img src="${data.image}?t=${new Date().getTime()}" class="img-fluid" alt="Gráfica de métricas">
        `;

        // Mostrar los valores debajo de la gráfica
        document.getElementById("resultados").innerHTML = `
            <p><strong>Tasa de defectos:</strong> ${data.tasa_defec}</p>
            <p><strong>Eficiencia de producción:</strong> ${data.efic_produc}</p>
            <p><strong>Tiempo de fabricación:</strong> ${data.tiempo_fabric}</p>
            <p><strong>Desperdicio de material:</strong> ${data.desp_material}</p>
            <p><strong>Costos por operación:</strong> ${data.cost_oper}</p>
        `;
    })
    .catch(error => console.error("Error:", error));
});
