import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { NavBar } from '@/components/ui/tubelight-navbar';
import {
  createAdmision,
  getIngresoHistorialByAdmisionId,
  searchAdmisionesByField,
  updateAdmisionById,
} from '@/services/admisionesSupabaseService';
import { supabase } from '@/lib/supabaseClient.js';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  BadgeCheck,
  BedDouble,
  CalendarDays,
  Clock3,
  CreditCard,
  Edit3,
  FileText,
  HeartPulse,
  MapPin,
  Phone,
  Printer,
  Search,
  Shield,
  Stethoscope,
  User,
  Save,
} from 'lucide-react';

const shellCardClass =
  'rounded-[28px] border border-[#76c4d5]/20 bg-white/95 shadow-[0_50px_55px_-28px_rgba(89,87,89,0.35)] backdrop-blur-sm';

const sectionCardClass =
  'rounded-[24px] border border-[#76c4d5]/18 bg-gradient-to-br from-white to-[#f6fbfc] p-5 shadow-[0_18px_45px_-30px_rgba(118,196,213,0.5)]';

const inputClass =
  'h-11 rounded-xl border border-[#76c4d5]/25 bg-white text-[#595759] placeholder:text-[#595759]/45 transition-all duration-200 focus:border-[#69c9ba] focus-visible:ring-2 focus-visible:ring-[#76c4d5]/35';

const selectClass =
  'h-11 w-full rounded-xl border border-[#76c4d5]/25 bg-white px-4 text-sm text-[#595759] shadow-sm transition-all duration-200 outline-none focus:border-[#69c9ba] focus:ring-2 focus:ring-[#76c4d5]/35';

