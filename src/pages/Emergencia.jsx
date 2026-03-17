import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, ChevronDown } from 'lucide-react';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { EmergenciaPDF } from '../components/EmergenciaPDF';
import { Button } from '@/components/ui/button';

 const Emergencia = () => {
  // ========== ESTADO PRINCIPAL ==========
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

  const [showToast, setShowToast] = useState(false);
  const [glasgowTotal, setGlasgowTotal] = useState(0);

  // Inicializar fecha y hora, diagnósticos y medicamentos
  useEffect(() => {
    const now = new Date();
    setFormData(prev => {
      // Solo inicializar si está vacío
      if (prev.diagIngreso.length === 0 && prev.diagAlta.length === 0 && prev.medicamentos.length === 0) {
        return {
          ...prev,
          fechaAdmision: now.toISOString().slice(0, 16),
          horaAtencion: now.toTimeString().slice(0, 5),
          fechaAlta: now.toISOString().slice(0, 10),
          horaAlta: now.toTimeString().slice(0, 5),
          // Inicializar 3 diagnósticos de ingreso y alta
          diagIngreso: [
            { id: `diag-ing-${now.getTime()}-1`, num: 1, nombre: '', cie: '', status: null },
            { id: `diag-ing-${now.getTime()}-2`, num: 2, nombre: '', cie: '', status: null },
            { id: `diag-ing-${now.getTime()}-3`, num: 3, nombre: '', cie: '', status: null }
          ],
          diagAlta: [
            { id: `diag-alta-${now.getTime()}-1`, num: 1, nombre: '', cie: '', status: null },
            { id: `diag-alta-${now.getTime()}-2`, num: 2, nombre: '', cie: '', status: null },
            { id: `diag-alta-${now.getTime()}-3`, num: 3, nombre: '', cie: '', status: null }
          ],
          // Inicializar 4 medicamentos
          medicamentos: [
            { id: `med-${now.getTime()}-1`, num: 1, nombre: '', posologia: '' },
            { id: `med-${now.getTime()}-2`, num: 2, nombre: '', posologia: '' },
            { id: `med-${now.getTime()}-3`, num: 3, nombre: '', posologia: '' },
            { id: `med-${now.getTime()}-4`, num: 4, nombre: '', posologia: '' }
          ]
        };
      }
      return {
        ...prev,
        fechaAdmision: prev.fechaAdmision || now.toISOString().slice(0, 16),
        horaAtencion: prev.horaAtencion || now.toTimeString().slice(0, 5),
        fechaAlta: prev.fechaAlta || now.toISOString().slice(0, 10),
        horaAlta: prev.horaAlta || now.toTimeString().slice(0, 5)
      };
    });
  }, []);

  // Calcular Glasgow
  useEffect(() => {
    const o = parseInt(formData.glasgowOcular) || 0;
    const v = parseInt(formData.glasgowVerbal) || 0;
    const m = parseInt(formData.glasgowMotora) || 0;
    const total = o + v + m;
    setGlasgowTotal(total);
  }, [formData.glasgowOcular, formData.glasgowVerbal, formData.glasgowMotora]);

  // ========== MANEJADORES GENERALES ==========
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVitalesChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      vitales: { ...prev.vitales, [field]: value }
    }));
  };

  // ========== ANTECEDENTES ==========
  const ANTECEDENTES = [
    { num: 1, label: 'Alérgico' },
    { num: 2, label: 'Clínico' },
    { num: 3, label: 'Ginecológico' },
    { num: 4, label: 'Traumatológico' },
    { num: 5, label: 'Quirúrgico' },
    { num: 6, label: 'Farmacológico' },
    { num: 7, label: 'Psiquiátrico' },
    { num: 8, label: 'Otro' }
  ];

  const toggleAntecedente = (num) => {
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
  };

  const updateAntecedentesDesc = (num, text) => {
    setFormData(prev => ({
      ...prev,
      antecedentesDescs: { ...prev.antecedentesDescs, [num]: text }
    }));
  };

  // ========== EXAMEN FÍSICO CP/SP ==========
  const EXAM_REGIONS = [
    '1. Vía Aérea Obstruida', '2. Cabeza', '3. Cuello', '4. Tórax',
    '5. Abdomen', '6. Columna', '7. Pelvis', '8. Extremidades'
  ];

  const toggleCPSP = (region, type) => {
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
  };

  // ========== LESIONES ==========
  const LESION_TYPES = [
    { n: 1, label: 'Herida Penetrante' }, { n: 2, label: 'Herida Cortante' },
    { n: 3, label: 'Fractura Expuesta' }, { n: 4, label: 'Fractura Cerrada' },
    { n: 5, label: 'Cuerpo Extraño' }, { n: 6, label: 'Hemorragia' },
    { n: 7, label: 'Mordedura' }, { n: 8, label: 'Picadura' },
    { n: 9, label: 'Excoriación' }, { n: 10, label: 'Deformidad o Masa' },
    { n: 11, label: 'Hematoma' }, { n: 12, label: 'Eritema / Inflamación' },
    { n: 13, label: 'Luxación / Esguince' }, { n: 14, label: 'Quemadura' },
    { n: 15, label: 'Otro' }
  ];

  const BODY_ZONES = [
    { name: 'Cabeza', x: [38, 82], y: [0, 50] },
    { name: 'Cuello', x: [50, 70], y: [47, 59] },
    { name: 'Tórax', x: [35, 85], y: [59, 140] },
    { name: 'Brazo Izq', x: [15, 35], y: [70, 140] },
    { name: 'Brazo Der', x: [85, 105], y: [70, 140] },
    { name: 'Antebrazo Izq', x: [12, 25], y: [130, 190] },
    { name: 'Antebrazo Der', x: [95, 108], y: [130, 190] },
    { name: 'Mano Izq', x: [9, 25], y: [183, 207] },
    { name: 'Mano Der', x: [95, 111], y: [183, 207] },
    { name: 'Pelvis/Abdomen', x: [40, 80], y: [140, 195] },
    { name: 'Muslo Izq', x: [42, 58], y: [180, 250] },
    { name: 'Muslo Der', x: [62, 78], y: [180, 250] },
    { name: 'Pierna Izq', x: [42, 58], y: [240, 280] },
    { name: 'Pierna Der', x: [62, 78], y: [240, 280] },
    { name: 'Pie Izq', x: [39, 53], y: [275, 300] },
    { name: 'Pie Der', x: [67, 81], y: [275, 300] }
  ];

  const getZoneName = (x, y) => {
    for (let z of BODY_ZONES) {
      if (x >= z.x[0] && x <= z.x[1] && y >= z.y[0] && y <= z.y[1]) return z.name;
    }
    return 'Área no identificada';
  };

  const selectLesionType = (n, label) => {
    setFormData(prev => ({
      ...prev,
      activeLesionType: { n, label }
    }));
  };

  const placeMarker = (event, side) => {
    if (!formData.activeLesionType) {
      alert('Seleccione primero el tipo de lesión');
      return;
    }

    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();
    const svgW = rect.width, svgH = rect.height;
    const vbW = 120, vbH = 300;
    const scaleX = vbW / svgW, scaleY = vbH / svgH;
    const svgX = (event.clientX - rect.left) * scaleX;
    const svgY = (event.clientY - rect.top) * scaleY;
    const zoneName = getZoneName(svgX, svgY);

    // Verificar si hay una lesión existente muy cerca (radio de 8 unidades)
    const existingLesion = formData.lesiones.find(l => 
      l.side === side && 
      Math.hypot(l.posX - svgX, l.posY - svgY) < 8
    );

    if (existingLesion) {
      // Si existe, eliminarla (toggle) y renumerar las restantes
      setFormData(prev => {
        const filtered = prev.lesiones.filter(l => l.id !== existingLesion.id);
        // Renumerar lesiones para que sean secuenciales (1, 2, 3...)
        const renumbered = filtered.map((l, idx) => ({ ...l, id: idx + 1 }));
        return { ...prev, lesiones: renumbered };
      });
      return;
    }

    // Si no existe, crear una nueva con ID secuencial basado en cantidad actual
    const newId = formData.lesiones.length + 1;
    
    setFormData(prev => ({
      ...prev,
      lesiones: [...prev.lesiones, {
        id: newId,
        type: formData.activeLesionType,
        zone: zoneName,
        side,
        posX: svgX,
        posY: svgY
      }]
    }));
  };

  const deleteLesion = (id) => {
    setFormData(prev => {
      const filtered = prev.lesiones.filter(l => l.id !== id);
      // Renumerar lesiones para que sean secuenciales (1, 2, 3...)
      const renumbered = filtered.map((l, idx) => ({ ...l, id: idx + 1 }));
      return {
        ...prev,
        lesiones: renumbered
      };
    });
  };

  // ========== EXÁMENES ==========
  const EXAM_LIST = [
    { n: 1, label: '1. Biometría' }, { n: 2, label: '2. Uroanálisis' },
    { n: 3, label: '3. Química Sanguínea' }, { n: 4, label: '4. Electrolitos' },
    { n: 5, label: '5. Gasometría' }, { n: 6, label: '6. Electrocardiograma' },
    { n: 7, label: '7. Endoscopía' }, { n: 8, label: '8. R-X Tórax' },
    { n: 9, label: '9. R-X Abdomen' }, { n: 10, label: '10. R-X Ósea' },
    { n: 11, label: '11. Tomografía' }, { n: 12, label: '12. Resonancia' },
    { n: 13, label: '13. Ecografía Pélvica' }, { n: 14, label: '14. Ecografía Abdomen' },
    { n: 15, label: '15. Interconsulta' }, { n: 16, label: '16. Otros' }
  ];

  const toggleExam = (n) => {
    setFormData(prev => {
      const newSet = new Set(prev.examenesMarcados);
      newSet.has(n) ? newSet.delete(n) : newSet.add(n);
      return { ...prev, examenesMarcados: newSet };
    });
  };

  // ========== DIAGNÓSTICOS ==========
  // Helper para reasignar números secuenciales
  const reassignNumbers = (items) => {
    return items.map((item, index) => ({ ...item, num: index + 1 }));
  };

  const addDiag = (type) => {
    setFormData(prev => {
      const key = type === 'ing' ? 'diagIngreso' : 'diagAlta';
      const currentArray = prev[key];
      const newNum = currentArray.length + 1;
      const newId = `diag-${type}-${Date.now()}-${newNum}`;
      
      return {
        ...prev,
        [key]: [...currentArray, {
          id: newId,
          num: newNum,
          nombre: '',
          cie: '',
          status: null
        }]
      };
    });
  };

  const updateDiag = (type, id, field, value) => {
    const key = type === 'ing' ? 'diagIngreso' : 'diagAlta';
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].map(d => d.id === id ? { ...d, [field]: value } : d)
    }));
  };

  const toggleDiagStatus = (type, id, status) => {
    const key = type === 'ing' ? 'diagIngreso' : 'diagAlta';
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].map(d => 
        d.id === id ? { ...d, status: d.status === status ? null : status } : d
      )
    }));
  };

  const deleteDiag = (type, id) => {
    const key = type === 'ing' ? 'diagIngreso' : 'diagAlta';
    setFormData(prev => {
      const filtered = prev[key].filter(d => d.id !== id);
      const renumbered = reassignNumbers(filtered);
      return {
        ...prev,
        [key]: renumbered
      };
    });
  };

  // ========== MEDICAMENTOS ==========
  const addMed = () => {
    setFormData(prev => {
      const currentArray = prev.medicamentos;
      const newNum = currentArray.length + 1;
      const newId = `med-${Date.now()}-${newNum}`;
      
      return {
        ...prev,
        medicamentos: [...currentArray, {
          id: newId,
          num: newNum,
          nombre: '',
          posologia: ''
        }]
      };
    });
  };

  const updateMed = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      medicamentos: prev.medicamentos.map(m => 
        m.id === id ? { ...m, [field]: value } : m
      )
    }));
  };

  const deleteMed = (id) => {
    setFormData(prev => {
      const filtered = prev.medicamentos.filter(m => m.id !== id);
      const renumbered = reassignNumbers(filtered);
      return {
        ...prev,
        medicamentos: renumbered
      };
    });
  };

  // ========== GUARDAR ==========
  const guardar = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    console.log('Formulario guardado:', formData);
  };

  const getGlasgowInterpretation = () => {
    if (glasgowTotal >= 13) return { text: '✅ Leve (13-15)', color: '#2e7d32' };
    if (glasgowTotal >= 9) return { text: '⚠️ Moderado (9-12)', color: '#d69e2e' };
    if (glasgowTotal > 0) return { text: '🔴 Severo (≤8)', color: '#c8433a' };
    return { text: '', color: '' };
  };

  const ALTA_OPTIONS = [
    { label: 'Domicilio', icon: '🏠', type: 'a' },
    { label: 'Consulta Externa', icon: '🏥', type: 'a' },
    { label: 'Observación', icon: '👁️', type: 'a' },
    { label: 'Internación', icon: '🛏️', type: 'a' },
    { label: 'Referencia', icon: '🔄', type: 'a' },
    { label: 'Muerto en Emergencia', icon: '☠️', type: 'b' }
  ];

  return (
    <div style={styles.container}>
      <style>{globalStyles}</style>

      {/* HEADER */}
      <header style={styles.atlasHeader}>
        <div style={styles.atlasHeaderContent}>
          <div style={styles.atlasLogo}>
            <svg viewBox="0 0 44 44" width="44" height="44" style={{ flex: 'shrink:0' }}>
              
               </svg>
           
          </div>
          <div style={styles.atlasInfo}>
            <div style={styles.atlasFormTitle}>HOJA DE EMERGENCIA</div>
            <div style={styles.atlasFormSubtitle}>SNS-MSP · HCU-form.008/2008 · Clínicas Atlas · Ecuador</div>
          </div>
           <div style={styles.urgencyBadge}><span style={styles.urgencyDot}></span> EN ATENCIÓN</div>
  
<div className="flex justify-end">
  <button
    onClick={async () => {

        // 1️⃣ abrir pestaña vacía primero
      const newWindow = window.open("", "_blank");
       // 2️⃣ generar PDF
      const pdfBytes = await EmergenciaPDF({
        formData,
      });
            // 3️⃣ crear blob
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
        // 4️⃣ cargar PDF en la nueva pestaña
      newWindow.location.href = url;

       // 5️⃣ imprimir cuando cargue
      newWindow.onload = () => {
        newWindow.print();
      };

    }}
    className="bg-[#76c4d5]/40 hover:bg-[#76c4d5] text-[#595759] px-3 py-1 rounded-2xl shadow-lg"
  >
    🖨️ Imprimir
  </button>
</div>



          <button onClick={guardar} style={styles.btnSave}>💾 Guardar</button>
        </div>
      </header>

      {/* MAIN HEADER */}
     

      {/* BODY */}
      <main style={styles.appBody}>

        {/* INSTITUCIÓN */}
        <Card title="Institución del Sistema">
          <div style={styles.gridFlex6}>
            <FormGroup label="Institución" value={formData.institucion} onChange={(v) => handleInputChange('institucion', v)} placeholder="Nombre de la institución" />
            <FormGroup label="Unidad Operativa" value={formData.unidadOperativa} onChange={(v) => handleInputChange('unidadOperativa', v)} placeholder="Unidad" />
            <FormGroup label="Cód. UO" value={formData.codUO} onChange={(v) => handleInputChange('codUO', v)} placeholder="Código" />
            <FormGroup label="Parroquia" value={formData.parroquiaInst} onChange={(v) => handleInputChange('parroquiaInst', v)} placeholder="Parroquia" />
            <FormGroup label="Cantón" value={formData.cantonInst} onChange={(v) => handleInputChange('cantonInst', v)} placeholder="Cantón" />
            <FormGroup label="Nº Historia Clínica" value={formData.historiaClinica} onChange={(v) => handleInputChange('historiaClinica', v)} placeholder="Número HCL" mono />
          </div>
        </Card>

        {/* SECCIÓN 1: ADMISIÓN */}
        <Card num="1" title="Registro de Admisión">
          <div style={styles.gridFlex5}>
            <FormGroup label="Apellido Paterno" value={formData.apellidoPaterno} onChange={(v) => handleInputChange('apellidoPaterno', v)} placeholder="Primer apellido" />
            <FormGroup label="Apellido Materno" value={formData.apellidoMaterno} onChange={(v) => handleInputChange('apellidoMaterno', v)} placeholder="Segundo apellido" />
            <FormGroup label="Primer Nombre" value={formData.primerNombre} onChange={(v) => handleInputChange('primerNombre', v)} placeholder="Primer nombre" />
            <FormGroup label="Segundo Nombre" value={formData.segundoNombre} onChange={(v) => handleInputChange('segundoNombre', v)} placeholder="Segundo nombre" />
            <FormGroup label="Nº Cédula" value={formData.cedula} onChange={(v) => handleInputChange('cedula', v)} placeholder="0000000000" mono />
          </div>

          <div style={styles.gridFlex6}>
            <FormGroup label="Dirección" value={formData.direccion} onChange={(v) => handleInputChange('direccion', v)} placeholder="Calle..." style={{ gridColumn: '1 / 4' }} />
            <FormGroup label="Barrio" value={formData.barrio} onChange={(v) => handleInputChange('barrio', v)} placeholder="Barrio" />
            <FormGroup label="Parroquia" value={formData.parroquia} onChange={(v) => handleInputChange('parroquia', v)} placeholder="Parroquia" />
            <FormGroup label="Cantón" value={formData.canton} onChange={(v) => handleInputChange('canton', v)} placeholder="Cantón" />
            <FormGroup label="Provincia" value={formData.provincia} onChange={(v) => handleInputChange('provincia', v)} placeholder="Provincia" />
            <FormGroup label="Nº Teléfono" value={formData.telefono} onChange={(v) => handleInputChange('telefono', v)} placeholder="0999..." />
          </div>

          <div style={styles.gridFlex8}>
            <FormGroup label="Fecha Nacimiento" value={formData.fechaNacimiento} onChange={(v) => handleInputChange('fechaNacimiento', v)} type="date" />
            <FormGroup label="Lugar Nacimiento" value={formData.lugarNacimiento} onChange={(v) => handleInputChange('lugarNacimiento', v)} placeholder="Ciudad..." />
            <FormGroup label="Nacionalidad" value={formData.nacionalidad} onChange={(v) => handleInputChange('nacionalidad', v)} placeholder="Ecuador" />
            <FormGroup label="Edad" value={formData.edad} onChange={(v) => handleInputChange('edad', v)} placeholder="0" type="number" />
            <SelectGroup label="Género" value={formData.genero} onChange={(v) => handleInputChange('genero', v)} options={['', 'M', 'F']} />
            <SelectGroup label="Estado Civil" value={formData.estadoCivil} onChange={(v) => handleInputChange('estadoCivil', v)} options={['', 'Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión Libre']} />
            <SelectGroup label="Instrucción" value={formData.instruccion} onChange={(v) => handleInputChange('instruccion', v)} options={['', 'Ninguna', 'Primaria', 'Secundaria', 'Superior', 'Posgrado']} />
            <FormGroup label="Grupo Étnico" value={formData.grupoOEtnia} onChange={(v) => handleInputChange('grupoOEtnia', v)} placeholder="Mestizo..." />
          </div>

          <div style={styles.gridFlex4}>
            <FormGroup label="Fecha Admisión" value={formData.fechaAdmision} onChange={(v) => handleInputChange('fechaAdmision', v)} type="datetime-local" />
            <FormGroup label="Ocupación" value={formData.ocupacion} onChange={(v) => handleInputChange('ocupacion', v)} placeholder="Ocupación" />
            <FormGroup label="Empresa" value={formData.empresa} onChange={(v) => handleInputChange('empresa', v)} placeholder="Empresa" />
            <SelectGroup label="Tipo Seguro" value={formData.tipoSeguro} onChange={(v) => handleInputChange('tipoSeguro', v)} options={['', 'IESS', 'ISSFA', 'ISSPOL', 'Privado', 'Particular', 'Sin seguro']} />
          </div>

          <div style={styles.gridFlex4}>
            <FormGroup label="Referido de" value={formData.referenciaOrigen} onChange={(v) => handleInputChange('referenciaOrigen', v)} placeholder="Institución" />
            <FormGroup label="Contacto Emergencia" value={formData.contactoEmergencia} onChange={(v) => handleInputChange('contactoEmergencia', v)} placeholder="Nombre" style={{ gridColumn: '1 / 3' }} />
            <FormGroup label="Dirección" value={formData.dirContacto} onChange={(v) => handleInputChange('dirContacto', v)} placeholder="Dirección" style={{ gridColumn: '3 / 5' }} />
            <FormGroup label="Teléfono" value={formData.telContacto} onChange={(v) => handleInputChange('telContacto', v)} placeholder="0999..." />
          </div>

          <div style={styles.gridFlex4}>
            <div>
              <label style={styles.label}>Forma Llegada</label>
              <ChipGroup options={['Ambulatorio', 'Ambulancia', 'Otro transporte']} value={formData.formaLlegada} onChange={(v) => handleInputChange('formaLlegada', v)} />
            </div>
            <FormGroup label="Fuente Info" value={formData.fuenteInfo} onChange={(v) => handleInputChange('fuenteInfo', v)} placeholder="Familiar..." />
            <FormGroup label="Institución Entrega" value={formData.institucionEntrega} onChange={(v) => handleInputChange('institucionEntrega', v)} placeholder="Nombre" />
            <FormGroup label="Teléfono" value={formData.telEntrega} onChange={(v) => handleInputChange('telEntrega', v)} placeholder="0999..." />
          </div>
        </Card>

        {/* SECCIÓN 2: MOTIVO */}
        <Card num="2" title="Inicio de Atención y Motivo">
          <div style={styles.gridFlex6}>
            <FormGroup label="Hora" value={formData.horaAtencion} onChange={(v) => handleInputChange('horaAtencion', v)} type="time" />
            <div>
              <label style={styles.label}>Trauma</label>
              <ChipGroup options={['Sí', 'No']} value={formData.trauma} onChange={(v) => handleInputChange('trauma', v)} />
            </div>
            <FormGroup label="Causa Clínica" value={formData.causaClin} onChange={(v) => handleInputChange('causaClin', v)} placeholder="Describa..." />
            <FormGroup label="Causa Obstétrica" value={formData.causaObst} onChange={(v) => handleInputChange('causaObst', v)} placeholder="Causa..." />
            <FormGroup label="Causa Quirúrgica" value={formData.causaQuir} onChange={(v) => handleInputChange('causaQuir', v)} placeholder="Causa..." />
            <SelectGroup label="Grupo Sanguíneo" value={formData.grupoSanguineo} onChange={(v) => handleInputChange('grupoSanguineo', v)} options={['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']} />
          </div>

          <div style={styles.gridFlex4}>
            <div>
              <label style={styles.label}>Notificación Policía</label>
              <ChipGroup options={['Sí', 'No']} value={formData.notificacionPolicia} onChange={(v) => handleInputChange('notificacionPolicia', v)} />
            </div>
            <FormGroup label="Otro Motivo" value={formData.otroMotivo} onChange={(v) => handleInputChange('otroMotivo', v)} placeholder="Especifique..." />
            <div>
              <label style={styles.label}>Custodia Policial</label>
              <ChipGroup options={['Sí', 'No']} value={formData.custodia} onChange={(v) => handleInputChange('custodia', v)} />
            </div>
            <div></div>
          </div>
        </Card>

        {/* SECCIÓN 3: ACCIDENTE */}
        <Card num="3" title="Accidente, Violencia, Intoxicación, Envenenamiento o Quemadura">
          <div style={styles.gridFlex4}>
            <FormGroup label="Fecha y Hora Evento" value={formData.fechaEvento} onChange={(v) => handleInputChange('fechaEvento', v)} type="datetime-local" />
            <FormGroup label="Lugar Evento" value={formData.lugarEvento} onChange={(v) => handleInputChange('lugarEvento', v)} placeholder="Tipo de lugar..." />
            <FormGroup label="Dirección Evento" value={formData.direccionEvento} onChange={(v) => handleInputChange('direccionEvento', v)} placeholder="Calle..." style={{ gridColumn: '1 / 3' }} />
            <div></div>
          </div>

          <EventTypeSelector formData={formData} setFormData={setFormData} />

          <div style={styles.gridFlex4}>
            <div>
              <label style={styles.label}>Aliento Etílico</label>
              <ChipGroup options={['Positivo', 'Negativo']} value={formData.aliento} onChange={(v) => handleInputChange('aliento', v)} />
            </div>
            <FormGroup label="Valor Alcocheck" value={formData.alcocheck} onChange={(v) => handleInputChange('alcocheck', v)} placeholder="mg/L..." />
            <FormGroup label="Observaciones" value={formData.obsAccidente} onChange={(v) => handleInputChange('obsAccidente', v)} placeholder="..." style={{ gridColumn: '1 / 5' }} textarea />
          </div>
        </Card>

        {/* SECCIÓN 4: ANTECEDENTES */}
        <Card num="4" title="Antecedentes Personales y Familiares">
          <ChipGroupGroup chips={ANTECEDENTES} selected={formData.antecedentes} onToggle={toggleAntecedente} />
          
          {Object.keys(formData.antecedentes).length > 0 && (
            <div style={styles.antsDescSection}>
              <h3 style={styles.subtitle}>Descripciones de Antecedentes</h3>
              {Object.keys(formData.antecedentes).map(num => (
                <FormGroup
                  key={num}
                  label={`${num}. Detalles`}
                  value={formData.antecedentesDescs[num] || ''}
                  onChange={(v) => updateAntecedentesDesc(num, v)}
                  placeholder="Describa..."
                  textarea
                />
              ))}
            </div>
          )}
        </Card>

        {/* SECCIÓN 5: ENFERMEDAD */}
        <Card num="5" title="Enfermedad Actual y Revisión de Sistemas">
          <div style={styles.chipGroupRow}>
            <div style={styles.chipGroupContainer}>
              <ChipButton active={formData.viaAerea === 'libre'} onClick={() => handleInputChange('viaAerea', 'libre')}>✅ Vía Aérea Libre</ChipButton>
              <ChipButton active={formData.viaAerea === 'obstruida'} onClick={() => handleInputChange('viaAerea', 'obstruida')}>🚫 Vía Aérea Obstruida</ChipButton>
              <ChipButton active={formData.condicion === 'estable'} onClick={() => handleInputChange('condicion', 'estable')}>💚 Condición Estable</ChipButton>
              <ChipButton active={formData.condicion === 'inestable'} onClick={() => handleInputChange('condicion', 'inestable')}>🔴 Condición Inestable</ChipButton>
            </div>
          </div>

          <div style={styles.gridFlex2}>
            <FormGroup label="Cronología" value={formData.cronologia} onChange={(v) => handleInputChange('cronologia', v)} placeholder="¿Cuándo comenzó?" textarea />
            <FormGroup label="Localización" value={formData.localizacion} onChange={(v) => handleInputChange('localizacion', v)} placeholder="¿Dónde?" textarea />
            <FormGroup label="Intensidad" value={formData.intensidad} onChange={(v) => handleInputChange('intensidad', v)} placeholder="Escala 1-10..." textarea />
            <FormGroup label="Factores Agravantes" value={formData.factoresAgravan} onChange={(v) => handleInputChange('factoresAgravan', v)} placeholder="¿Qué empeora?" textarea />
          </div>
        </Card>

        {/* SECCIÓN 6: VITALES */}
        <Card num="6" title="Signos Vitales y Mediciones">
          <VitalesGrid vitales={formData.vitales} onChangeVital={handleVitalesChange} />

          <GlasgowPanel
            ocular={formData.glasgowOcular}
            verbal={formData.glasgowVerbal}
            motora={formData.glasgowMotora}
            onChangeOcular={(v) => handleInputChange('glasgowOcular', v)}
            onChangeVerbal={(v) => handleInputChange('glasgowVerbal', v)}
            onChangeMotora={(v) => handleInputChange('glasgowMotora', v)}
            total={glasgowTotal}
            interpretation={getGlasgowInterpretation()}
            pupilaDer={formData.pupilaDer}
            onChangePupilaDer={(v) => handleInputChange('pupilaDer', v)}
            pupilaIzq={formData.pupilaIzq}
            onChangePupilaIzq={(v) => handleInputChange('pupilaIzq', v)}
            llenado={formData.llenado}
            onChangeLlenado={(v) => handleInputChange('llenado', v)}
          />
        </Card>

        {/* SECCIÓN 7: EXAMEN FÍSICO */}
        <Card num="7" title="Examen Físico (SP = Sin Patología · CP = Con Patología)">
          <CPSPGrid regions={EXAM_REGIONS} cpsp={formData.cpsp} onToggle={toggleCPSP} />
        </Card>

        {/* SECCIÓN 8: LESIONES */}
        <Card num="8" title="Localización de Lesiones">
          <div style={styles.lesionContainer}>
            <LesionMap
              lesions={formData.lesiones}
              activeLesionType={formData.activeLesionType}
              onPlaceMarker={placeMarker}
              lesionTypes={LESION_TYPES}
              onSelectLesionType={selectLesionType}
              onDeleteLesion={deleteLesion}
            />
          </div>
        </Card>

        {/* SECCIÓN 9: OBSTÉTRICA */}
        <Card num="9" title="Emergencia Obstétrica">
          <div style={styles.obsGrid}>
            <FormGroup label="Gestas" value={formData.gestas} onChange={(v) => handleInputChange('gestas', v)} type="number" placeholder="0" />
            <FormGroup label="Partos" value={formData.partos} onChange={(v) => handleInputChange('partos', v)} type="number" placeholder="0" />
            <FormGroup label="Abortos" value={formData.abortos} onChange={(v) => handleInputChange('abortos', v)} type="number" placeholder="0" />
            <FormGroup label="Cesáreas" value={formData.cesareas} onChange={(v) => handleInputChange('cesareas', v)} type="number" placeholder="0" />
            <FormGroup label="FUM" value={formData.fum} onChange={(v) => handleInputChange('fum', v)} type="date" />
            <FormGroup label="Semanas" value={formData.semanas} onChange={(v) => handleInputChange('semanas', v)} type="number" placeholder="semanas" />
            <SelectGroup label="Movimiento Fetal" value={formData.movFetal} onChange={(v) => handleInputChange('movFetal', v)} options={['', 'Presente', 'Ausente', 'Disminuido']} />
            <FormGroup label="F. Cardíaca Fetal" value={formData.fcFetal} onChange={(v) => handleInputChange('fcFetal', v)} placeholder="lpm" />
            <SelectGroup label="Membranas" value={formData.membranas} onChange={(v) => handleInputChange('membranas', v)} options={['', 'Íntegras', 'Rotas']} />
            <FormGroup label="Tiempo (rotura)" value={formData.tiempoRotura} onChange={(v) => handleInputChange('tiempoRotura', v)} placeholder="horas" />
            <FormGroup label="Altura Uterina" value={formData.alturaUterina} onChange={(v) => handleInputChange('alturaUterina', v)} placeholder="cm" type="number" />
            <SelectGroup label="Presentación" value={formData.presentacion} onChange={(v) => handleInputChange('presentacion', v)} options={['', 'Cefálica', 'Podálica', 'Transversa', 'Oblicua']} />
            <FormGroup label="Dilatación" value={formData.dilatacion} onChange={(v) => handleInputChange('dilatacion', v)} type="number" placeholder="cm" />
            <FormGroup label="Borramiento" value={formData.borramiento} onChange={(v) => handleInputChange('borramiento', v)} placeholder="%" />
            <FormGroup label="Plano" value={formData.plano} onChange={(v) => handleInputChange('plano', v)} placeholder="Hodge..." />
            <SelectGroup label="Pelvis Útil" value={formData.pelvisUtil} onChange={(v) => handleInputChange('pelvisUtil', v)} options={['', 'Sí', 'No']} />
            <SelectGroup label="Sangrado Vaginal" value={formData.sangradoVaginal} onChange={(v) => handleInputChange('sangradoVaginal', v)} options={['', 'Ausente', 'Escaso', 'Moderado', 'Abundante']} />
            <SelectGroup label="Contracciones" value={formData.contracciones} onChange={(v) => handleInputChange('contracciones', v)} options={['', 'Ausentes', 'Irregulares', 'Regulares', 'Muy frecuentes']} />
          </div>
        </Card>

        {/* SECCIÓN 10: EXÁMENES */}
        <Card num="10" title="Solicitud de Exámenes">
          <ExamGrid exams={EXAM_LIST} selected={formData.examenesMarcados} onToggle={toggleExam} />
          <div style={{ marginTop: '16px' }}>
            <FormGroup label="Comentarios y Resultados" value={formData.comentariosExamenes} onChange={(v) => handleInputChange('comentariosExamenes', v)} placeholder="Registre resultados..." textarea minHeight="110px" />
          </div>
        </Card>

        {/* SECCIONES 11 & 12: DIAGNÓSTICOS */}
        <div style={styles.gridFlex2}>
          <Card num="11" title="Diagnóstico de Ingreso">
            <DiagnosticoTable
              diags={formData.diagIngreso}
              onUpdate={updateDiag}
              onToggleStatus={toggleDiagStatus}
              onDelete={deleteDiag}
              type="ing"
            />
            <button onClick={() => addDiag('ing')} style={styles.btnAdd}>＋ Agregar</button>
          </Card>
          <Card num="12" title="Diagnóstico de Alta">
            <DiagnosticoTable
              diags={formData.diagAlta}
              onUpdate={updateDiag}
              onToggleStatus={toggleDiagStatus}
              onDelete={deleteDiag}
              type="alta"
            />
            <button onClick={() => addDiag('alta')} style={styles.btnAdd}>＋ Agregar</button>
          </Card>
        </div>

        {/* SECCIÓN 13: TRATAMIENTO */}
        <Card num="13" title="Plan de Tratamiento">
          <FormGroup label="Indicaciones Generales" value={formData.indicacionesGenerales} onChange={(v) => handleInputChange('indicacionesGenerales', v)} placeholder="Indicaciones..." textarea />
          <MedicationTable
            meds={formData.medicamentos}
            onUpdate={updateMed}
            onDelete={deleteMed}
          />
          <button onClick={addMed} style={styles.btnAdd}>＋ Agregar Medicamento</button>
        </Card>

        {/* SECCIÓN 14: ALTA */}
        <Card num="14" title="Alta">
          <label style={styles.label}>Destino del Paciente</label>
          <div style={styles.altaGrid}>
            {ALTA_OPTIONS.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleInputChange('destino', formData.destino === opt.label ? '' : opt.label)}
                style={{
                  ...styles.altaOption,
                  ...(formData.destino === opt.label && (opt.type === 'b' ? styles.altaOptionSelB : styles.altaOptionSelA))
                }}
              >
                <span style={styles.aoIcon}>{opt.icon}</span>
                <span style={styles.aoName}>{opt.label}</span>
              </button>
            ))}
          </div>

          <div style={styles.gridFlex4}>
            <div>
              <label style={styles.label}>Condición al Alta</label>
              <ChipGroup options={['Estable', 'Inestable']} value={formData.condicionAlta} onChange={(v) => handleInputChange('condicionAlta', v)} />
            </div>
            <FormGroup label="Días Incapacidad" value={formData.diasIncapacidad} onChange={(v) => handleInputChange('diasIncapacidad', v)} type="number" placeholder="0" mono />
            <FormGroup label="Servicio Referencia" value={formData.servicioRef} onChange={(v) => handleInputChange('servicioRef', v)} placeholder="Servicio..." />
            <FormGroup label="Establecimiento" value={formData.establecimientoRef} onChange={(v) => handleInputChange('establecimientoRef', v)} placeholder="Establecimiento..." />
          </div>

          <div style={styles.gridFlex4}>
            <div>
              <label style={styles.label}>Egresa</label>
              <ChipGroup options={['✅ Vivo', '☠️ Muerto']} value={formData.egresa} onChange={(v) => handleInputChange('egresa', v)} />
            </div>
            <FormGroup label="Causa (si fallecimiento)" value={formData.causaMuerte} onChange={(v) => handleInputChange('causaMuerte', v)} placeholder="Causa..." />
            <FormGroup label="Código" value={formData.codigoMuerte} onChange={(v) => handleInputChange('codigoMuerte', v)} placeholder="CIE..." />
            <div></div>
          </div>

          <div style={styles.gridFlex4}>
            <FormGroup label="Fecha Alta" value={formData.fechaAlta} onChange={(v) => handleInputChange('fechaAlta', v)} type="date" />
            <FormGroup label="Hora Alta" value={formData.horaAlta} onChange={(v) => handleInputChange('horaAlta', v)} type="time" />
            <FormGroup label="Profesional" value={formData.profesional} onChange={(v) => handleInputChange('profesional', v)} placeholder="Dr./Dra..." />
            <FormGroup label="Nº Hoja" value={formData.numeroHoja} onChange={(v) => handleInputChange('numeroHoja', v)} placeholder="2" mono type="number" />
          </div>
        </Card>

      </main>

      {/* BOTTOM BAR */}
      <div style={styles.bottomBar}>
        <div style={styles.bbInfo}>
          <StatItem label="Paciente" value={`${formData.apellidoPaterno} ${formData.primerNombre}`.trim() || '—'} />
          <StatItem label="Cédula" value={formData.cedula || '—'} />
          <StatItem label="Hora" value={formData.horaAtencion || '—'} />
          <StatItem label="Lesiones" value={formData.lesiones.length.toString()} />
        </div>
        <div style={styles.bbBtns}>
           
