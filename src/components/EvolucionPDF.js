// src/components/EvolucionPDF.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
//SE GENERA UN PDF
//ENCABEZADO PRIMERO
//SE GENERA UN PDF
 export const EvolucionPDF = ({
  evolucionTexto = '',
  analisisTexto = '',
  enfermeriaTexto = '',
  medicamentoTexto = '',
  viaTexto = '',
  frecuenciaTexto = '',
  presTexto = '',
  adminiTexto = '',
  cantidadTexto = '',
  indicaTexto = '',
  insuTexto = '',
  indiTexto = '',
  freTexto = '',
  dietaTexto = '',
  obsTexto = '',
  interTexto = '',
  signosTexto = '',
  activTexto = '',
  obseTexto = '',
  examenTexto = '',
  condiTexto = '',
  alergiaTexto = '',
  obserTexto = '',
  diagTexto = '',
  codigoTexto = '',
  diagnosticoTexto = '',
  codeTexto = '',
  admisiones,
 }={}) => {
//CONSTANTES//
  const fechaActual = new Date();
    const fechaFormateada = fechaActual.toLocaleDateString('es-EC');
    const horaActual = fechaActual.toLocaleTimeString('es-EC');
  const doc = new jsPDF();
 //**
  autoTable(doc, {
    startY: 20,
    head: [
      [
        'ESTABLECIMIENTO',
        'NOMBRE',
        'APELLIDO',
        'SEXO ( M - F)',
        'N° HOJA',
        'N° HISTORIA CLINICA',
      ],
    ],
    headStyles: {
      fillColor: '#CCFFCC',
      textColor: '#000000',
      halign: 'center',
      fontStyle: 'bold',
      fontSize: 5,
    },
        //traigo LA INFO DE BASE DE DATOS GUARDAD
    body: [
      [
        `CLINICA ATLAS`,
       `${admisiones?.mainData?.firstName || ''}`,
       `${admisiones.mainData?.lastName}`,
        `${admisiones.mainData?.gender?.[0] || 'N/A'}`,
        '',
        '651561651651',
      ],
    ],


    bodyStyles: {
      halign: 'center',
      cellPadding: 1,
      fontSize: 6,
      minCellHeight: 1, // 👈 AQUI CONTROLAS ALTURA
    },

    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 40 },
      2: { cellWidth: 35 },
      3: { cellWidth: 15 },
      4: { cellWidth: 15 },
      5: { cellWidth: 35 },
    },
    styles: {
      cellPadding: 1,
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      minCellHeight: 1, // 👈 AQUI CONTROLAS ALTURA
    },
    theme: 'grid', // para mostrar bordes
  });


  // Tabla de evolución
  const filasVaciass = Array.from({ length: 34 }, () => ['', '']);
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 2,
    head: [
      [
        {
          content: '1 EVOLUCIÓN',
          colSpan: 3,
          styles: { 
            fillColor: '#B8BAFF',
            halign: 'left', 
            fontSize: 10, 
            fontStyle: 'bold',
           },
        },
      ],
      [
        'FECHA(DIA/MES/AÑO)', 
        'HORA', 
        'NOTAS DE EVOLUCION'
      ],
    ],
    headStyles: {
      fillColor: '#CCFFCC',
      textColor: '#000000',
      halign: 'center',
      fontStyle: 'bold',
      fontSize: 6,
    },
    body: [
      [ 
        fechaFormateada,
        horaActual,
        evolucionTexto,
      ],
      ...filasVaciass,
    ],
    bodyStyles: {
      halign: 'center',
      fontSize: 6,
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 15 },
      2: { cellWidth: 68 },
    },
    styles: {
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
    },
    theme: 'grid', // para mostrar bordes
  });

  // Tabla de prescripciones
  const filasVacias = Array.from({ length: 35 }, () => ['', '']);
  autoTable(doc, {
    startY: 31,
    margin: { left: 120 }, // <-- mueve la tabla hacia la derecha (ajusta este valor según lo que necesites)
    head: [
      [
        {
          content: '2 PRESCRIPCIONES',
          colSpan: 2,
          styles: { halign: 'left', fontSize: 10, fontStyle: 'bold', fillColor: '#B8BAFF', },
        },
      ],
      ['FARMACOTERAPIA E INDICACIONES (PARA ENFERMERIA Y OTRO PERSONAL)', 'ADMINISTRAR FARMACOS INSUMOSs'],
    ],
    headStyles: {
      fillColor: '#CCFFCC',
      textColor: '#000000',
      halign: 'center',
      fontStyle: 'semibold',
      fontSize: 6,
    },
    body: filasVacias,
    bodyStyles: {
      halign: 'center',
      fontSize: 6,
    },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 20 },
    },
    styles: {
      cellPadding: 2,
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
    },
    theme: 'grid', // para mostrar bordes
  });

// Pie de Página 1
const finalY = doc.lastAutoTable.finalY;
const pageWidth = doc.internal.pageSize.width;

doc.setFontSize(7);
doc.setFont('helvetica', 'bold');

// Texto izquierda
doc.text(
  'SNS-MSP / HCU-form.007 / 2008',
  20, // margen izquierdo
  finalY + 3,
  { align: 'left' }
);

// Texto derecha
doc.setFontSize(9);
doc.setFont('helvetica', 'bold');
doc.text(
  'EVOLUCION Y PRESCRIPCIONES (1)',
  pageWidth - 20, // margen derecho
  finalY + 3,
  { align: 'right' }
);

//pie de pagina //


  doc.save('EvolucionPDF.pdf');
};
//HASTA AQUI PDF
