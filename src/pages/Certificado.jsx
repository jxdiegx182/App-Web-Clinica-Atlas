import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, CalendarDays } from 'lucide-react';
import { generarPDF } from '../components/generarPDF';
import { db } from '../firebaseConfig'; // 👈 AJUSTAr la ruta si es necesario
import { doc, getDoc } from 'firebase/firestore';
import { toast } from '@/components/ui/use-toast';

const AllergyWarning = ({ allergy }) => (
  <span className="allergy-warning text-[#FF0000] font-semibold">
    <span className="allergy-icon">⚠️</span>
    ALERGIAS: {allergy}
  </span>
);
const numeroALetras = (num) => {
  const unidades = ["cero","uno","dos","tres","cuatro","cinco","seis","siete","ocho","nueve"];
  const especiales = ["diez","once","doce","trece","catorce","quince","dieciséis","diecisiete","dieciocho","diecinueve"];
  const decenas = ["", "", "veinte","treinta"];
  
  if (num < 10) return unidades[num];
  if (num < 20) return especiales[num - 10];
  if (num < 30) return num === 20 ? "veinte" : "veinti" + unidades[num - 20];
  if (num < 40) return num === 30 ? "treinta" : "treinta y " + unidades[num - 30];
  return num.toString(); // fallback
};

 //Inicio del programa