<div className="flex justify-end">
  <Button
    onClick={async () => {

        // 1️⃣ abrir pestaña vacía primero
      const newWindow = window.open("", "_blank");
       // 2️⃣ generar PDF
      const pdfBytes = await EmergenciaPDF({
        formData,
      });
            // 3️⃣ crear blob
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
        // 4️⃣ cargar PDF en la nueva pestaña
      newWindow.location.href = url;

       // 5️⃣ imprimir cuando cargue
      newWindow.onload = () => {
        newWindow.print();
      };

    }}
    className="bg-[#76c4d5]/30 hover:bg-teal-700 text-[#595759] px-3 py-1 rounded-2xl shadow-lg"
  >
    🖨️ Imprimir
  </Button>
</div>

          <button onClick={guardar} style={styles.btnSaveBar}>💾 Guardar Registro</button>
        </div>
      </div>

      {/* TOAST */}
      {showToast && <div style={styles.toast}>✓ Registro de Emergencia guardado</div>}
    </div>
  );
};

// ========== COMPONENTES SECUNDARIOS ==========
const Card = ({ num, title, children }) => (
  <div style={styles.card}>
    {num && (
      <div style={styles.cardHeader}>
        <span style={styles.cardNum}>{num}</span>
        <span style={styles.cardTitle}>{title}</span>
      </div>
    )}
    {!num && <div style={{ ...styles.cardHeader, paddingTop: 0 }}><span style={styles.cardTitle}>{title}</span></div>}
    <div style={styles.cardBody}>{children}</div>
  </div>
);

