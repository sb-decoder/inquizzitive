import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Inside the generatePDF function, after the score summary:
const canvas = document.querySelector('.chart-container'); // Adjust selector to your chart element
if (canvas) {
  html2canvas(canvas).then((canvasImg) => {
    const imgData = canvasImg.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', 20, 80, 170, 80); // Adjust dimensions as needed
    // Continue with question feedback and save
    // ...
    doc.save(`Inquizzitive_Quiz_Results_${new Date().toISOString().split('T')[0]}.pdf`);
  });
} else {
  // Fallback if no chart is present
  // Add question feedback and save as above
  doc.save(`Inquizzitive_Quiz_Results_${new Date().toISOString().split('T')[0]}.pdf`);
}
