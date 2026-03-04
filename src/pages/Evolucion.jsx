import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { EvolucionPDF } from '../components/EvolucionPDF';
import { db } from '../firebaseConfig'; // 👈 AJUSTAr la ruta si es necesario
import { doc, getDoc } from 'firebase/firestore';
import { toast } from '@/components/ui/use-toast';

const AllergyWarning = ({ allergy }) => (
  <span className="allergy-warning text-[#FF0000] font-semibold">
    <span className="allergy-icon">⚠️</span>
    ALERGIAS: {allergy}
  </span>
);

const Evolucion = () => {
  const { mainId } = useParams();
  const [time, setTime] = useState(new Date());
  const [admisiones, setAdmisiones] = useState(null); // <-- aquí se guardan los datos desde Firestore
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  //agregado
  const [evolucionTexto, setEvolucionTexto] = useState('');
  const [analisisTexto, setAnalisisTexto] = useState('');
  const [enfermeriaTexto, setEnfermeriaTexto] = useState('');
  const [medicamentoTexto, setMedicamentoTexto] = useState('');
  const [viaTexto, setViaTexto] = useState('');
  const [frecuenciaTexto, setFrecuenciaTexto] = useState('');
  const [presTexto, setPresTexto] = useState('');
  const [adminiTexto, setAdminiTexto] = useState('');
  const [cantidadTexto, setCantidadTexto] = useState('');
  const [indicaTexto, setIndicaTexto] = useState('');
  const [insuTexto, setInsuTexto] = useState('');
  const [indiTexto, setIndiTexto] = useState('');
  const [freTexto, setFreTexto] = useState('');
  const [dietaTexto, setDietaTexto] = useState('');
  const [obsTexto, setObsTexto] = useState('');
  const [interTexto, setInterTexto] = useState('');
  const [signosTexto, setSignosTexto] = useState('');
  const [activTexto, setActivTexto] = useState('');
  const [obseTexto, setObseTexto] = useState('');
  const [examenTexto, setExamenTexto] = useState('');
  const [condiTexto, setCondiTexto] = useState('ESTABLE');
  const [alergiaTexto, setAlergiaTexto] = useState('SI');
  const [obserTexto, setObserTexto] = useState('PENICILINA');
  const [diagTexto, setDiagTexto] = useState('');
  const [codigoTexto, setCodigoTexto] = useState('');
  const [diagnosticoTexto, setDiagnosticoTexto] = useState('');
  const [codeTexto, setCodeTexto] = useState('');

  
const handleGeneratePDF =() => {
  EvolucionPDF({
    evolucionTexto,
    analisisTexto,
    enfermeriaTexto,
    medicamentoTexto,
    viaTexto,
    frecuenciaTexto,
    presTexto,
    adminiTexto,
    cantidadTexto,
    indicaTexto,
    insuTexto,
    indiTexto,
    freTexto,
    dietaTexto,
    obsTexto,
    interTexto,
    signosTexto,
    activTexto,
    obseTexto,
    examenTexto,
    condiTexto,
    alergiaTexto,
    obserTexto,
    diagTexto,
    codigoTexto,
    diagnosticoTexto,
    codeTexto,
    admisiones,
    edad,
  });
};

//AQUI VIENE LA VENTANA DE VISUALIZACION

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);



//Aqui traigo de firebase para el encabezado
useEffect(() => {
  const fetchAdmisiones = async () => {
    
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
      const data = snap.data(); //extrae documentos de firebase
         setAdmisiones({
            id: snap.id,
            ...data,
            ...data.mainData,
          });

          
        } 
          
        catch (error) {
      console.error('❌ Error al obtener admisiones:', error);
      setAdmisiones(null);
    } finally {
      setLoading(false);
    }
    
  };
  fetchAdmisiones();
}, [mainId]);
//*******************hasta aqui traigo de firebase****************//