const FormGroup = ({ label, value, onChange, placeholder, type = 'text', mono = false, textarea = false, minHeight = '80px', ...props }) => (
  <div style={styles.formGroup}>
    <label style={styles.label}>{label}</label>
    {textarea ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...styles.textarea, minHeight, fontFamily: mono ? 'Montserrat' : 'inherit', fontWeight: mono ? 700 : 400 }}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...styles.input, fontFamily: mono ? 'Montserrat' : 'inherit', fontWeight: mono ? 700 : 400, color: mono ? '#0a3d62' : 'inherit' }}
        {...props}
      />
    )}
  </div>
);

const SelectGroup = ({ label, value, onChange, options }) => (
  <div style={styles.formGroup}>
    <label style={styles.label}>{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} style={styles.select}>
      {options.map((opt, i) => (
        <option key={i} value={opt}>{opt || '—'}</option>
      ))}
    </select>
  </div>
);

const ChipGroup = ({ options, value, onChange }) => (
  <div style={styles.chipGroup}>
    {options.map((opt, i) => (
      <button
        key={i}
        onClick={() => onChange(value === opt ? '' : opt)}
        style={{ ...styles.chip, ...(value === opt && styles.chipActive) }}
      >
        {opt}
      </button>
    ))}
  </div>
);

