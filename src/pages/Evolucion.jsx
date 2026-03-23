import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { PlusCircle, Stethoscope, Pill, Droplet, UtensilsCrossed, Heart, FileText, AlertCircle, Clock, Printer, Save } from 'lucide-react';
import { EvolucionPDF } from '../components/EvolucionPDF';
import { toast } from '@/components/ui/use-toast';
import {
  createClinicalEvolutionWithDetails,
  getClinicalEvolutionFull,
  getAdmisionForModuleById,
} from '@/services/admisionesSupabaseService';

const AllergyWarning = ({ allergy }) => (
  <span className="allergy-warning text-[#FF0000] font-semibold flex items-center gap-2">
    <AlertCircle size={16} />
    ALERGIAS: {allergy}
  </span>
);

const MINUTOS_POR_DIA = 24 * 60;

const calcularProximaToma = (horaPrimeraToma, intervaloHoras) => {
  if (!horaPrimeraToma || !intervaloHoras) return '';

  const [horas, minutos] = horaPrimeraToma.split(':').map(Number);
  const intervalo = Number(intervaloHoras);

  if (
    Number.isNaN(horas) ||
    Number.isNaN(minutos) ||
    Number.isNaN(intervalo) ||
    intervalo <= 0
  ) {
    return '';
  }

  const minutosTotales = horas * 60 + minutos;
  const minutosProximaToma = (minutosTotales + intervalo * 60) % MINUTOS_POR_DIA;
  const horasProximaToma = String(Math.floor(minutosProximaToma / 60)).padStart(2, '0');
  const minutosProximaTomaFormateados = String(minutosProximaToma % 60).padStart(2, '0');

  return `${horasProximaToma}:${minutosProximaTomaFormateados}`;
};