//*****************AQUI CREO LA ESTANCIA DE CADA PACIOENTE SUMANDO LOS DIAS **********************//
const [estancia, setEstancia] = useState(0);
useEffect(() => {
  if (!admisiones?.createdAt) return;

  const fechaIngreso = admisiones.createdAt.toDate();
  const hoy = new Date();

  const dias = Math.floor(
    (hoy - fechaIngreso) / (1000 * 60 * 60 * 24) + 1
  );

  setEstancia(dias);
}, [admisiones]);
//*******************************HASTA AQUI ESTANCIAS **********************//
//AQUI CREO LA edad DE CADA PACIOENTE SUMANDO LOS años 
const [edad, setEdad] = useState(0);
useEffect(() => {
  if (!admisiones?.secondaryData?.dateOfBirth) return;

  let fechaNacimiento = admisiones.secondaryData.dateOfBirth;
   // 🔥 Si viene como Timestamp de Firestore
   if (fechaNacimiento.toDate) {
    fechaNacimiento = fechaNacimiento.toDate();
  } else {
    fechaNacimiento = new Date(fechaNacimiento);
  }

  const hoy = new Date();

  let años = hoy.getFullYear() - fechaNacimiento.getFullYear();

  const mesActual = hoy.getMonth();
  const mesNacimiento = fechaNacimiento.getMonth();

  // Si aún no cumple años este año
  if (
    mesActual < mesNacimiento ||
    (mesActual === mesNacimiento && hoy.getDate() < fechaNacimiento.getDate())
  ) {
    años--;
  }

  setEdad(años);
}, [admisiones]);
//*******************************************************HASTA AQUI edad */


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
        EVOLUCION Y PRESCRIPCIONES
      </h1>
      </div>
      {/* HEADER */}
      <header className="relative rounded-2xl border border-[#007e8f]/25 bg-white/85 p-2 md:p-3 shadow-md text-[#1c3f6e] backdrop-blur">
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
                  <strong>Edad:</strong> {edad}<br/>
                   <strong>Médico:</strong> {admisiones.medico}<br/>
                   <strong>Fecha Nacimiento:</strong> {admisiones.secondaryData?.dateOfBirth || 'No registrado'}   <br/>
                   <strong>Días de estancia:</strong> {estancia}<br/>
                  
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
        
        <div className="absolute right-11 top-28 z-20 ">
          <Button
            onClick={handleGeneratePDF}
            className="bg-[#4b6bb3]/60 text-white px-7 py-2 rounded hover:bg-[#87D1D4] flex items-center"
            title="EvolucionPDF"
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
          <h2 className="bg-[#162f5c] text-white text-center text-sm font-bold px-4 py-2 rounded-t">
            EVOLUCION Y PRESCRIPCION
          </h2>

          <button
            onClick={() => console.log('Agregar nuevo registro')}
            className=" absolute top-60 left-80 text-gray hover:text-[#FF5757] "
            title="Agregar nuevo registro"
          >
            <PlusCircle className="w-5 h-5" />
          </button>

          <div className="border p-2 mt-2 text-sm">
            <h3 className="text-[#010101] font-bold text-center mb-2">
              HISTORIAL
            </h3>
            <ul className="text-[#3aa7aa] text-center">
              <li>23/11/2025 11:15</li>
              <li>23/11/2025 20:15</li>
              <li>24/11/2025 11:15</li>
            </ul>
          </div>

          <div className="bg-[#7cc4bc] text-white rounded-2xl p-4 mt-4 text-sm">
            <p>
              <strong>PESO:</strong> 70 KG
            </p>
            <p>
              <strong>TALLA:</strong> 1.60
            </p>
            <p>
              <strong>PULSO:</strong> 7
            </p>
            <p>
              <strong>TEMPERATURA:</strong> 36.5
            </p>
            <p>
              <strong>FRECUENCIA RESPIRATORIA:</strong> 23
            </p>
            <p>
              <strong>PRESION ARTERIAL:</strong> 120/70
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-3 bg-white p-4 rounded shadow"
        >
          <div className="border border-[#3aa7aa] p-4 text-[#000000] text-xs">
            {/* Aquí puedes construir las secciones del formulario con líneas horizontales */}
            <div className=" ">
              <label className="block font-bold">EVOLUCIÓN</label>
              <textarea
                value={evolucionTexto}
                onChange={(e) => setEvolucionTexto(e.target.value)}
                className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                rows={3}
              />
            </div>
            <div className="">
              <label className="block font-bold">ANÁLISIS</label>
              <textarea
                value={analisisTexto}
                onChange={(e) => setAnalisisTexto(e.target.value)}
                className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                rows={3}
              />
            </div>
            <div className="">
              <label className="block font-bold">ENFERMERÍA</label>
              <textarea
                value={enfermeriaTexto}
                onChange={(e) => setEnfermeriaTexto(e.target.value)}
                className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-7 gap-1 py-1 text-xs text-center ">
              {/* ESTE ES EL INICIO DE PEQUEÑOS TEXTOS*/}
              <div className="">
                <label className="block font-bold">MEDICAMENTO</label>
                <textarea
                  value={medicamentoTexto}
                  onChange={(e) => setMedicamentoTexto(e.target.value)}
                  className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>

              <div className="">
                <label className="block font-bold">VIA ADM</label>
                <textarea
                  value={viaTexto}
                  onChange={(e) => setViaTexto(e.target.value)}
                  className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
              <div className="">
                <label className="block font-bold">FRECUENCIA</label>
                <textarea
                  value={frecuenciaTexto}
                  onChange={(e) => setFrecuenciaTexto(e.target.value)}
                  className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
              <div className="">
                <label className="block font-bold">PRESENTACION</label>
                <textarea
                  value={presTexto}
                  onChange={(e) => setPresTexto(e.target.value)}
                  className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
              <div className="">
                <label className="block font-bold">ADMINISTRA</label>
                <textarea
                  value={adminiTexto}
                  onChange={(e) => setAdminiTexto(e.target.value)}
                  className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
              <div className="">
                <label className="block font-bold">CANTIDAD</label>
                <textarea
                  value={cantidadTexto}
                  onChange={(e) => setCantidadTexto(e.target.value)}
                  className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
              <div className="">
                <label className="block font-bold">INDICACION MEDICA</label>
                <textarea
                  value={indicaTexto}
                  onChange={(e) => setIndicaTexto(e.target.value)}
                  className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2  py-2 text-xs text-center">
              <div className="">
                <label className="block font-bold">INSUSIONES</label>
                <textarea
                  value={insuTexto}
                  onChange={(e) => setInsuTexto(e.target.value)}
                  className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
              <div className="">
                <label className="block font-bold">INDICACION</label>
                <textarea
                  value={indiTexto}
                  onChange={(e) => setIndiTexto(e.target.value)}
                  className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
              <div className="">
                <label className="block font-bold">FRECUENCIA</label>
                <textarea
                  value={freTexto}
                  onChange={(e) => setFreTexto(e.target.value)}
                  className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
            </div>
            {/*otro bloque deita, obs, interconsulta*/}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className=" ">
                <label className="block font-bold">DIETA</label>
                <textarea
                  value={dietaTexto}
                  onChange={(e) => setDietaTexto(e.target.value)}
                  className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
              <div className=" ">
                <label className="block font-bold">OBSERVACION</label>
                <textarea
                  value={obsTexto}
                  onChange={(e) => setObsTexto(e.target.value)}
                  className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
              <div className=" ">
                <label className="block font-bold">INTERCONSULTA</label>
                <textarea
                  value={interTexto}
                  onChange={(e) => setInterTexto(e.target.value)}
                  className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
            </div>
            {/*Ultimo grupo */}
            <div className=" ">
              <label className="block font-bold">SIGNOS VITALES</label>
              <textarea
                value={signosTexto}
                onChange={(e) => setSignosTexto(e.target.value)}
                className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                rows={3}
              />
            </div>
            <div className=" ">
              <label className="block font-bold">ACTIVIDADES</label>
              <textarea
                value={activTexto}
                onChange={(e) => setActivTexto(e.target.value)}
                className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                rows={3}
              />
            </div>
            <div className=" ">
              <label className="block font-bold">OBSERVACIONES</label>
              <textarea
                value={obseTexto}
                onChange={(e) => setObseTexto(e.target.value)}
                className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                rows={3}
              />
            </div>
            <div className=" ">
              <label className="block font-bold">EXAMENES SOLICITADOS</label>
              <textarea
                value={examenTexto}
                onChange={(e) => setExamenTexto(e.target.value)}
                className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 gap-2 py-2 text-xs">
              <div className=" ">
                <label className="block font-bold">CONDICION</label>
                <textarea
                  value={condiTexto}
                  onChange={(e) => setCondiTexto(e.target.value)}
                  className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
              <div className=" ">
                <label className="block font-bold">ALERGIAS</label>
                <textarea
                  value={alergiaTexto}
                  onChange={(e) => setAlergiaTexto(e.target.value)}
                  className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
              <div className=" ">
                <label className="block font-bold">OBSERVACION</label>
                <textarea
                  value={obserTexto}
                  onChange={(e) => setObserTexto(e.target.value)}
                  className="w-full h-7 text-sm text-center border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2 border-t border-[#3aa7aa] py-2 text-xs">
              <div className=" ">
                <label className="block font-bold">
                  DIAGNOSTICO PRESUNTIVO
                </label>
                <textarea
                  value={diagTexto}
                  onChange={(e) => setDiagTexto(e.target.value)}
                  className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
              <div className=" ">
                <label className="block font-bold">CODIGO</label>
                <textarea
                  value={codigoTexto}
                  onChange={(e) => setCodigoTexto(e.target.value)}
                  className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
              <div className=" ">
                <label className="block font-bold">
                  DIAGNOSTICO DEFINITIVO
                </label>
                <textarea
                  value={diagnosticoTexto}
                  onChange={(e) => setDiagnosticoTexto(e.target.value)}
                  className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
              <div className=" ">
                <label className="block font-bold">CODIGO</label>
                <textarea
                  value={codeTexto}
                  onChange={(e) => setCodeTexto(e.target.value)}
                  className="w-full h-7 text-sm border border-[#7cc4bc] bg-[#4b6bb3]/10 rounded text-black"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
export default Evolucion;
;

