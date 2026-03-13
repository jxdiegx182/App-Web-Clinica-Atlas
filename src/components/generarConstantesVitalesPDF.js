import { Bold } from "lucide-react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
export const generarConstantesVitalesPDF = async (datos) => {
  // 1️⃣ Cargar PDF oficial como plantilla
  const response = await fetch("/plantilla_constantes_vitales.pdf");

console.log("Status:", response.status);
const existingPdfBytes = await response.arrayBuffer();

  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  const { width, height } = firstPage.getSize();
  console.log("Width", width, "Height", height);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  
{/* //constante de grilla en mi pdf una locura total
for (let x = 0; x < width; x += 20) {
  firstPage.drawLine({
    start: { x, y: 0 },
    end: { x, y: height },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
}

for (let y = 0; y < height; y += 20) {
  firstPage.drawLine({
    start: { x: 0, y },
    end: { x: width, y },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
}
*/}

  // 2️⃣ Escribir encima sin alterar estructura
  firstPage.drawText(String(datos.cieDiag || ""), {
    x: 10,
    y: height - 34,
    size: 8,
    font,
    color: rgb(0, 0, 0),
  });

  firstPage.drawText(`${datos.admisiones?.lastName || ""}`, {
    x: 50,
    y: height - 54,
    size: 6,
    font,
  });
  
  firstPage.drawText(`${datos.admisiones?.firstName || ""}`, {
    x: 158,
    y: height - 54,
    size: 6,
    font,
  });
  firstPage.drawText(`${datos.edad || ""}`, {
    x: 483,
    y: height - 54,
    size: 6,
    font,
    color: rgb(0, 0, 0),
  });

  // Guardar PDF final
  const pdfBytes = await pdfDoc.save();

  // Descargar automáticamente
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "Constantes_Vitales.pdf";
  link.click();
};