const Evolucion = ({ clinicalEvolutionHistory = [], onRefreshClinicalEvolution }) => {
  const { mainId } = useParams();
  const [time, setTime] = useState(new Date());
  const [admisiones, setAdmisiones] = useState(null);
  const [evoluciones, setEvoluciones] = useState(Array.isArray(clinicalEvolutionHistory) ? clinicalEvolutionHistory : []);
  // Estados para medicamentos dinámicos
  const [medicamentos, setMedicamentos] = useState([
    {
      id: 1,
      medicamento: '',
      via: '',
      frecuencia: '',
      presentacion: '',
      administra: '',
      cantidad: '',
      indicacion: '',
      horaPrimeraToma: '',
      intervaloHoras: '',
      proximaToma: '',
    },
  ]);
  const [nextMedicamentoId, setNextMedicamentoId] = useState(2);
  const [evolucionTexto, setEvolucionTexto] = useState('');
  const [analisisTexto, setAnalisisTexto] = useState('');
  const [enfermeriaTexto, setEnfermeriaTexto] = useState('');
  const [insuTexto, setInsuTexto] = useState('');
  const [indiTexto, setIndiTexto] = useState('');
  const [freTexto, setFreTexto] = useState('');
  const [dietaTexto, setDietaTexto] = useState('');
  // Funciones para manejar medicamentos
  const handleMedicamentoChange = (id, field, value) => {
    setMedicamentos((prev) =>
      prev.map((med) => {
        if (med.id !== id) return med;

        const medicamentoActualizado = { ...med, [field]: value };
        if (field === 'horaPrimeraToma' || field === 'intervaloHoras') {
          medicamentoActualizado.proximaToma = calcularProximaToma(
            medicamentoActualizado.horaPrimeraToma,
            medicamentoActualizado.intervaloHoras
          );
        }

        return medicamentoActualizado;
      })
    );
  };
  const addMedicamento = () => {
    setMedicamentos((prev) => [
      ...prev,
      {
        id: nextMedicamentoId,
        medicamento: '',
        via: '',
        frecuencia: '',
        presentacion: '',
        administra: '',
        cantidad: '',
        indicacion: '',
        horaPrimeraToma: '',
        intervaloHoras: '',
        proximaToma: '',
      },
    ]);
    setNextMedicamentoId((prev) => prev + 1);
  };

  const removeMedicamento = (id) => {
    if (medicamentos.length > 1) {
      setMedicamentos((prev) => prev.filter((med) => med.id !== id));
    }
  };
  const [obsTexto, setObsTexto] = useState('');
  const [interTexto, setInterTexto] = useState('');
  
  // Estado para signos vitales con turnos
  const [signosVitales, setSignosVitales] = useState({
    temperatura: { manana: '', tarde: '', noche: '' },
    presionArterial: { manana: '', tarde: '', noche: '' },
    frecuenciaCardiaca: { manana: '', tarde: '', noche: '' },
    satO2: { manana: '', tarde: '', noche: '' },
  });

  // Función para actualizar signos vitales
  const handleSignoVitalChange = (signo, turno, value) => {
    setSignosVitales((prev) => ({
      ...prev,
      [signo]: {
        ...prev[signo],
        [turno]: value,
      },
    }));
  };

  const [activTexto, setActivTexto] = useState('');
  const [obseTexto, setObseTexto] = useState('');
  const [examenTexto, setExamenTexto] = useState('');
  const [condiTexto, setCondiTexto] = useState('');
  const [alergiaTexto, setAlergiaTexto] = useState('');
  const [obserTexto, setObserTexto] = useState('');
  const [diagTexto, setDiagTexto] = useState('');
  const [codigoTexto, setCodigoTexto] = useState('');
  const [diagnosticoTexto, setDiagnosticoTexto] = useState('');
  const [codeTexto, setCodeTexto] = useState('');

const [isSaving, setIsSaving] = useState(false);

const handleGeneratePDF =() => {
  EvolucionPDF({
    evolucionTexto,
    analisisTexto,
    enfermeriaTexto,
    medicamentos,
    insuTexto,
    indiTexto,
    freTexto,
    dietaTexto,
    obsTexto,
    interTexto,
    signosVitales,
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

const handleSaveEvolucion = async () => {
  if (!mainId) {
    toast({
      title: "Error",
      description: "No se pudo identificar el paciente",
      variant: "destructive",
    });
    return;
  }

  setIsSaving(true);
  try {
    const payload = {
      admision_id: mainId,
      evolucion: evolucionTexto,
      analisis: analisisTexto,
      enfermeria: enfermeriaTexto,
      actividades: activTexto,
      observaciones: obseTexto,
      examenes: examenTexto,
      medicamentos,
      infusiones: [
        {
          infusiones: insuTexto,
          indicacion: indiTexto,
          frecuencia: freTexto,
        },
      ],
      nutricion: {
        dieta: dietaTexto,
        observacion: obsTexto,
        interconsulta: interTexto,
      },
      signos_vitales: {
        temperatura: signosVitales.temperatura,
        presion_arterial: signosVitales.presionArterial,
        frecuencia_cardiaca: signosVitales.frecuenciaCardiaca,
        sat_o2: signosVitales.satO2,
        actividades: activTexto,
        observaciones: obseTexto,
      },
    };

    await createClinicalEvolutionWithDetails(payload);

    const actualizado = await getClinicalEvolutionFull(mainId);
    setEvoluciones(actualizado);
    if (typeof onRefreshClinicalEvolution === 'function') {
      onRefreshClinicalEvolution();
    }

    toast({
      title: "Éxito",
      description: "Evolución clínica guardada correctamente",
      variant: "success",
    });

  } catch (error) {
    console.error('❌ Error al guardar evolución:', error);
    toast({
      title: "Error",
      description: "No se pudo guardar la evolución clínica: " + error.message,
      variant: "destructive",
    });
  } finally {
    setIsSaving(false);
  }
};

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

useEffect(() => {
  const fetchAdmisiones = async () => {
    if (!mainId) {
      console.warn('⚠️ mainId es undefined o null'); 
      return;
    }
    try {
      const data = await getAdmisionForModuleById(mainId);
      setAdmisiones(data);
    } catch (error) {
      console.error('❌ Error al obtener admisiones:', error);
      setAdmisiones(null);
    }
  };
  fetchAdmisiones();
}, [mainId]);

useEffect(() => {
  setEvoluciones(Array.isArray(clinicalEvolutionHistory) ? clinicalEvolutionHistory : []);
}, [clinicalEvolutionHistory]);

useEffect(() => {
  const fetchClinicalEvolution = async () => {
    if (!mainId) return;
    try {
      const data = await getClinicalEvolutionFull(mainId);
      setEvoluciones(data);
    } catch (error) {
      console.error('❌ Error al cargar evolución clínica en Supabase:', error);
    }
  };

  if (!clinicalEvolutionHistory || clinicalEvolutionHistory.length === 0) {
    fetchClinicalEvolution();
  }
}, [mainId, clinicalEvolutionHistory]);

const [estancia, setEstancia] = useState(0);
useEffect(() => {
  if (!admisiones?.createdAt) return;
  const fechaIngreso = admisiones.createdAt?.toDate
    ? admisiones.createdAt.toDate()
    : new Date(admisiones.createdAt);
  if (Number.isNaN(fechaIngreso.getTime())) return;
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
  const totalEvoluciones = Array.isArray(evoluciones) ? evoluciones.length : 0;
  const ultimaEvolucionFecha = evoluciones?.[0]?.created_at
    ? new Date(evoluciones[0].created_at).toLocaleString('es-ES')
    : null;

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
            <p className="text-[11px] text-gray-500 mt-1">
              Registros guardados: {totalEvoluciones}
              {ultimaEvolucionFecha ? ` | Último: ${ultimaEvolucionFecha}` : ''}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleSaveEvolucion}
              disabled={isSaving}
              className="bg-[#28a745] hover:bg-[#218838] text-white px-6 py-2 rounded-lg shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
              title="Guardar Evolución"
            >
              <Save size={18} />
              <span className="hidden sm:inline">{isSaving ? 'Guardando...' : 'Guardar'}</span>
            </Button>
            <Button
              onClick={handleGeneratePDF}
              className="bg-[#76c4d5] hover:bg-[#69c9ba] text-white px-6 py-2 rounded-lg shadow-md flex items-center gap-2 transition-all"
              title="EvolucionPDF"
            >
              <Printer size={18} />
              <span className="hidden sm:inline">Imprimir PDF</span>
            </Button>
          </div>
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
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#595759] flex items-center gap-2">
                  <Pill size={24} className="text-[#007e8f]" />
                  Medicamentos
                </h2>
                <Button
                  onClick={addMedicamento}
                  className="bg-[#007e8f] hover:bg-[#005f7f] text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <PlusCircle size={18} />
                  Agregar Medicamento
                </Button>
              </div>

              {/* Lista de medicamentos */}
              {medicamentos.map((med, index) => (
                <motion.div
                  key={med.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-[#f0f7f7] to-white p-4 rounded-lg border-2 border-[#7cc4bc] space-y-3"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-[#007e8f]">Medicamento #{index + 1}</span>
                    {medicamentos.length > 1 && (
                      <Button
                        onClick={() => removeMedicamento(med.id)}
                        variant="destructive"
                        size="sm"
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1"
                      >
                        Eliminar
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-2 text-xs">
                    <div>
                      <label className="block font-semibold text-[#1c3f6e] mb-1">MEDICAMENTO</label>
                      <Input
                        value={med.medicamento}
                        onChange={(e) =>
                          handleMedicamentoChange(med.id, 'medicamento', e.target.value)
                        }
                        placeholder="Ej: Paracetamol"
                        className="w-full h-8 text-sm border-2 border-[#7cc4bc] rounded text-black focus:border-[#007e8f]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#1c3f6e] mb-1 flex items-center gap-1">
                        <Droplet size={14} /> VIA ADM
                      </label>
                      <Input
                        value={med.via}
                        onChange={(e) =>
                          handleMedicamentoChange(med.id, 'via', e.target.value)
                        }
                        placeholder="Ej: Oral"
                        className="w-full h-8 text-sm border-2 border-[#7cc4bc] rounded text-black focus:border-[#007e8f]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#1c3f6e] mb-1 flex items-center gap-1">
                        <Clock size={14} /> FRECUENCIA
                      </label>
                      <Input
                        value={med.frecuencia}
                        onChange={(e) =>
                          handleMedicamentoChange(med.id, 'frecuencia', e.target.value)
                        }
                        placeholder="Ej: C/8hrs"
                        className="w-full h-8 text-sm border-2 border-[#7cc4bc] rounded text-black focus:border-[#007e8f]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#1c3f6e] mb-1 flex items-center gap-1">
                        <Clock size={14} /> HORA INICIAL
                      </label>
                      <Input
                        type="time"
                        value={med.horaPrimeraToma}
                        onChange={(e) =>
                          handleMedicamentoChange(med.id, 'horaPrimeraToma', e.target.value)
                        }
                        className="w-full h-8 text-sm border-2 border-[#7cc4bc] rounded text-black focus:border-[#007e8f]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#1c3f6e] mb-1 flex items-center gap-1">
                        <Clock size={14} /> CADA (HORAS)
                      </label>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={med.intervaloHoras}
                        onChange={(e) =>
                          handleMedicamentoChange(med.id, 'intervaloHoras', e.target.value)
                        }
                        placeholder="Ej: 8"
                        className="w-full h-8 text-sm border-2 border-[#7cc4bc] rounded text-black focus:border-[#007e8f]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#1c3f6e] mb-1 flex items-center gap-1">
                        <Clock size={14} /> PRÓXIMA TOMA
                      </label>
                      <Input
                        value={med.proximaToma}
                        readOnly
                        placeholder="Automático"
                        className="w-full h-8 text-sm border-2 border-[#7cc4bc] rounded text-black bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#1c3f6e] mb-1">PRESENTACION</label>
                      <Input
                        value={med.presentacion}
                        onChange={(e) =>
                          handleMedicamentoChange(med.id, 'presentacion', e.target.value)
                        }
                        placeholder="Ej: 500mg"
                        className="w-full h-8 text-sm border-2 border-[#7cc4bc] rounded text-black focus:border-[#007e8f]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#1c3f6e] mb-1">ADMINISTRA</label>
                      <Input
                        value={med.administra}
                        onChange={(e) =>
                          handleMedicamentoChange(med.id, 'administra', e.target.value)
                        }
                        placeholder="Ej: Enfermera"
                        className="w-full h-8 text-sm border-2 border-[#7cc4bc] rounded text-black focus:border-[#007e8f]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#1c3f6e] mb-1">CANTIDAD</label>
                      <Input
                        value={med.cantidad}
                        onChange={(e) =>
                          handleMedicamentoChange(med.id, 'cantidad', e.target.value)
                        }
                        placeholder="Ej: 2 tab"
                        className="w-full h-8 text-sm border-2 border-[#7cc4bc] rounded text-black focus:border-[#007e8f]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#1c3f6e] mb-1 flex items-center gap-1">
                        <AlertCircle size={14} /> INDICACION
                      </label>
                      <Input
                        value={med.indicacion}
                        onChange={(e) =>
                          handleMedicamentoChange(med.id, 'indicacion', e.target.value)
                        }
                        placeholder="Ej: Dolor"
                        className="w-full h-8 text-sm border-2 border-[#7cc4bc] rounded text-black focus:border-[#007e8f]"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
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
              <h2 className="text-lg font-bold text-[#8A2C2C] flex items-center gap-2">
                <Heart size={24} className="text-[#D93636]" />
                Signos Vitales y Actividades
              </h2>

              {/* Tabla de Signos Vitales */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border-2 border-[#007e8f]">
                  <thead>
                    <tr className="bg-[#76c4d5] text-white">
                      <th className="border-2 border-[#ffffff] px-4 py-2 text-left font-bold">Signo Vital</th>
                      <th className="border-2 border-[#ffffff] px-4 py-2 text-center font-bold">Mañana</th>
                      <th className="border-2 border-[#ffffff] px-4 py-2 text-center font-bold">Tarde</th>
                      <th className="border-2 border-[#ffffff] px-4 py-2 text-center font-bold">Noche</th>
                      <th className="border-2 border-[#ffffff] px-4 py-2 text-center font-bold">Unidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Temperatura */}
                    <tr className="hover:bg-gray-100">
                      <td className="border-2 border-[#ffffff] px-4 py-2 font-semibold text-[#1c3f6e]">
                        <Heart size={16} className="inline mr-2 text-red-500" />
                        Temperatura
                      </td>
                      <td className="border-2 border-[#ffffff] px-4 py-2">
                        <Input
                          type="number"
                          placeholder="36.5"
                          step="0.1"
                          value={signosVitales.temperatura.manana}
                          onChange={(e) =>
                            handleSignoVitalChange('temperatura', 'manana', e.target.value)
                          }
                          className="w-full h-8 text-sm border-2 border-[#7cc4bc] rounded text-black focus:border-[#007e8f]"
                        />
                      </td>
                      <td className="border-2 border-[#ffffff] px-4 py-2">
                        <Input
                          type="number"
                          placeholder="36.8"
                          step="0.1"
                          value={signosVitales.temperatura.tarde}
                          onChange={(e) =>
                            handleSignoVitalChange('temperatura', 'tarde', e.target.value)
                          }
                          className="w-full h-8 text-sm border-2 border-[#7cc4bc] rounded text-black focus:border-[#007e8f]"
                        />
                      </td>
                      <td className="border-2 border-[#ffffff] px-4 py-2">
                        <Input
                          type="number"
                          placeholder="36.6"
                          step="0.1"
                          value={signosVitales.temperatura.noche}
                          onChange={(e) =>
                            handleSignoVitalChange('temperatura', 'noche', e.target.value)
                          }
                          className="w-full h-8 text-sm border-2 border-[#ffffff] rounded text-black focus:border-[#007e8f]"
                        />
                      </td>
                      <td className="border-2 text-[#595759] border-[#ffffff] px-4 py-2 text-center font-semibold">°C</td>
                    </tr>

                    {/* Presión Arterial */}
                    <tr className="hover:bg-gray-100 bg-[#f0f7f7]">
                      <td className="border-2 border-[#ffffff] px-4 py-2 font-semibold text-[#1c3f6e]">
                        <Heart size={16} className="inline mr-2 text-red-500" />
                        P. Arterial
                      </td>
                      <td className="border-2 border-[#ffffff] px-4 py-2">
                        <Input
                          type="text"
                          placeholder="120/70"
                          value={signosVitales.presionArterial.manana}
                          onChange={(e) =>
                            handleSignoVitalChange('presionArterial', 'manana', e.target.value)
                          }
                          className="w-full h-8 text-sm border-2 border-[#ffffff] rounded text-black focus:border-[#007e8f]"
                        />
                      </td>
                      <td className="border-2 border-[#ffffff] px-4 py-2">
                        <Input
                          type="text"
                          placeholder="118/72"
                          value={signosVitales.presionArterial.tarde}
                          onChange={(e) =>
                            handleSignoVitalChange('presionArterial', 'tarde', e.target.value)
                          }
                          className="w-full h-8 text-sm border-2 border-[#ffffff] rounded text-black focus:border-[#007e8f]"
                        />
                      </td>
                      <td className="border-2 border-[#ffffff] px-4 py-2">
                        <Input
                          type="text"
                          placeholder="115/68"
                          value={signosVitales.presionArterial.noche}
                          onChange={(e) =>
                            handleSignoVitalChange('presionArterial', 'noche', e.target.value)
                          }
                          className="w-full h-8 text-sm border-2 border-[#ffffff] rounded text-black focus:border-[#007e8f]"
                        />
                      </td>
                      <td className="border-2 text-[#595759] border-[#ffffff] px-4 py-2 text-center font-semibold">mmHg</td>
                    </tr>

                    {/* Frecuencia Cardíaca */}
                    <tr className="hover:bg-gray-100">
                      <td className="border-2 border-[#ffffff] px-4 py-2 font-semibold text-[#1c3f6e]">
                        <Heart size={16} className="inline mr-2 text-red-500" />
                        Fr. Cardíaca
                      </td>
                      <td className="border-2 border-[#ffffff] px-4 py-2">
                        <Input
                          type="number"
                          placeholder="72"
                          value={signosVitales.frecuenciaCardiaca.manana}
                          onChange={(e) =>
                            handleSignoVitalChange('frecuenciaCardiaca', 'manana', e.target.value)
                          }
                          className="w-full h-8 text-sm border-2 border-[#ffffff] rounded text-black focus:border-[#007e8f]"
                        />
                      </td>
                      <td className="border-2 border-[#ffffff] px-4 py-2">
                        <Input
                          type="number"
                          placeholder="75"
                          value={signosVitales.frecuenciaCardiaca.tarde}
                          onChange={(e) =>
                            handleSignoVitalChange('frecuenciaCardiaca', 'tarde', e.target.value)
                          }
                          className="w-full h-8 text-sm border-2 border-[#ffffff] rounded text-black focus:border-[#007e8f]"
                        />
                      </td>
                      <td className="border-2 border-[#ffffff] px-4 py-2">
                        <Input
                          type="number"
                          placeholder="70"
                          value={signosVitales.frecuenciaCardiaca.noche}
                          onChange={(e) =>
                            handleSignoVitalChange('frecuenciaCardiaca', 'noche', e.target.value)
                          }
                          className="w-full h-8 text-sm border-2 border-[#ffffff] rounded text-black focus:border-[#007e8f]"
                        />
                      </td>
                      <td className="text-[#595759] border-2 border-[#ffffff] px-4 py-2 text-center font-semibold">lpm</td>
                    </tr>

                    {/* SAT O2 */}
                    <tr className="hover:bg-gray-100 bg-[#f0f7f7]">
                      <td className="border-2 border-[#ffffff] px-4 py-2 font-semibold text-[#1c3f6e]">
                        <Heart size={16} className="inline mr-2 text-red-500" />
                        SAT O₂
                      </td>
                      <td className="border-2 border-[#ffffff] px-4 py-2">
                        <Input
                          type="number"
                          placeholder="98"
                          value={signosVitales.satO2.manana}
                          onChange={(e) =>
                            handleSignoVitalChange('satO2', 'manana', e.target.value)
                          }
                          className="w-full h-8 text-sm border-2 border-[#ffffff] rounded text-black focus:border-[#007e8f]"
                        />
                      </td>
                      <td className="border-2 border-[#ffffff] px-4 py-2">
                        <Input
                          type="number"
                          placeholder="97"
                          value={signosVitales.satO2.tarde}
                          onChange={(e) =>
                            handleSignoVitalChange('satO2', 'tarde', e.target.value)
                          }
                          className="w-full h-8 text-sm border-2 border-[#ffffff] rounded text-black focus:border-[#007e8f]"
                        />
                      </td>
                      <td className="border-2 border-[#ffffff] px-4 py-2">
                        <Input
                          type="number"
                          placeholder="98"
                          value={signosVitales.satO2.noche}
                          onChange={(e) =>
                            handleSignoVitalChange('satO2', 'noche', e.target.value)
                          }
                          className="w-full h-8 text-sm border-2 border-[#ffffff] rounded text-black focus:border-[#007e8f]"
                        />
                      </td>
                      <td className="text-[#595759] border-2 border-[#ffffff] px-4 py-2 text-center font-semibold">%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Actividades */}
              <div className="space-y-3 mt-6">
                <div>
                  <label className="block font-semibold text-[#595759] mb-1">ACTIVIDADES</label>
                  <Input
                    value={activTexto}
                    onChange={(e) => setActivTexto(e.target.value)}
                    className="w-full h-8 text-sm border-2 border-[#7cc4bc] rounded text-black focus:border-[#007e8f]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#595759] mb-1">OBSERVACIONES</label>
                  <Input
                    value={obseTexto}
                    onChange={(e) => setObseTexto(e.target.value)}
                    className="w-full h-8 text-sm border-2 border-[#7cc4bc] rounded text-black focus:border-[#007e8f]"
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
                    className="w-full h-8 text-sm border-2 border-[#7cc4bc] rounded text-black focus:border-[#007e8f]"
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

