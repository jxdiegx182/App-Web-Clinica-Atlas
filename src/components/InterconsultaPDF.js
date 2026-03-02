// src/components/InterconsultaPDF.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

//SE GENERA UN PDF
//ENCABEZADO PRIMERO
export const InterconsultaPDF = ({
  establecimientoTexto, 
  servicioDosTexto,
  servicioTresTexto,
  medicoTexto,
  descTexto,
  cuadroUnoTexto,
  examenesTexto,
  diagUnoTexto = '',
  cieUnoTexto = '',
  preUnoTexto = '',
  defUnoTexto = '',
  planesTeTexto = '',
  cuadroTexto = '',
  resumenTexto = '',
  diagDosTexto = '',
  cieDosTexto = '',
  preTexto = '',
  defTexto = '',
  planDiagTexto = '',
  planTratamientoTexto = '',
  admisiones,
  edad,
  formData,
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
        'ESTABLECIMIENTO SOLICITANTE',
        'NOMBRE',
        'APELLIDO',
        'SEXO (M-F)',
        'EDAD',
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
       `${edad} Años`,
       '', 
      ],
    ],
    //traigo LA INFO DE BASE DE DATOS GUARDAD

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

  //*************************1************************** */

  // Tabla de 1 CARACTERISITICAS DE LA SOLICITUD Y MOTIVO

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 2,
    head: [
      [
        {
          content: '1 CARACTERISTICAS DE LA  SOLICITUD Y MOTIVO ',
          colSpan: 10, //COLUMNAS
          styles: {
            fillColor: '#B8BAFF',
            halign: 'left',
            fontSize: 10,
            fontStyle: 'bold',
          },
        },
      ],
      [
        'ESTABLECIMIENTO DE DESTINO',
        establecimientoTexto,
        'SERVICIO CONSULTADO',
        servicioDosTexto,
        'SERVICIO QUE SOLICITA',
        servicioTresTexto,
        'SALA ',
        '',
        'CAMA',
        ''
      ],
    ],
    //********************CONDICION PARA QUE LAS CELDAS SE PONGAN EN BLANCO  ********************
    didParseCell: function (data) {
      if (data.section === 'head') {
        if ([1, 3, 5, 7, 9].includes(data.column.index)) {
          data.cell.styles.fillColor = [255, 255, 255];
        }
      }
    },
    //********************HASTA AQUI*********************************
    headStyles: {
      fillColor: '#CCFFCC',
      textColor: '#000000',
      halign: 'center',
      fontStyle: 'bold',
      fontSize: 5,
    },

    body: [],

    bodyStyles: {
      fillColor: '#CCFFCC',
      textColor: '#000000',
      halign: 'center',
      fontStyle: 'bold',
      fontSize: 5,
    },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 18 }, // BLANCO
      2: { cellWidth: 18 },
      3: { cellWidth: 18 }, // BLANCO
      4: { cellWidth: 18 },
      5: { cellWidth: 18 }, // BLANCO
      6: { cellWidth: 18 },
      7: { cellWidth: 18 }, // BLANCO
      8: { cellWidth: 18 },
      9: { cellWidth: 18 }, // BLANCO
    },

    styles: {
      cellPadding: 1,
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      minCellHeight: 5, //ALTURA
      valign: 'middle',
    },
    theme: 'grid', // para mostrar bordes
  });

  //*******************************************1************************************** */
  //tabla de la uno todavia

  // Tabla de caracteristicas de la solicitud

  autoTable(doc, {
    startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 2 : 10,
    head: [
      [
        'NORMAL',
        formData.tecnica === 'NORMAL' ? 'X' : '',
        'URGENTE',
        formData.tecnica === 'URGENTE' ? 'X' : '',
        'MEDICO INTERCONSULTADO',
        medicoTexto,
        'DESCRIPCION DEL MOTIVO',
        descTexto,
      ],
    ],
    //********************CONDICION PARA QUE LAS CELDAS SE PONGAN EN BLANCO  ********************
    didParseCell: function (data) {
      if (data.section === 'head') {
        if ([1, 3].includes(data.column.index)) {
          data.cell.styles.fillColor = [255, 230, 138];
        } else if ([5, 7].includes(data.column.index)) {
          data.cell.styles.fillColor = [255, 255, 255];
        }
      }
    },

    //********************HASTA AQUI*********************************
    headStyles: {
      fillColor: '#CCFFCC',
      textColor: '#000000',
      halign: 'center',
      fontStyle: 'bold',
      fontSize: 5,
    },

    bodyStyles: {
      fillColor: '#ffffff',
      textColor: '#000000',
      halign: 'center',
      fontStyle: 'bold',
      fontSize: 5,
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 22 }, // BLANCO
      2: { cellWidth: 22 },
      3: { cellWidth: 22 }, // BLANCO
      4: { cellWidth: 22 },
      5: { cellWidth: 24 }, // BLANCO
      6: { cellWidth: 22 },
      7: { cellWidth: 23 }, // BLANCO
    },

    styles: {
      cellPadding: 1,
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      minCellHeight: 5, //ALTURA
      valign: 'middle',
    },
    theme: 'grid', // para mostrar bordes
  });
  //tabla de la 1 todavia

  // Tabla de CUADRO CLINICO ACTUAL*******************2*****************************
  const filasVacias = Array.from({ length: 12 }, () => ['', '']);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 2,
    //margin: { left: 120 }, // <-- mueve la tabla hacia la derecha (ajusta este valor según lo que necesites)
    head: [
      [
        {
          content: '2 CUADRO CLINICO ACTUAL',
          colSpan: 1,
          styles: {
            halign: 'left',
            fontSize: 10,
            fontStyle: 'bold',
            fillColor: '#B8BAFF', //COLOR AZULADO DE ENCABEZADO
          },
        },
      ],
    ],
    headStyles: {
      fillColor: '#CCFFCC',
      textColor: '#000000',
      halign: 'center',
      fontStyle: 'bold',
      fontSize: 6,
    },

    body:[
      [cuadroUnoTexto],
      ...filasVacias,
  ], 

    bodyStyles: {
      halign: 'center',
      fontSize: 6,
    },
    columnStyles: {
      0: { cellWidth: 180 }, //ANCHOO
    },
    styles: {
      cellPadding: 1,
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      minCellHeight: 4.5, //ALTURA
    },
    theme: 'grid', // para mostrar bordes
  });

  // Tabla de CUADRO CLINICO ACTUAL*************************2***********************

  //*******************3**************************//

  const filasVaciasTres = Array.from({ length: 7 }, () => ['', '']);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 2,
    //margin: { left: 120 }, // <-- mueve la tabla hacia la derecha (ajusta este valor según lo que necesites)
    head: [
      [
        {
          content: '3 RESULTADOS DE EXAMENES Y PROCEDIMIENTOS DIAGNOSTICOS',
          colSpan: 1,
          styles: {
            halign: 'left',
            fontSize: 10,
            fontStyle: 'bold',
            fillColor: '#B8BAFF', //COLOR AZULADO DE ENCABEZADO
          },
        },
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
      [examenesTexto],
    ...filasVaciasTres,
    ],
    bodyStyles: {
      halign: 'center',
      fontSize: 6,
    },
    columnStyles: {
      0: { cellWidth: 180 }, //ANCHOO
    },
    styles: {
      cellPadding: 1,
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      minCellHeight: 4.5, //ALTURA
    },
    theme: 'grid', // para mostrar bordes
  });
  //*****************3************************ */

  // Sección 4: Diagnóstico (Tabla)
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 2,
    head: [
      [
        {
          content: '4 DIAGNOSTICO',
          colSpan: 10,
          styles: {
            halign: 'left',
            fontSize: 10,
            fontStyle: 'bold',
            fillColor: '#B8BAFF', //COLOR AZULADO DE ENCABEZADO
          },
        },
      ],
      ['', '', 'CIE', 'PRE', 'DEF', '', '', 'CIE', 'PRE', 'DEF'],
    ], // [cite: 25]
    headStyles: {
      fillColor: '#CCFFCC',
      textColor: '#000000',
      halign: 'center',
      fontStyle: 'bold',
      fontSize: 6,
    },
    body: [
      ['1', `DIAG: ${diagUnoTexto}  `, `CIE: ${cieUnoTexto}`, `PRE: ${preUnoTexto}  `, `DEF: ${defUnoTexto}  `, '4', '', '', '', ''],
      ['2', '', '', '', '', '5', '', '', '', ''],
      ['3', '', '', '', '', '6', '', '', '', ''],
    ], //|| PONER PARA AGREGAR INF FIREBASE
    theme: 'grid',
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 19 }, // BLANCO
      2: { cellWidth: 19 },
      3: { cellWidth: 19 }, // BLANCO
      4: { cellWidth: 19 },
      5: { cellWidth: 15 }, // BLANCO
      6: { cellWidth: 19 },
      7: { cellWidth: 19 }, // BLANCO
      8: { cellWidth: 19 }, // BLANCO
      9: { cellWidth: 19 }, // BLANCO
    },
    styles: {
      fontSize: 7,
      cellPadding: 1,
      lineColor: [0, 0, 0],
      lineWidth: 0.3,

      minCellHeight: 4.5, //ALTURA
    },
  });

  // Sección 4: Diagnóstico (Tabla)

  //*****************5************************ */
  // Tabla de CUADRO CLINICO ACTUAL************************************************
  const filasVaciasCinco = Array.from({ length: 13 }, () => ['', '']);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 2,
    //margin: { left: 120 }, // <-- mueve la tabla hacia la derecha (ajusta este valor según lo que necesites)
    head: [
      [
        {
          content: '5 PLANES TERAPEUTICOS Y EDUCACIONALES REALIZADOS',
          colSpan: 1,
          styles: {
            halign: 'left',
            fontSize: 10,
            fontStyle: 'bold',
            fillColor: '#B8BAFF', //COLOR AZULADO DE ENCABEZADO
          },
        },
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
      [planesTeTexto],
        ...filasVaciasCinco,
      ],
    bodyStyles: {
      halign: 'center',
      fontSize: 6,
    },
    columnStyles: {
      0: { cellWidth: 180 }, //ANCHOO
    },
    styles: {
      cellPadding: 1,
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      minCellHeight: 4.5, //ALTURA
    },
    theme: 'grid', // para mostrar bordes
  });
  //*****************5************************ */

  //*************************************pie de pagina******************** //
  // Tabla de caracteristicas de la solicitud
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 2,
    head: [
      [
        'FECHA',
        fechaFormateada,
        'HORA',
        horaActual,
        'NOMBRE DEL PROFESIONAL',
        '',
        '',
        'FIRMA',
        '',
        'NUMERO DE HOJA',
        '',
      ],
    ],
    //********************CONDICION PARA QUE LAS CELDAS SE PONGAN EN BLANCO  ***********
    didParseCell: function (data) {
      if (data.section === 'head') {
        if ([1, 3, 5, 6, 8, 10].includes(data.column.index)) {
          data.cell.styles.fillColor = [255, 255, 255];
        }
      }
    },
    //********************HASTA AQUI*********************************
    headStyles: {
      fillColor: '#CCFFCC',
      textColor: '#000000',
      halign: 'center',
      fontStyle: 'bold',
      fontSize: 5,
    },

    bodyStyles: {
      fillColor: '#ffffff',
      textColor: '#000000',
      halign: 'center',
      fontStyle: 'bold',
      fontSize: 5,
    },
    columnStyles: {
      0: { cellWidth: 14 },
      1: { cellWidth: 16, fillColor: [255, 230, 138] }, // BLANCO
      2: { cellWidth: 14 },
      3: { cellWidth: 16, fillColor: [255, 255, 255] }, // BLANCO
      4: { cellWidth: 16 },
      5: { cellWidth: 26, fillColor: [255, 255, 255] }, // BLANCO
      6: { cellWidth: 16, fillColor: [255, 255, 255] }, // BLANCO
      7: { cellWidth: 14 },
      8: { cellWidth: 22, fillColor: [255, 255, 255] }, // BLANCO
      9: { cellWidth: 14 },
      10: { cellWidth: 16, fillColor: [255, 255, 255] }, // BLANCO
    },

    styles: {
      cellPadding: 1,
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      minCellHeight: 5, //ALTURA
      valign: 'middle',
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
    'INTERCONSULTA - SOLICITUD',
    pageWidth - 20, // margen derecho
    finalY + 3,
    { align: 'right' }
  );

  //pie de pagina //

  //*************************************ENCABEZADO DE pagina 2******************** //
  //**
  doc.addPage();

  autoTable(doc, {
    startY: 20,
    head: [
      [
        'ESTABLECIMIENTO CONSULTADO',
        'NOMBRE',
        'APELLIDO',
        'SEXO (M-F)',
        'EDAD',
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
      ['CLINICA ATLAS',
      `${admisiones?.mainData?.firstName || ''}`,
      `${admisiones?.mainData?.lastName || ''}`,
      '',
      `${edad} Años`,
      '',
       // `
      //NOMBRE: ${admisiones.firstName}
      //`,
      ],
    ],
    //traigo LA INFO DE BASE DE DATOS GUARDAD

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

  //*******************ENCABEZADO DE pagina 2**FINAL AQUI */

  //

  // Tabla de CUADRO CLINICO ACTUAL*******************6*****************************
  const filasVaciasSeis = Array.from({ length: 13 }, () => ['', '']);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 2,
    //margin: { left: 120 }, // <-- mueve la tabla hacia la derecha (ajusta este valor según lo que necesites)
    head: [
      [
        {
          content: '6 CUADRO CLINICO DE INTERCONSULTA',
          colSpan: 1,
          styles: {
            halign: 'left',
            fontSize: 10,
            fontStyle: 'bold',
            fillColor: '#B8BAFF', //COLOR AZULADO DE ENCABEZADO
          },
        },
      ],
    ],
    headStyles: {
      fillColor: '#CCFFCC',
      textColor: '#000000',
      halign: 'center',
      fontStyle: 'bold',
      fontSize: 6,
    },
    body:[
      [cuadroTexto], 
    ...filasVaciasSeis,
  ],

    bodyStyles: {
      halign: 'center',
      fontSize: 6,
    },
    columnStyles: {
      0: { cellWidth: 180 }, //ANCHOO
    },
    styles: {
      cellPadding: 1,
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      minCellHeight: 4.5, //ALTURA
    },
    theme: 'grid', // para mostrar bordes
  });

  // Tabla de CUADRO CLINICO ACTUAL*************************6***********************

  //*******************7**************************//

  const filasVaciasSiete = Array.from({ length: 9 }, () => ['', '']);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 2,
    //margin: { left: 120 }, // <-- mueve la tabla hacia la derecha (ajusta este valor según lo que necesites)
    head: [
      [
        {
          content: '7 RESUMEN DEL CRITERIO CLÍNICO',
          colSpan: 1,
          styles: {
            halign: 'left',
            fontSize: 10,
            fontStyle: 'bold',
            fillColor: '#B8BAFF', //COLOR AZULADO DE ENCABEZADO
          },
        },
      ],
    ],
    headStyles: {
      fillColor: '#CCFFCC',
      textColor: '#000000',
      halign: 'center',
      fontStyle: 'bold',
      fontSize: 6,
    },
    body:[
      [resumenTexto],
      ...filasVaciasSiete,
  ],

    bodyStyles: {
      halign: 'center',
      fontSize: 6,
    },
    columnStyles: {
      0: { cellWidth: 180 }, //ANCHOO
    },
    styles: {
      cellPadding: 1,
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      minCellHeight: 4.5, //ALTURA
    },
    theme: 'grid', // para mostrar bordes
  });
  //*****************7************************ */

  // Sección *******************8***********************: Diagnóstico (Tabla)
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 2,
    head: [
      [
        {
          content: '8 DIAGNOSTICO',
          colSpan: 10,
          styles: {
            halign: 'left',
            fontSize: 10,
            fontStyle: 'bold',
            fillColor: '#B8BAFF', //COLOR AZULADO DE ENCABEZADO
          },
        },
      ],
      ['', '', 'CIE', 'PRE', 'DEF', '', '', 'CIE', 'PRE', 'DEF'],
    ], // [cite: 25]
    headStyles: {
      fillColor: '#CCFFCC',
      textColor: '#000000',
      halign: 'center',
      fontStyle: 'bold',
      fontSize: 6,
    },
    body: [
      ['1', `DIAG: ${diagDosTexto}`, cieDosTexto, preTexto, defTexto, '4', '', '', '', ''],
      ['2', '', '', '', '', '5', '', '', '', ''],
      ['3', '', '', '', '', '6', '', '', '', ''],
    ], //|| PONER PARA AGREGAR INF FIREBASE
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 1,
      lineColor: [0, 0, 0],
      lineWidth: 0.3,

      minCellHeight: 4.5, //ALTURA
    },
  });

  // Sección **************************8**************************: Diagnóstico (Tabla)

  //*****************9************************ */
  // Tabla de CUADRO CLINICO ACTUAL************************************************
  const filasVaciasNueve = Array.from({ length: 4 }, () => ['', '']);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 2,
    //margin: { left: 120 }, // <-- mueve la tabla hacia la derecha (ajusta este valor según lo que necesites)
    head: [
      [
        {
          content: '9 PLAN DE DIAGNOSTICO PROPUESTO',
          colSpan: 1,
          styles: {
            halign: 'left',
            fontSize: 10,
            fontStyle: 'bold',
            fillColor: '#B8BAFF', //COLOR AZULADO DE ENCABEZADO
          },
        },
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
      [planDiagTexto],
    ...filasVaciasNueve,
  ],

    bodyStyles: {
      halign: 'center',
      fontSize: 6,
    },
    columnStyles: {
      0: { cellWidth: 180 }, //ANCHOO
    },
    styles: {
      cellPadding: 1,
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      minCellHeight: 4.5, //ALTURA
    },
    theme: 'grid', // para mostrar bordes
  });
  //*****************9*********************** */

  //*****************10************************ */
  // Tabla de CUADRO CLINICO ACTUAL************************************************
  const filasVaciasDiez = Array.from({ length: 11 }, () => ['', '']);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 2,
    //margin: { left: 120 }, // <-- mueve la tabla hacia la derecha (ajusta este valor según lo que necesites)
    head: [
      [
        {
          content: '10 PLAN DE TRATAMIENTO PROPUESTO',
          colSpan: 1,
          styles: {
            halign: 'left',
            fontSize: 10,
            fontStyle: 'bold',
            fillColor: '#B8BAFF', //COLOR AZULADO DE ENCABEZADO
          },
        },
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
      [planTratamientoTexto],
      ...filasVaciasDiez,
  ],
    bodyStyles: {
      halign: 'center',
      fontSize: 6,
    },
    columnStyles: {
      0: { cellWidth: 180 }, //ANCHOO
    },
    styles: {
      cellPadding: 1,
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      minCellHeight: 4.5, //ALTURA
    },
    theme: 'grid', // para mostrar bordes
  });
  //****************10********************** */

  //*************************************pie de pagina 2******************** //
  // Tabla de caracteristicas de la solicitud
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 2,
    head: [
      [
        'FECHA',
        fechaFormateada,
        'HORA',
        horaActual,
        'NOMBRE DEL PROFESIONAL',
        '',
        '',
        'FIRMA',
        '',
        'NUMERO DE HOJA',
        '',
      ],
    ],
    //********************CONDICION PARA QUE LAS CELDAS SE PONGAN EN BLANCO  ***********
    didParseCell: function (data) {
      if (data.section === 'head') {
        if ([1, 3, 5, 6, 8, 10].includes(data.column.index)) {
          data.cell.styles.fillColor = [255, 255, 255];
        }
      }
    },
    //********************HASTA AQUI*********************************
    headStyles: {
      fillColor: '#CCFFCC',
      textColor: '#000000',
      halign: 'center',
      fontStyle: 'bold',
      fontSize: 5,
    },

    bodyStyles: {
      fillColor: '#ffffff',
      textColor: '#000000',
      halign: 'center',
      fontStyle: 'bold',
      fontSize: 5,
    },
    columnStyles: {
      0: { cellWidth: 14 },
      1: { cellWidth: 16, fillColor: [255, 230, 138] }, // BLANCO
      2: { cellWidth: 14 },
      3: { cellWidth: 16, fillColor: [255, 255, 255] }, // BLANCO
      4: { cellWidth: 16 },
      5: { cellWidth: 26, fillColor: [255, 255, 255] }, // BLANCO
      6: { cellWidth: 16, fillColor: [255, 255, 255] }, // BLANCO
      7: { cellWidth: 14 },
      8: { cellWidth: 22, fillColor: [255, 255, 255] }, // BLANCO
      9: { cellWidth: 14 },
      10: { cellWidth: 16, fillColor: [255, 255, 255] }, // BLANCO
    },

    styles: {
      cellPadding: 1,
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      minCellHeight: 5, //ALTURA
      valign: 'middle',
    },
    theme: 'grid', // para mostrar bordes
  });
  //tabla PIE DE PAGINA

  // Pie de Página 2
  const finalYDos = doc.lastAutoTable.finalY;
  const pageWidthDos = doc.internal.pageSize.width;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  // Texto izquierda
  doc.text(
    'SNS-MSP / HCU-form.007 / 2008',
    20, // margen izquierdo
    finalYDos + 3,
    { align: 'left' }
  );

  // Texto derecha
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(
    'INTERCONSULTA - SOLICITUD',
    pageWidthDos - 20, // margen derecho
    finalYDos + 3,
    { align: 'right'}
  );

  //pie de pagina 2//

  // En lugar de: doc.save('InterconsultaPDF.pdf');
  // Usar esto para desarrollo:
  //const string = doc.output('bloburl');
  //window.open(string);

  doc.save('InterconsultaPDF.pdf');
};
//HASTA AQUI PDF
