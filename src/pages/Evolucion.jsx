import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Stethoscope, Pill, Droplet, UtensilsCrossed, Heart, FileText, AlertCircle, Clock, Printer } from 'lucide-react';
import { EvolucionPDF } from '../components/EvolucionPDF';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from '@/components/ui/use-toast';

const AllergyWarning = ({ allergy }) => (
  <span className="allergy-warning text-[#FF0000] font-semibold flex items-center gap-2">
    <AlertCircle size={16} />
    ALERGIAS: {allergy}
  </span>
);

const Evolucion = () => {
  const { mainId } = useParams();
  const [time, setTime] = useState(new Date());
  const [admisiones, setAdmisiones] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
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

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

const [estancia, setEstancia] = useState(0);
useEffect(() => {
  if (!admisiones?.createdAt) return;
  const fechaIngreso = admisiones.createdAt.toDate();
  const hoy = new Date();
  const dias = Math.floor((hoy - fechaIngreso) / (1000 * 60 * 60 * 24) + 1);
  setEstancia(dias);
}, [admisiones]);

const [edad, setEdad] = useState(0);
useEffect(() => {
  if (!admisiones?.secondaryData?.dateOfBirth) return;
  let fechaNacimiento = admisiones.secondaryData.dateOfBirth;
  if (fechaNacimiento.toDate) {
    fechaNacimiento = fechaNacimiento.toDate();
  } else {
    fechaNacimiento = new Date(fechaNacimiento);
  }
  const hoy = new Date();
  let años = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const mesActual = hoy.getMonth();
  const mesNacimiento = fechaNacimiento.getMonth();
  if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < fechaNacimiento.getDate())) {
    años--;
  }
  setEdad(años);
}, [admisiones]);

  const formattedDate = time.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = time.toLocaleTimeString('es-ES');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ffffff] via-[#EAF4FB] to-[#1a5784] p-4">
      
      {/* HEADER */}
      <header className="rounded-2xl border border-[#007e8f]/25 bg-white/90 p-4 md:p-5 shadow-lg text-[#595759] backdrop-blur mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Stethoscope size={28} className="text-[#69c9ba]" />
              Evolución Clínica
            </h1>
            <p className="text-xs md:text-sm text-gray-600 mt-1">{formattedDate} - {formattedTime}</p>
          </div>
          <Button
            onClick={handleGeneratePDF}
            className="bg-[#76c4d5] hover:bg-[#69c9ba] text-white px-6 py-2 rounded-lg shadow-md flex items-center gap-2 transition-all"
            title="EvolucionPDF"
          >
            <Printer size={18} />
            <span className="hidden sm:inline">Imprimir PDF</span>
          </Button>
        </div>
      </header>

      {/* MAIN PANEL */}
      <main className="grid grid-cols-1 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-[#3aa7aa]/20"
        >
          <div className="space-y-6">
            
            {/* SECCIÓN EVALUACIÓN PRINCIPAL */}
            <div className="space-y-4 pb-6 border-b-2 border-[#007e8f]/20">
              <h2 className="text-lg font-bold text-[#595759] flex items-center gap-2">
                <Stethoscope size={24} className="text-[#69c9ba]" />
                Evaluación del Paciente
              </h2>
              
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-[#595759] mb-1 flex items-center gap-2">
                    <FileText size={18} className="text-[#511259]" />
                    EVOLUCIÓN
                  </label>
                  <Input
                    value={evolucionTexto}
                    onChange={(e) => setEvolucionTexto(e.target.value)}
                    className="w-full h-8 text-sm border-2 border-[#7cc4bc]  rounded text-black focus:border-[#007e8f]"
                  />
                </div>
                
                <div>
                  <label className="block font-semibold text-[#595759] mb-1 flex items-center gap-2">
                    <FileText size={18} className="text-[#007e8f]" />
                    ANÁLISIS
                  </label>
                  <Input
                    value={analisisTexto}
                    onChange={(e) => setAnalisisTexto(e.target.value)}
                    className="w-full h-8 text-sm border-2 border-[#7cc4bc]  rounded text-black focus:border-[#007e8f]"
                  />
                </div>
                
                <div>
                  <label className="block font-semibold text-[#595759] mb-1 flex items-center gap-2">
                    <Heart size={18} className="text-[#FF6B6B]" />
                    ENFERMERÍA
                  </label>
                  <Input
                    value={enfermeriaTexto}
                    onChange={(e) => setEnfermeriaTexto(e.target.value)}
                    className="w-full h-8 text-sm border-2 border-[#7cc4bc]  rounded text-black focus:border-[#007e8f]"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN MEDICAMENTOS */}
            <div className="space-y-4 pb-6 border-b-2 border-[#007e8f]/20">
              <h2 className="text-lg font-bold text-[#595759] flex items-center gap-2">
                <Pill size={24} className="text-[#007e8f]" />
                Medicamentos
              </h2>
              <div className="grid grid-cols-7 gap-2 text-xs">
                <div>
                  <label className="block font-semibold text-[#1c3f6e] mb-1">MEDICAMENTO</label>
                  <Input
                    value={medicamentoTexto}
                    onChange={(e) => setMedicamentoTexto(e.target.value)}
                    className="w-full h-8 text-sm border-2 border-[#7cc4bc]  rounded text-black focus:border-[#007e8f]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c3f6e] mb-1 flex items-center gap-1">
                    <Droplet size={14} /> VIA ADM
                  </label>
                  <Input
                    value={viaTexto}
                    onChange={(e) => setViaTexto(e.target.value)}
                    className="w-full h-8 text-sm border-2 border-[#7cc4bc]  rounded text-black focus:border-[#007e8f]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c3f6e] mb-1 flex items-center gap-1">
                    <Clock size={14} /> FRECUENCIA
                  </label>
                  <Input
                    value={frecuenciaTexto}
                    onChange={(e) => setFrecuenciaTexto(e.target.value)}
                    className="w-full h-8 text-sm border-2 border-[#7cc4bc]  rounded text-black focus:border-[#007e8f]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c3f6e] mb-1">PRESENTACION</label>
                  <Input
                    value={presTexto}
                    onChange={(e) => setPresTexto(e.target.value)}
                    className="w-full h-8 text-sm border-2 border-[#7cc4bc]  rounded text-black focus:border-[#007e8f]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c3f6e] mb-1">ADMINISTRA</label>
                  <Input
                    value={adminiTexto}
                    onChange={(e) => setAdminiTexto(e.target.value)}
                    className="w-full h-8 text-sm border-2 border-[#7cc4bc]  rounded text-black focus:border-[#007e8f]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c3f6e] mb-1">CANTIDAD</label>
                  <Input
                    value={cantidadTexto}
                    onChange={(e) => setCantidadTexto(e.target.value)}
                    className="w-full h-8 text-sm border-2 border-[#7cc4bc]  rounded text-black focus:border-[#007e8f]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c3f6e] mb-1 flex items-center gap-1">
                    <AlertCircle size={14} /> INDICACION
                  </label>
                  <Input
                    value={indicaTexto}
                    onChange={(e) => setIndicaTexto(e.target.value)}
                    className="w-full h-8 text-sm border-2 border-[#7cc4bc]  rounded text-black focus:border-[#007e8f]"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN INFUSIONES */}
            <div className="space-y-4 pb-6 border-b-2 border-[#007e8f]/20">
              <h2 className="text-lg font-bold text-[#595759] flex items-center gap-2">
                <Droplet size={24} className="text-[#4B8BBE]" />
                Infusiones
              </h2>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#1c3f6e] mb-1">INFUSIONES</label>
                  <Input
                    value={insuTexto}
                    onChange={(e) => setInsuTexto(e.target.value)}
                    className="w-full h-8 text-sm border-2 border-[#7cc4bc]  rounded text-black focus:border-[#007e8f]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c3f6e] mb-1 flex items-center gap-1">
                    <AlertCircle size={14} /> INDICACION
                  </label>
                  <Input
                    value={indiTexto}
                    onChange={(e) => setIndiTexto(e.target.value)}
                    className="w-full h-8 text-sm border-2 border-[#7cc4bc]  rounded text-black focus:border-[#007e8f]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c3f6e] mb-1 flex items-center gap-1">
                    <Clock size={14} /> FRECUENCIA
                  </label>
                  <Input
                    value={freTexto}
                    onChange={(e) => setFreTexto(e.target.value)}
                    className="w-full h-8 text-sm border-2 border-[#7cc4bc]  rounded text-black focus:border-[#007e8f]"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN NUTRICIÓN */}
            <div className="space-y-4 pb-6 border-b-2 border-[#007e8f]/20">
              <h2 className="text-lg font-bold text-[#595759] flex items-center gap-2">
                <UtensilsCrossed size={24} className="text-[#FF9800]" />
                Nutrición y Observaciones
              </h2>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#1c3f6e] mb-1">DIETA</label>
                  <Input
                    value={dietaTexto}
                    onChange={(e) => setDietaTexto(e.target.value)}
                    className="w-full h-8 text-sm border-2 border-[#7cc4bc] rounded text-black focus:border-[#007e8f]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c3f6e] mb-1 flex items-center gap-1">
                    <AlertCircle size={14} /> OBSERVACION
                  </label>
                  <Input
                    value={obsTexto}
                    onChange={(e) => setObsTexto(e.target.value)}
                    className="w-full h-8 text-sm border-2 border-[#7cc4bc]  rounded text-black focus:border-[#007e8f]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c3f6e] mb-1 flex items-center gap-1">
                    <FileText size={14} /> INTERCONSULTA
                  </label>
                  <Input
                    value={interTexto}
                    onChange={(e) => setInterTexto(e.target.value)}
                    className="w-full h-8 text-sm border-2 border-[#7cc4bc]  rounded text-black focus:border-[#007e8f]"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN SIGNOS VITALES */}
            <div className="space-y-4 pb-6 border-b-2 border-[#007e8f]/20">
              <h2 className="text-lg font-bold text-[#595759] flex items-center gap-2">
                <Heart size={24} className="text-[#FF6B6B]" />
                Signos Vitales y Actividades
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-[#595759] mb-1 flex items-center gap-2">
                    <Heart size={18} className="text-[#FF6B6B]" />
                    SIGNOS VITALES
                  </label>
                  <Input
                    value={signosTexto}
                    onChange={(e) => setSignosTexto(e.target.value)}
                    className="w-full h-8 text-sm border-2 border-[#7cc4bc]  rounded text-black focus:border-[#007e8f]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#595759] mb-1">ACTIVIDADES</label>
                  <Input
                    value={activTexto}
                    onChange={(e) => setActivTexto(e.target.value)}
                    className="w-full h-8 text-sm border-2 border-[#7cc4bc]  rounded text-black focus:border-[#007e8f]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#595759] mb-1">OBSERVACIONES</label>
                  <Input
                    value={obseTexto}
                    onChange={(e) => setObseTexto(e.target.value)}
                    className="w-full h-8 text-sm border-2 border-[#7cc4bc]  rounded text-black focus:border-[#007e8f]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#595759] mb-1 flex items-center gap-2">
                    <FileText size={18} className="text-[#007e8f]" />
                    EXAMENES SOLICITADOS
                  </label>
                  <Input
                    value={examenTexto}
                    onChange={(e) => setExamenTexto(e.target.value)}
                    className="w-full h-8 text-sm border-2 border-[#7cc4bc]  rounded text-black focus:border-[#007e8f]"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN ESTADO Y ALERGIAS */}
            <div className="space-y-4 pb-6 border-b-2 border-[#007e8f]/20">
              <h2 className="text-lg font-bold text-[#595759] flex items-center gap-2">
                <AlertCircle size={24} className="text-[#FF0000]" />
                Estado y Alergias
              </h2>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="block font-semibold text-[#1c3f6e] mb-1">CONDICION</label>
                  <Input
                    value={condiTexto}
                    onChange={(e) => setCondiTexto(e.target.value)}
                    className="w-full h-8 text-sm border-2 border-[#7cc4bc]  rounded text-black focus:border-[#007e8f]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c3f6e] mb-1 flex items-center gap-1">
                    <AlertCircle size={14} className="text-[#FF0000]" /> ALERGIAS
                  </label>
                  <Input
                    value={alergiaTexto}
                    onChange={(e) => setAlergiaTexto(e.target.value)}
                    className="w-full h-8 text-sm border-2 border-[#7cc4bc]  rounded text-black focus:border-[#007e8f]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c3f6e] mb-1 flex items-center gap-1">
                    <AlertCircle size={14} className="text-[#FF0000]" /> ESPECIFICAR
                  </label>
                  <Input
                    value={obserTexto}
                    onChange={(e) => setObserTexto(e.target.value)}
                    className="w-full h-8 text-sm border-2 border-[#7cc4bc]  rounded text-black focus:border-[#007e8f]"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN DIAGNÓSTICOS */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[#595759] flex items-center gap-2">
                <Stethoscope size={24} className="text-[#007e8f]" />
                Diagnósticos
              </h2>
              <div className="grid grid-cols-5 gap-2 text-xs">
                <div>
                  <label className="block font-semibold text-[#1c3f6e] mb-1">DIAGNOSTICO PRESUNTIVO</label>
                  <Input
                    value={diagTexto}
                    onChange={(e) => setDiagTexto(e.target.value)}
                    className="w-full h-8 text-sm border-2 border-[#7cc4bc]  rounded text-black focus:border-[#007e8f]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c3f6e] mb-1">CODIGO</label>
                  <Input
                    value={codigoTexto}
                    onChange={(e) => setCodigoTexto(e.target.value)}
                    className="w-full h-8 text-sm border-2 border-[#7cc4bc]  rounded text-black focus:border-[#007e8f]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c3f6e] mb-1">DIAGNOSTICO DEFINITIVO</label>
                  <Input
                    value={diagnosticoTexto}
                    onChange={(e) => setDiagnosticoTexto(e.target.value)}
                    className="w-full h-8 text-sm border-2 border-[#7cc4bc]  rounded text-black focus:border-[#007e8f]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1c3f6e] mb-1">CODIGO</label>
                  <Input
                    value={codeTexto}
                    onChange={(e) => setCodeTexto(e.target.value)}
                    className="w-full h-8 text-sm border-2 border-[#7cc4bc]  rounded text-black focus:border-[#007e8f]"
                  />
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </main>
    </div>
  );
};
export default Evolucion;

