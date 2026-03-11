import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  PlusCircle, 
  FileText, 
  Stethoscope, 
  User, 
  Calendar, 
  Clock,
  Heart,
  Thermometer,
  Wind,
  Droplet,
  AlertCircle,
  ClipboardList,
  Zap,
  Pill,
  CheckCircle,
  Search,
  Trash2,
  Plus,
  Building
} from 'lucide-react';
import { InterconsultaPDF } from '../components/InterconsultaPDF';
import { db } from '../firebaseConfig'; // 👈 AJUSTAr la ruta si es necesario
import { doc, getDoc } from 'firebase/firestore';
import { toast } from '@/components/ui/use-toast';

const AllergyWarning = ({ allergy }) => (
  <span className="allergy-warning text-[#FF0000] font-semibold">
    <span className="allergy-icon">⚠️</span>
    ALERGIAS: {allergy}
  </span>
);

const Interconsulta = () => {
  const { mainId } = useParams();
  const [time, setTime] = useState(new Date());
  const [admisiones, setAdmisiones] = useState(null); // <-- aquí se guardan los datos desde Firestore
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  //agregado
  //le estoy agregando tecnica para que inicialize en cero y ADEMAS ES UNA PROPIEDAD DEL OBJETO formDate
  const [formData, setFormData] = useState({
    tecnica:''
  });
  const [planTratamientoTexto, setPlanTratamientoTexto] = useState('');
  const [planDiagTexto, setPlanDiagTexto] = useState('');
  const [defTexto, setDefTexto] = useState('');
  const [preTexto, setPreTexto] = useState('');
  const [cieDosTexto, setCieDosTexto] = useState('');
  const [diagDosTexto, setDiagDosTexto] = useState('');
  const [resumenTexto, setResumenTexto] = useState('');
  const [cuadroTexto, setCuadroTexto] = useState('');
  const [planesTeTexto, setPlanesTeTexto] = useState('');
  const [defUnoTexto, setDefUnoTexto] = useState('');
  const [preUnoTexto, setPreUnoTexto] = useState('');
  const [servicioTresTexto, setServicioTresTexto] = useState('');
  const [servicioDosTexto, setServicioDosTexto] = useState('');
  const [cieUnoTexto, setCieUnoTexto] = useState('');
  const [diagUnoTexto, setDiagUnoTexto] = useState('');
  const [examenesTexto, setExamenesTexto] = useState('');
  const [cuadroUnoTexto, setCuadroUnoTexto] = useState('');
  const [descTexto, setDescTexto] = useState('');
  const [medicoTexto, setMedicoTexto] = useState('');
  const [establecimientoTexto, setEstablecimientoTexto] = useState('');
  
  const handleGeneratePDF = () => {
    InterconsultaPDF({
      establecimientoTexto,
      servicioDosTexto,
      servicioTresTexto,
      medicoTexto,
      descTexto,
      cuadroUnoTexto,
      examenesTexto,
      diagUnoTexto,
      cieUnoTexto,
      preUnoTexto,
      defUnoTexto,
      planesTeTexto,
      cuadroTexto,
      resumenTexto,
      diagDosTexto,
      cieDosTexto,
      preTexto,
      defTexto,
      planDiagTexto,
      planTratamientoTexto,
      admisiones,
      edad,
      formData,
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

//*****************AQUI CREO LA ESTANCIA DE CADA PACIENTE SUMANDO LOS DIAS **********************//
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
    <div className="min-h-screen bg-gradient-to-br from-[#76c4d5]/20 via-[#EAF4FB] to-[#76c4d5] p-6">
     
      {/* HEADER */}
      <header className="relative rounded-2xl border border-[#76c4d5]/25 bg-gradient-to-r from-white/90 to-[#76c4d5]/60 p-3 md:p-3 shadow-lg backdrop-blur mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#1a5784]" />
            <div>
              <h1 className="text-xs font-bold text-[#595759]">Interconsulta</h1>
              <p className="text-xs text-[#007e8f]">{formattedDate} • {formattedTime}</p>
            </div>
          </div>
          {admisiones && (
            <div className="flex gap-6 text-right">
              <div>
                <p className="text-xs text-gray-500">Estancia</p>
                <p className="text-xs font-bold text-[#1a5784]">{estancia} días</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Edad</p>
                <p className="text-xs font-bold text-[#1a5784]">{edad} años</p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* MAIN PANEL */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT PANEL - Historial y Signos Vitales */}
      

        {/* RIGHT PANEL - Formulario Principal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3 bg-white rounded-xl shadow-lg overflow-hidden border border-[#007e8f]/10"
        >
          <div className="p-6 space-y-6">
           
            {/* SECCIÓN 1: TIPO DE CONSULTA Y ESTABLECIMIENTOS */}
            <div className="bg-[#f8f9fa] rounded-lg p-5 space-y-4 border-l-4 border-[#1a5784]">
              <h3 className="font-bold text-[#1a5784] text-sm flex items-center gap-2">
                <Zap className="w-5 h-5" />
                INFORMACIÓN DE CONSULTA
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipo de Consulta */}
                <div>
                  <Label className="block font-bold text-[#1a5784] text-sm mb-2">TIPO DE CONSULTA</Label>
                  <div className="flex gap-4">
                    {['NORMAL', 'URGENTE'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer hover:text-[#007e8f] transition">
                        <input
                          type="radio"
                          name="tecnica"
                          value={opt}
                          checked={formData.tecnica === opt}
                          onChange={(e) =>
                            setFormData({ ...formData, tecnica: e.target.value })
                          }
                          className="w-4 h-4 cursor-pointer"
                        />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Establecimiento */}
                <div>
                  <Label className="block font-bold text-[#1a5784] text-sm mb-2 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    ESTABLECIMIENTO
                  </Label>
                  <Input
                    value={establecimientoTexto}
                    onChange={(e) => setEstablecimientoTexto(e.target.value)}
                    className="w-full h-10 text-sm border-[#007e8f]/30 shadow-sm focus:ring-2 focus:ring-[#007e8f]/60 rounded text-black"
                    placeholder="Ingrese el establecimiento"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Servicio Consultado */}
                <div>
                  <Label className="block font-bold text-[#1a5784] text-sm mb-2 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" />
                    SERVICIO CONSULTADO
                  </Label>
                  <Input
                    value={servicioDosTexto}
                    onChange={(e) => setServicioDosTexto(e.target.value)}
                    className="w-full h-10 text-sm border-[#007e8f]/30 shadow-sm focus:ring-2 focus:ring-[#007e8f]/60 rounded text-black"
                    placeholder="Ingrese el servicio"
                  />
                </div>

                {/* Servicio que Solicita */}
                <div>
                  <Label className="block font-bold text-[#1a5784] text-sm mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    SERVICIO QUE SOLICITA
                  </Label>
                  <Input
                    value={servicioTresTexto}
                    onChange={(e) => setServicioTresTexto(e.target.value)}
                    className="w-full h-10 text-sm border-[#007e8f]/30 shadow-sm focus:ring-2 focus:ring-[#007e8f]/60 rounded text-black"
                    placeholder="Ingrese el servicio"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: MÉDICO Y DESCRIPCIÓN */}
            <div className="bg-[#f8f9fa] rounded-lg p-5 space-y-4 border-l-4 border-[#007e8f]">
              <h3 className="font-bold text-[#1a5784] text-sm flex items-center gap-2">
                <User className="w-5 h-5" />
                DATOS DEL MÉDICO
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label className="block font-bold text-[#1a5784] text-sm mb-2 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" />
                    MÉDICO INTERCONSULTADO
                  </Label>
                  <Input
                    value={medicoTexto}
                    onChange={(e) => setMedicoTexto(e.target.value)}
                    className="w-full h-10 text-sm border-[#007e8f]/30 shadow-sm focus:ring-2 focus:ring-[#007e8f]/60 rounded text-black"
                    placeholder="Nombre del médico"
                  />
                </div>
                <button className="flex items-center justify-center gap-2 bg-[#007e8f]/20 hover:bg-[#007e8f]/30 text-[#007e8f] rounded-lg h-10 transition-colors">
                  <Search className="w-4 h-4" />
                  <span className="text-sm font-semibold">Buscar</span>
                </button>
              </div>

              <div>
                <Label className="block font-bold text-[#1a5784] text-sm mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  DESCRIPCIÓN DEL MOTIVO
                </Label>
                <Input
                  value={descTexto}
                  onChange={(e) => setDescTexto(e.target.value)}
                  className="w-full h-20 text-sm border border-[#007e8f]/30 shadow-sm focus:ring-2 focus:ring-[#007e8f]/60 rounded text-black p-3 resize-none"
                  placeholder="Describa el motivo de la interconsulta"
                />
              </div>
            </div>

            {/* SECCIÓN 3: INFORMACIÓN CLÍNICA */}
            <div className="bg-[#f8f9fa] rounded-lg p-5 space-y-4 border-l-4 border-[#3aa7aa]">
              <h3 className="font-bold text-[#1a5784] text-sm flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                INFORMACIÓN CLÍNICA INICIAL
              </h3>

              <div>
                <Label className="block font-bold text-[#1a5784] text-sm mb-2">CUADRO CLÍNICO ACTUAL</Label>
                <Input
                  value={cuadroUnoTexto}
                  onChange={(e) => setCuadroUnoTexto(e.target.value)}
                  className="w-full h-20 text-sm border border-[#007e8f]/30 shadow-sm focus:ring-2 focus:ring-[#007e8f]/60 rounded text-black p-3 resize-none"
                  placeholder="Describa el cuadro clínico"
                />
              </div>

              <div>
                <Label className="block font-bold text-[#1a5784] text-sm mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  EXÁMENES Y PROCEDIMIENTOS DIAGNÓSTICOS
                </Label>
                <Input
                  value={examenesTexto}
                  onChange={(e) => setExamenesTexto(e.target.value)}
                  className="w-full h-20 text-sm border border-[#007e8f]/30 shadow-sm focus:ring-2 focus:ring-[#007e8f]/60 rounded text-black p-3 resize-none"
                  placeholder="Describa los exámenes realizados"
                />
              </div>

              <div className="bg-white rounded-lg p-4 border border-[#007e8f]/20">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-[#1a5784] text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    PRIMER DIAGNÓSTICO
                  </h4>
                  <button className="text-red-500 hover:text-red-700 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="md:col-span-2">
                    <Label className="block text-gray-600 text-xs font-semibold mb-1">DIAGNÓSTICO</Label>
                    <Input
                      value={diagUnoTexto}
                      onChange={(e) => setDiagUnoTexto(e.target.value)}
                      className="w-full h-9 text-sm border-[#007e8f]/30 rounded text-black"
                      placeholder="Diagnóstico"
                    />
                  </div>
                  <div>
                    <Label className="block text-gray-600 text-xs font-semibold mb-1">CIE10</Label>
                    <Input
                      value={cieUnoTexto}
                      onChange={(e) => setCieUnoTexto(e.target.value)}
                      className="w-full h-9 text-sm border-[#007e8f]/30 rounded text-black"
                      placeholder="CIE10"
                    />
                  </div>
                  <div>
                    <Label className="block text-gray-600 text-xs font-semibold mb-1">PRE</Label>
                    <Input
                      value={preUnoTexto}
                      onChange={(e) => setPreUnoTexto(e.target.value)}
                      className="w-full h-9 text-sm border-[#007e8f]/30 rounded text-black"
                      placeholder="PRE"
                    />
                  </div>
                  <div>
                    <Label className="block text-gray-600 text-xs font-semibold mb-1">DEF</Label>
                    <Input
                      value={defUnoTexto}
                      onChange={(e) => setDefUnoTexto(e.target.value)}
                      className="w-full h-9 text-sm border-[#007e8f]/30 rounded text-black"
                      placeholder="DEF"
                    />
                  </div>
                </div>
              </div>

              <button className="w-full flex items-center justify-center gap-2 bg-[#3aa7aa]/20 hover:bg-[#3aa7aa]/30 text-[#3aa7aa] py-2 rounded-lg transition-colors font-semibold text-sm">
                <Plus className="w-4 h-4" />
                AGREGAR OTRO DIAGNÓSTICO
              </button>
            </div>

            {/* SECCIÓN 4: PLANES TERAPÉUTICOS */}
            <div className="bg-[#f8f9fa] rounded-lg p-5 space-y-4 border-l-4 border-[#7cc4bc]">
              <h3 className="font-bold text-[#1a5784] text-sm flex items-center gap-2">
                <Pill className="w-5 h-5" />
                PLANES TERAPÉUTICOS
              </h3>

              <div>
                <Label className="block font-bold text-[#1a5784] text-sm mb-2">PLANES TERAPÉUTICOS Y EDUCACIONALES REALIZADOS</Label>
                <Input
                  value={planesTeTexto}
                  onChange={(e) => setPlanesTeTexto(e.target.value)}
                  className="w-full h-20 text-sm border border-[#007e8f]/30 shadow-sm focus:ring-2 focus:ring-[#007e8f]/60 rounded text-black p-3 resize-none"
                  placeholder="Describa los planes terapéuticos"
                />
              </div>
            </div>

            {/* SECCIÓN 5: INTERCONSULTA */}
            <div className="bg-[#f8f9fa] rounded-lg p-5 space-y-4 border-l-4 border-[#595759]">
              <h3 className="font-bold text-[#1a5784] text-sm flex items-center gap-2">
                <FileText className="w-5 h-5" />
                DATOS DE INTERCONSULTA
              </h3>

              <div>
                <Label className="block font-bold text-[#1a5784] text-sm mb-2">CUADRO CLÍNICO DE INTERCONSULTA</Label>
                <Input
                  value={cuadroTexto}
                  onChange={(e) => setCuadroTexto(e.target.value)}
                  className="w-full h-20 text-sm border border-[#007e8f]/30 shadow-sm focus:ring-2 focus:ring-[#007e8f]/60 rounded text-black p-3 resize-none"
                  placeholder="Describa el cuadro clínico"
                />
              </div>

              <div>
                <Label className="block font-bold text-[#1a5784] text-sm mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  RESUMEN DE CRITERIO CLÍNICO
                </Label>
                <Input
                  value={resumenTexto}
                  onChange={(e) => setResumenTexto(e.target.value)}
                  className="w-full h-20 text-sm border border-[#007e8f]/30 shadow-sm focus:ring-2 focus:ring-[#007e8f]/60 rounded text-black p-3 resize-none"
                  placeholder="Resumen del criterio clínico"
                />
              </div>

              <div className="bg-white rounded-lg p-4 border border-[#007e8f]/20">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-[#1a5784] text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    DIAGNÓSTICOS FINALES
                  </h4>
                  <button className="text-red-500 hover:text-red-700 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="md:col-span-2">
                    <Label className="block text-gray-600 text-xs font-semibold mb-1">DIAGNÓSTICO</Label>
                    <Input
                      value={diagDosTexto}
                      onChange={(e) => setDiagDosTexto(e.target.value)}
                      className="w-full h-9 text-sm border-[#007e8f]/30 rounded text-black"
                      placeholder="Diagnóstico"
                    />
                  </div>
                  <div>
                    <Label className="block text-gray-600 text-xs font-semibold mb-1">CIE10</Label>
                    <Input
                      value={cieDosTexto}
                      onChange={(e) => setCieDosTexto(e.target.value)}
                      className="w-full h-9 text-sm border-[#007e8f]/30 rounded text-black"
                      placeholder="CIE10"
                    />
                  </div>
                  <div>
                    <Label className="block text-gray-600 text-xs font-semibold mb-1">PRE</Label>
                    <Input
                      value={preTexto}
                      onChange={(e) => setPreTexto(e.target.value)}
                      className="w-full h-9 text-sm border-[#007e8f]/30 rounded text-black"
                      placeholder="PRE"
                    />
                  </div>
                  <div>
                    <Label className="block text-gray-600 text-xs font-semibold mb-1">DEF</Label>
                    <Input
                      value={defTexto}
                      onChange={(e) => setDefTexto(e.target.value)}
                      className="w-full h-9 text-sm border-[#007e8f]/30 rounded text-black"
                      placeholder="DEF"
                    />
                  </div>
                </div>
              </div>

              <button className="w-full flex items-center justify-center gap-2 bg-[#3aa7aa]/20 hover:bg-[#3aa7aa]/30 text-[#3aa7aa] py-2 rounded-lg transition-colors font-semibold text-sm">
                <Plus className="w-4 h-4" />
                AGREGAR OTRO DIAGNÓSTICO
              </button>
            </div>

            {/* SECCIÓN 6: PLANES PROPUESTOS */}
            <div className="bg-[#f8f9fa] rounded-lg p-5 space-y-4 border-l-4 border-[#FF6B6B]">
              <h3 className="font-bold text-[#1a5784] text-sm flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                PLANES PROPUESTOS
              </h3>

              <div>
                <Label className="block font-bold text-[#1a5784] text-sm mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  PLAN DE DIAGNÓSTICO PROPUESTO
                </Label>
                <Input
                  value={planDiagTexto}
                  onChange={(e) => setPlanDiagTexto(e.target.value)}
                  className="w-full h-20 text-sm border border-[#007e8f]/30 shadow-sm focus:ring-2 focus:ring-[#007e8f]/60 rounded text-black p-3 resize-none"
                  placeholder="Describa el plan de diagnóstico"
                />
              </div>

              <div>
                <Label className="block font-bold text-[#1a5784] text-sm mb-2 flex items-center gap-2">
                  <Pill className="w-4 h-4" />
                  PLAN DE TRATAMIENTO PROPUESTO
                </Label>
                <Input
                  value={planTratamientoTexto}
                  onChange={(e) => setPlanTratamientoTexto(e.target.value)}
                  className="w-full h-20 text-sm border border-[#007e8f]/30 shadow-sm focus:ring-2 focus:ring-[#007e8f]/60 rounded text-black p-3 resize-none"
                  placeholder="Describa el plan de tratamiento"
                />
              </div>
            </div>

            {/* BOTÓN GENERAR PDF */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleGeneratePDF}
                className="flex-1 bg-gradient-to-r from-[#76c4d5] to-[#595759]/90 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold"
              >
                <FileText className="w-5 h-5" />
                Generar PDF de Interconsulta
              </Button>
              
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
export default Interconsulta;

