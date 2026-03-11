import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle,
  FileText,
  TestTube,
  Stethoscope,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Zap,
  Users,
  Scissors,
  Plus,
  Trash2
} from 'lucide-react';
import { generarConstantesVitalesPDF } from '../components/generarConstantesVitalesPDF';
import { db } from '../firebaseConfig'; // 👈 AJUSTAr la ruta si es necesario
import { doc, getDoc } from 'firebase/firestore';
import { toast } from '@/components/ui/use-toast';

const AllergyWarning = ({ allergy }) => (
  <span className="allergy-warning text-[#FF0000] font-semibold">
    <span className="allergy-icon">⚠️</span>
    ALERGIAS: {allergy}
  </span>
);

const Protocolo = () => {
  const { mainId } = useParams();
  const [time, setTime] = useState(new Date());
  const [admisiones, setAdmisiones] = useState(null); // <-- aquí se guardan los datos desde Firestore
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  //agregado
  //le estoy agregando tecnica para que inicialize en cero y ADEMAS ES UNA PROPIEDAD DEL OBJETO formDate
  //CIE-10+++++++++++++++++++++++++++++++++++++++++++++
  const [cieDiag, setCieDiag] = useState([
    { id: Date.now(), valor: "" }
  ]);

  const agregarCIE = () => {
    setCieDiag([
      ...cieDiag,
      { id: Date.now(), valor: "" }
    ]);
  };
  
  const eliminarCIE = (id) => {
    if (cieDiag.length === 1) return; // evita borrar el último
    setCieDiag(cieDiag.filter(item => item.id !== id));
  };
  
  const actualizarCIE = (id, valor) => {
    setCieDiag(
      cieDiag.map(item =>
        item.id === id ? { ...item, valor } : item
      )
    );
  };
//CIE-10+++++++++++++++++++++++++++++++++++++++++++++
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
  
  // son cosntantes para la eleccion de muestra patologica 
  const [muestra, setMuestra] = useState("");
  const [materia, setMateria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  //hasta aqui 
 
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

//constante de fecha
  const formattedDate = time.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = time.toLocaleTimeString('es-ES');
  //constante de DATOS DE LA CIRUGIA 
  const [horaInicio, setHoraInicio] = useState('');
const [horaFin, setHoraFin] = useState('');
const [duracion, setDuracion] = useState('');
//AGREGAR USEEFECTS 
useEffect(() => {
  if (!horaInicio || !horaFin) {
    setDuracion('');
    return;
  }

  const inicio = new Date(`1970-01-01T${horaInicio}`);
  const fin = new Date(`1970-01-01T${horaFin}`);

  let diferencia = (fin - inicio) / 1000; // segundos

  if (diferencia < 0) diferencia += 24 * 3600; // cruza medianoche

  const horas = Math.floor(diferencia / 3600);
  const minutos = Math.floor((diferencia % 3600) / 60);

  setDuracion(`${horas}h ${minutos}min`);
}, [horaInicio, horaFin]);
//HASTA AQUI USEEFECTS ++++++++++++++++++++++++++++++++

  //inicia la ventana grafica
  return (
   <div className="min-h-screen bg-gradient-to-br from-[#ffffff] via-[#EAF4FB] to-[#76c4d5] p-6">
      
      {/* HEADER */}
      <header className="relative rounded-2xl border border-[#007e8f]/25 bg-gradient-to-r from-[#595759] to-[#595759]/40 p-4 md:p-6 shadow-lg backdrop-blur mb-6">
        <div className="flex items-center justify-between ">
          <div className="flex items-center gap-3">
            <Scissors className="w-8 h-8 text-[#ffffff]" />
            <div>
              <h1 className="text-2xl font-bold text-[#fffffff]">Protocolo Quirúrgico</h1>
             
            </div>
          </div>
        </div>
      </header>

      {/* MAIN PANEL */}
      <main className="grid grid-cols-1 md:grid-cols-1 gap-6">
       
   {/* CONTENIDO PRINCIPAL */}
<div className="col-span-1 space-y-6">

{/* CODIFICACIÓN */}
<div className="bg-white rounded-2xl shadow-md p-6 border border-[#007e8f]/10">
  <h3 className="text-lg font-semibold text-[#1a5784] mb-4 flex items-center gap-2">
    <TestTube className="w-5 h-5" />
    Codificación Diagnóstica
  </h3>

  <div className="grid md:grid-cols-2 gap-4">






{/*CIE-10 (Diagnóstico) */}
    <div>
      <label className="block text-sm font-medium text-[#007e8f] mb-1">
        CIE-10 (Diagnóstico)
      </label>

      {cieDiag.map((item, index) => (
    <div key={item.id} className="flex gap-2 mb-2 items-center"> <Input
    type="text"
    value={item.valor}
    onChange={(e) => actualizarCIE(item.id, e.target.value)}
    placeholder={`Ej: K35 - Diagnóstico ${index + 1}`}
    className="text-blue-500 w-full border border-blue-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
  />

  <button
    type="button"
    onClick={agregarCIE}
    className="bg-[#007e8f] text-white px-3 py-2 rounded-lg hover:bg-green-600"
  >
    +
  </button>

  <button
    type="button"
    onClick={() => eliminarCIE(item.id)}
    className="bg-[#007e8f] text-white px-3 py-2 rounded-lg hover:bg-red-600"
  >
    −
  </button>

</div>
))}
</div>






    <div>
      <label className="block text-sm font-medium text-[#007e8f] mb-1">
        CPT (Procedimiento)
      </label>
      <Input
        type="text"
        placeholder="Ej: 44950"
        className="text-green-700 w-full  border border-green-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-green-400 outline-none"
      />
    </div>
    <div className="mt-0.5">
  <label className="block text-sm font-medium text-[#007e8f] mb-1">
    CIE-10 Secundario / Comorbilidades
  </label>
  <Input
    type="text"
    placeholder="Ej: E11 - Diabetes Mellitus"
    className="text-blue-500 w-full border border-blue-200 rounded-xl  px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
  />
</div>
  </div>
</div>






{/** ++++++++++++++++++++++++++++++++++++++++++++++++++++++++DATOS DE LA CIRUGÍA++++++++++++++++++++++++++++++++++ */}
<div className="bg-white rounded-2xl shadow-md p-5 border border-[#007e8f]/10">
  <h3 className="text-lg font-semibold text-[#1a5784] mb-4 flex items-center gap-2">
    <Scissors className="w-5 h-5" />
    Datos de la Cirugía
  </h3>

  <div className="grid md:grid-cols-2 gap-2">

    <div className="md:col-span-2">
      <label className="block text-sm text-lg font-semibold text-[#007e8f] mb-1">
        Diagnóstico Pre-operatorio
      </label>
      <Input className="text-blue-500 w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-green-400 outline-none" />
    </div>

    <div className="md:col-span-2">
      <label className="block text-sm font-semibold text-lg text-[#007e8f] mb-1">
        Diagnóstico Post-operatorio
      </label>
      <Input className="w-full border rounded-xl px-3 py-2 focus:ring-2 text-[#007e8f] focus:ring-green-400 outline-none" />
    </div>

    <div>
      <label className="block text-sm text-lg font-semibold text-[#007e8f] mb-1">
       Dieresis
      </label>
      <Input className="text-blue-500 w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-green-400 outline-none" />
    </div>

    <div>
      <label className="block text-sm font-semibold text-lg text-[#007e8f] mb-1">
        Exposición
      </label>
      <Input className="w-full border rounded-xl px-3 py-2 focus:ring-2 text-[#007e8f] focus:ring-green-400 outline-none" />
    </div>

    <div>
      <label className="block text-sm text-lg font-semibold text-[#007e8f] mb-1">
       Exaploración y Hallasgos Quirurgicos
      </label>
      <Input className="text-blue-500 w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-green-400 outline-none" />
    </div>

    <div>
      <label className="block text-sm font-semibold text-lg text-[#007e8f] mb-1">
        Procedimiento Operatorio
      </label>
      <Input className="w-full border rounded-xl px-3 py-2 focus:ring-2 text-blue-800 focus:ring-green-400 outline-none" />
    </div>

    <div>
      <label className="block text-sm font-semibold text-lg text-[#007e8f] mb-1">
        Sintesis
      </label>
      <Input className="w-full border rounded-xl px-3 py-2 focus:ring-2 text-[#007e8f] focus:ring-green-400 outline-none" />
    </div>

    <div>
      <label className="block text-sm font-semibold text-lg text-[#007e8f] mb-1">
        Complicaciones
      </label>
      <Input className="w-full border rounded-xl px-3 py-2 focus:ring-2 text-[#007e8f] focus:ring-green-400 outline-none" />
    </div>
    
    {/**inicia la seleccion de MUESTRA PATOLOGICO */}
    
    <div className="p-1 border rounded-lg space-y-4 ">

  <h2 className="font-bold text-[#007e8f] ">
    Muestra Patológico
  </h2>

  <div className="flex gap-9 text-[#007e8f] mt-9">
    <label>
      <input
        type="radio"
        name="muestra"
        value="SI"
        checked={muestra === "SI"}
        onChange={(e) => setMuestra(e.target.value)}
        className =" mr-2"
      />
      SI
    </label>

    <label>
      <input
        type="radio"
        name="muestra"
        value="NO"
        checked={muestra === "NO"}
        onChange={(e) => setMuestra(e.target.value)}
        className =" mr-2"
      />
      NO
    </label>
  </div>

  {muestra === "SI" && (
    <div>
      <label className="block font-normalbold text-[#007e8f] ">
        Descripción
      </label>
      <Input
        type="text"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        className="border p-2 w-full"
        placeholder="Ingrese descripción..."
      />
    </div>
  )}

</div>
{/**HASTA AQUI ++++++++++++++++++++++++++++++++++++++++++++++++++++ */}

 {/**inicia la seleccion de MUESTRA PATOLOGICO */}
    
 <div className="p-1 border rounded-lg space-y-4 ">

<h2 className="font-bold text-[#007e8f] ">
Materia Protésico
</h2>

<div className="flex gap-9 text-[#007e8f] mt-9">
  <label>
    <input
      type="radio"
      name="materia"
      value="SI"
      checked={materia === "SI"}
      onChange={(e) => setMateria(e.target.value)}
      className =" mr-2"
    />
    SI
  </label>

  <label>
    <input
      type="radio"
      name="materia"
      value="NO"
      checked={materia === "NO"}
      onChange={(e) => setMateria(e.target.value)}
      className =" mr-2"
    />
    NO
  </label>
</div>

{materia === "SI" && (
  <div>
    <label className="block font-normalbold text-[#007e8f] ">
      Descripción
    </label>
    <Input
      type="text"
      value={descripcion}
      onChange={(e) => setDescripcion(e.target.value)}
      className="border p-2 w-full"
      placeholder="Ingrese descripción..."
    />
  </div>
)}

</div>
{/**HASTA AQUI ++++++++++++++++++++++++++++++++++++++++++++++++++++ */}

    





    <div>
      <label className=" text-lg font-semibold text-[#007e8f] block text-sm font-medium mb-1">
        Fecha de Cirugía
      </label>
      <Input type="date"
        className="w-full border rounded-xl text-[#007e8f] px-3 py-2 focus:ring-2 focus:ring-green-400 outline-none" />
    </div>

    <div>
      <label className="block text-sm text-[#007e8f] font-semibold mb-1">
        Hora de Inicio
      </label>
      <Input
        type="time"
        value={horaInicio}
        onChange={(e) => setHoraInicio(e.target.value)}
        className="text-green-800 w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-green-400 outline-none"
      />
    </div>

    <div>
      <label className="text-[#007e8f] block text-sm font-medium mb-1">
        Hora de Término
      </label>
      <Input
        type="time"
        value={horaFin}
        onChange={(e) => setHoraFin(e.target.value)}
        className=" text-[#007e8f] w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-green-400 outline-none"
      />
    </div>

    <div>
      <label className="text-[#007e8f] block text-sm font-medium mb-1">
        Duración
      </label>
      <Input
        value={duracion}
        readOnly
        className="text-[#007e8f] w-full bg-blue-50 border border-green-200 rounded-xl px-3 py-2 font-semibold"
      />
    </div>

    <div>
      <label className="text-[#007e8f] block text-sm font-medium mb-1">
        Clasificación ASA
      </label>
      <select className="text-[#007e8f]  w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none">
        <option>Seleccionar</option>
        <option>ASA I - Paciente sano</option>
        <option>ASA II - Enfermedad sistémica leve</option>
        <option>ASA III - Enfermedad sistémica grave</option>
        <option>ASA IV - Riesgo vital constante</option>
        <option>ASA V - No sobrevive sin cirugía</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium mb-1 text-[#007e8f]">
        Posición Quirúrgica
      </label>
      <select className="text-[#007e8f] w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none">
        <option>Seleccionar</option>
        <option>Decúbito Supino</option>
        <option>Decúbito Prono</option>
        <option>Decúbito Lateral Derecho</option>
        <option>Decúbito Lateral Izquierdo</option>
        <option>Trendelenburg</option>
        <option>Litotomía</option>
      </select>
    </div>

    <div>
      <label className="text-[#007e8f] block text-sm font-medium mb-1">
        Acceso Quirúrgico
      </label>
      <select className="text-[#007e8f] w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none">
        <option>Seleccionar</option>
        <option>Abierto</option>
        <option>Laparoscópico</option>
        <option>Robótico</option>
        <option>Endoscópico</option>
        <option>Percutáneo</option>
      </select>
    </div>

    

  </div>
</div>



{/* EQUIPO QUIRÚRGICO */}
<div className="bg-white rounded-2xl shadow-md p-4 border border-[#007e8f]/10">
  <h3 className="text-lg font-semibold text-[#1a5784] mb-4 flex items-center gap-2">
    <Users className="w-5 h-5" />
    Equipo Quirúrgico
  </h3>

  <div className="grid md:grid-cols-3 gap-4">

    <Input placeholder="Cirujano Principal"
      className="text-black  border rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-400 outline-none" />
      <Input placeholder="1ER Ayudante"
      className="text-black border rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-400 outline-none" />
       <Input placeholder="2DO Ayudante"
      className="text-black border rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-400 outline-none" />
    <Input placeholder="Médico Anestesiólogo"
      className=" text-black  border rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-400 outline-none" />
      <Input placeholder="Enfermera Instrumentista"
      className=" text-black  border rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-400 outline-none" />
      <Input placeholder="Enfermera Circulante"
      className=" text-black  border rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-400 outline-none" />
       <Input placeholder=" Pediatra"
      className="text-black  border rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-400 outline-none" />
  </div>
</div>

{/* BOTÓN GENERAR PDF */}
<div className="flex justify-end">
  <Button
    onClick={async () => {
      await generarConstantesVitalesPDF({
        cieDiag,
        edad,
        estancia,
        admisiones, // 👈 ENVÍAS TODO EL OBJETO FIREBASE
      });
    }}
  

    className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-2xl shadow-lg"
  >
    Generar PDF
  </Button>
</div>

</div>
 {/* HASTA AQUIIIII++++++++++++++++++++++++++++++++++++++++++ RIGHT PANEL */}

      </main>
    </div>
  );
};
export default Protocolo;

