# 📋 GUÍA COMPLETA: REFACTORIZACIÓN DE EMERGENCIA.JSX

## 🎯 Objetivo

Refactorizar **Emergencia.jsx** de 700+ líneas a componentes modulares sin romper funcionalidad. **Migración progresiva**, no reescritura.

---

## ✅ **PASO 1: USAR EL NUEVO HOOK (YA EXISTE)**

El hook `useEmergenciaForm` **ya está creado** en:
- Ubicación: `src/modules/emergencia/hooks/useEmergenciaForm.js`
- Exporta: Todo el state y handlers del formulario

### Reemplazar el state actual en Emergencia.jsx:

```javascript
// ❌ ANTES (Emergencia.jsx)
const [formData, setFormData] = useState({
  institucion: '', 
  apellidoPaterno: '',
  // ... 100+ líneas de state
});

const [lesionCount, setLesionCount] = useState(0);
const [diagIngCount, setDiagIngCount] = useState(0);
// ... otros states

// ✅ DESPUÉS (Emergencia.jsx)
import { useEmergenciaForm } from './hooks/useEmergenciaForm';

const Emergencia = () => {
  const {
    formData,
    handleInputChange,
    handleVitalesChange,
    toggleAntecedente,
    toggleCPSP,
    placeMarker,
    toggleExam,
    addDiag,
    updateDiag,
    deleteDiag,
    addMed,
    updateMed,
    deleteMed,
    glasgowTotal,
    getGlasgowInterpretation,
    save,
    reset
  } = useEmergenciaForm();

  // El resto del componente sigue igual
  return (
    // ... JSX sin cambios
  );
};
```

---

## ✅ **PASO 2: USAR CONSTANTES CENTRALIZADAS**

Las constantes **ya están creadas** en:
- Ubicación: `src/modules/emergencia/emergencia.constants.js`
- Exporta: ANTECEDENTES, EXAM_REGIONS, LESION_TYPES, BODY_ZONES, etc.

### Reemplazar constantes en Emergencia.jsx:

```javascript
// ❌ ANTES (Emergencia.jsx)
const ANTECEDENTES = [
  { num: 1, label: 'Alérgico' },
  { num: 2, label: 'Clínico' },
  // ... hardcodeadas
];

const LESION_TYPES = [
  { n: 1, label: 'Herida Penetrante' },
  // ... hardcodeadas
];

// ✅ DESPUÉS (Emergencia.jsx)
import {
  ANTECEDENTES,
  EXAM_REGIONS,
  LESION_TYPES,
  BODY_ZONES,
  EXAM_LIST,
  ALTA_OPTIONS,
  SELECT_OPTIONS,
  INITIAL_FORM_DATA
} from './emergencia.constants';

// Ya no necesitas definirlas, solo importarlas
```

---

## ✅ **PASO 3: DIVIDIR EN COMPONENTES (PROGRESIVO)**

### Crear componentes pequeños y reutilizables:

```
emergencia/
├── Emergencia.jsx                    (Container - orquesta todo)
├── components/
│   ├── sections/
│   │   ├── InstitutionSection.jsx   (INSTITUCIÓN)
│   │   ├── AdmissionSection.jsx     (ADMISIÓN)
│   │   ├── MotiveSection.jsx        (MOTIVO)
│   │   ├── AccidentSection.jsx      (ACCIDENTE)
│   │   ├── AntecedentsSection.jsx   (ANTECEDENTES)
│   │   ├── DiseaseSection.jsx       (ENFERMEDAD)
│   │   ├── VitalsSection.jsx        (VITALES)
│   │   ├── PhysicalExamSection.jsx  (EXAMEN FÍSICO)
│   │   ├── LesionsSection.jsx       (LESIONES)
│   │   ├── ExamsSection.jsx         (EXÁMENES)
│   │   ├── DiagnosticsSection.jsx   (DIAGNÓSTICOS)
│   │   ├── TreatmentSection.jsx     (TRATAMIENTO)
│   │   └── DischargeSection.jsx     (ALTA)
│   └── forms/
│       └── FormGroup.jsx            (Input reutilizable)
├── hooks/
│   └── useEmergenciaForm.js         ✅ CREADO
├── emergencia.constants.js           ✅ CREADO
└── emergencia.validation.js          (Para crear después)
```

---

## 📝 **EJEMPLO: Crear un Componente de Sección**

### Crear: `src/modules/emergencia/components/sections/InstitutionSection.jsx`

