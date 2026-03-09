import { useState, useEffect, useCallback } from 'react';

/**
 * Hook especializado para el formulario de Emergencia
 * Maneja todo el state del formulario médico
 */
export const useEmergenciaForm = (initialData = null) => {
  // STATE INICIAL DEL FORMULARIO
  const [formData, setFormData] = useState({
    // INSTITUCIÓN
    institucion: '', unidadOperativa: '', codUO: '', parroquiaInst: '', cantonInst: '', historiaClinica: '',
    // ADMISIÓN
    apellidoPaterno: '', apellidoMaterno: '', primerNombre: '', segundoNombre: '', cedula: '',
    direccion: '', barrio: '', parroquia: '', canton: '', provincia: '', telefono: '',
    fechaNacimiento: '', lugarNacimiento: '', nacionalidad: 'Ecuador', edad: '',
    genero: '', estadoCivil: '', instruccion: '', grupoOEtnia: '',
    fechaAdmision: '', ocupacion: '', empresa: '', tipoSeguro: '',
    referenciaOrigen: '', contactoEmergencia: '', dirContacto: '', telContacto: '',
    formaLlegada: '', fuenteInfo: '', institucionEntrega: '', telEntrega: '',
    // MOTIVO
    horaAtencion: '', trauma: '', causaClin: '', causaObst: '', causaQuir: '',
    grupoSanguineo: '', notificacionPolicia: '', otroMotivo: '', custodia: '',
    // ACCIDENTE
    fechaEvento: '', lugarEvento: '', direccionEvento: '',
    tiposEvento: [], aliento: '', alcocheck: '', obsAccidente: '',
    // ANTECEDENTES
    antecedentes: {}, antecedentesDescs: {},
    // ENFERMEDAD
    viaAerea: '', condicion: '', cronologia: '', localizacion: '', intensidad: '', factoresAgravan: '',
    // VITALES
    vitales: { pa: '', fc: '', fr: '', tempBucal: '', tempAxilar: '', peso: '', talla: '', saturacion: '' },
    glasgowOcular: '', glasgowVerbal: '', glasgowMotora: '',
    pupilaDer: '', pupilaIzq: '', llenado: '',
    // EXAMEN FÍSICO
    cpsp: {},
    // LESIONES
    activeLesionType: null, lesiones: [],
    // OBSTÉTRICA
    gestas: '', partos: '', abortos: '', cesareas: '', fum: '', semanas: '',
    movFetal: '', fcFetal: '', membranas: '', tiempoRotura: '', alturaUterina: '',
    presentacion: '', dilatacion: '', borramiento: '', plano: '', pelvisUtil: '',
    sangradoVaginal: '', contracciones: '',
    // EXÁMENES
    examenesMarcados: new Set(), comentariosExamenes: '',
    // DIAGNÓSTICOS
    diagIngreso: [], diagAlta: [],
    // TRATAMIENTO
    indicacionesGenerales: '', medicamentos: [],
    // ALTA
    destino: '', condicionAlta: '', diasIncapacidad: '', servicioRef: '', establecimientoRef: '',
    egresa: '', causaMuerte: '', codigoMuerte: '', fechaAlta: '', horaAlta: '', profesional: '', numeroHoja: ''
  });

  const [lesionCount, setLesionCount] = useState(0);
  const [diagIngCount, setDiagIngCount] = useState(0);
  const [diagAltaCount, setDiagAltaCount] = useState(0);
  const [medCount, setMedCount] = useState(0);
  const [glasgowTotal, setGlasgowTotal] = useState(0);

  // Inicializar fechas
  useEffect(() => {
    const now = new Date();
    setFormData(prev => ({
      ...prev,
      fechaAdmision: now.toISOString().slice(0, 16),
      horaAtencion: now.toTimeString().slice(0, 5),
      fechaAlta: now.toISOString().slice(0, 10),
      horaAlta: now.toTimeString().slice(0, 5)
    }));

    // Inicializar 3 diagnósticos de ingreso y alta, 4 medicamentos
    for (let i = 0; i < 3; i++) {
      addDiag('ing');
      addDiag('alta');
    }
    for (let i = 0; i < 4; i++) {
      addMed();
    }
  }, []);

  // Calcular Glasgow
  useEffect(() => {
    const o = parseInt(formData.glasgowOcular) || 0;
    const v = parseInt(formData.glasgowVerbal) || 0;
    const m = parseInt(formData.glasgowMotora) || 0;
    setGlasgowTotal(o + v + m);
  }, [formData.glasgowOcular, formData.glasgowVerbal, formData.glasgowMotora]);

  // HANDLERS GENERALES
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleVitalesChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      vitales: { ...prev.vitales, [field]: value }
    }));
  }, []);

  // ANTECEDENTES
  const toggleAntecedente = useCallback((num) => {
    setFormData(prev => {
      const newAnts = { ...prev.antecedentes };
      if (newAnts[num]) {
        delete newAnts[num];
        const newDescs = { ...prev.antecedentesDescs };
        delete newDescs[num];
        return { ...prev, antecedentes: newAnts, antecedentesDescs: newDescs };
      }
      newAnts[num] = true;
      return { ...prev, antecedentes: newAnts };
    });
  }, []);

  const updateAntecedentesDesc = useCallback((num, text) => {
    setFormData(prev => ({
      ...prev,
      antecedentesDescs: { ...prev.antecedentesDescs, [num]: text }
    }));
  }, []);

  // EXAMEN FÍSICO CP/SP
  const toggleCPSP = useCallback((region, type) => {
    setFormData(prev => {
      const currentState = prev.cpsp[region];
      if (currentState === type) {
        const newCpsp = { ...prev.cpsp };
        delete newCpsp[region];
        return { ...prev, cpsp: newCpsp };
      }
      return {
        ...prev,
        cpsp: { ...prev.cpsp, [region]: type }
      };
    });
  }, []);

  // LESIONES
  const selectLesionType = useCallback((n, label) => {
    setFormData(prev => ({
      ...prev,
      activeLesionType: { n, label }
    }));
  }, []);

  const placeMarker = useCallback((event, side, getZoneName) => {
    if (!formData.activeLesionType) {
      alert('Seleccione primero el tipo de lesión');
      return;
    }

    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();
    const svgW = rect.width, svgH = rect.height;
    const vbW = 120, vbH = 280;
    const scaleX = vbW / svgW, scaleY = vbH / svgH;
    const svgX = (event.clientX - rect.left) * scaleX;
    const svgY = (event.clientY - rect.top) * scaleY;
    const zoneName = getZoneName(svgX, svgY);

    const newId = lesionCount + 1;
    setLesionCount(newId);
    
    setFormData(prev => ({
      ...prev,
      lesiones: [...prev.lesiones, {
        id: newId,
        type: formData.activeLesionType,
        zone: zoneName,
        side,
        posX: ((event.clientX - rect.left) / svgW) * 100,
        posY: ((event.clientY - rect.top) / svgH) * 100
      }]
    }));
  }, [formData.activeLesionType, lesionCount]);

  const deleteLesion = useCallback((id) => {
    setFormData(prev => ({
      ...prev,
      lesiones: prev.lesiones.filter(l => l.id !== id)
    }));
  }, []);

  // EXÁMENES
  const toggleExam = useCallback((n) => {
    setFormData(prev => {
      const newSet = new Set(prev.examenesMarcados);
      newSet.has(n) ? newSet.delete(n) : newSet.add(n);
      return { ...prev, examenesMarcados: newSet };
    });
  }, []);

  // DIAGNÓSTICOS
  const addDiag = useCallback((type) => {
    if (type === 'ing') {
      setDiagIngCount(prev => prev + 1);
      setFormData(prev => ({
        ...prev,
        diagIngreso: [...prev.diagIngreso, {
          id: `diag-ing-${diagIngCount + 1}`,
          num: diagIngCount + 1,
          nombre: '',
          cie: '',
          status: null
        }]
      }));
    } else {
      setDiagAltaCount(prev => prev + 1);
      setFormData(prev => ({
        ...prev,
        diagAlta: [...prev.diagAlta, {
          id: `diag-alta-${diagAltaCount + 1}`,
          num: diagAltaCount + 1,
          nombre: '',
          cie: '',
          status: null
        }]
      }));
    }
  }, [diagIngCount, diagAltaCount]);

  const updateDiag = useCallback((type, id, field, value) => {
    const key = type === 'ing' ? 'diagIngreso' : 'diagAlta';
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].map(d => d.id === id ? { ...d, [field]: value } : d)
    }));
  }, []);

  const toggleDiagStatus = useCallback((type, id, status) => {
    const key = type === 'ing' ? 'diagIngreso' : 'diagAlta';
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].map(d => 
        d.id === id ? { ...d, status: d.status === status ? null : status } : d
      )
    }));
  }, []);

  const deleteDiag = useCallback((type, id) => {
    const key = type === 'ing' ? 'diagIngreso' : 'diagAlta';
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].filter(d => d.id !== id)
    }));
  }, []);

  // MEDICAMENTOS
  const addMed = useCallback(() => {
    setMedCount(prev => prev + 1);
    setFormData(prev => ({
      ...prev,
      medicamentos: [...prev.medicamentos, {
        id: `med-${medCount + 1}`,
        num: medCount + 1,
        nombre: '',
        posologia: ''
      }]
    }));
  }, [medCount]);

  const updateMed = useCallback((id, field, value) => {
    setFormData(prev => ({
      ...prev,
      medicamentos: prev.medicamentos.map(m => 
        m.id === id ? { ...m, [field]: value } : m
      )
    }));
  }, []);

  const deleteMed = useCallback((id) => {
    setFormData(prev => ({
      ...prev,
      medicamentos: prev.medicamentos.filter(m => m.id !== id)
    }));
  }, []);

  // UTILIDADES
  const getGlasgowInterpretation = () => {
    if (glasgowTotal >= 13) return { text: '✅ Leve (13-15)', color: '#2e7d32' };
    if (glasgowTotal >= 9) return { text: '⚠️ Moderado (9-12)', color: '#d69e2e' };
    if (glasgowTotal > 0) return { text: '🔴 Severo (≤8)', color: '#c8433a' };
    return { text: '', color: '' };
  };

  const reset = useCallback(() => {
    setFormData({
      institucion: '', unidadOperativa: '', codUO: '', parroquiaInst: '', cantonInst: '', historiaClinica: '',
      apellidoPaterno: '', apellidoMaterno: '', primerNombre: '', segundoNombre: '', cedula: '',
      direccion: '', barrio: '', parroquia: '', canton: '', provincia: '', telefono: '',
      fechaNacimiento: '', lugarNacimiento: '', nacionalidad: 'Ecuador', edad: '',
      genero: '', estadoCivil: '', instruccion: '', grupoOEtnia: '',
      fechaAdmision: '', ocupacion: '', empresa: '', tipoSeguro: '',
      referenciaOrigen: '', contactoEmergencia: '', dirContacto: '', telContacto: '',
      formaLlegada: '', fuenteInfo: '', institucionEntrega: '', telEntrega: '',
      horaAtencion: '', trauma: '', causaClin: '', causaObst: '', causaQuir: '',
      grupoSanguineo: '', notificacionPolicia: '', otroMotivo: '', custodia: '',
      fechaEvento: '', lugarEvento: '', direccionEvento: '',
      tiposEvento: [], aliento: '', alcocheck: '', obsAccidente: '',
      antecedentes: {}, antecedentesDescs: {},
      viaAerea: '', condicion: '', cronologia: '', localizacion: '', intensidad: '', factoresAgravan: '',
      vitales: { pa: '', fc: '', fr: '', tempBucal: '', tempAxilar: '', peso: '', talla: '', saturacion: '' },
      glasgowOcular: '', glasgowVerbal: '', glasgowMotora: '',
      pupilaDer: '', pupilaIzq: '', llenado: '',
      cpsp: {},
      activeLesionType: null, lesiones: [],
      gestas: '', partos: '', abortos: '', cesareas: '', fum: '', semanas: '',
      movFetal: '', fcFetal: '', membranas: '', tiempoRotura: '', alturaUterina: '',
      presentacion: '', dilatacion: '', borramiento: '', plano: '', pelvisUtil: '',
      sangradoVaginal: '', contracciones: '',
      examenesMarcados: new Set(), comentariosExamenes: '',
      diagIngreso: [], diagAlta: [],
      indicacionesGenerales: '', medicamentos: [],
      destino: '', condicionAlta: '', diasIncapacidad: '', servicioRef: '', establecimientoRef: '',
      egresa: '', causaMuerte: '', codigoMuerte: '', fechaAlta: '', horaAlta: '', profesional: '', numeroHoja: ''
    });
    setLesionCount(0);
    setDiagIngCount(0);
    setDiagAltaCount(0);
    setMedCount(0);
  }, []);

  return {
    // State
    formData,
    setFormData,
    glasgowTotal,
    lesionCount,
    diagIngCount,
    diagAltaCount,
    medCount,

    // Handlers generales
    handleInputChange,
    handleVitalesChange,

    // Antecedentes
    toggleAntecedente,
    updateAntecedentesDesc,

    // Examen físico
    toggleCPSP,

    // Lesiones
    selectLesionType,
    placeMarker,
    deleteLesion,

    // Exámenes
    toggleExam,

    // Diagnósticos
    addDiag,
    updateDiag,
    toggleDiagStatus,
    deleteDiag,

    // Medicamentos
    addMed,
    updateMed,
    deleteMed,

    // Utilidades
    getGlasgowInterpretation,
    reset
  };
};