function Admision() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Datos principales');
  const [mainData, setMainData] = useState({
    firstName: '',
    firstName_lower: '',
    lastName: '',
    lastName_lower: '',
    idType: '',
    cedula: '',
    phone: '',
    gender: '',
    maritalStatus: '',
    servicio: '',
    ubicacion: {
      piso: '',
      habitacion: '',
    },
    seguro: '',
    medico: '',
  });
  const [secondaryData, setSecondaryData] = useState({
    nacionalidad: '',
    placeOfBirth: '',
    dateOfBirth: '',
    country: '',
    province: '',
    canton: '',
    direccion: '',
    calleprin: '',
    callesecun: '',
    numero: '',
    referencia: '',
    ocupacion: '',
    instituto: '',
    puesto: '',
    descripcion: '',
    correo: '',
  });
  const navItems = [
    { name: 'Datos principales' },
    { name: 'Datos complementarios' },
  ];
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [docId, setDocId] = useState(null);
  const [pacienteId, setPacienteId] = useState(null);
  const [ingresoHistorial, setIngresoHistorial] = useState([]);

  const handleMainChange = (e) => {
    const { name, value } = e.target;
    setMainData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSecondaryChange = (e) => {
    const { name, value } = e.target;
    setSecondaryData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMainSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = {
        mainData: {
          ...mainData,
          firstName_lower: mainData.firstName.toLowerCase(),
          lastName_lower: mainData.lastName.toLowerCase(),
        },
        admitido: false,
        createdAt: new Date().toISOString(),
      };

      if (docId) {
        await updateAdmisionById(docId, dataToSave);
        alert('✅ DATOS DEL PACIENTE ACTUALIZADOS');
      } else {
        const docRef = await createAdmision({
          ...dataToSave,
          pacienteId,
        });

        setDocId(docRef.id);
        setPacienteId(docRef.pacienteId || pacienteId || null);
        alert('✅ PACIENTE CREADO CORRECTAMENTE');
      }
    } catch (error) {
      console.error('Supabase error:', error);
      alert(`❌ Error al guardar datos principales: ${error?.message || 'Error desconocido'}`);
    }
  };

  const handleSecondarySubmit = async (e) => {
    e.preventDefault();
    if (!docId) {
      alert('Primero guarda los datos principales');
      return;
    }
    try {
      await updateAdmisionById(docId, {
        secondaryData,
      });
      setMainData({
        firstName: '',
        lastName: '',
        idType: '',
        cedula: '',
        idNumber: '',
        phone: '',
        gender: '',
        maritalStatus: '',
        servicio: '',
        ubicacion: {
          piso: '',
          habitacion: '',
        },
        insurance: '',
        medico: '',
      });

      setSecondaryData({
        nacionalidad: '',
        placeOfBirth: '',
        dateOfBirth: '',
        country: '',
        province: '',
        canton: '',
        direccion: '',
        calleprin: '',
        callesecun: '',
        numero: '',
        referencia: '',
        ocupacion: '',
        instituto: '',
        puesto: '',
        descripcion: '',
        correo: '',
      });
      setDocId(null);
      setPacienteId(null);
      setActiveTab('Datos principales');

      alert('✅ Datos complementarios guardados');
    } catch (error) {
      console.error('Supabase error:', error.code, error.message);
      alert(`❌ Error al guardar datos complementarios: ${error?.message || 'Error desconocido'}`);
    }
  };

  const handleAdmitirPaciente = async () => {
    if (!docId) {
      alert('Primero debes guardar los datos del paciente');
      return;
    }
    try {
      const { data: admisionActual, error: admisionError } = await supabase
        .from('admisiones')
        .select('id, paciente_id, estado, motivo, diagnostico')
        .eq('id', docId)
        .single();

      if (admisionError || !admisionActual?.paciente_id) {
        throw admisionError || new Error('No se encontró la admisión actual');
      }

      const nowIso = new Date().toISOString();
      const newAdmision = {
        paciente_id: admisionActual.paciente_id,
        fecha_ingreso: nowIso,
        estado: admisionActual.estado || 'Espera',
        motivo: admisionActual.motivo || null,
        diagnostico: admisionActual.diagnostico || null,
        admitido: true,
        created_at: nowIso,
      };

      const { data: insertedRows, error: insertError } = await supabase
        .from('admisiones')
        .insert([newAdmision])
        .select();

      if (insertError) {
        throw insertError;
      }

      const nuevaAdmision = Array.isArray(insertedRows) ? insertedRows[0] : null;
      if (nuevaAdmision?.id) {
        setDocId(nuevaAdmision.id);
        setPacienteId(nuevaAdmision.paciente_id || admisionActual.paciente_id);
      }

      alert('✅ Paciente admitido correctamente');
    } catch (error) {
      console.error(error);
      alert(`❌ Error al admitir paciente: ${error?.message || 'Error desconocido'}`);
    }
  };

  const searchPatients = async (text, field) => {
    if (!text || text.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const searchText = text.toLowerCase();
      const results = await searchAdmisionesByField(field, searchText);
      setSearchResults(Array.isArray(results) ? results : []);
    } catch (error) {
      console.error('Error buscando pacientes en admisiones:', error);
      setSearchResults([]);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadIngresoHistorial = async () => {
      if (!docId) return;

      try {
        const historial = await getIngresoHistorialByAdmisionId(docId);
        if (!historial.length) {
          console.log('📋 Historial de Ingresos: No hay registros');
          setIngresoHistorial([]);
          return;
        }

        console.log('✅ Historial de Ingresos cargado:', historial);
        setIngresoHistorial(historial);
      } catch (error) {
        console.error('Error al cargar historial de ingresos:', error);
      }
    };
    loadIngresoHistorial();
  }, [docId]);

  const handleDayClick = (day) => {
    navigate(`/cita?day=${day}&year=${selectedYear}`);
  };

  const formattedDate = time.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = time.toLocaleTimeString('es-ES');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(118,196,213,0.24),_transparent_34%),linear-gradient(180deg,_#f4fbfc_0%,_#ffffff_44%,_#f8fcfb_100%)] px-4 py-5 md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col">
<div className="">
          <Button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="  w-fit rounded-2xl bg-[#595759] px-3 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.1 hover:bg-[#4a484a]"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver
                </Button>
                </div>
        <header className={cn(shellCardClass, 'overflow-hidden p-3 md:p-4')}>
           
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#76c4d5] via-[#69c9ba] to-[#4ea685]" />
          <div className="relative flex flex-col gap-5">
            <div className="flex flex-col gap-1 lg:flex-row lg:items-start lg:justify-between">
             


              <div className="grid grid-cols-1 gap-[3rem] sm:grid-cols-2 xl:grid-cols-5">
                
              
                
                <div className="space-y-9">
                  <div className="inline-flex w-fit mt-6 items-center text-center rounded-full border border-[#76c4d5]/25 bg-[#76c4d5]/10 px-2 py-5 text-[19px] font-bold uppercase tracking-[0.001em] text-[#595759]">
                    <HeartPulse className="h-6 w-6" />
                    Admisión Clínica
                  </div>
                  
                </div>
              

                <MetricCard
                  icon={User}
                  label="Paciente"
                  value={
                    mainData.firstName || mainData.lastName
                      ? `${mainData.firstName} ${mainData.lastName}`.trim()
                      : 'Sin registrar'
                  }
                />
                
                <MetricCard icon={CalendarDays} label="Fecha" value={formattedDate} />
               
                <MetricCard
                  icon={BadgeCheck}
                  label="Estado"
                  value={docId ? 'Registro en edición' : 'Nuevo ingreso'}
                />
                
                <MetricCard
                  icon={FileText}
                  label="Historial"
                  value={`${ingresoHistorial.length || 0} ingresos`}
                />
              </div>
            </div>
          </div>
        </header>

        <main className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <div className={cn(shellCardClass, 'overflow-hidden')}>
              <div className="bg-gradient-to-r from-[#76c4d5] via-[#69c9ba] to-[#4ea685] p-3 text-white">
                <div className="flex items-center gap-2">
                  <div className="rounded-2xl bg-white/20 p-2 backdrop-blur-sm">
                    <Clock3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
                      Hora actual
                    </p>
                    <p className="text-[19px] font-black tracking-wide">{formattedTime}</p>
                  </div>
                </div>
                <p className="mt-1 text-[14px] font-medium uppercase tracking-wide text-white/90">
                  {formattedDate}
                </p>
              </div>

              <div className="space-y-3 p-3">
                <div className="rounded-[22px] border border-[#76c4d5]/15 bg-[#f7fbfc] p-1">
                  <img
                    src="https://clinicas-atlas.com/wp-content/uploads/2024/11/clinicas-atlas-ecuador.png"
                    alt="Logo Clinica Atlas"
                    className="h-auto w-44"
                  />
                 
                </div>

                <div className="overflow-hidden rounded-[18px] border border-[#76c4d5]/15 bg-white">
                  <img
                    src="https://static.vecteezy.com/system/resources/previews/004/996/073/non_2x/face-recognition-and-identification-line-icon-face-id-line-icon-facial-scan-and-identification-facial-recognition-system-sign-biometric-facial-detection-pictogram-illustration-vector.jpg"
                    alt="Referencia visual de identificación"
                    className="h-40 w-48 object-cover"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <StatusChip icon={BadgeCheck} label="Documento" value={docId ? 'Activo' : 'Pendiente'} />
                  <StatusChip icon={Shield} label="Paciente ID" value={pacienteId ? 'Asignado' : 'Sin ID'} />
                  <StatusChip icon={Search} label="Resultados" value={`${searchResults.length}`} />
                  <StatusChip icon={BedDouble} label="Ubicación" value={mainData.ubicacion?.habitacion || 'Sin asignar'} />
                </div>
              </div>
            </div>

            <div className={cn(shellCardClass, 'p-5')}>
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-[#76c4d5]/12 p-3 text-[#4ea685]">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#595759]">Acciones rápidas</h2>
                  <p className="text-xs text-[#595759]/60">Accesos directos sin cambiar el flujo actual.</p>
                </div>
              </div>

              <div className="space-y-3">
                <SidebarActionButton
                  icon={Edit3}
                  label="Editar"
                  onClick={() =>
                    toast({
                      title: '🚧 Esta función no está implementada aún.',
                    })
                  }
                />
                <SidebarActionButton
                  icon={Save}
                  label="Guardar"
                  onClick={() =>
                    toast({
                      title: '🚧 Esta función no está implementada aún.',
                    })
                  }
                />
                <SidebarActionButton
                  icon={CreditCard}
                  label="Datos de facturación"
                  onClick={() =>
                    toast({
                      title: '🚧 Esta función no está implementada aún.',
                    })
                  }
                />
                <SidebarActionButton
                  icon={Printer}
                  label="Imprimir"
                  onClick={() =>
                    toast({
                      title: '🚧 Esta función no está implementada aún.',
                    })
                  }
                />
                <Button
                  type="button"
                  onClick={handleAdmitirPaciente}
                  className="h-12 w-full rounded-2xl bg-gradient-to-r from-[#4ea685] to-[#69c9ba] text-sm font-semibold text-white shadow-[0_16px_30px_-18px_rgba(78,166,133,0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:from-[#459778] hover:to-[#5cbbaa]"
                >
                  <HeartPulse className="mr-2 h-4 w-4" />
                  Admitir paciente
                </Button>
              </div>
            </div>
          </aside>

          <section className={cn(shellCardClass, 'p-5 md:p-6')}>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#69c9ba]">
                    Expediente de ingreso
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-[#595759]">Formulario de admisión</h2>
                 
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <MiniInfoCard
                    icon={Phone}
                    label="Contacto"
                    value={mainData.phone || 'No registrado'}
                  />
                  <MiniInfoCard
                    icon={Stethoscope}
                    label="Servicio"
                    value={mainData.servicio || 'Sin selección'}
                  />
                  <MiniInfoCard
                    icon={MapPin}
                    label="Ubicación"
                    value={mainData.ubicacion?.habitacion || 'Pendiente'}
                  />
                </div>
              </div>

              <div className="rounded-[24px] border border-[#595759]/90 bg-[#69c9ba]/20 p-3">
                <NavBar
                  items={navItems}
                  className="!static !left-auto !top-auto !mb-0 !translate-x-0 sm:!pt-0 [&>div]:!mt-0 [&>div]:!w-full [&>div]:!justify-center [&>div]:!gap-2 [&>div]:!rounded-[18px] [&>div]:!border-[#76c4d5]/20 [&>div]:!bg-[#4ea685]/50 [&>div]:!px-2 [&>div]:!py-2 [&>div]:!shadow-none"
                  onChange={setActiveTab}
                />
              </div>

              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                {activeTab === 'Datos principales' && (
                  <form onSubmit={handleMainSubmit} className="space-y-6 text-black">
                    <div className="grid gap-6 2xl:grid-cols-[1.7fr_1fr]">
                      <div className="space-y-6">
                        <div className={sectionCardClass}>
                          <SectionHeader
                            icon={User}
                            title="Identificación del paciente"
                            subtitle="Datos básicos para localizar, validar y recuperar el registro."
                          />

                          <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <FieldShell
                              icon={User}
                              label="Nombres"
                              hint="La búsqueda se activa mientras escribes."
                            >
                              <Input
                                type="text"
                                name="firstName"
                                placeholder="Nombres"
                                value={mainData.firstName}
                                onChange={(e) => {
                                  handleMainChange(e);
                                  searchPatients(e.target.value, 'firstName_lower');
                                }}
                                className={inputClass}
                              />
                            </FieldShell>

                            <FieldShell
                              icon={User}
                              label="Apellidos"
                              hint="Busca coincidencias por apellido."
                            >
                              <Input
                                type="text"
                                name="lastName"
                                placeholder="Apellidos"
                                value={mainData.lastName}
                                onChange={(e) => {
                                  handleMainChange(e);
                                  searchPatients(e.target.value, 'lastName_lower');
                                }}
                                className={inputClass}
                              />
                            </FieldShell>
                          </div>

                          {searchResults.length > 0 && (
                            <div className="mt-4 rounded-[20px] border border-[#76c4d5]/20 bg-white p-2 shadow-sm">
                              <div className="mb-2 flex items-center gap-2 px-3 pt-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#69c9ba]">
                                <Search className="h-4 w-4" />
                                Coincidencias encontradas
                              </div>
                              <div className="max-h-48 space-y-2 overflow-y-auto px-1 pb-1">
                                {searchResults.map((patient) => (
                                  <button
                                    key={patient.id || patient.pacienteId}
                                    type="button"
                                    className="w-full rounded-2xl border border-transparent bg-[#f7fbfc] px-4 py-3 text-left transition-all duration-200 hover:border-[#76c4d5]/25 hover:bg-[#eef8fa]"
                                    onClick={() => {
                                      setMainData((prev) => ({
                                        ...prev,
                                        ...patient.mainData,
                                        ubicacion: {
                                          piso: patient.mainData?.ubicacion?.piso || '',
                                          habitacion: patient.mainData?.ubicacion?.habitacion || '',
                                        },
                                      }));
                                      setSecondaryData(patient.secondaryData || {});
                                      setDocId(patient.id);
                                      setPacienteId(patient.pacienteId || null);
                                      setSearchResults([]);
                                    }}
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <div>
                                        <p className="font-semibold text-[#595759]">
                                          {patient.mainData.firstName} {patient.mainData.lastName}
                                        </p>
                                        <p className="text-sm text-[#595759]/62">
                                          {patient.mainData.cedula}
                                        </p>
                                      </div>
                                      <BadgeCheck className="h-5 w-5 text-[#4ea685]" />
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <FieldShell icon={Shield} label="Tipo de identificación">
                              <select
                                name="idType"
                                value={mainData.idType}
                                onChange={handleMainChange}
                                className={selectClass}
                              >
                                <option value="Cedula">Cédula</option>
                                <option value="Pasaporte">Pasaporte</option>
                                <option value="Temporal">Temporal</option>
                              </select>
                            </FieldShell>

                            <FieldShell icon={FileText} label="Número de identificación">
                              <Input
                                type="text"
                                name="cedula"
                                placeholder="(Cedula)"
                                value={mainData.cedula}
                                onChange={(e) => {
                                  handleMainChange(e);
                                  searchPatients(e.target.value, 'cedula');
                                }}
                                className={inputClass}
                              />
                            </FieldShell>

                            <FieldShell icon={Phone} label="Teléfono">
                              <Input
                                type="text"
                                name="phone"
                                placeholder="Telefono"
                                value={mainData.phone}
                                onChange={handleMainChange}
                                className={inputClass}
                              />
                            </FieldShell>

                            <FieldShell icon={User} label="Género">
                              <select
                                name="gender"
                                value={mainData.gender}
                                onChange={handleMainChange}
                                className={selectClass}
                              >
                                <option value="Masculino">Hombre</option>
                                <option value="Femenino">Mujer</option>
                                <option value="Otro">Otro</option>
                              </select>
                            </FieldShell>
                          </div>
                        </div>

                        <div className={sectionCardClass}>
                          <SectionHeader
                            icon={Stethoscope}
                            title="Perfil clínico y cobertura"
                            subtitle="Información relevante para la gestión médica y administrativa."
                          />

                          <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <FieldShell icon={BadgeCheck} label="Estado civil">
                              <select
                                name="maritalStatus"
                                value={mainData.maritalStatus}
                                onChange={handleMainChange}
                                className={selectClass}
                              >
                                <option value="">Estado Civil</option>
                                <option value="Single">Soltero</option>
                                <option value="Married">Casado</option>
                                <option value="Divorced">Divorciado</option>
                                <option value="Widowed">Apegado</option>
                              </select>
                            </FieldShell>

                            <FieldShell icon={Shield} label="Seguro médico">
                              <Input
                                type="text"
                                name="seguro"
                                placeholder="Seguro Médico"
                                value={mainData.seguro}
                                onChange={handleMainChange}
                                className={inputClass}
                              />
                            </FieldShell>

                            <FieldShell
                              icon={Stethoscope}
                              label="Médico tratante"
                              className="md:col-span-2"
                            >
                              <Input
                                type="text"
                                name="medico"
                                placeholder="MEDICO TRATANTE"
                                value={mainData.medico}
                                onChange={handleMainChange}
                                className={inputClass}
                              />
                            </FieldShell>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className={sectionCardClass}>
                          <SectionHeader
                            icon={MapPin}
                            title="Asignación hospitalaria"
                            subtitle="Define servicio, piso y habitación del ingreso."
                          />

                          <div className="mt-5 space-y-4">
                            <FieldShell icon={BedDouble} label="Servicio">
                              <select
                                name="servicio"
                                value={mainData.servicio}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setMainData((prev) => ({
                                    ...prev,
                                    servicio: value,
                                    ubicacion: {
                                      piso: '',
                                      habitacion: '',
                                    },
                                  }));
                                }}
                                className={selectClass}
                              >
                                <option value="EMERGENCIA">EMERGENCIA</option>
                                <option value="HOSPITAL DIA">HOSPITAL DEL DÍA</option>
                                <option value="HOSPITALIZACION">HOSPITALIZACIÓN</option>
                                <option value="UCI">UCI</option>
                                <option value="UCI PEDIATRICA">UCI PEDIATRICA</option>
                                <option value="NEONATOLOGÍA">NEONATOLOGÍA</option>
                              </select>
                            </FieldShell>

                            {mainData.servicio === 'EMERGENCIA' && (
                              <FieldShell icon={MapPin} label="Habitación">
                                <select
                                  value={mainData.ubicacion.habitacion}
                                  onChange={(e) =>
                                    setMainData((prev) => ({
                                      ...prev,
                                      ubicacion: {
                                        ...prev.ubicacion,
                                        habitacion: e.target.value,
                                      },
                                    }))
                                  }
                                  className={selectClass}
                                >
                                  <option value="">Seleccione habitación</option>
                                  <option value="CUBICULO 1">CUBICULO-1</option>
                                  <option value="CUBICULO 2">CUBICULO-2</option>
                                  <option value="CUBICULO 3">CUBICULO-3</option>
                                  <option value="CUBICULO 4">CUBICULO-4</option>
                                  <option value="CUBICULO 5">CUBICULO-5</option>
                                  <option value="CUBICULO 6">CUBICULO-6</option>
                                  <option value="CUBICULO 7">CUBICULO-7</option>
                                </select>
                              </FieldShell>
                            )}

                            {mainData.servicio === 'HOSPITAL DIA' && (
                              <FieldShell icon={MapPin} label="Habitación">
                                <select
                                  value={mainData.ubicacion.habitacion}
                                  onChange={(e) =>
                                    setMainData((prev) => ({
                                      ...prev,
                                      ubicacion: {
                                        ...prev.ubicacion,
                                        habitacion: e.target.value,
                                      },
                                    }))
                                  }
                                  className={selectClass}
                                >
                                  <option value="">Seleccione habitación</option>
                                  <option value="HD-01">HD-1</option>
                                  <option value="HD-02">HD-2</option>
                                  <option value="HD-03">HD-3</option>
                                  <option value="HD-03">HD-4</option>
                                  <option value="HD-03">HD-5</option>
                                  <option value="HD-03">HD-6</option>
                                </select>
                              </FieldShell>
                            )}

                            {mainData.servicio === 'HOSPITALIZACION' && (
                              <FieldShell icon={MapPin} label="Piso">
                                <select
                                  value={mainData.ubicacion.piso}
                                  onChange={(e) => {
                                    setMainData((prev) => ({
                                      ...prev,
                                      ubicacion: {
                                        ...prev.ubicacion,
                                        piso: e.target.value,
                                        habitacion: '',
                                      },
                                    }));
                                  }}
                                  className={selectClass}
                                >
                                  <option value="">Seleccione el Piso</option>
                                  <option value="1">Primer Piso</option>
                                  <option value="2">Segundo Piso</option>
                                  <option value="3">Tercer Piso</option>
                                </select>
                              </FieldShell>
                            )}

                            {mainData.servicio === 'HOSPITALIZACION' && mainData.ubicacion.piso && (
                              <FieldShell icon={BedDouble} label="Habitación">
                                <select
                                  value={mainData.ubicacion.habitacion}
                                  onChange={(e) => {
                                    setMainData((prev) => ({
                                      ...prev,
                                      ubicacion: {
                                        ...prev.ubicacion,
                                        habitacion: e.target.value,
                                      },
                                    }));
                                  }}
                                  className={selectClass}
                                >
                                  <option value="">Seleccione la habitación</option>
                                  <option value={`HAB ${mainData.ubicacion.piso}-1`}>
                                    HAB {mainData.ubicacion.piso}-1
                                  </option>
                                  <option value={`HAB ${mainData.ubicacion.piso}-2`}>
                                    HAB {mainData.ubicacion.piso}-2
                                  </option>
                                  <option value={`HAB ${mainData.ubicacion.piso}-3`}>
                                    HAB {mainData.ubicacion.piso}-3
                                  </option>
                                  <option value={`HAB ${mainData.ubicacion.piso}-4`}>
                                    HAB {mainData.ubicacion.piso}-4
                                  </option>
                                  <option value={`HAB ${mainData.ubicacion.piso}-5`}>
                                    HAB {mainData.ubicacion.piso}-5
                                  </option>
                                </select>
                              </FieldShell>
                            )}

                            {mainData.servicio === 'UCI' && (
                              <FieldShell icon={BedDouble} label="Habitación">
                                <select
                                  value={mainData.ubicacion.habitacion}
                                  onChange={(e) =>
                                    setMainData((prev) => ({
                                      ...prev,
                                      ubicacion: {
                                        ...prev.ubicacion,
                                        habitacion: e.target.value,
                                      },
                                    }))
                                  }
                                  className={selectClass}
                                >
                                  <option value="">Seleccione habitación</option>
                                  <option value="UCI-1">UCI-1</option>
                                  <option value="UCI-2">UCI-2</option>
                                  <option value="UCI-3">UCI-3</option>
                                  <option value="UCI-4">UCI-4</option>
                                </select>
                              </FieldShell>
                            )}

                            {mainData.servicio === 'UCI PEDIATRICA' && (
                              <FieldShell icon={BedDouble} label="Habitación">
                                <select
                                  value={mainData.ubicacion.habitacion}
                                  onChange={(e) =>
                                    setMainData((prev) => ({
                                      ...prev,
                                      ubicacion: {
                                        ...prev.ubicacion,
                                        habitacion: e.target.value,
                                      },
                                    }))
                                  }
                                  className={selectClass}
                                >
                                  <option value="">Seleccione habitación</option>
                                  <option value="UCI PEDIATRICA-1">UCI PEDIATRICA-1</option>
                                  <option value="UCI PEDIATRICA-2">UCI PEDIATRICA-2</option>
                                  <option value="UCI PEDIATRICA-3">UCI PEDIATRICA-3</option>
                                  <option value="UCI PEDIATRICA-4">UCI PEDIATRICA-4</option>
                                </select>
                              </FieldShell>
                            )}

                            {mainData.servicio === 'NEONATOLOGÍA' && (
                              <FieldShell icon={BedDouble} label="Habitación">
                                <select
                                  value={mainData.ubicacion.habitacion}
                                  onChange={(e) =>
                                    setMainData((prev) => ({
                                      ...prev,
                                      ubicacion: {
                                        ...prev.ubicacion,
                                        habitacion: e.target.value,
                                      },
                                    }))
                                  }
                                  className={selectClass}
                                >
                                  <option value="">Seleccione habitación</option>
                                  <option value="NEO-1">NEO-1</option>
                                  <option value="NEO-2">NEO-2</option>
                                  <option value="NEO-3">NEO-3</option>
                                  <option value="NEO-4">NEO-4</option>
                                  <option value="NEO-5">NEO-5</option>
                                  <option value="NEO-6">NEO-6</option>
                                </select>
                              </FieldShell>
                            )}
                          </div>
                        </div>

                        <div className="rounded-[24px] border border-[#4ea685]/18 bg-gradient-to-br from-[#f7fffc] to-white p-5 shadow-[0_18px_42px_-32px_rgba(78,166,133,0.65)]">
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#4ea685]">
                            Estado del registro
                          </p>
                          <div className="mt-4 space-y-3 text-sm text-[#595759]">
                            <InfoRow label="Documento actual" value={docId ? 'Disponible' : 'Sin guardar'} />
                            <InfoRow label="Paciente" value={pacienteId ? 'Relacionado' : 'Pendiente'} />
                            <InfoRow
                              label="Búsqueda"
                              value={searchResults.length > 0 ? 'Coincidencias activas' : 'Sin resultados visibles'}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="h-12 rounded-2xl bg-gradient-to-r from-[#76c4d5] via-[#69c9ba] to-[#4ea685] px-6 text-sm font-semibold text-white shadow-[0_18px_35px_-18px_rgba(78,166,133,0.78)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-95"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Guardar datos principales
                      </Button>
                    </div>
                  </form>
                )}
                {activeTab === 'Datos complementarios' && (
                  <form onSubmit={handleSecondarySubmit} className="space-y-6 text-black">
                    <div className="grid gap-6 xl:grid-cols-2">
                      <div className={sectionCardClass}>
                        <SectionHeader
                          icon={User}
                          title="Información personal"
                          subtitle="Datos de origen, nacimiento y contacto general del paciente."
                        />

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                          <FieldShell icon={Shield} label="Nacionalidad">
                            <Input
                              type="text"
                              name="nacionalidad"
                              placeholder="Nacionalidad"
                              value={secondaryData.nacionalidad}
                              onChange={handleSecondaryChange}
                              className={inputClass}
                            />
                          </FieldShell>

                          <FieldShell icon={MapPin} label="Lugar de nacimiento">
                            <Input
                              type="text"
                              name="placeOfBirth"
                              placeholder="Lugar de Nacimiento"
                              value={secondaryData.placeOfBirth}
                              onChange={handleSecondaryChange}
                              className={inputClass}
                            />
                          </FieldShell>

                          <FieldShell icon={CalendarDays} label="Fecha de nacimiento">
                            <Input
                              type="date"
                              name="dateOfBirth"
                              value={secondaryData.dateOfBirth}
                              onChange={handleSecondaryChange}
                              className={inputClass}
                            />
                          </FieldShell>

                          <FieldShell icon={MapPin} label="País">
                            <Input
                              type="text"
                              name="country"
                              placeholder="País"
                              value={secondaryData.country}
                              onChange={handleSecondaryChange}
                              className={inputClass}
                            />
                          </FieldShell>

                          <FieldShell icon={MapPin} label="Provincia">
                            <Input
                              type="text"
                              name="province"
                              placeholder="Provincia"
                              value={secondaryData.province}
                              onChange={handleSecondaryChange}
                              className={inputClass}
                            />
                          </FieldShell>

                          <FieldShell icon={MapPin} label="Cantón">
                            <Input
                              type="text"
                              name="canton"
                              placeholder="Cantón"
                              value={secondaryData.canton}
                              onChange={handleSecondaryChange}
                              className={inputClass}
                            />
                          </FieldShell>

                          <FieldShell icon={MapPin} label="Dirección" className="md:col-span-2">
                            <Input
                              type="text"
                              name="direccion"
                              placeholder="Dirección"
                              value={secondaryData.direccion}
                              onChange={handleSecondaryChange}
                              className={inputClass}
                            />
                          </FieldShell>

                          <FieldShell icon={MapPin} label="Calle principal">
                            <Input
                              type="text"
                              name="calleprin"
                              placeholder="Calle Principal"
                              value={secondaryData.calleprin}
                              onChange={handleSecondaryChange}
                              className={inputClass}
                            />
                          </FieldShell>

                          <FieldShell icon={MapPin} label="Calle secundaria">
                            <Input
                              type="text"
                              name="callesecun"
                              placeholder="Calle Secundaria"
                              value={secondaryData.callesecun}
                              onChange={handleSecondaryChange}
                              className={inputClass}
                            />
                          </FieldShell>

                          <FieldShell icon={FileText} label="Número">
                            <Input
                              type="text"
                              name="numero"
                              placeholder="Numero"
                              value={secondaryData.numero}
                              onChange={handleSecondaryChange}
                              className={inputClass}
                            />
                          </FieldShell>

                          <FieldShell icon={FileText} label="Referencia">
                            <Input
                              type="text"
                              name="referencia"
                              placeholder="Referencia"
                              value={secondaryData.referencia}
                              onChange={handleSecondaryChange}
                              className={inputClass}
                            />
                          </FieldShell>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className={sectionCardClass}>
                          <SectionHeader
                            icon={Stethoscope}
                            title="Información laboral y contacto"
                            subtitle="Contexto ocupacional del paciente y datos complementarios."
                          />

                          <div className="mt-5 grid gap-4">
                            <FieldShell icon={FileText} label="Ocupación">
                              <Input
                                type="text"
                                name="ocupacion"
                                placeholder="Ocupación"
                                value={secondaryData.ocupacion}
                                onChange={handleSecondaryChange}
                                className={inputClass}
                              />
                            </FieldShell>

                            <FieldShell icon={FileText} label="Instituto o empresa">
                              <Input
                                type="text"
                                name="instituto"
                                placeholder="Insituto/Empresa:"
                                value={secondaryData.instituto}
                                onChange={handleSecondaryChange}
                                className={inputClass}
                              />
                            </FieldShell>

                            <FieldShell icon={BadgeCheck} label="Puesto de trabajo">
                              <Input
                                type="text"
                                name="puesto"
                                placeholder="Puesto de trabajo Paciente:"
                                value={secondaryData.puesto}
                                onChange={handleSecondaryChange}
                                className={inputClass}
                              />
                            </FieldShell>

                            <FieldShell icon={Stethoscope} label="Descripción laboral">
                              <Input
                                type="text"
                                name="descripcion"
                                placeholder="Descripción Laboral:"
                                value={secondaryData.descripcion}
                                onChange={handleSecondaryChange}
                                className={inputClass}
                              />
                            </FieldShell>

                            <FieldShell icon={Phone} label="Correo electrónico">
                              <Input
                                type="text"
                                name="correo"
                                placeholder="Correo Electrónico:"
                                value={secondaryData.correo}
                                onChange={handleSecondaryChange}
                                className={inputClass}
                              />
                            </FieldShell>
                          </div>
                        </div>

                        <div className="rounded-[24px] border border-[#76c4d5]/18 bg-gradient-to-br from-[#eef8fa] to-white p-5 shadow-[0_18px_42px_-32px_rgba(118,196,213,0.65)]">
                          <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-white p-3 text-[#69c9ba] shadow-sm">
                              <BadgeCheck className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#595759]">
                                Guardado complementario
                              </p>
                              <p className="text-xs text-[#595759]/62">
                                Debe existir un registro principal antes de guardar esta sección.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={!docId}
                        className={cn(
                          'h-12 rounded-2xl px-6 text-sm font-semibold text-white shadow-[0_18px_35px_-18px_rgba(78,166,133,0.78)] transition-all duration-200',
                          docId
                            ? 'bg-gradient-to-r from-[#76c4d5] via-[#69c9ba] to-[#4ea685] hover:-translate-y-0.5 hover:brightness-95'
                            : 'bg-gray-400'
                        )}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Guardar datos complementarios
                      </Button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Admision;

const MetricCard = ({ icon: Icon, label, value }) => (
  <div className="min-w-[180px] rounded-[22px] border border-[#76c4d5]/18 bg-gradient-to-br from-white to-[#f6fbfc] p-4">
    <div className="flex items-center gap-3">
      <div className="rounded-2xl bg-[#76c4d5]/12 p-3 text-[#4ea685]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#69c9ba]">{label}</p>
        <p className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-[#595759]">{value}</p>
      </div>
    </div>
  </div>
);

const StatusChip = ({ icon: Icon, label, value }) => (
  <div className="rounded-[20px] border border-[#76c4d5]/16 bg-[#f8fcfc] p-3">
    <div className="flex items-center gap-2 text-[#69c9ba]">
      <Icon className="h-4 w-4" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">{label}</span>
    </div>
    <p className="mt-2 text-sm font-semibold text-[#595759]">{value}</p>
  </div>
);

const SidebarActionButton = ({ icon: Icon, label, onClick }) => (
  <Button
    type="button"
    onClick={onClick}
    className="h-12 w-full justify-start rounded-2xl border border-[#76c4d5]/18 bg-[#f7fbfc] px-4 text-sm font-semibold text-[#595759] shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#eef8fa]"
  >
    <span className="mr-3 rounded-xl bg-white p-2 text-[#69c9ba] shadow-sm">
      <Icon className="h-4 w-4" />
    </span>
    {label}
  </Button>
);

const MiniInfoCard = ({ icon: Icon, label, value }) => (
  <div className="rounded-[18px] border border-[#76c4d5]/16 bg-white px-4 py-3">
    <div className="flex items-center gap-2 text-[#69c9ba]">
      <Icon className="h-4 w-4" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">{label}</span>
    </div>
    <p className="mt-2 text-sm font-semibold text-[#595759]">{value}</p>
  </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-start gap-4">
    <div className="rounded-[22px] bg-gradient-to-br from-[#76c4d5]/18 to-[#69c9ba]/20 p-3 text-[#4ea685] shadow-sm">
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <h3 className="text-lg font-bold text-[#595759]">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-[#595759]/65">{subtitle}</p>
    </div>
  </div>
);

const FieldShell = ({ icon: Icon, label, hint, children, className }) => (
  <div className={cn('space-y-2', className)}>
    <div className="flex items-center gap-2 text-[#595759]">
      <span className="rounded-xl bg-[#76c4d5]/12 p-2 text-[#69c9ba]">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-sm font-semibold">{label}</p>
        {hint ? <p className="text-xs text-[#595759]/55">{hint}</p> : null}
      </div>
    </div>
    {children}
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#4ea685]/10 bg-white/80 px-4 py-3">
    <span className="text-[#595759]/68">{label}</span>
    <span className="font-semibold text-[#595759]">{value}</span>
  </div>
);