```javascript
import React from 'react';
import { Card } from '@/components/ui/card';
import { FormGroup } from '../forms/FormGroup';

/**
 * COMPONENTE: InstitutionSection
 * Sección: Institución del Sistema
 * Responsabilidad: Solo renderizar los campos de institución
 */
export const InstitutionSection = ({ formData, onInputChange }) => {
  return (
    <Card title="Institución del Sistema">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
        <FormGroup
          label="Institución"
          value={formData.institucion}
          onChange={(v) => onInputChange('institucion', v)}
          placeholder="Nombre de la institución"
        />
        <FormGroup
          label="Unidad Operativa"
          value={formData.unidadOperativa}
          onChange={(v) => onInputChange('unidadOperativa', v)}
          placeholder="Unidad"
        />
        <FormGroup
          label="Cód. UO"
          value={formData.codUO}
          onChange={(v) => onInputChange('codUO', v)}
          placeholder="Código"
        />
        <FormGroup
          label="Parroquia"
          value={formData.parroquiaInst}
          onChange={(v) => onInputChange('parroquiaInst', v)}
          placeholder="Parroquia"
        />
        <FormGroup
          label="Cantón"
          value={formData.cantonInst}
          onChange={(v) => onInputChange('cantonInst', v)}
          placeholder="Cantón"
        />
        <FormGroup
          label="Nº Historia Clínica"
          value={formData.historiaClinica}
          onChange={(v) => onInputChange('historiaClinica', v)}
          placeholder="Número HCL"
          mono
        />
      </div>
    </Card>
  );
};

export default InstitutionSection;
```

### Luego, usar en Emergencia.jsx:

```javascript
import { InstitutionSection } from './components/sections/InstitutionSection';

const Emergencia = () => {
  const { formData, handleInputChange } = useEmergenciaForm();

  return (
    <div>
      <header>{/* ... header ... */}</header>
      
      <main>
        {/* Antes: 100+ líneas de JSX */}
        
        {/* Después: Componentes limpios */}
        <InstitutionSection
          formData={formData}
          onInputChange={handleInputChange}
        />
        
        <AdmissionSection
          formData={formData}
          onInputChange={handleInputChange}
        />
        
        {/* ... resto de secciones */}
      </main>
    </div>
  );
};
```

---

## 🔄 **ESTRATEGIA DE MIGRACIÓN (Fase por Fase)**

### **FASE 1: Preparación** (Ya hecha)
- ✅ Hook `useEmergenciaForm` creado
- ✅ Constantes centralizadas
- ✅ Esta guía

### **FASE 2: Refactorización Gradual** (Hacer ahora)
1. **Semana 1**: Crear 3 componentes de sección:
   - `InstitutionSection`
   - `AdmissionSection`
   - `MotiveSection`

2. **Semana 2**: Crear 3 más:
   - `VitalsSection`
   - `PhysicalExamSection`
   - `LesionsSection`

3. **Semana 3**: Completar:
   - `ExamsSection`
   - `DiagnosticsSection`
   - `TreatmentSection`

### **FASE 3: Validación**
- Crear `emergencia.validation.js`
- Agregar validaciones médicas específicas

### **FASE 4: Testing**
- Verificar que todo funciona igual
- Tests unitarios para componentes

---

## ✨ **BENEFICIOS DE ESTA REFACTORIZACIÓN**

| Antes | Después |
|-------|---------|
| 700+ líneas en 1 archivo | ~100 líneas + componentes limpios |
| State disperso | Hook centralizado |
| Constantes hardcodeadas | Importadas y reutilizables |
| Difícil testear | Componentes testeables |
| Difícil mantener | Mantenible |
| Difícil reutilizar | Reutilizable en otros módulos |

---

## 🎓 **CHECKLIST DE IMPLEMENTACIÓN**

- [ ] **PASO 1**: Reemplazar state con `useEmergenciaForm`
- [ ] **PASO 2**: Importar constantes de `emergencia.constants.js`
- [ ] **PASO 3**: Crear `InstitutionSection.jsx`
- [ ] **PASO 4**: Crear `AdmissionSection.jsx`
- [ ] **PASO 5**: Crear `MotiveSection.jsx`
- [ ] **PASO 6**: Crear `VitalsSection.jsx`
- [ ] **PASO 7**: Crear `PhysicalExamSection.jsx`
- [ ] **PASO 8**: Crear `LesionsSection.jsx`
- [ ] **PASO 9**: Refactorizar JSX principal
- [ ] **PASO 10**: Validar en navegador

---

## 🐛 **Si algo se rompe...**

1. **Verificar imports**: ¿Los paths son correctos?
2. **Verificar exports**: ¿El componente exporta correctamente?
3. **Verificar handlers**: ¿Se pasan correctamente los props?
4. **Console logs**: Agrega `console.log(formData)` para debuggear
5. **Revert**: Si no funciona, revertir y intentar de nuevo

---

## 📞 **Próximos Pasos**

Una vez refactorices Emergencia.jsx:

1. **Refactorizar otros módulos** siguiendo el mismo patrón
2. **Crear validaciones médicas** específicas por módulo
3. **Agregar tests unitarios** para componentes
4. **Optimizar rendimiento** con React.memo y useCallback

---

## 🚀 **Recursos**

- Hook: `src/modules/emergencia/hooks/useEmergenciaForm.js`
- Constantes: `src/modules/emergencia/emergencia.constants.js`
- Original: `src/pages/Emergencia.jsx` (actual)
- Nueva estructura: `src/modules/emergencia/` (destino)

---

¿Listo para empezar la refactorización? Comienza por el **PASO 1** en Emergencia.jsx.
