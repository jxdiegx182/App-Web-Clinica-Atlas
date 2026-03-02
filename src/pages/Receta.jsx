import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileDown } from 'lucide-react';
import { PlusCircle, Search, CalendarCheck} from 'lucide-react';
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
    "Paracetamol 1 gramo": 10,
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
    <div className="min-h-screen bg-gradient-to-br from-[#ffffff] via-[#EAF4FB] to-[#1a5784]">
      <button
        onClick={() => window.history.back()}
        className="absolute left-5 top-1 bg-[#4b6bb3] px-3 py-1 rounded text-sm hover:bg-[#257f80]"
      >
        ← Volver
      </button>

      <h1 className="text-3xl text-[#5dbfc1] font-bold text-center">
        RECETA
      </h1>
      {/* HEADER */}
      <header className="bg-[#4b6bb3]/15 p-4 text-black rounded-md shadow relative">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 text-sm">
          <div className="max-w-6xl mx-auto ">
            <img
              src="https://clinicas-atlas.com/wp-content/uploads/2024/11/clinicas-atlas-ecuador.png"
              alt="Logo Clinica Atlas"
              className="w-44 h-auto"
            />
          </div>
        
          
{/* 🔄 Mostrar datos del citas o cargando */}
{loading ? (
              <p className="text-gray-600">Cargando datos de admisiones...</p>
            ) : admisiones ? (
              <>
                <div>
                  <strong>{admisiones.firstName} {admisiones.lastName}{' '} </strong><br/>
                  <strong>Identificacion:</strong> {admisiones.cedula}<br/>
                  <strong>Edad:</strong> {admisiones.seguro}<br/>
                   <strong>Médico:</strong> {admisiones.medico}<br/>
                   <strong>Fecha Nacimiento:</strong> {admisiones.secondaryData?.dateOfBirth || 'No registrado'}   <br/>
                   <strong>Días de estancia:</strong> {admisiones.dias}<br/>
                  
                </div>
                <div>
                <strong>Servicio:</strong> {admisiones.servicio}<br/>
                  <strong>Seguro:</strong> {admisiones.seguro}<br/>
                  <strong>Alertas:</strong> {admisiones.alergiaIconUno || 'No registrado'} {admisiones.alergiaUno || 'No registrado'}   <br/>
                  {admisiones.alergiaIconDos || ''} {admisiones.alergiaDos || ''} <br/>
                  {admisiones.alergiaIconTres || ''} {admisiones.alergiaTres || ''}
                   </div>
                   <div className=" bg-[#4b6bb3]/60 absolute rounded text-center p-4 text-white font-bold top-30 right-10">
                <strong>PISO:</strong> {admisiones.ubicacion.piso ||'No Reg'} <br/>
                  <strong></strong> {admisiones.ubicacion.habitacion ||'No Reg'} <br/>
                </div>
                
              </>
            ) : (
              <p className="text-red-600 font-bold">
                ❌ No se encontró información de admisiones.estoy arto
              </p>
            )}

            {/*HASTA AQUI DE FIREBASE */}