const Certificado = () => {
  const { mainId } = useParams();
const [time, setTime] = useState(new Date());
const [admisiones, setAdmisiones] = useState(null); // <-- aquí se guardan los datos desde Firestore
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  //agregado ESTO SON LAS CONSTANTES DEL TEXTO
  const [fechaTexto, setFechaTexto] = useState('');
  const [diasTexto, setDiasTexto] = useState('');
  const [certificadoTexto, setCertificadoTexto] = useState('');
  const [tipoTexto, setTipoTexto] = useState('');//ESTOS DOS NOMBRES CLAVE POR SE EXPORTAN AL PDF PILAS
  const [sintomaTexto, setSintomaTexto] = useState('');
  const [diagnosticoTexto, setDiagnosticoTexto] = useState('');
  const [diassTexto, setDiassTexto] = useState('');
  const [tiposTexto, setTiposTexto] = useState('');
  const [observacionesTexto, setObservacionesTexto] = useState('');
// inicio de las fechas 
  const [desdeTexto, setDesdeTexto] = useState("");
  const [desdeTextoPalabras, setDesdeTextoPalabras] = useState("");
  const [hastaTexto, setHastaTexto] = useState("");
  const [hastaTextoPalabras, setHastaTextoPalabras] = useState("");
// Referencias para inputs ocultos
  const inputDesdeRef = useRef(null);
  const inputHastaRef = useRef(null);
  const formatearFechaEnPalabras = (fecha) => {
  if (!fecha) return "";
  const [y, m, d] = fecha.split("-").map(Number);   // <-- descompone "YYYY-MM-DD"
  const date = new Date(y, m - 1, d);               // <-- crea Date en hora LOCAL
  const diaSemana = date.toLocaleDateString("es-ES", { weekday: "long" });
    const mes = date.toLocaleDateString("es-ES", { month: "long" });
    const anio = date.getFullYear();

    return `${diaSemana}, ${numeroALetras(d)} de ${mes} de ${anio}`;
};
//TERMINAL DE LAS FECHAS HASTA AQUI 

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
      <div className="relative mb-2">
      <button
        onClick={() => window.history.back()}
        className="absolute left-0 top-1/2 -translate-y-1/2 rounded-lg bg-[#1c3f6e] px-3 py-1.5 text-sm font-semibold text-white shadow transition hover:bg-[#007e8f]"
      >
        ← Volver
      </button>

      <h1 className="text-2xl text-[#007e8f] font-extrabold tracking-wide text-center">
        CERTIFICADO MEDICO
      </h1>
      </div>
      {/* HEADER */}
      <header className="relative rounded-2xl border border-[#007e8f]/25 bg-white/85 p-2 md:p-3 shadow-md text-[#1c3f6e] backdrop-blur">
        {/*FECHA */}
        <p className="absolute left-40 top-36  text-lg font-bold  ">
            {formattedTime}
          </p>
          
          <p className="absolute left-24 top-44 text-sm uppercase tracking-wide">
            {formattedDate.toUpperCase()}
          </p>
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
                  <strong>Alergias:</strong> {admisiones.secondaryData?.numero || 'No registrado'}   <br/>
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
{/**IMPORTANTE AQUI ESTOS DOS TIPO TEXTO Y OBSERVACIONESTEXTO VAN A GENERAR EL PDF */}
        <div className="absolute right-11 top-[158px] z-20 ">
          <Button
            onClick={() =>
              generarPDF({
                tipoTexto,
                observacionesTexto,
              })
            }
            className="bg-[#4b6bb3]/60 text-white px-7 py-2 rounded hover:bg-[#87D1D4] flex items-center"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/4659/4659495.png"
              alt="Imprimir"
              className="w-8 h-8"
            />
          </Button>
        </div>
{/**IMPORTANTE AQUI ESTOS DOS TIPO TEXTO Y OBSERVACIONESTEXTO VAN A GENERAR EL PDF */}


      </header>
      {/* MAIN PANEL */}
      <main className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 ">
        {/* LEFT PANEL */}
        <div className="bg-white rounded shadow p-4">
          <h2 className="bg-[#4b6bb3] text-white text-center text-sm font-bold px-1 py-1 rounded-t">
            HISTORIAL CERTIFICADOS
            <button
              onClick={() => console.log('Agregar nuevo registro')}
              className=" absolute top-61 left-70 text-gray hover:text-[#FF5757] "
              title="Agregar nuevo registro"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
          </h2>

          <div className="border p-2 mt-2 text-sm">
            <h3 className="text-[#010101] font-bold text-center mb-2">
              HISTORIAL DE CERTIFICADOS
            </h3>
            <ul className="text-[#3aa7aa] text-center">
              <li>23/11/2025 11:15</li>
              <li>23/11/2025 20:15</li>
              <li>24/11/2025 11:15</li>
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
            <div className="grid grid-cols-3 gap-1 text-xs">
              <div className="flex gap-2">
                <label className="block font-bold">
                  TIPO DE CERTIFICADO:{''}
                </label>
                <textarea
                  value={certificadoTexto}
                  onChange={(e) => setCertificadoTexto(e.target.value)}
                  className="w-40 h-6 mb-2 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
            </div>
{/**EJEMPLO DE EXPORTAR A PDF EL TIPO DE CONTINGENCIA TEXTO DE INTRODUCCION SE MUESTRA EN EL PDF */}
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className="flex gap-2">
                <label className="block font-bold">
                  TIPO DE CONTINGENCIA:{''}
                </label>
                <textarea
                  value={tipoTexto}//CLAVE ESTOS NOMBRES
                  onChange={(e) => setTipoTexto(e.target.value)}//CLAVE ESTOS DOS NOMBRES
                  className="w-40 h-6 mb-2 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className="flex gap-2">
                <label className=" block font-bold">SINTOMATOLOGÍA:</label>
                <textarea
                  value={sintomaTexto}
                  onChange={(e) => setSintomaTexto(e.target.value)}
                  className="flex-1 w-full mb-2 h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className="flex gap-2">
                <label className=" block font-bold">DIAGNOSTICO CIE10:</label>
                <textarea
                  value={diagnosticoTexto}
                  onChange={(e) => setDiagnosticoTexto(e.target.value)}
                  className="flex-1 w-full mb-2 h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
            </div>

            {/*otro bloque deita, obs, interconsulta*/}

            {/*Ultimo grupo */}
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className="flex gap-2">
                <label className=" block font-bold">FECHA ATENCION:</label>
                <textarea
                  value={fechaTexto}
                  onChange={(e) => setFechaTexto(e.target.value)}
                  className="flex-1 w-full mb-2 h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
                <button
                  onClick={() => console.log('Agregar nuevo registro')}
                  className=" text-gray hover:text-[#FF5757] "
                  title="Agregar una nueva prescripcion"
                >
                  <CalendarDays className="w-8 h-5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className="flex gap-2">
                <label className=" block font-bold">DIAS REPOSO:</label>
                <textarea
                  value={diasTexto}
                  onChange={(e) => setDiasTexto(e.target.value)}
                  className="flex-1 w-full mb-2 h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
                <textarea
                  value={diassTexto}
                  onChange={(e) => setDiassTexto(e.target.value)}
                  className="flex-1 w-full mb-2 h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
                <label className=" block font-bold">TIPO REPOSO:</label>
                <textarea
                  value={tiposTexto}
                  onChange={(e) => setTiposTexto(e.target.value)}
                  className="flex-1 w-full mb-2 h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
            </div>

            {/*PENUltimo grupo */}

            {/* Grupo DESDE */}
      <div className="grid grid-cols-1 gap-1 text-xs">
        <div className="flex gap-2 items-center">
          <label className="block font-bold">DESDE:</label>

          {/* Fecha numérica */}
          <textarea
            value={desdeTexto}
            readOnly
            className="flex-1 w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
          />

          {/* Icono que abre el date picker */}
          <CalendarDays
            className="w-8 h-6 cursor-pointer text-blue-600"
            onClick={() => inputDesdeRef.current.showPicker()}
            
          />

          {/* Fecha en palabras */}
          <textarea
            value={desdeTextoPalabras}
            readOnly
            className="flex-1 w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
          />

          {/* Input de fecha oculto */}
          <input
            type="date"
            ref={inputDesdeRef}
            className="text-white mt-1 ml-1"
            onChange={(e) => {
              setDesdeTexto(e.target.value);
              setDesdeTextoPalabras(formatearFechaEnPalabras(e.target.value));
            }}
          />
        </div>
      </div>

      {/* Grupo HASTA */}
      <div className="grid grid-cols-1 gap-1 mb-3 text-xs mt-3">
        <div className="flex gap-2 items-center">
          <label className="block font-bold">HASTA:</label>

          {/* Fecha numérica */}
          <textarea
            value={hastaTexto}
            readOnly
            className="flex-1 w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
          />

          {/* Icono que abre el date picker */}
          <CalendarDays
            className="w-8 h-6 cursor-pointer text-blue-600"
            onClick={() => inputHastaRef.current.showPicker()}
          />

          {/* Fecha en palabras */}
          <textarea
            value={hastaTextoPalabras}
            readOnly
            className="flex-1 w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
          />
          {/* Input de fecha oculto */}
          <input
            type="date"
            ref={inputHastaRef}
            className="text-white mt-1 ml-1"
            onChange={(e) => {
              setHastaTexto(e.target.value);
              setHastaTextoPalabras(formatearFechaEnPalabras(e.target.value));
            }}
          />
        </div>
      </div>

      
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className="flex gap-2">
                <label className=" block font-bold">OBSERVACIONES:</label>
                <textarea
                  value={observacionesTexto}
                  onChange={(e) => setObservacionesTexto(e.target.value)}
                  className="w-full mb-1 h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
            </div>

            <div className="">
              <label className="mt-10 block font-bold ">FIRMA Y SELLO: </label>
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

export default Certificado;
