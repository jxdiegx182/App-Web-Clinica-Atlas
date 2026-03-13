import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  FileDown,
  Pill,
  AlertCircle,
  Clock,
  AlertTriangle,
  CheckCircle,
  MapPin,
  FileText,
  Search,
  Calendar
} from 'lucide-react';
import { PlusCircle, CalendarCheck } from 'lucide-react';
import { db } from '../firebaseConfig'; // 👈 AJUSTAr la ruta si es necesario
import { doc, getDoc } from 'firebase/firestore';
import { toast } from '@/components/ui/use-toast';

const AllergyWarning = ({ allergy }) => (
  <span className="allergy-warning text-[#FF0000] font-semibold">
    <span className="allergy-icon">⚠️</span>
    ALERGIAS: {allergy}
  </span>
);
const Receta = () => {
  const { mainId } = useParams();
  const [time, setTime] = useState(new Date());
  const [admisiones, setAdmisiones] = useState(null); // <-- aquí se guardan los datos desde Firestore
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); 
  

  const toggleCell = (row, col, setSelected) => {
    const key = `${row}-${col}`;
    setSelected((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderGrid = (rows, cols, selected, setSelected, symbol) => {
    return Array.from({ length: rows }, (_, row) => (
      <div key={row} className="flex">
        {Array.from({ length: cols }, (_, col) => {
          const key = `${row}-${col}`;
          return (
            <div
              key={col}
              className={`w-10 h-10 border flex items-center justify-center cursor-pointer ${
                selected[key] ? 'bg-gray-300' : 'bg-white'
              }`}
              onClick={() => toggleCell(row, col, setSelected)}
            >
              {selected[key] ? symbol : ''}
            </div>
          );
        })}
      </div>
    ));
  };

  //agregado
  const [presTexto, setPresTexto] = useState('');
  const [recetaTexto, setRecetaTexto] = useState('');
  const [recomendacionTexto, setRecomendacionTexto] = useState('');
  const [obsTexto, setObsTexto] = useState('');
  const [indicaTexto, setIndicaTexto] = useState('');
  const [diagnosticoTexto, setDiagnosticoTexto] = useState('');
  const [medicamento, setMedicamento] = useState("");
  const [stockActual, setStockActual] = useState("");
  const [advertencia, setAdvertencia] = useState("");
  const stock = {
    "Paracetamol 500 mg": 60,
    "Amoxisilina 1 gramo": 10,
  };

  //los medicamentos y el stock 
  const handleMedicamentoChange = (e) => {
    const seleccionado = e.target.value;
    setMedicamento(seleccionado);

    if (seleccionado && stock[seleccionado] !== undefined) {
      const cantidad = stock[seleccionado];
      setStockActual(cantidad);

      if (cantidad <= 50) {
        setAdvertencia(`⚠ Stock bajo: solo quedan ${cantidad} unidades.`);
      } else {
        setAdvertencia("");
      }
    } else {
      setStockActual("");
      setAdvertencia("");
    }
  };
  //SE GENERA UN PDF
  const handleGeneratePDF = () => {
    const doc = new jsPDF();

    autoTable(doc, {
      startY: 10,
      head: [
        [
          'ESTABLECIMIENTO',
          'NOMBRE',
          'APELLIDO',
          'SEXO',
          'N° HOJA',
          'N° HISTORIA CLINICA',
        ],
      ],
      headStyles: {
        fillColor: '#CCE4EA',
        textColor: '#000000',
        halign: 'center',
        fontStyle: 'bold',
        fontSize: 5,
      },
      body: [
        [
          'CLINICA ATLAS',
          'DAVID ERNESTO',
          'ALCIVAR ROMERO',
          'M',
          '1',
          '23/11/2025 11:15',
        ],
      ],
      bodyStyles: {
        halign: 'center',
        fontSize: 6,
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
        cellPadding: 4,
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
      },
      theme: 'grid', // para mostrar bordes
    });
    
    // Tabla de evolución
    const filasVaciass = Array.from({ length: 21 }, () => ['', '']);
    autoTable(doc, {
      startY: 37,
      head: [
        [
          {
            content: '1 EVOLUCIÓN',
            colSpan: 3,
            styles: { halign: 'left', fontSize: 10, fontStyle: 'bold' },
          },
        ],
        ['FECHA(DIA/MES/AÑO)', 'HORA', 'NOTAS DE EVOLUCION'],
      ],
      headStyles: {
        fillColor: '#CCE4EA',
        textColor: '#000000',
        halign: 'center',
        fontStyle: 'bold',
        fontSize: 6,
      },
      body: filasVaciass,
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
        cellPadding: 4,
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
      },
      theme: 'grid', // para mostrar bordes
    });
    // Tabla de prescripciones
    const filasVacias = Array.from({ length: 21 }, () => ['', '']);
    autoTable(doc, {
      startY: 37,
      margin: { left: 120 }, // <-- mueve la tabla hacia la derecha (ajusta este valor según lo que necesites)
      head: [
        [
          {
            content: '2 PRESCRIPCIONES',
            colSpan: 2,
            styles: { halign: 'left', fontSize: 10, fontStyle: 'bold' },
          },
        ],
        ['FARMACOTERAPIA E INDICACIONES', 'FARMACOS INSUMOSs'],
      ],
      headStyles: {
        fillColor: '#CCE4EA',
        textColor: '#000000',
        halign: 'center',
        fontStyle: 'bold',
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
        cellPadding: 4,
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
      },
      theme: 'grid', // para mostrar bordes
    });

    doc.save('Evolucion_Resumen.pdf');
  };
// HASTA AQUI EL PDF 

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

//Aqui traigo de firebase para el encabezado
useEffect(() => {
  const fetchAdmisiones = async () => {
    console.log('🧪 mainId recibido:', mainId);

    if (!mainId) {
      console.warn('⚠️ mainId es undefined o null'); 
      setLoading(false);
      return;
    }
    try {
      const ref = doc(db, 'admisiones', mainId);
      const snap = await getDoc(ref);
         if (!snap.exists()) {
        console.warn('❌ Documento no existe');
        setAdmisiones(null);
        return;
      }
      const data = snap.data();
         setAdmisiones({
            id: snap.id,
            ...data,
            ...data.mainData,
          });
        } catch (error) {
      console.error('❌ Error al obtener admisiones:', error);
      setAdmisiones(null);
    } finally {
      setLoading(false);
    }
  };
  fetchAdmisiones();
}, [mainId]);
//hasta aqui traigo de firebase

  const formattedDate = time.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = time.toLocaleTimeString('es-ES');
  //inicia la ventana grafica
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ffffff] via-[#EAF4FB] to-[#1a5784] p-6">

     
      {/* HEADER */}
      <header className="relative rounded-2xl border border-[#007e8f]/25 bg-gradient-to-r from-[#595759] to-[#595759]/40 p-4 md:p-6 shadow-lg backdrop-blur mb-6"><div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Pill className="w-8 h-8 text-[#fffff]" />
            <div>
              <h1 className="text-2xl font-bold text-[#fffffff]">Receta Médica</h1>
              <p className="text-sm text-[#fffffff]">{formattedDate} • {formattedTime}</p>
            </div>
          </div>
          <Button
            onClick={handleGeneratePDF}
            className="flex items-center gap-2 bg-gradient-to-r from-[#4b6bb3] to-[#007e8f] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
            title="Imprimir PDF"
          >
            <FileDown className="w-5 h-5" />
            GENERAR PDF
          </Button>
        </div>
      </header>

      {/* MAIN PANEL */}
      <main className="mx-auto">
        {/* FORMULARIO */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#007e8f]/10"
        >
          <div className="p-6 space-y-6">
           
            {/* SECCIÓN 1: INFORMACIÓN DE LA RECETA */}
            <div className="bg-[#f8f9fa] rounded-lg p-5 space-y-4 border-l-4 border-[#1a5784]">
              <h3 className="font-bold text-[#1a5784] text-sm flex items-center gap-2">
                <FileText className="w-5 h-5" />
                INFORMACIÓN DE LA RECETA
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-[#1a5784] text-sm mb-2">Nº RECETA</label>
                  <Input
                    value="0001"
                    readOnly
                    className="w-full h-10 bg-gray-100 text-[#1a5784] font-bold border-[#007e8f]/30 rounded"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-[#1a5784] text-sm mb-2">CARGAR PLANTILLA</label>
                  <div className="flex gap-2">
                    <Input
                      value={recetaTexto}
                      onChange={(e) => setRecetaTexto(e.target.value)}
                      className="flex-1 h-10 text-sm border-[#007e8f]/30 rounded"
                      placeholder="Seleccione una plantilla"
                    />
                    <Button className="bg-[#007e8f]/20 text-[#007e8f] hover:bg-[#007e8f]/30 px-4">
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#1a5784] text-sm mb-2">COPIAR ÚLTIMA RECETA</label>
                  <Input
                    value={recetaTexto}
                    onChange={(e) => setRecetaTexto(e.target.value)}
                    className="w-full h-10 text-sm border-[#007e8f]/30 rounded"
                    placeholder="Copia de receta anterior"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1a5784] text-sm mb-2">ES PLANTILLA</label>
                  <Input
                    value={recetaTexto}
                    onChange={(e) => setRecetaTexto(e.target.value)}
                    className="w-full h-10 text-sm border-[#007e8f]/30 rounded"
                    placeholder="Marcar si es plantilla"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: UBICACIÓN Y CITA */}
            <div className="bg-[#f8f9fa] rounded-lg p-5 space-y-4 border-l-4 border-[#007e8f]">
              <h3 className="font-bold text-[#1a5784] text-sm flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                DATOS DE LOCALIZACIÓN
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-[#1a5784] text-sm mb-2">CIUDAD</label>
                  <Input
                    value={diagnosticoTexto}
                    onChange={(e) => setDiagnosticoTexto(e.target.value)}
                    className="w-full h-10 text-sm border-[#007e8f]/30 rounded"
                    placeholder="QUITO"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1a5784] text-sm mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    PRÓXIMA CITA
                  </label>
                  <Input
                    value={diagnosticoTexto}
                    onChange={(e) => setDiagnosticoTexto(e.target.value)}
                    className="w-full h-10 text-sm border-[#007e8f]/30 rounded"
                    placeholder="Próxima cita"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1a5784] text-sm mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    SIGNOS DE ALARMA
                  </label>
                  <Input
                    value={diagnosticoTexto}
                    onChange={(e) => setDiagnosticoTexto(e.target.value)}
                    className="w-full h-10 text-sm border-[#007e8f]/30 rounded"
                    placeholder="Signos de alarma"
                  />
                </div>
              </div>
            </div>





            {/* SECCIÓN 3: MEDICAMENTOS */}
            <div className="bg-[#f8f9fa] rounded-lg p-5 space-y-4 border-l-4 border-[#3aa7aa]">
              <h3 className="font-bold text-[#1a5784] text-sm flex items-center gap-2">
                <Pill className="w-5 h-5" />
                PRESCRIPCIÓN DE MEDICAMENTOS
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-[#1a5784] text-sm mb-2">SELECCIONAR MEDICAMENTO</label>
                  <div className="flex gap-2">
                    <select
                      value={medicamento}
                      onChange={handleMedicamentoChange}
                      className="flex-1 h-10 text-sm border border-[#007e8f]/30 text-[#595759] rounded px-3"
                    >
                      <option value="">-- Seleccionar medicamento --</option>
                      <option value="Paracetamol 500 mg">Paracetamol 500 mg</option>
                      <option value="Amoxisilina 1 gramo">Amoxisilina 1 gramo</option>
                    </select>
                  </div>
                </div>

                {advertencia && (
                  <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 flex gap-2 items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800">{advertencia}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[#007e8f] font-semibold">STOCK ACTUAL</label>
                    <Input
                      value={stockActual}
                      readOnly
                      className="w-full h-10 bg-blue-50 text-[#007e8f] font-bold border-[#007e8f]/30 rounded"
                      placeholder="Stock actual"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-[#007e8f] font-semibold">DIAGNÓSTICO</label>
                    <Input
                      value={diagnosticoTexto}
                      onChange={(e) => setDiagnosticoTexto(e.target.value)}
                      className="w-full h-10 text-sm border-[#007e8f]/30 rounded"
                      placeholder="Código CIE10"
                    />
                  </div>

                  

                </div>
                <div className=" fsec-title text-[#76c4d5]">Medicamentos</div>
      <table className="vtable text-[#76c4d5]">
        <thead><tr><th>#</th><th>Medicamento (DCI)</th><th>Presentación</th><th>Dosis</th><th>Frec.</th><th>Días</th></tr></thead>
        <tbody>
          <tr><td style={{textAlign:'center',fontWeight:800}}>1</td><td><input placeholder="Amoxicilina"/></td><td><input placeholder="Tableta"/></td><td><input placeholder="500mg" style={{width:65}}/></td><td><input placeholder="c/8h" style={{width:60}}/></td><td><input type="number" placeholder="7" style={{width:50}}/></td></tr>
          <tr><td style={{textAlign:'center',fontWeight:800}}>2</td><td><input placeholder="Paracetamol"/></td><td><input placeholder="Tableta"/></td><td><input placeholder="1g" style={{width:65}}/></td><td><input placeholder="c/6h" style={{width:60}}/></td><td><input type="number" placeholder="5" style={{width:50}}/></td></tr>
        </tbody>
      </table>
      <div className="frow g1"><div className="field"><label>Indicaciones</label><textarea rows="2" placeholder="Tomar con alimentos..."></textarea></div></div>


              </div>
              
            </div>





            {/* SECCIÓN 4: INDICACIONES Y OBSERVACIONES */}
            <div className="bg-[#f8f9fa] rounded-lg p-5 space-y-4 border-l-4 border-[#7cc4bc]">
              <h3 className="font-bold text-[#1a5784] text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                INSTRUCCIONES
              </h3>

              <div>
                <label className="block font-bold text-[#1a5784] text-sm mb-2">PRESCRIPCIÓN</label>
                <textarea
                  value={presTexto}
                  onChange={(e) => setPresTexto(e.target.value)}
                  className="w-full h-20 text-sm border border-[#007e8f]/30 rounded p-3 focus:ring-2 focus:ring-[#007e8f]/60 text-black resize-none"
                  placeholder="Indicaciones detalladas"
                  rows={3}
                />
              </div>

              <div>
                <label className="block font-bold text-[#1a5784] text-sm mb-2">RECOMENDACIONES</label>
                <textarea
                  value={recomendacionTexto}
                  onChange={(e) => setRecomendacionTexto(e.target.value)}
                  className="w-full h-20 text-sm border border-[#007e8f]/30 rounded p-3 focus:ring-2 focus:ring-[#007e8f]/60 text-black resize-none"
                  placeholder="Recomendaciones adicionales"
                  rows={3}
                />
              </div>

              <div>
                <label className="block font-bold text-[#1a5784] text-sm mb-2">OBSERVACIONES</label>
                <textarea
                  value={obsTexto}
                  onChange={(e) => setObsTexto(e.target.value)}
                  className="w-full h-20 text-sm border border-[#007e8f]/30 rounded p-3 focus:ring-2 focus:ring-[#007e8f]/60 text-black resize-none"
                  placeholder="Notas importantes"
                  rows={3}
                />
              </div>
            </div>

            {/* SECCIÓN 5: INDICACIONES */}
            <div className="bg-[#f8f9fa] rounded-lg p-5 space-y-4 border-l-4 border-[#FF6B6B]">
              <h3 className="font-bold text-[#1a5784] text-sm flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                INDICACIONES FINALES
              </h3>

              <div>
                <label className="block font-bold text-[#1a5784] text-sm mb-2">INDICACIONES</label>
                <textarea
                  value={indicaTexto}
                  onChange={(e) => setIndicaTexto(e.target.value)}
                  className="w-full h-20 text-sm border border-[#007e8f]/30 rounded p-3 focus:ring-2 focus:ring-[#007e8f]/60 text-black resize-none"
                  placeholder="Instrucciones finales para el paciente"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </motion.div>









<div style={{background:'var(--ctxl)',border:'1px solid var(--ctl)',borderRadius:8,padding:'9px 13px',marginBottom:13,fontSize:11,color:'var(--ctdd)',fontWeight:600}}>⚕️ Prescripción obligatoria por DCI — Acuerdo MSP 0031-2020</div>
      <div className="frow g2">
        <div className="field"><label>N° Receta</label><input defaultValue="REC-20260303-4821" readOnly style={{background:'var(--cbg)',fontWeight:700}}/></div>
        <div className="field"><label>Alergias <span className="req">*</span></label><input defaultValue="Sin alergias conocidas"/></div>
      </div>
      <div className="frow g1"><div className="field"><label>Diagnóstico CIE-10 <span className="req">*</span></label><input placeholder="I10 — Hipertensión esencial"/></div></div>
      
      
      










      </main>
    </div>
  );
};

export default Receta;