</div>
        {/*FECHA */}
        <p className="absolute left-28 top-24  text-lg font-bold  ">
          {formattedTime}
        </p>
        <p className="absolute left-12 top-32 text-sm uppercase tracking-wide font-bold">
          {formattedDate.toUpperCase()}
        </p>
        
        <div className="absolute right-32 top-24 z-20 ">
          <Button
            onClick={handleGeneratePDF}
            className="bg-[#4b6bb3]/60 text-white px-7 py-2 rounded hover:bg-[#87D1D4] flex items-center"
            title="Imprimir PDF"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/4659/4659495.png"
              alt="Imprimir"
              className="w-8 h-8"
            />
          </Button>
        </div>
      </header>
      {/* MAIN PANEL */}
      <main className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 ">
        {/* LEFT PANEL */}
        <div className="bg-white rounded shadow p-4">
          <h2 className="bg-[#4b6bb3] text-white text-center text-sm font-bold px-4 py-2 rounded-t">
            HISTORIAL RECETAS
            <button
            onClick={() => console.log('Agregar nuevo registro')}
            className=" absolute top-61 left-70 text-gray hover:text-[#FF5757] "
            title="Agregar nuevo registro"
          >
            <PlusCircle className="w-5 h-5" />
          </button>
          </h2>

          <div className="overflow-y-auto max-h-[250px] pr-2">
              {' '}
              {/* contenedor con scroll */}
              <ul className="bg-[#E9F5F2] text-center rounded-2xl p-4 mt-1 text-sm list-disc list-inside text-gray-700">
                <li>21/12/2023</li>
                <li>15/10/2019</li>
                <li>15/12/2015</li>
                <li>10/08/2013</li>
                <li>22/04/2011</li>
                <li>05/08/2024</li>
                <li>05/07/2009</li>
                <li>05/01/2024</li>
                <li>05/02/2024</li>
                <li>05/08/2023</li>
                <li>05/07/2024</li>
                <li>05/09/2009</li>
                <li>05/06/2025</li>
                <li>05/01/2025</li>
                {/* puedes agregar más elementos sin que se desborde */}
              </ul>
            </div>

          
        </div>

        {/* RIGHT PANEL */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-3 bg-white p-4 rounded shadow"
        >
          <div className="border border-[#4b6bb3] p-4 text-[#000000] text-xs">
            {/* Aquí puedes construir las secciones del formulario con líneas horizontales */}
            <div className="grid grid-cols-3 gap-1 mb-5  text-xs">
              <div className="flex gap-2">
                  <label className="block font-bold">
                    NUMERO RECETA:{' 0001'}
                  </label>
                  
              </div>
            </div>
            <label className="block font-bold">
                    CARGAR PLANTILLA:{' '}
                  </label>
            <div className="grid grid-cols-3 gap-1 text-xs">
             <div className="flex gap-1">
                   <textarea
                    value={recetaTexto}
                    onChange={(e) => setRecetaTexto(e.target.value)}
                    className="w-60 h-9 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                    placeholder="---"
                    rows={3}
                  />
                 <div className="ml-1">
                 <Button 
                                type="button" 
                                className="px-2 bg-[#9DD9EC] text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 mr-2"
                                onClick={() => {}} // Función vacía (no hace nada)
                              ><Search className="w-5 h-5" />
                                
                              </Button>
              
              </div>  
              </div>
             
              <div className="">
                   <textarea
                    value={recetaTexto}
                    onChange={(e) => setRecetaTexto(e.target.value)}
                    className="w-40 h-9 mb-2 ml-2 text-sm ml-10 border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                    placeholder="Copiar última receta"
                    rows={3}
                  />
              </div>
              <div className="">
                   <textarea
                    value={recetaTexto}
                    onChange={(e) => setRecetaTexto(e.target.value)}
                    className="w-40 h-9 mb-2 text-sm ml-0 border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                    placeholder="Es plantilla"
                    rows={3}
                  />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-1 text-xs">
            <div className="flex gap-2">
            <label className="flex-1 block font-bold">
                    CIUDAD :{' '}
                  </label>
                  <label className="flex-1 ml-10 mb-1 block font-bold">
                    PROXIMA CITA:{' '}
                  </label>
                  <label className="flex-1 ml-9 block font-bold">
                    SIGNOS DE ALARMA:{' '}
                  </label>
                  </div>
            </div>

            <div className="grid grid-cols-1 gap-1 mb-1 text-xs">
            <div className="flex gap-2">
            <textarea
                value={diagnosticoTexto}
                onChange={(e) => setDiagnosticoTexto(e.target.value)}
                className="flex-1 w-full mb-3 h-7 text-sm border border-[#7cc4bc] mr-9 bg-[#4b6bb3]/10 rounded text-black"
                placeholder="QUITO"
                rows={3}
              />
              <textarea
                value={diagnosticoTexto}
                onChange={(e) => setDiagnosticoTexto(e.target.value)}
                className="flex-1 w-full mb-2  h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                placeholder="Próxima cita"
                rows={3}
                
              />
<CalendarCheck className="w-5 h-5" />
              <textarea
                value={diagnosticoTexto}
                onChange={(e) => setDiagnosticoTexto(e.target.value)}
                className="flex-1 w-full mb-3 ml-9 h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                placeholder="Signos de alarma"
                rows={3}
              />
            </div>
            
            </div>

            <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="flex gap-2">
              <label className=" block font-bold">
                ALERGIAS FARMACOLOGICAS:
              </label>
              <textarea
                value={diagnosticoTexto}
                onChange={(e) => setDiagnosticoTexto(e.target.value)}
                className="flex-1 w-full mb-3 h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                placeholder=" No refiere alergias farmacológicas"
                rows={3}
              />
            </div>
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="flex gap-2">
              <label className=" block font-bold">
                DIAGNOSTICO CIE10:
              </label>
              <textarea
                value={diagnosticoTexto}
                onChange={(e) => setDiagnosticoTexto(e.target.value)}
                className="flex-1 w-full mb-2 h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                rows={3}
              />
            </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-xs">
                <div className=""><label className="block font-bold ">PRESCRIPCION:{' '}</label></div>
                <div className=""><label className="block font-bold ">CANTIDAD:{' '}</label></div>
                <div className=""><label className="block font-bold ">INDICACION:{' '}</label></div>
                <button onClick={() => console.log('Agregar nuevo registro')}
                      className=" text-gray hover:text-[#FF5757] "
                      title="Agregar una nueva prescripcion">
                      <PlusCircle className="w-8 h-5" />
                    </button>
            </div>

     <div className="grid grid-cols-5 gap-2 text-xs">
      
              {/* Selector de medicamento */}
              <div>
                <select
                  value={medicamento}
                  onChange={handleMedicamentoChange}
                  className="w-full mb-3 h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                >
                  <option value="">Seleccionar medicamento</option>
                  <option value="Paracetamol 500 mg">Paracetamol 500 mg</option>
                  <option value="Paracetamol 1 gramo">Paracetamol 1 gramo</option>
                </select>
              </div>

              {/* Stock disponible */}
              <div>
                <textarea
                  value={stockActual}
                  readOnly
                  placeholder="Stock"
                  className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
        {/* Advertencia */}
        {advertencia && (
                <div className="col-span-1 text-red-600 text-xs mt-1">{advertencia}</div>
              )}
              {/* Otro campo (ej: indicaciones) */}
              <div>
                <textarea
                  placeholder="Indicaciones"
                  className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>

      
    </div>

            
            {/*otro bloque deita, obs, interconsulta*/}
            
            {/*Ultimo grupo */}
            <div className=" flex gap-2 ">
              <label className="block font-bold">RECOMENDACION NO FARMACOLOGICA:</label>
              <textarea
                value={recomendacionTexto}
                onChange={(e) => setRecomendacionTexto(e.target.value)}
                className="w-40 h-7 mb-3 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <label className="block font-bold">
                OBSERVACIONES:{' '}
              </label>
              <textarea
                value={obsTexto}
                onChange={(e) => setObsTexto(e.target.value)}
                className="w-2xl h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                rows={3}
              />
              <br/>
            </div>
              <div className="">
              <label className="mt-10 block font-bold ">
                FIRMA Y SELLO:{' '}
              </label>
             </div>


             <div className="">
              <label className="block font-bold flex justify-end">
                <div className="grid grid-cols-2 right-11 top-28 z-20 ">
                            <Button 
                                type="button" 
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 mr-2"
                                onClick={() => {}} // Función vacía (no hace nada)
                              >
                                
                                EDITAR
                              </Button>
                              <Button 
                                type="button" 
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 mr-2"
                                onClick={() => {}} // Función vacía (no hace nada)
                              >
                                GUARDAR
                              </Button>
                  
                </div>{' '}
              </label>
             </div>
            
            
            
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Receta;