const ChipGroupGroup = ({ chips, selected, onToggle }) => (
  <div style={styles.chipGroup}>
    {chips.map(chip => (
      <button
        key={chip.num}
        onClick={() => onToggle(chip.num)}
        style={{ ...styles.chip, ...(selected[chip.num] && styles.chipActive) }}
      >
        {chip.num}. {chip.label}
      </button>
    ))}
  </div>
);

const ChipButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      ...styles.chip,
      ...(active && styles.chipActive)
    }}
  >
    {children}
  </button>
);

const VitalesGrid = ({ vitales, onChangeVital }) => (
  <div style={styles.vitalesGrid}>
    {[
      { key: 'pa', icon: '🩸', label: 'P. Arterial', unit: 'mmHg' },
      { key: 'fc', icon: '❤️', label: 'F. Cardíaca', unit: '/ min' },
      { key: 'fr', icon: '💨', label: 'F. Respiratoria', unit: '/ min' },
      { key: 'tempBucal', icon: '🌡️', label: 'Temp. Bucal', unit: '°C' },
      { key: 'tempAxilar', icon: '🌡️', label: 'Temp. Axilar', unit: '°C' },
      { key: 'peso', icon: '⚖️', label: 'Peso', unit: 'kg' },
      { key: 'talla', icon: '📏', label: 'Talla', unit: 'm' },
      { key: 'saturacion', icon: '💧', label: 'Saturación O₂', unit: '%' }
    ].map(v => (
      <div key={v.key} style={styles.vitalCard}>
        <div style={styles.vitalIcon}>{v.icon}</div>
        <div style={styles.vitalName}>{v.label}</div>
        <input
          type={v.key === 'peso' || v.key === 'talla' ? 'number' : 'text'}
          step={v.key === 'talla' ? '0.01' : '0.1'}
          value={vitales[v.key]}
          onChange={(e) => onChangeVital(v.key, e.target.value)}
          placeholder={v.key === 'pa' ? '120/80' : ''}
          style={styles.vitalInput}
        />
        <div style={styles.vitalUnit}>{v.unit}</div>
      </div>
    ))}
  </div>
);

