import { Bold } from "lucide-react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
export const EpicrisisPDF = async (datos) => {
  // 1️⃣ Cargar PDF oficial como plantilla
  const response = await fetch("/Hoja_Epicrisis.pdf");

console.log("Status:", response.status);
const existingPdfBytes = await response.arrayBuffer();

  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  const { width, height } = firstPage.getSize();
  console.log("Width", width, "Height", height);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  const genero = datos?.formData?.genero;
  const estadoCivil = datos?.formData?.estadoCivil;
  
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
  firstPage.drawText(String(datos.formData.institucion  || ""), {
    x: 80,
    y: height - 42,
    size: 8,
    font,
    color: rgb(0, 0, 0),
  });

  firstPage.drawText(`${datos.formData.unidadOperativa || ""}`, {
    x: 210,
    y: height - 42,
    size: 6,
    font,
  });
  
  firstPage.drawText(`${datos.formData.codUO || ""}`, {
    x: 345,
    y: height - 42,
    size: 6,
    font,
  });
  firstPage.drawText(`${datos.formData.parroquiaInst || ""}`, {
    x: 376,
    y: height - 42,
    size: 5,
    font,
    color: rgb(0, 0, 0),
  });

  firstPage.drawText(`${datos.formData.cantonInst || ""}`, {
    x: 410,
    y: height - 42,
    size: 5,
    font,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(`${datos.formData.historiaClinica || ""}`, {
    x: 510,
    y: height - 42,
    size: 6,
    font,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(`${datos.formData.apellidoPaterno || ""}`, {
    x: 82,
    y: height - 98,
    size: 6,
    font,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(`${datos.formData.apellidoMaterno || ""}`, {
    x: 190,
    y: height - 98,
    size: 6,
    font,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(`${datos.formData.primerNombre || ""}`, {
    x: 300,
    y: height - 98,
    size: 6,
    font,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(`${datos.formData.segundoNombre || ""}`, {
    x: 405,
    y: height - 98,
    size: 6,
    font,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(`${datos.formData.cedula || ""}`, {
    x: 500,
    y: height - 98,
    size: 6,
    font,
    color: rgb(0, 0, 0),
  });
firstPage.drawText(`${datos.formData.direccion || ""}`, {
    x: 80,
    y: height - 125,
    size: 6,
    font,
    color: rgb(0, 0, 0),
  });
firstPage.drawText(`${datos.formData.barrio || ""}`, {
    x: 265,
    y: height - 125,
    size: 6,
    font,
    color: rgb(0, 0, 0),
  });

firstPage.drawText(`${datos.formData.parroquia || ""}`, {
    x: 305,
    y: height - 125,
    size: 6,
    font,
    color: rgb(0, 0, 0),
  });

firstPage.drawText(`${datos.formData.canton || ""}`, {
    x: 365,
    y: height - 125,
    size: 6,
    font,
    color: rgb(0, 0, 0),
  });
firstPage.drawText(`${datos.formData.provincia || ""}`, {
    x: 410,
    y: height - 125,
    size: 6,
    font,
    color: rgb(0, 0, 0),
  });
firstPage.drawText(`${datos.formData.telefono || ""}`, {
    x: 510,
    y: height - 125,
    size: 6,
    font,
    color: rgb(0, 0, 0),
  });


  firstPage.drawText(`${datos.formData.fechaNacimiento || ""}`, {
    x: 60,
    y: height - 162,
    size: 6,
    font,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(`${datos.formData.lugarNacimiento || ""}`, {
    x: 145,
    y: height - 162,
    size: 6,
    font,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(`${datos.formData.nacionalidad || ""}`, {
    x: 230,
    y: height - 162,
    size: 6,
    font,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(`${datos.formData.grupoOEtnia || ""}`, {
    x: 293,
    y: height - 162,
    size: 6,
    font,
    color: rgb(0, 0, 0),
  });
  firstPage.drawText(`${datos.formData.edad || ""}`, {
    x: 360,
    y: height - 162,
    size: 6,
    font,
    color: rgb(0, 0, 0),
  });
  if (genero === "F") {
  firstPage.drawText("X", {
    x: 412,
    y: height - 162,
    size: 6,
    font,
    color: rgb(0, 0, 0),
  });
}

if (genero === "M") {
  firstPage.drawText("X", {
    x: 396,
    y: height - 162,
    size: 6,
    font,
    color: rgb(0, 0, 0),
  });
}
  {/**ESTADO CIVIL */}
  if (estadoCivil === "Soltero/a") {
  firstPage.drawText("X", {
    x: 429,
    y: height - 162,
    size: 6,
    font,
    color: rgb(0, 0, 0),
  });
}
    if (estadoCivil === "Casado/a") {
  firstPage.drawText("X", {
    x: 445,
    y: height - 162,
    size: 6,
    font,
    color: rgb(0, 0, 0),
  });
}
  if (estadoCivil === "Divorciado/a") {
  firstPage.drawText("X", {
    x: 464,
    y: height - 162,
    size: 6,
    font,
    color: rgb(0, 0, 0),
  });
}
  if (estadoCivil === "Viudo/a") {
  firstPage.drawText("X", {
    x: 479,
    y: height - 162,
    size: 6,
    font,
    color: rgb(0, 0, 0),
  });
}
  if (estadoCivil === "Unión Libre") {
  firstPage.drawText("X", {
    x: 493,
    y: height - 162,
    size: 6,
    font,
    color: rgb(0, 0, 0),
  });
}

  firstPage.drawText(`${datos.formData.instruccion || ""}`, {
    x: 520,
    y: height - 162,
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
  link.download = "Anamnesis.pdf";
  //link.click();

  
return pdfBytes;
};