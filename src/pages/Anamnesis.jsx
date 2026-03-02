import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import { InterconsultaPDF } from '../components/InterconsultaPDF';
import { db } from '../firebaseConfig'; // 👈 AJUSTAr la ruta si es necesario
import { doc, getDoc } from 'firebase/firestore';
import { toast } from '@/components/ui/use-toast';



export default function Anamnesis() {
//constantes
const { mainId } = useParams();
  const [time, setTime] = useState(new Date());
  const [admisiones, setAdmisiones] = useState(null); // <-- aquí se guardan los datos desde Firestore
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  //agregado
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
//++++++++++copiado desde interconsulta

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

//copiado desde interconsulta


  // ===============================
  // FECHA ACTUAL
  // ===============================
  const [fechaActual, setFechaActual] = useState("");

  useEffect(() => {
    const hoy = new Date();
    setFechaActual(hoy.toLocaleDateString());
  }, []);

  // ===============================
  // DATOS PACIENTE
  // ===============================
  const [paciente, setPaciente] = useState({
    numeroHistoria: "",
    fechaNacimiento: "",
    edadAnios: "",
    edadMeses: "",
  });

  const handlePaciente = (e) => {
    setPaciente({ ...paciente, [e.target.name]: e.target.value });
  };

  // ===============================
  // CALCULAR EDAD
  // ===============================
  useEffect(() => {
    if (!paciente.fechaNacimiento) return;

    const nacimiento = new Date(paciente.fechaNacimiento);
    const hoy = new Date();

    let anios = hoy.getFullYear() - nacimiento.getFullYear();
    let meses = hoy.getMonth() - nacimiento.getMonth();

    if (meses < 0) {
      anios--;
      meses += 12;
    }

    setPaciente(prev => ({
      ...prev,
      edadAnios: anios,
      edadMeses: meses
    }));
  }, [paciente.fechaNacimiento]);

  // ===============================
  // EVA
  // ===============================
  const [eva, setEva] = useState(0);

  // ===============================
  // DINÁMICOS
  // ===============================

  const [cirugias, setCirugias] = useState([
    { procedimiento: "", anio: "", complicaciones: "" }
  ]);

  const addCirugia = () => {
    setCirugias([...cirugias, { procedimiento: "", anio: "", complicaciones: "" }]);
  };

  const removeCirugia = (index) => {
    setCirugias(cirugias.filter((_, i) => i !== index));
  };

  const updateCirugia = (index, field, value) => {
    const nuevas = [...cirugias];
    nuevas[index][field] = value;
    setCirugias(nuevas);
  };

  // ===============================
  // MEDICAMENTOS
  // ===============================

  const [medicamentos, setMedicamentos] = useState([
    { nombre: "", dosis: "", frecuencia: "" }
  ]);

  const addMedicamento = () => {
    setMedicamentos([...medicamentos, { nombre: "", dosis: "", frecuencia: "" }]);
  };

  const removeMedicamento = (index) => {
    setMedicamentos(medicamentos.filter((_, i) => i !== index));
  };

  const updateMedicamento = (index, field, value) => {
    const nuevos = [...medicamentos];
    nuevos[index][field] = value;
    setMedicamentos(nuevos);
  };

  // ===============================
  // ALERGIAS
  // ===============================

  const [alergias, setAlergias] = useState([
    { nombre: "", tipo: "", severidad: "" }
  ]);

  const addAlergia = () => {
    setAlergias([...alergias, { nombre: "", tipo: "", severidad: "" }]);
  };

  const removeAlergia = (index) => {
    setAlergias(alergias.filter((_, i) => i !== index));
  };

  const updateAlergia = (index, field, value) => {
    const nuevas = [...alergias];
    nuevas[index][field] = value;
    setAlergias(nuevas);
  };

  // ===============================
  // RENDER
  // ===============================
  return (




    
    <div className="min-h-screen bg-gradient-to-br from-[#ffffff] via-[#EAF4FB] to-[#1a5784]">



    <div className="relative mb-1">
      <button
        onClick={() => window.history.back()}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#4b6bb3] text-white font-semibold py-1 px-3 rounded hover:bg-[#2b8d8f] shadow"
      >
        ← Volver
      </button>

      <h1 className="text-3xl text-[#5dbfc1] font-bold text-center">
        ANAMNESIS
      </h1>
      </div>









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
     
     



   </header>
   {/* MAIN PANEL */}
   <main className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 ">
        {/* LEFT PANEL */}
        <div className="bg-white rounded shadow p-4">
          <h2 className="bg-[#162f5c] text-white text-center text-sm font-bold px-4 py-2 rounded-t">
            NUEVA ANAMNESIS
          </h2>

          <button
            onClick={() => console.log('Agregar nuevo registro')}
            className=" absolute top-60 left-80 text-gray hover:text-[#FF5757] "
            title="Agregar nuevo registro"
          >
            <PlusCircle className="w-5 h-5" />
          </button>

          <div className="border p-2 mt-2 text-sm">
            <h1 className="text-[#010101] font-bold text-center mb-2">
              HISTORIAL
            </h1>
           
            <h1 className="text-[#3aa7aa] font-bold text-center mb-2">Doctor</h1>
            
            <ul className="text-[#3aa7aa] text-center">
              <li>DELGADO ZURITA LUIS MIGUEL</li>
           
              <li>DELGADO ZURITA LUIS MIGUEL</li>
            
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

















<div style={styles.body}>
      <style>{css}</style>
  <div className="card">
    <div className="card-header">
      <i className="fas fa-comment-medical" />
      <h2>2. Motivo de Consulta</h2>
    </div>
    <div className="card-body">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="tipoConsulta">Tipo de Consulta *</label>
          <select id="tipoConsulta" name="tipoConsulta" required>
            <option value="">Seleccionar...</option>
            <option value="primera_vez">Primera Vez</option>
            <option value="control">Control</option>
            <option value="urgencia">Urgencia</option>
            <option value="hospitalizacion">Hospitalización</option>
            <option value="interconsulta">Interconsulta</option>
            <option value="domiciliaria">Atención Domiciliaria</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="servicio">Servicio / Especialidad *</label>
          <select id="servicio" name="servicio" required>
            <option value="">Seleccionar...</option>
            <option value="medicina_general">Medicina General</option>
            <option value="pediatria">Pediatría</option>
            <option value="ginecologia">Ginecología y Obstetricia</option>
            <option value="cirugia">Cirugía General</option>
            <option value="ortopedia">Ortopedia y Traumatología</option>
            <option value="cardiologia">Cardiología</option>
            <option value="neurologia">Neurología</option>
            <option value="endocrinologia">Endocrinología</option>
            <option value="gastroenterologia">Gastroenterología</option>
            <option value="psiquiatria">Psiquiatría</option>
            <option value="dermatologia">Dermatología</option>
            <option value="oncologia">Oncología</option>
            <option value="neumologia">Neumología</option>
            <option value="urologia">Urología</option>
            <option value="oftalmologia">Oftalmología</option>
            <option value="otorrinolaringologia">Otorrinolaringología</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group form-group-full">
          <label htmlFor="motivoConsulta">
            Motivo de Consulta (en palabras del paciente) *
          </label>
          <textarea
            id="motivoConsulta"
            name="motivoConsulta"
            placeholder="Descripción del motivo de consulta en palabras del paciente..."
            required
            rows="3"
          />
        </div>
      </div>
      <div className="subsection-title">
        <i className="fas fa-stethoscope" /> Caracterización del Síntoma
        Principal
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="localizacion">Localización</label>
          <Input
            id="localizacion"
            name="localizacion"
            placeholder="Zona anatómica afectada"
            type="text"
          />
        </div>
        <div className="form-group">
          <label htmlFor="inicio">Inicio / Tiempo de Evolución</label>
          <Input
            id="inicio"
            name="inicio"
            placeholder="Ej: 3 días, 1 semana..."
            type="text"
          />
        </div>
        <div className="form-group">
          <label htmlFor="intensidad">Intensidad (EVA 0-10)</label>
          <div className="eva-container">
            <input
              defaultValue="0"
              id="intensidad"
              max="10"
              min="0"
              name="intensidad"
              oninput="updateEva(this.value)"
              type="range"
            />
            <span className="eva-badge" id="evaValue">
              0
            </span>
          </div>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="tipo">Tipo / Calidad</label>
          <input
            id="tipo"
            name="tipo"
            placeholder="Ej: Punzante, quemante, opresivo..."
            type="text"
          />
        </div>
        <div className="form-group">
          <label htmlFor="irradiacion">Irradiación</label>
          <input
            id="irradiacion"
            name="irradiacion"
            placeholder="Hacia dónde irradia"
            type="text"
          />
        </div>
        <div className="form-group">
          <label htmlFor="cronologia">Cronología</label>
          <select id="cronologia" name="cronologia">
            <option value="">Seleccionar...</option>
            <option value="continuo">Continuo</option>
            <option value="intermitente">Intermitente</option>
            <option value="progresivo">Progresivo</option>
            <option value="episodico">Episódico</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="factoresAgravantes">Factores Agravantes</label>
          <input
            id="factoresAgravantes"
            name="factoresAgravantes"
            placeholder="Qué lo empeora"
            type="text"
          />
        </div>
        <div className="form-group">
          <label htmlFor="factoresAtenuantes">Factores Atenuantes</label>
          <input
            id="factoresAtenuantes"
            name="factoresAtenuantes"
            placeholder="Qué lo mejora"
            type="text"
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group form-group-full">
          <label htmlFor="sintomasAsociados">Síntomas Asociados</label>
          <Input
            id="sintomasAsociados"
            name="sintomasAsociados"
            placeholder="Otros síntomas relacionados..."
            rows="2"
          />
        </div>
      </div>
    </div>
  </div>
  <div className="card">
    <div className="card-header">
      <i className="fas fa-history" />
      <h2>3. Antecedentes</h2>

    </div>

    <div className="card-body">
      <div className="subsection-title">
        <i className="fas fa-disease" /> Antecedentes Personales Patológicos
      </div>

      <div className="checkbox-grid m-2">
        <label className="checkbox-item m-2">
          <input defaultValue="1" name="ant_hipertension" type="checkbox" />
          <span className="checkmark" />
          Hipertensión Arterial
        </label>
        <label className="checkbox-item m-2">
          <input defaultValue="1" name="ant_diabetes" type="checkbox" />
          <span className="checkmark" />
          Diabetes Mellitus
        </label>
        <label className="checkbox-item m-2">
          <input defaultValue="1" name="ant_obesidad" type="checkbox" />
          <span className="checkmark" />
          Obesidad
        </label>
        <label className="checkbox-item m-2">
          <input defaultValue="1" name="ant_cardiopatia" type="checkbox" />
          <span className="checkmark" />
          Cardiopatía
        </label>
        <label className="checkbox-item m-2">
          <input defaultValue="1" name="ant_epoc" type="checkbox" />
          <span className="checkmark" />
          EPOC / Asma
        </label>
        <label className="checkbox-item m-2">
          <input defaultValue="1" name="ant_cancer" type="checkbox" />
          <span className="checkmark" />
          Cáncer
        </label>
        <label className="checkbox-item m-2">
          <input defaultValue="1" name="ant_vih" type="checkbox" />
          <span className="checkmark" />
          VIH/SIDA
        </label>
        <label className="checkbox-item m-2">
          <input defaultValue="1" name="ant_tuberculosis" type="checkbox" />
          <span className="checkmark" />
          Tuberculosis
        </label>
        <label className="checkbox-item m-2">
          <input defaultValue="1" name="ant_renal" type="checkbox" />
          <span className="checkmark" />
          Enfermedad Renal
        </label>
        <label className="checkbox-item m-2">
          <input defaultValue="1" name="ant_hepatica" type="checkbox" />
          <span className="checkmark" />
          Enfermedad Hepática
        </label>
        <label className="checkbox-item m-2">
          <input defaultValue="1" name="ant_neurologica" type="checkbox" />
          <span className="checkmark" />
          Enfermedad Neurológica
        </label>
        <label className="checkbox-item m-2">
          <input defaultValue="1" name="ant_psiquiatrica" type="checkbox" />
          <span className="checkmark" />
          Trastorno Psiquiátrico
        </label>
      </div>
      <div
        className="form-row"
        style={{
          marginTop: "15px",
        }}>
        <div className="form-group form-group-full">
          <label htmlFor="otrosAntPersonales">
            Otros antecedentes personales
          </label>
          <textarea
            id="otrosAntPersonales"
            name="otrosAntPersonales"
            placeholder="Especificar otras enfermedades, procedimientos, hospitalizaciones previas..."
            rows="2"
          />
        </div>
      </div>
      <div className="subsection-title">
        <i className="fas fa-cut" /> Antecedentes Quirúrgicos
      </div>
      <div id="cirugiasContainer">
        <div className="dynamic-row" id="cirugiaRow_0">
          <div className="form-row">
            <div className="form-group">
              <label>Procedimiento</label>
              <input
                name="cirugia_proc_0"
                placeholder="Tipo de cirugía"
                type="text"
              />
            </div>
            <div className="form-group">
              <label>Año</label>
              <input
                max="2099"
                min="1900"
                name="cirugia_anio_0"
                placeholder="Año"
                type="number"
              />
            </div>
            <div className="form-group">
              <label>Complicaciones</label>
              <input
                name="cirugia_comp_0"
                placeholder="Complicaciones"
                type="text"
              />
            </div>
            <div className="form-group btn-remove-container">
              <button
                className="btn-remove"
                style={{
                  visibility: "hidden",
                }}
                type="button">
                <i className="fas fa-trash" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <button className="btn-add" onclick="addCirugia()" type="button">
        <i className="fas fa-plus" /> Agregar Cirugía
      </button>
      <div className="subsection-title">
        <i className="fas fa-pills" /> Antecedentes Farmacológicos (Medicación
        Actual)
      </div>
      <div id="medicamentosContainer">
        <div className="dynamic-row" id="medicRow_0">
          <div className="form-row">
            <div className="form-group">
              <label>Medicamento</label>
              <input
                name="medic_nombre_0"
                placeholder="Nombre del medicamento"
                type="text"
              />
            </div>
            <div className="form-group">
              <label>Dosis</label>
              <input name="medic_dosis_0" placeholder="Ej: 10mg" type="text" />
            </div>
            <div className="form-group">
              <label>Frecuencia</label>
              <input
                name="medic_freq_0"
                placeholder="Ej: Cada 8h"
                type="text"
              />
            </div>
            <div className="form-group btn-remove-container">
              <button
                className="btn-remove"
                style={{
                  visibility: "hidden",
                }}
                type="button">
                <i className="fas fa-trash" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <button className="btn-add" onclick="addMedicamento()" type="button">
        <i className="fas fa-plus" /> Agregar Medicamento
      </button>
      <div className="subsection-title">
        <i className="fas fa-allergies" /> Alergias
      </div>
      <div id="alergiasContainer">
        <div className="dynamic-row" id="alergiaRow_0">
          <div className="form-row">
            <div className="form-group">
              <label>Alérgeno</label>
              <input
                name="alergia_nombre_0"
                placeholder="Ej: Penicilina, Mariscos..."
                type="text"
              />
            </div>
            <div className="form-group">
              <label>Tipo de Reacción</label>
              <select name="alergia_tipo_0">
                <option value="">Seleccionar...</option>
                <option value="cutanea">Cutánea (rash, urticaria)</option>
                <option value="anafilaxia">Anafilaxia</option>
                <option value="respiratoria">Respiratoria</option>
                <option value="digestiva">Digestiva</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div className="form-group">
              <label>Severidad</label>
              <select name="alergia_sev_0">
                <option value="">Seleccionar...</option>
                <option value="leve">Leve</option>
                <option value="moderada">Moderada</option>
                <option value="grave">Grave</option>
              </select>
            </div>
            <div className="form-group btn-remove-container">
              <button
                className="btn-remove"
                style={{
                  visibility: "hidden",
                }}
                type="button">
                <i className="fas fa-trash" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <button className="btn-add" onclick="addAlergia()" type="button">
        <i className="fas fa-plus" /> Agregar Alergia
      </button>
    </div>
  </div>
</div>





















    </motion.div>
    </main>
    </div>


  );
};

