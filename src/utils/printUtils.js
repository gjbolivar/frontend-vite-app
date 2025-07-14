export const generatePDF = (htmlContent, filename = 'documento') => {
  // En un entorno real, usaríamos una librería como jsPDF o html2pdf
  console.log("Generando PDF:", filename);
  // Esta es una implementación simulada
  return new Promise((resolve) => {
    setTimeout(() => {
      const blob = new Blob([htmlContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.pdf`;
      a.click();
      resolve();
    }, 500);
  });
};


// DONE