const GlasgowPanel = ({ ocular, verbal, motora, onChangeOcular, onChangeVerbal, onChangeMotora, total, interpretation, pupilaDer, onChangePupilaDer, pupilaIzq, onChangePupilaIzq, llenado, onChangeLlenado }) => (
  <div style={styles.glasgowPanel}>
    <div style={styles.glasgowTitle}>ESCALA DE GLASGOW</div>
    <div style={styles.glasgowGrid}>
      <div style={styles.formGroup}>
        <label style={styles.label}>Ocular (máx. 4)</label>
        <input type="number" min="1" max="4" value={ocular} onChange={(e) => onChangeOcular(e.target.value)} style={styles.glasgowInput} placeholder="4" />
        <div style={styles.glasgowHelp}>4=Espontánea · 3=Orden · 2=Dolor · 1=Ninguna</div>
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Verbal (máx. 5)</label>
        <input type="number" min="1" max="5" value={verbal} onChange={(e) => onChangeVerbal(e.target.value)} style={styles.glasgowInput} placeholder="5" />
        <div style={styles.glasgowHelp}>5=Orientado · 4=Confuso · 3=Palabras · 2=Sonidos · 1=Ninguna</div>
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Motora (máx. 6)</label>
        <input type="number" min="1" max="6" value={motora} onChange={(e) => onChangeMotora(e.target.value)} style={styles.glasgowInput} placeholder="6" />
        <div style={styles.glasgowHelp}>6=Obedece · 5=Localiza · 4=Retira · 3=Flexión · 2=Extensión · 1=Ninguna</div>
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>TOTAL (máx. 15)</label>
        <input type="text" readOnly value={total || '—'} style={styles.glasgowTotalInput} />
        {interpretation.text && <div style={{ ...styles.glasgowHelp, color: interpretation.color, fontWeight: 700, textAlign: 'center' }}>{interpretation.text}</div>}
      </div>
    </div>
    <div style={styles.gridFlex3}>
      <SelectGroup label="Pupila Der." value={pupilaDer} onChange={onChangePupilaDer} options={['', 'Normal', 'Midriasis', 'Miosis', 'Arreactiva', 'Anisocoria']} />
      <SelectGroup label="Pupila Izq." value={pupilaIzq} onChange={onChangePupilaIzq} options={['', 'Normal', 'Midriasis', 'Miosis', 'Arreactiva', 'Anisocoria']} />
      <SelectGroup label="T. Llenado Capilar" value={llenado} onChange={onChangeLlenado} options={['', '< 2 seg (Normal)', '2-3 seg', '> 3 seg (Alterado)']} />
    </div>
  </div>
);

const CPSPGrid = ({ regions, cpsp, onToggle }) => (
  <div style={styles.cpspGrid}>
    {regions.map((region, i) => (
      <div key={i} style={styles.cpspCard}>
        <div style={styles.cpspName}>{region}</div>
        <div style={styles.cpspBtns}>
          <button
            onClick={() => onToggle(region, 'cp')}
            style={{ ...styles.cpspBtn, ...(cpsp[region] === 'cp' && styles.cpspBtnCpOn) }}
          >
            CP
          </button>
          <button
            onClick={() => onToggle(region, 'sp')}
            style={{ ...styles.cpspBtn, ...(cpsp[region] === 'sp' && styles.cpspBtnSpOn) }}
          >
            SP
          </button>
        </div>
      </div>
    ))}
  </div>
);