// ===============================
// ESTILOS
// ===============================

const styles = {
  body: {
    minHeight: "100vh",
    padding: "20px",
    background: "linear-gradient(135deg,#0f2027,#203a43,#2c5364)",
    color: "white",
    fontFamily: "Segoe UI"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px"
  },
  container: {
    maxWidth: "1000px",
    margin: "auto"
  },
  card: {
    background: "rgba(255,255,255,0.1)",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px"
  },
  row: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px"
  },
  evaBadge: {
    marginLeft: "10px",
    padding: "5px 10px",
    background: "#00b4ff",
    borderRadius: "8px"
  }
};

const css = `
.container { max-width:1100px; margin:auto; }
.card { background:rgba(255,255,255,0.05); padding:20px; border-radius:16px; margin-bottom:20px; }
.grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
.form-group { display:flex; flex-direction:column; gap:6px; }
input { padding:8px; border-radius:6px; border:1px solid #00b4ff55; background:#ffffff11; color:white; }
.tiempo-wrapper { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
.tiempo-bloque { background:#ffffff10; padding:15px; border-radius:12px; }
.duracion-display { display:flex; justify-content:space-between; margin:10px 0; }
.progress-bar { height:6px; background:#ffffff20; border-radius:4px; overflow:hidden; }
.progress-fill { height:100%; background:linear-gradient(90deg,#00b4ff,#00e5ff); transition:0.4s; }
.resumen-tiempos { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:20px; }
.resumen-item { background:#ffffff10; padding:12px; text-align:center; border-radius:10px; }
`;