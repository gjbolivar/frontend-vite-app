// utils/helpers.js
export const exportToExcel = (data, filename = 'reporte', sheetName = 'Datos') => {
  if (!data || data.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }

  // Obtener encabezados de las columnas del primer objeto de datos
  const headers = Object.keys(data[0]);

  // Convertir los datos a formato CSV
  let csvContent = headers.map(header => `"${header}"`).join(',') + '\n'; // Encabezados entre comillas
  data.forEach(row => {
    const rowValues = headers.map(header => {
      let value = row[header];
      if (value === null || value === undefined) {
        value = '';
      } else if (typeof value === 'string') {
        value = value.replace(/"/g, '""'); // Escapar comillas dobles
        value = `"${value}"`; // Envolver valores de texto en comillas
      }
      return value;
    });
    csvContent += rowValues.join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  alert(`Reporte "${filename}.csv" generado (simulado).`);
};


// DONE