const LesionMap = ({ lesions, activeLesionType, onPlaceMarker, lesionTypes, onSelectLesionType, onDeleteLesion }) => (
  <div style={styles.lesionContent}>
    <div style={styles.lesionMapWrap}>
      <div style={styles.lesionMapTitle}>Mapa Corporal — Haga clic para marcar</div>
      <div style={styles.bodyMapFigures}>








{/**Aqui empieza la parte frontal del MUÑECO */}
        <div style={styles.bodyMapContainer}>
          <div style={styles.bodyMapLabel}>FRONTAL</div>

          <svg
            viewBox="0 0 120 300"
            onClick={(e) => onPlaceMarker(e, 'front')}
            style={styles.bodySvg}
          >
            {/* CABEZA */}
            <ellipse cx="60" cy="25" rx="22" ry="25" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5" />
            {/* CUELLO */}
            <rect x="50" y="47" width="20" height="12" rx="3" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5" />
            {/* TORAX CENTRAL */}
            <path d="M35 59 Q33 75 35 100 L40 140 L80 140 L85 100 Q87 75 85 59 Z" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5" />
            {/* LINEAS DE SEPARACION TORAX-BRAZOS */}
            <line x1="35" y1="59" x2="30" y2="70" stroke="#c9b99a" strokeWidth="1" />
            <line x1="85" y1="59" x2="90" y2="70" stroke="#c9b99a" strokeWidth="1" />
            {/* BRAZO IZQUIERDO - CILINDRICO */}
            <path d="M30 70 Q20 75 15 95 L15 130 Q18 140 25 140 Q30 135 35 100 Q33 85 35 70 Z" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5"/>
            {/* BRAZO DERECHO - CILINDRICO */}
            <path d="M90 70 Q100 75 105 95 L105 130 Q102 140 95 140 Q90 135 85 100 Q87 85 85 70 Z" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5"/>
            {/* ANTEBRAZO IZQUIERDO */}
            <path d="M15 130 Q12 150 12 170 Q15 180 22 180 Q25 170 25 140 Z" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5"/>
            {/* ANTEBRAZO DERECHO */}
            <path d="M105 130 Q108 150 108 170 Q105 180 98 180 Q95 170 95 140 Z" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5"/>
            {/* MANO IZQUIERDA */}
            <ellipse cx="17" cy="195" rx="8" ry="12" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5"/>
            {/* MANO DERECHA */}
            <ellipse cx="103" cy="195" rx="8" ry="12" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5"/>
            {/* PELVIS Y ABDOMEN */}
            <path d="M40 140 L38 180 Q60 190 82 180 L80 140 Z" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5"/>
            {/* MUSLO IZQUIERDO */}
            <path d="M45 180 Q40 210 42 240 Q50 250 58 248 Q55 220 50 180 Z" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5"/>
            {/* MUSLO DERECHO */}
            <path d="M75 180 Q80 210 78 240 Q70 250 62 248 Q65 220 70 180 Z" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5"/>
            {/* PIERNA IZQUIERDA */}
            <path d="M42 240 Q40 260 42 280 Q50 280 58 275 Q55 260 50 240 Z" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5"/>
            {/* PIERNA DERECHA */}
            <path d="M78 240 Q80 260 78 280 Q70 280 62 275 Q65 260 70 240 Z" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5"/>
            {/* PIE IZQUIERDO */}
            <ellipse cx="46" cy="285" rx="7" ry="10" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5"/>
            {/* PIE DERECHO */}
            <ellipse cx="74" cy="285" rx="7" ry="10" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5"/>
            {lesions.filter(l => l.side === 'front').map(l => (
              <circle
                key={l.id}
                cx={l.posX}
                cy={l.posY}
                r="5"
                fill="#c8433a"
                stroke="white"
                strokeWidth="2"
              >
                <title>{l.id}. {l.type.label} — {l.zone}</title>
              </circle>
            ))}
          </svg>



          {lesions.filter(l => l.side === 'front').length > 0 && (
            <div style={styles.lesionOverlay}>
              {lesions.filter(l => l.side === 'front').map(l => (
                <div
                  key={l.id}
                  style={{
                    ...styles.lesionMarker,
                    left: `calc(${(l.posX / 120) * 100}% - 10px)`,
                    top: `calc(${(l.posY / 300) * 100}% - 10px)`
                  }}
                  title={`${l.id}. ${l.type.label} — ${l.zone}`}
                >
                  {l.id}
                </div>
              ))}
            </div>
          )}
        </div>







{/**Aqui empieza la parte POSTERIOR del MUÑECO */}

<div style={styles.bodyMapContainer}>
          <div style={styles.bodyMapLabel}>POSTERIOR</div>

          <svg
            viewBox="0 0 120 300"
            onClick={(e) => onPlaceMarker(e, 'back')}
            style={styles.bodySvg}
          >
            {/* CABEZA */}
            <ellipse cx="60" cy="25" rx="22" ry="25" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5" />
            {/* CUELLO */}
            <rect x="50" y="47" width="20" height="12" rx="3" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5" />
            {/* ESPALDA CENTRAL */}
            <path d="M35 59 Q33 75 35 100 L40 140 L80 140 L85 100 Q87 75 85 59 Z" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5" />
            {/* LINEA VERTEBRAL */}
            <line x1="60" y1="59" x2="60" y2="140" stroke="#c9b99a" strokeWidth="1" strokeDasharray="2" />
            {/* LINEAS DE SEPARACION ESPALDA-BRAZOS */}
            <line x1="35" y1="59" x2="30" y2="70" stroke="#c9b99a" strokeWidth="1" />
            <line x1="85" y1="59" x2="90" y2="70" stroke="#c9b99a" strokeWidth="1" />
            {/* BRAZO IZQUIERDO POSTERIOR - CILINDRICO */}
            <path d="M30 70 Q20 75 15 95 L15 130 Q18 140 25 140 Q30 135 35 100 Q33 85 35 70 Z" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5"/>
            {/* BRAZO DERECHO POSTERIOR - CILINDRICO */}
            <path d="M90 70 Q100 75 105 95 L105 130 Q102 140 95 140 Q90 135 85 100 Q87 85 85 70 Z" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5"/>
            {/* ANTEBRAZO IZQUIERDO */}
            <path d="M15 130 Q12 150 12 170 Q15 180 22 180 Q25 170 25 140 Z" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5"/>
            {/* ANTEBRAZO DERECHO */}
            <path d="M105 130 Q108 150 108 170 Q105 180 98 180 Q95 170 95 140 Z" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5"/>
            {/* MANO IZQUIERDA */}
            <ellipse cx="17" cy="195" rx="8" ry="12" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5"/>
            {/* MANO DERECHA */}
            <ellipse cx="103" cy="195" rx="8" ry="12" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5"/>
            {/* PELVIS POSTERIOR */}
            <path d="M40 140 L38 180 Q60 190 82 180 L80 140 Z" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5"/>
            {/* LINEA SACRA */}
            <line x1="60" y1="140" x2="60" y2="180" stroke="#c9b99a" strokeWidth="1" strokeDasharray="2" />
            {/* MUSLO IZQUIERDO */}
            <path d="M45 180 Q40 210 42 240 Q50 250 58 248 Q55 220 50 180 Z" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5"/>
            {/* MUSLO DERECHO */}
            <path d="M75 180 Q80 210 78 240 Q70 250 62 248 Q65 220 70 180 Z" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5"/>
            {/* PIERNA IZQUIERDA */}
            <path d="M42 240 Q40 260 42 280 Q50 280 58 275 Q55 260 50 240 Z" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5"/>
            {/* PIERNA DERECHA */}
            <path d="M78 240 Q80 260 78 280 Q70 280 62 275 Q65 260 70 240 Z" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5"/>
            {/* PIE IZQUIERDO */}
            <ellipse cx="46" cy="285" rx="7" ry="10" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5"/>
            {/* PIE DERECHO */}
            <ellipse cx="74" cy="285" rx="7" ry="10" fill="#f0e8d8" stroke="#c9b99a" strokeWidth="1.5"/>
            {lesions.filter(l => l.side === 'back').map(l => (
              <circle
                key={l.id}
                cx={l.posX}
                cy={l.posY}
                r="5"
                fill="#c8433a"
                stroke="white"
                strokeWidth="2"
              >
                <title>{l.id}. {l.type.label} — {l.zone}</title>
              </circle>
            ))}
          </svg>



          {lesions.filter(l => l.side === 'back').length > 0 && (
            <div style={styles.lesionOverlay}>
              {lesions.filter(l => l.side === 'back').map(l => (
                <div
                  key={l.id}
                  style={{
                    ...styles.lesionMarker,
                    left: `calc(${(l.posX / 120) * 100}% - 10px)`,
                    top: `calc(${(l.posY / 300) * 100}% - 10px)`
                  }}
                  title={`${l.id}. ${l.type.label} — ${l.zone}`}
                >
                  {l.id}
                </div>
              ))}
            </div>
          )}
        </div>

















      </div>
      <div style={styles.activeLesionDisplay}>Tipo: <strong style={{ color: '#0a3d62' }}>{activeLesionType ? `${activeLesionType.n}. ${activeLesionType.label}` : '— Seleccione tipo —'}</strong></div>
    </div>

    <div style={styles.lesionTypes}>
      <label style={styles.label}>Tipo de Lesión</label>
      <div style={styles.lesionTypeGrid}>
        {lesionTypes.map(lt => (
          <button
            key={lt.n}
            onClick={() => onSelectLesionType(lt.n, lt.label)}
            style={{
              ...styles.lesionTypeItem,
              ...(activeLesionType?.n === lt.n && styles.lesionTypeItemSelected)
            }}
          >
            <div style={styles.lesionTypeNum}>{lt.n}</div>
            <span style={styles.lesionTypeLabel}>{lt.label}</span>
          </button>
        ))}
      </div>

      <label style={{ ...styles.label, marginTop: '16px' }}>Lesiones Registradas</label>
      {lesions.length === 0 ? (
        <div style={styles.emptyState}>Ninguna lesión registrada aún.</div>
      ) : (
        <div style={styles.lesionLog}>
          {lesions.map(l => (
            <div key={l.id} style={styles.lesionLogItem}>
              <div style={styles.lesionLogNum}>{l.id}</div>
              <div style={styles.lesionLogContent}>
                <div style={styles.lesionLogText}><strong>{l.type.label}</strong></div>
                <div style={styles.lesionLogZone}>{l.side === 'front' ? '🫀 Frontal' : '🔙 Posterior'} — {l.zone}</div>
              </div>
              <button onClick={() => onDeleteLesion(l.id)} style={styles.btnDel}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

const ExamGrid = ({ exams, selected, onToggle }) => (
  <div style={styles.examGrid}>
    {exams.map(e => (
      <button
        key={e.n}
        onClick={() => onToggle(e.n)}
        style={{
          ...styles.examItem,
          ...(selected.has(e.n) && styles.examItemChecked)
        }}
      >
        <div style={styles.examBox}>
          {selected.has(e.n) && <span style={styles.examMark}>✓</span>}
        </div>
        <span style={styles.examLabel}>{e.label}</span>
      </button>
    ))}
  </div>
);

const DiagnosticoTable = ({ diags, onUpdate, onToggleStatus, onDelete, type }) => (
  <table style={styles.diagTable}>
    <thead>
      <tr style={styles.diagTableHead}>
        <th style={{ ...styles.diagTh, width: '40px' }}>#</th>
        <th style={styles.diagTh}>Diagnóstico</th>
        <th style={{ ...styles.diagTh, width: '100px' }}>CIE</th>
        <th style={{ ...styles.diagTh, width: '120px' }}>PRE/DEF</th>
        <th style={{ ...styles.diagTh, width: '36px' }}></th>
      </tr>
    </thead>
    <tbody>
      {diags.map(d => (
        <tr key={d.id} style={styles.diagTableRow}>
          <td style={styles.diagTd}>{d.num}</td>
          <td style={styles.diagTd}>
            <input
              type="text"
              value={d.nombre}
              onChange={(e) => onUpdate(type, d.id, 'nombre', e.target.value)}
              placeholder="Diagnóstico..."
              style={styles.input}
            />
          </td>
          <td style={styles.diagTd}>
            <input
              type="text"
              value={d.cie}
              onChange={(e) => onUpdate(type, d.id, 'cie', e.target.value)}
              placeholder="CIE"
              style={{ ...styles.input, fontFamily: 'Montserrat', fontWeight: 700, color: '#0a3d62' }}
            />
          </td>
          <td style={styles.diagTd}>
            <div style={styles.prdBtns}>
              <button
                onClick={() => onToggleStatus(type, d.id, 'pre')}
                style={{
                  ...styles.prdBtn,
                  ...(d.status === 'pre' && styles.prdBtnPreOn)
                }}
              >
                PRE
              </button>
              <button
                onClick={() => onToggleStatus(type, d.id, 'def')}
                style={{
                  ...styles.prdBtn,
                  ...(d.status === 'def' && styles.prdBtnDefOn)
                }}
              >
                DEF
              </button>
            </div>
          </td>
          <td style={styles.diagTd}>
            <button onClick={() => onDelete(type, d.id)} style={styles.btnDel}>✕</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const MedicationTable = ({ meds, onUpdate, onDelete }) => (
  <table style={styles.diagTable}>
    <thead>
      <tr style={styles.diagTableHead}>
        <th style={{ ...styles.diagTh, width: '40px' }}>#</th>
        <th style={styles.diagTh}>Medicamento</th>
        <th style={styles.diagTh}>Posología</th>
        <th style={{ ...styles.diagTh, width: '36px' }}></th>
      </tr>
    </thead>
    <tbody>
      {meds.map(m => (
        <tr key={m.id} style={styles.diagTableRow}>
          <td style={styles.diagTd}><div style={styles.medNum}>{m.num}</div></td>
          <td style={styles.diagTd}>
            <input
              type="text"
              value={m.nombre}
              onChange={(e) => onUpdate(m.id, 'nombre', e.target.value)}
              placeholder="Medicamento..."
              style={styles.input}
            />
          </td>
          <td style={styles.diagTd}>
            <input
              type="text"
              value={m.posologia}
              onChange={(e) => onUpdate(m.id, 'posologia', e.target.value)}
              placeholder="Dosis, frecuencia..."
              style={styles.input}
            />
          </td>
          <td style={styles.diagTd}>
            <button onClick={() => onDelete(m.id)} style={styles.btnDel}>✕</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const EventTypeSelector = ({ formData, setFormData }) => {
  const eventTypes = {
    '⚠️ Accidente': ['🚗 Accidente de Tránsito', '🪂 Caída', '🔥 Quemadura', '🐾 Mordedura', '💧 Ahogamiento', '🔩 Cuerpo Extraño', '⚙️ Aplastamiento', 'Otro Accidente'],
    '🔴 Violencia': ['🔫 Por Arma de Fuego', '🔪 Por Arma C. Punzante', '👊 Por Riña', '🏠 Violencia Familiar', '💢 Abuso Físico', '🧠 Abuso Psicológico', '⚠️ Abuso Sexual', 'Otra Violencia'],
    '🧪 Intoxicación': ['🍺 Alcohólica', '🍽️ Alimentaria', '💊 Por Drogas', '💨 Inhalación de Gases', '🐍 Envenenamiento', '🕷️ Picadura', '💉 Anafilaxia', 'Otra Intoxicación']
  };

  return (
    <div>
      {Object.entries(eventTypes).map(([category, types]) => (
        <div key={category} style={{ marginBottom: '12px' }}>
          <div style={styles.eventTypeCategory}>{category}</div>
          <div style={styles.chipGroup}>
            {types.map((type, i) => (
              <button
                key={i}
                onClick={() => {
                  const newTypes = formData.tiposEvento.includes(type)
                    ? formData.tiposEvento.filter(t => t !== type)
                    : [...formData.tiposEvento, type];
                  setFormData(prev => ({ ...prev, tiposEvento: newTypes }));
                }}
                style={{
                  ...styles.chip,
                  ...(formData.tiposEvento.includes(type) && styles.chipActive)
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const StatItem = ({ label, value }) => (
  <div style={styles.bbStat}>
    <span style={styles.bbStatLabel}>{label}</span>
    <span style={styles.bbStatVal}>{value}</span>
  </div>
);

// ========== ESTILOS ==========
const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

* { box-sizing: border-box; }
body { margin: 0; padding: 0; font-family: 'Outfit', sans-serif; background: #eef2f7; color: #4472a6; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #69C9BA; }
::-webkit-scrollbar-thumb { background: #595759; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #1e88e5; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
`;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#ffffff'
    
  },
  atlasHeader: {
    background: 'white',
    borderBottom: '3px solid #76c4d5',
    padding: '3px 21px',
    position: 'sticky',
    top: 0,
    zIndex: 500,
    boxShadow: '0 2px 10px rgba(68, 171, 85, 0.08)'
  },
  atlasHeaderContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px'
  },
  atlasLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  atlasTitle: {
    fontFamily: 'Montserrat',
    fontSize: '1.12rem',
    fontWeight: 700,
    color: '#595759',
    lineHeight: 1.15
  },
  atlasSubtitle: {
    fontSize: '.58rem',
    color: '#8aaabf',
    letterSpacing: '.1em',
    textTransform: 'uppercase'
  },
  atlasInfo: {
    flex: 1,
    marginLeft: '12px',
    
  },
  atlasFormTitle: {
    fontFamily: 'Montserrat',
    fontSize: '.95rem',
    fontWeight: 800,
    color: '#595759',
    letterSpacing: '.06em',
    textTransform: 'uppercase'
  },
  atlasFormSubtitle: {
    fontSize: '.6rem',
    color: '#595759',
    letterSpacing: '.08em'
  },
  btnPrint: {
    padding: '8px 15px',
    background: 'transparent',
    border: '1.5px solid #c8d8e8',
    borderRadius: '7px',
    color: '#595759',
    fontSize: '.8rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all .2s',
    marginRight: '8px'
  },
  btnSave: {
    padding: '8px 15px',
    background: 'transparent',
    border: '1.5px solid #c8d8e8',
    borderRadius: '7px',
    color: '#595759',
    fontSize: '.8rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all .2s'
  },
  appHeader: {
    background: 'linear-gradient(135deg, #76C4D5 0%, #76C4D5 100%)',
    position: 'sticky',
    top: '67px',
    zIndex: 200,
    boxShadow: '0 3px 10px rgba(85,87,89,0.35)'
  },
  headerInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 32px',
    maxWidth: '1280px',
    margin: '0 auto'
  },
  headerBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  brandIcon: {
    width: '44px',
    height: '44px',
    background: 'rgba(255,255,255,0.15)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.4rem',
    border: '1px solid rgba(255,255,255,0.25)'
  },
  h1: {
    fontFamily: 'Montserrat',
    fontSize: '1.6rem',
    color: 'white',
    letterSpacing: '0.1em',
    lineHeight: 1,
    margin: 0
  },
  headerSubtitle: {
    fontSize: '0.68rem',
    color: 'rgba(220,235,255,0.65)',
    letterSpacing: '0.1em',
    fontWeight: 400,
    textTransform: 'uppercase',
    margin: 0
  },
  headerMeta: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center'
  },
  urgencyBadge: {
    background: 'rgba(54, 168, 114, 0.15)',
    border: '1px solid rgba(85, 87, 89, 0.28)',
    color: 'rgb(85, 87, 89)',
    padding: '6px 14px',
    borderRadius: '100px',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  urgencyDot: {
    width: '7px',
    height: '7px',
    background: '#76C4D5',
    borderRadius: '50%',
    animation: 'blink 1s infinite',
    display: 'inline-block'
  },
  btnHdrOutline: {
    padding: '9px 18px',
    borderRadius: '8px',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    border: '1px solid rgba(255,255,255,0.3)',
    background: 'rgba(255,255,255,0.12)',
    color: 'white',
    transition: 'all 0.2s'
  },
  btnHdrWhite: {
    padding: '9px 18px',
    borderRadius: '8px',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    background: 'white',
    color: '#0a3d62',
    transition: 'all 0.2s'
  },
  appBody: {
    maxWidth: '1360px',
    margin: '0 auto',
    padding: '12px 24px 100px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  card: {
    background: 'white',
    borderRadius: '14px',
    border: '1px solid #c8d8e8',
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(10,61,98,0.08)',
    transition: 'box-shadow 0.2s'
  },
  cardHeader: {
    padding: '13px 22px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'linear-gradient(135deg, #595759 0%, #595759 100%)',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  },
  cardNum: {
    fontFamily: 'Montserrat',
    fontSize: '1.3rem',
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 1,
    width: '28px',
    flexShrink: 0
  },
  cardTitle: {
    fontFamily: 'Montserrat',
    fontSize: '1rem',
    color: 'white',
    letterSpacing: '0.08em'
  },
  cardBody: {
    padding: '20px 22px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '0'
  },
  label: {
    fontSize: '0.68rem',
    fontWeight: 700,
    color: '#0000009e',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '5px'
  },
  input: {
    width: '100%',
    background: '#f4f7fb',
    border: '1.5px solid #c8d8e8',
    borderRadius: '8px',
    padding: '9px 12px',
    fontSize: '0.88rem',
   fontFamily: 'Montserrat',
    outline: 'none',
    transition: 'border-color 0.2s',
    color: '#1b3f69'
  },
  textarea: {
    width: '100%',
    background: '#f4f7fb',
    border: '1.5px solid #c8d8e8',
    borderRadius: '8px',
    padding: '9px 12px',
    fontSize: '0.88rem',
    fontFamily: 'Montserrat',
    outline: 'none',
    transition: 'border-color 0.2s',
    color: '#1c2a3a',
    resize: 'vertical',
    lineHeight: 1.6
  },
  select: {
    width: '100%',
    background: '#f4f7fb',
    border: '1.5px solid #c8d8e8',
    borderRadius: '8px',
    padding: '9px 12px',
    fontSize: '0.88rem',
    fontFamily: 'Montserrat',
    outline: 'none',
    cursor: 'pointer',
    color: '#595759'
  },
  subtitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#76C4D5',
    marginBottom: '10px',
    marginTop: 0
  },
  gridFlex2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
    marginBottom: '10px'
  },
  gridFlex3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '14px',
    marginBottom: '10px'
  },
  gridFlex4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '14px',
    marginBottom: '10px'
  },
  gridFlex5: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '14px',
    marginBottom: '10px'
  },
  gridFlex6: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '10px',
    marginBottom: '1px'
  },
  gridFlex8: {
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: '14px',
    marginBottom: '14px'
  },
  chipGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '22px',
    marginBottom: '14px'
  },
  chipGroupRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '16px',
    flexWrap: 'wrap'
  },
  chipGroupContainer: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  chip: {
    padding: '7px 14px',
    borderRadius: '100px',
    border: '1.5px solid #c8d8e8',
    background: '#f4f7fb',
    color: '#5a6a7a',
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
    userSelect: 'none',
    fontFamily: "'Outfit', sans-serif'",
    outline: 'none'
  },
  chipActive: {
    background: '#76C4D5',
    borderColor: '#595759',
    color: 'white'
  },
  vitalesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '12px',
    marginBottom: '18px'
  },
  vitalCard: {
    background: '#f4f7fb',
    border: '1.5px solid #c8d8e8',
    borderTop: '3px solid #1e88e5',
    borderRadius: '12px',
    padding: '14px 12px',
    textAlign: 'center'
  },
  vitalIcon: {
    fontSize: '1.3rem',
    marginBottom: '6px'
  },
  vitalName: {
    fontSize: '0.68rem',
    fontWeight: 700,
    color: '#1e88e5',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: '8px'
  },
  vitalInput: {
    width: '100%',
    border: '1.5px solid #c8d8e8',
    borderRadius: '7px',
    padding: '8px 6px',
    fontFamily: 'Montserrat',
    fontSize: '1.1rem',
    fontWeight: 700,
    textAlign: 'center',
    background: 'white',
    color: '#0a3d62',
    outline: 'none'
  },
  vitalUnit: {
    fontSize: '0.68rem',
    color: '#5a6a7a',
    marginTop: '4px'
  },
  glasgowPanel: {
    background: '#e3f0fc',
    border: '1.5px solid #c8d8e8',
    borderLeft: '4px solid #0a3d62',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '14px'
  },
  glasgowTitle: {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '1rem',
    letterSpacing: '0.08em',
    color: '#0a3d62',
    marginBottom: '14px'
  },
  glasgowGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '14px',
    marginBottom: '14px'
  },
  glasgowInput: {
    width: '100%',
    border: '2px solid #c8d8e8',
    borderRadius: '10px',
    padding: '12px 10px',
    fontFamily: 'Montserrat',
    fontSize: '1.6rem',
    fontWeight: 700,
    textAlign: 'center',
    background: 'white',
    outline: 'none',
    color: '#0a3d62'
  },
  glasgowTotalInput: {
    width: '100%',
    border: '3px solid #0a3d62',
    borderRadius: '10px',
    padding: '12px 10px',
    fontFamily: 'Montserrat',
    fontSize: '1.8rem',
    fontWeight: 700,
    textAlign: 'center',
    background: '#e3f0fc',
    color: '#0a3d62',
    outline: 'none',
    cursor: 'default'
  },
  glasgowHelp: {
    fontSize: '0.68rem',
    color: '#5a6a7a',
    marginTop: '6px',
    lineHeight: 1.4
  },
  cpspGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px'
  },
  cpspCard: {
    border: '1.5px solid #c8d8e8',
    borderRadius: '10px',
    overflow: 'hidden',
    background: 'white'
  },
  cpspName: {
    padding: '8px 10px',
    fontSize: '0.72rem',
    fontWeight: 700,
    textAlign: 'center',
    background: '#e3f0fc',
    color: '#0a3d62',
    borderBottom: '1px solid #c8d8e8',
    minHeight: '46px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1.3
  },
  cpspBtns: {
    display: 'flex'
  },
  cpspBtn: {
    flex: 1,
    padding: '8px 6px',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontFamily: "'Outfit', sans-serif",
    transition: 'all 0.15s',
    color: '#5a6a7a'
  },
  cpspBtnCpOn: {
    background: '#fef2f2',
    color: '#c8433a',
    borderRight: '1px solid #c8d8e8'
  },
  cpspBtnSpOn: {
    background: '#e3f0fc',
    color: '#0a3d62'
  },
  lesionContainer: {
    marginBottom: '14px'
  },
  lesionContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  lesionMapWrap: {
    background: '#f4f7fb',
    border: '1.5px solid #c8d8e8',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
  },
  lesionMapTitle: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#5a6a7a',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '4px'
  },
  bodyMapFigures: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center'
  },
  bodyMapContainer: {
    position: 'relative',
    textAlign: 'center'
  },
  bodyMapLabel: {
    fontSize: '0.65rem',
    color: '#5a6a7a',
    marginBottom: '4px',
    fontWeight: 600
  },
  bodySvg: {
    width: '120px',
    cursor: 'crosshair'
  },
  lesionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none'
  },
  lesionMarker: {
    position: 'absolute',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: '#76C4D5',
    border: '2px solid white',
    boxShadow: '0 2px 6px rgb(105, 201, 187)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '0.62rem',
    fontWeight: 800,
    cursor: 'pointer',
    pointerEvents: 'all'
  },
  activeLesionDisplay: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: '#5a6a7a',
    textAlign: 'center',
    marginTop: '6px'
  },
  lesionTypes: {
    flex: 1
  },
  lesionTypeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px'
  },
  lesionTypeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 12px',
    border: '1.5px solid #c8d8e8',
    borderRadius: '8px',
    cursor: 'pointer',
    background: '#f4f7fb',
    transition: 'all 0.15s',
    fontSize: '0.8rem',
    fontWeight: 600
  },
  lesionTypeItemSelected: {
    borderColor: '#595759',
    background: '#76c4d56b',
  },
  lesionTypeNum: {
    width: '22px',
    height: '22px',
    borderRadius: '6px',
    background: '#76C4D5',
    color: 'white',
    fontSize: '0.72rem',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  lesionTypeLabel: {
    textAlign: 'center'
  },
  emptyState: {
    fontSize: '0.8rem',
    color: '#5a6a7a',
    padding: '8px 0'
  },
  lesionLog: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  lesionLogItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#76c4d553',
    border: '1px solid #c8d8e8',
    borderRadius: '8px',
    padding: '8px 12px',
    borderLeft: '4px solid #595759'
  },
  lesionLogNum: {
    width: '24px',
    height: '24px',
    background: '#76C4D5',
    color: 'white',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  lesionLogContent: {
    flex: 1
  },
  lesionLogText: {
    fontSize: '0.82rem',
    color: '#595759',
    flex: 1
  },
  lesionLogZone: {
    fontSize: '0.75rem',
    color: '#595759',
  },
  examGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px'
  },
  examItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 12px',
    border: '1.5px solid #c8d8e8',
    borderRadius: '8px',
    cursor: 'pointer',
    background: '#f4f7fb',
    transition: 'all 0.15s',
    fontSize: '0.8rem',
    fontWeight: 600
  },
  examItemChecked: {
    borderColor: '#0a3d62',
    background: '#e3f0fc'
  },
  examBox: {
    width: '16px',
    height: '16px',
    border: '2px solid #8aaabf',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  examMark: {
    color: 'white',
    fontSize: '0.6rem',
    fontWeight: 800
  },
  examLabel: {
    textAlign: 'center'
  },
  diagTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '16px'
  },
  diagTableHead: {
    background: '#76C4D5',
    borderBottom: '2px solid #c8d8e8'
  },
  diagTh: {
    padding: '9px 12px',
    textAlign: 'left',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'white'
  },
  diagTableRow: {
    borderBottom: '1px solid #c8d8e8'
  },
  diagTd: {
    padding: '8px 10px',
    verticalAlign: 'middle'
  },
  prdBtns: {
    display: 'flex',
    gap: '4px'
  },
  prdBtn: {
    flex: 1,
    padding: '5px 10px',
    borderRadius: '100px',
    border: '1.5px solid #c8d8e8',
    fontSize: '0.7rem',
    fontWeight: 700,
    cursor: 'pointer',
    background: 'transparent',
    fontFamily: 'Montserrat',
    transition: 'all 0.12s',
    letterSpacing: '0.04em',
    color: '#5a6a7a'
  },
  prdBtnPreOn: {
    background: '#fffff0',
    borderColor: '#d69e2e',
    color: '#7a4900'
  },
  prdBtnDefOn: {
    background: '#e3f0fc',
    borderColor: '#0a3d62',
    color: '#0a3d62'
  },
  medNum: {
    width: '28px',
    height: '28px',
    background: '#76C4D5',
    color: 'white',
    borderRadius: '7px',
    fontSize: '0.78rem',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  btnAdd: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 16px',
    background: 'transparent',
    border: '1.5px dashed #1e88e5',
    borderRadius: '8px',
    color: '#1e88e5',
    fontSize: '0.82rem',
    cursor: 'pointer',
    fontFamily: 'Montserrat',
    transition: 'all 0.2s',
    fontWeight: 500,
    marginTop: '10px'
  },
  btnDel: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    background: '#fef2f2',
    border: '1px solid #f5b4b0',
    color: '#c8433a',
    fontSize: '0.85rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s'
  },
  altaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '10px',
    marginBottom: '12px'
  },
  altaOption: {
    border: '2px solid #c8d8e8',
    borderRadius: '14px',
    padding: '3px 9px',
    textAlign: 'center',
    cursor: 'pointer',
    background: '#f4f7fb',
    transition: 'all 0.15s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  altaOptionSelA: {
    borderColor: '#1a5682',
    background: '#e3f0fc'
  },
  altaOptionSelB: {
    borderColor: '#c8433a',
    background: '#fef2f2'
  },
  aoIcon: {
    fontSize: '1.5rem',
    marginBottom: '3px'
  },
  aoName: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#1c2a3a',
    display: 'block'
  },
  eventTypeCategory: {
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    marginBottom: '8px',
    textTransform: 'uppercase'
  },
  obsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px'
  },
  antsDescSection: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #c8d8e8'
  },
  bottomBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: '#ffffff',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    padding: '1px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
    boxShadow: '0 -4px 20px rgba(10,61,98,0.25)'
  },
  bbInfo: {
    display: 'flex',
    gap: '18px',
    alignItems: 'center'
  },
  bbStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px'
  },
  bbStatLabel: {
    fontSize: '0.62rem',
    color: 'rgba(85,87,89,0.9)',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase'
  },
  bbStatVal: {
    fontFamily: 'Montserrat',
    fontSize: '0.58rem',
    color: '#595759',
    fontWeight: 700
  },
  bbBtns: {
    display: 'flex',
    gap: '10px'
  },
  btnPrintBar: {
    padding: '1px 10px',
    background: '#ffffff',
    color: 'rgba(85, 87, 89, 1)',
    border: '1px solid rgba(118,196,213,0.9)',
    borderRadius: '100px',
    fontFamily: 'Montserrat',
    fontSize: '0.68rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  btnSaveBar: {
    padding: '1px 10px',
    background: '#ffffff',
    color: '#595759',
    border: '1.5px solid rgba(118,196,213,0.9)',
    borderRadius: '100px',
    fontFamily: 'Montserrat',
    fontSize: '0.68rem',
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: '0.02em',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '7px'
  },
  toast: {
    position: 'fixed',
    top: '80px',
    right: '24px',
    background: '#0a3d62',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: 600,
    boxShadow: '0 4px 20px rgba(10,61,98,0.35)',
    zIndex: 999,
    borderLeft: '4px solid #64b5f6',
    animation: 'fadeInUp 0.3s ease-out'
  }
};

export default Emergencia;