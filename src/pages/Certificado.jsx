import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  CalendarDays, 
  FileText, 
  AlertCircle, 
  Heart, 
  Clock,
  CheckCircle,
  Activity,
  Save,
  Edit3
} from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-[#ffffff] via-[#EAF4FB] to-[#1a5784] p-6">
      
      {/* HEADER */}
       <header className="relative rounded-2xl border border-[#007e8f]/25 bg-gradient-to-r from-[#595759] to-[#595759]/40 p-4 md:p-6 shadow-lg backdrop-blur mb-6"><div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#fffffff]" />
            <div>
              <h1 className="text-2xl font-bold text-[#fffffff]">Certificado Médico</h1>
              <p className="text-sm text-[#fffffff]">{formattedDate} • {formattedTime}</p>
            </div>
          </div>
          <button
            onClick={() =>
              generarPDF({
                tipoTexto,
                observacionesTexto,
              })
            }
            className="flex items-center gap-2 bg-gradient-to-r from-[#4b6bb3] to-[#007e8f] text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all font-semibold"
          >
            <FileText className="w-5 h-5" />
            GENERAR PDF
          </button>
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
           
            {/* SECCIÓN 1: TIPO DE CERTIFICADO */}
            <div className="bg-[#f8f9fa] rounded-lg p-5 space-y-4 border-l-4 border-[#1a5784]">
              <h3 className="font-bold text-[#1a5784] text-sm flex items-center gap-2">
                <FileText className="w-5 h-5" />
                INFORMACIÓN DEL CERTIFICADO
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#1a5784] text-sm mb-2">TIPO DE CERTIFICADO</label>
                  <textarea
                    value={certificadoTexto}
                    onChange={(e) => setCertificadoTexto(e.target.value)}
                    className="w-full h-10 text-sm border border-[#007e8f]/30 rounded p-2 focus:ring-2 focus:ring-[#007e8f]/60 text-black"
                    placeholder="Ej: Incapacidad, Aptitud, etc."
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1a5784] text-sm mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    TIPO DE CONTINGENCIA
                  </label>
                  <textarea
                    value={tipoTexto}
                    onChange={(e) => setTipoTexto(e.target.value)}
                    className="w-full h-10 text-sm border border-[#007e8f]/30 rounded p-2 focus:ring-2 focus:ring-[#007e8f]/60 text-black"
                    placeholder="Ingrese el tipo de contingencia"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: SINTOMATOLOGÍA Y DIAGNÓSTICO */}
            <div className="bg-[#f8f9fa] rounded-lg p-5 space-y-4 border-l-4 border-[#007e8f]">
              <h3 className="font-bold text-[#1a5784] text-sm flex items-center gap-2">
                <Heart className="w-5 h-5" />
                DIAGNÓSTICO CLÍNICO
              </h3>

              <div>
                <label className="block font-bold text-[#1a5784] text-sm mb-2">SINTOMATOLOGÍA</label>
                <textarea
                  value={sintomaTexto}
                  onChange={(e) => setSintomaTexto(e.target.value)}
                  className="w-full h-20 text-sm border border-[#007e8f]/30 rounded p-3 focus:ring-2 focus:ring-[#007e8f]/60 text-black resize-none"
                  placeholder="Describa los síntomas presentados"
                  rows={3}
                />
              </div>

              <div>
                <label className="block font-bold text-[#1a5784] text-sm mb-2">DIAGNÓSTICO CIE10</label>
                <textarea
                  value={diagnosticoTexto}
                  onChange={(e) => setDiagnosticoTexto(e.target.value)}
                  className="w-full h-20 text-sm border border-[#007e8f]/30 rounded p-3 focus:ring-2 focus:ring-[#007e8f]/60 text-black resize-none"
                  placeholder="Ingrese el código CIE10"
                  rows={3}
                />
              </div>
            </div>

            {/* SECCIÓN 3: FECHAS Y REPOSO */}
            <div className="bg-[#f8f9fa] rounded-lg p-5 space-y-4 border-l-4 border-[#3aa7aa]">
              <h3 className="font-bold text-[#1a5784] text-sm flex items-center gap-2">
                <Clock className="w-5 h-5" />
                PERÍODO DE INCAPACIDAD
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#1a5784] text-sm mb-2 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    FECHA ATENCIÓN
                  </label>
                  <textarea
                    value={fechaTexto}
                    onChange={(e) => setFechaTexto(e.target.value)}
                    className="w-full h-10 text-sm border border-[#007e8f]/30 rounded p-2 focus:ring-2 focus:ring-[#007e8f]/60 text-black"
                    placeholder="Ingrese la fecha"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1a5784] text-sm mb-2">DÍAS DE REPOSO</label>
                  <textarea
                    value={diasTexto}
                    onChange={(e) => setDiasTexto(e.target.value)}
                    className="w-full h-10 text-sm border border-[#007e8f]/30 rounded p-2 focus:ring-2 focus:ring-[#007e8f]/60 text-black"
                    placeholder="Numero de días"
                    rows={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#1a5784] text-sm mb-2">DURACIÓN EN DÍAS</label>
                  <textarea
                    value={diassTexto}
                    onChange={(e) => setDiassTexto(e.target.value)}
                    className="w-full h-10 text-sm border border-[#007e8f]/30 rounded p-2 focus:ring-2 focus:ring-[#007e8f]/60 text-black"
                    placeholder="Duración"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1a5784] text-sm mb-2">TIPO DE REPOSO</label>
                  <textarea
                    value={tiposTexto}
                    onChange={(e) => setTiposTexto(e.target.value)}
                    className="w-full h-10 text-sm border border-[#007e8f]/30 rounded p-2 focus:ring-2 focus:ring-[#007e8f]/60 text-black"
                    placeholder="Reposo total/parcial"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 4: RANGO DE FECHAS */}
            <div className="bg-[#f8f9fa] rounded-lg p-5 space-y-4 border-l-4 border-[#7cc4bc]">
              <h3 className="font-bold text-[#1a5784] text-sm flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                VALIDEZ DEL CERTIFICADO
              </h3>

              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-[#007e8f]/20">
                  <div className="flex gap-2 items-center">
                    <label className="block font-bold text-[#1a5784] text-sm">DESDE:</label>
                    <textarea
                      value={desdeTexto}
                      readOnly
                      className="flex-1 h-10 text-sm border border-[#007e8f]/30 rounded p-2 bg-[#f0f0f0] text-black"
                    />
                    <CalendarDays
                      className="w-6 h-6 cursor-pointer text-[#007e8f] hover:text-[#1a5784]"
                      onClick={() => inputDesdeRef.current.showPicker()}
                    />
                    <textarea
                      value={desdeTextoPalabras}
                      readOnly
                      className="flex-1 h-10 text-sm border border-[#007e8f]/30 rounded p-2 bg-[#f0f0f0] text-[#007e8f] italic"
                    />
                    <input
                      type="date"
                      ref={inputDesdeRef}
                      className="hidden"
                      onChange={(e) => {
                        setDesdeTexto(e.target.value);
                        setDesdeTextoPalabras(formatearFechaEnPalabras(e.target.value));
                      }}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-[#007e8f]/20">
                  <div className="flex gap-2 items-center">
                    <label className="block font-bold text-[#1a5784] text-sm">HASTA:</label>
                    <textarea
                      value={hastaTexto}
                      readOnly
                      className="flex-1 h-10 text-sm border border-[#007e8f]/30 rounded p-2 bg-[#f0f0f0] text-black"
                    />
                    <CalendarDays
                      className="w-6 h-6 cursor-pointer text-[#007e8f] hover:text-[#1a5784]"
                      onClick={() => inputHastaRef.current.showPicker()}
                    />
                    <textarea
                      value={hastaTextoPalabras}
                      readOnly
                      className="flex-1 h-10 text-sm border border-[#007e8f]/30 rounded p-2 bg-[#f0f0f0] text-[#007e8f] italic"
                    />
                    <input
                      type="date"
                      ref={inputHastaRef}
                      className="hidden"
                      onChange={(e) => {
                        setHastaTexto(e.target.value);
                        setHastaTextoPalabras(formatearFechaEnPalabras(e.target.value));
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 5: OBSERVACIONES */}
            <div className="bg-[#f8f9fa] rounded-lg p-5 space-y-4 border-l-4 border-[#FF6B6B]">
              <h3 className="font-bold text-[#1a5784] text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                OBSERVACIONES ADICIONALES
              </h3>

              <div>
                <label className="block font-bold text-[#1a5784] text-sm mb-2">OBSERVACIONES</label>
                <textarea
                  value={observacionesTexto}
                  onChange={(e) => setObservacionesTexto(e.target.value)}
                  className="w-full h-20 text-sm border border-[#007e8f]/30 rounded p-3 focus:ring-2 focus:ring-[#007e8f]/60 text-black resize-none"
                  placeholder="Agregue observaciones o notas importantes"
                  rows={3}
                />
              </div>
            </div>

            {/* SECCIÓN 6: FIRMA Y ACCIONES */}
            <div className="bg-[#f8f9fa] rounded-lg p-5 space-y-4 border-l-4 border-[#595759]">
              <h3 className="font-bold text-[#1a5784] text-sm flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                FIRMA Y SELLO
              </h3>

              <p className="text-sm text-gray-600 italic">Espacio reservado para firma del médico y sello de la institución</p>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {}}
                  className="flex-1 bg-[#007e8f]/20 text-[#007e8f] hover:bg-[#007e8f]/30 px-6 py-2 rounded-lg transition-all font-semibold flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  EDITAR
                </Button>
                <Button
                  onClick={() => {}}
                  className="flex-1 bg-green-500/20 text-green-700 hover:bg-green-500/30 px-6 py-2 rounded-lg transition-all font-semibold flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  GUARDAR
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Certificado;
