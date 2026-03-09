# 📐 NUEVA ARQUITECTURA - CLÍNICA ATLAS

## 📊 Estructura Actual vs Nueva

### ❌ ANTES (Plana y desorganizada)
```
src/
├── pages/           ← 20 archivos .jsx gigantes
│   ├── Emergencia.jsx (300+ líneas)
│   ├── Anamnesis.jsx
│   ├── Evolucion.jsx
│   └── ... (17 más)
├── components/      ← UI mix sin orden
│   ├── Calendar.jsx
│   ├── AppointmentModal.jsx
│   ├── GraficoPastelServicio.jsx
│   └── ui/          ← Solo input, button, card
├── services/        ← Solo 2 servicios
│   ├── authService.js
│   └── userService.js
└── ...
```

**PROBLEMAS:**
- Componentes monolíticos (300+ líneas)
- Lógica mezclada con UI
- Difícil reutilizar código
- Sin sistema de diseño
- Escalabilidad limitada

---

### ✅ DESPUÉS (Modular y profesional)
```
src/
├── modules/                    ← NUEVO: Código por feature/módulo
│   ├── emergencia/
│   │   ├── Emergencia.jsx            (100 líneas - solo container)
│   │   ├── components/
│   │   │   ├── EmergenciaForm.jsx    (renderiza secciones)
│   │   │   ├── sections/
│   │   │   │   ├── InstitutionSection.jsx
│   │   │   │   ├── AdmissionSection.jsx
│   │   │   │   ├── VitalsSection.jsx
│   │   │   │   └── ...
│   │   │   └── inputs/
│   │   ├── hooks/
│   │   │   ├── useEmergenciaForm.js  (lógica del formulario)
│   │   │   └── useVitalesCalcs.js
│   │   ├── services/
│   │   │   └── emergenciaService.js  (API calls)
│   │   ├── types/
│   │   │   └── emergencia.types.js
│   │   └── index.js                 (exportar el módulo)
│   ├── anamnesis/                   (misma estructura)
│   ├── evolucion/
│   ├── dashboard/
│   └── ... (otros módulos)
│
├── shared/                     ← NUEVO: Código compartido
│   ├── components/
│   │   ├── ui/                 (Button, Card, Input, Badge)
│   │   ├── forms/              ← NUEVO: Componentes de formulario
│   │   │   ├── MedicalInput.jsx
│   │   │   ├── VitalsInput.jsx (especializado para vitales)
│   │   │   ├── DiagnosisInput.jsx
│   │   │   └── index.js
│   │   ├── layouts/            (cuando se necesite)
│   │   └── index.js
│   ├── hooks/                  ← NUEVO: 8+ hooks reutilizables
│   │   ├── useForm.js
│   │   ├── useFirestore.js
│   │   ├── useMedicalValidation.js
│   │   ├── useUtils.js         (debounce, pagination, etc)
│   │   └── index.js
│   ├── theme/                  ← NUEVO: Sistema de diseño
│   │   ├── colors.js           (paleta profesional)
│   │   ├── typography.js       (tipografía)
│   │   └── index.js
│   └── ...
│
├── types/                      ← NUEVO: Interfaces compartidas
│   ├── patient.types.js
│   ├── user.types.js
│   └── forms.types.js
│
├── contexts/                   (AuthContext, etc)
├── services/                   (Servicios compartidos)
├── utils/                      (Utilidades)
├── App.jsx
└── main.jsx
```

---

## 🎨 SISTEMA DE DISEÑO CREADO

### 1. PALETA DE COLORES
📁 `src/shared/theme/colors.js`

```javascript
import { colors, semantic, badges, modules } from '@/shared/theme';

// Colores por estado médico
semantic.states.urgentBg   // Rojo para emergencias
semantic.states.urgentText
semantic.states.pendingBg  // Naranja para pendientes
semantic.states.completedBg // Verde para completado

// O directo por módulo
modules.emergencia.primary  // Rojo (crítico)
modules.anamnesis.primary   // Azul (información)
modules.evolucion.primary   // Naranja (en progreso)
```

### 2. TIPOGRAFÍA Y ESPACIADO
📁 `src/shared/theme/typography.js`

```javascript
import { typography, spacing, shadows } from '@/shared/theme';

// Escalas predefinidas
typography.fontSize.h1     // 36px heading
typography.fontSize.h3     // 24px para títulos
typography.fontSize.label  // 14px para labels

spacing.padding.md // 12px 20px
spacing.gap.lg     // 24px
```

---

## 🪝 HOOKS REUTILIZABLES CREADOS

### 1. `useForm.js` - Manejo completo de formularios
```javascript
import { useForm } from '@/shared/hooks';

const { 
  formData,
  handleChange,
  handleArrayChange,
  addArrayItem,      // Para medicamentos, diagnósticos
  removeArrayItem,
  handleSubmit,
  errors,
  isDirty,
  isSubmitting 
} = useForm(
  initialValues,
  async (data) => await save(data),
  (data) => validate(data)
);
```

### 2. `useFirestore.js` - Consultas en tiempo real
```javascript
const { data, loading, error } = useFirestoreQuery(
  query(collection(db, 'patients'), where('estado', '==', 'Atención'))
);
```

### 3. `useMedicalValidation.js` - Validaciones médicas
```javascript
const { 
  validatePressure,
  validateHeartRate,
  validateTemperature,
  calculateBMI,
  calculateAge
} = useMedicalValidation();

const errors = validatePressure(120, 80);
const bmi = calculateBMI(70, 170); // { value: 24.2, category: 'Normal' }
```

### 4. `useUtils.js` - 9 hooks de utilidad
```javascript
useDebounce(searchTerm, 500)              // Búsqueda con delay
useAsync(() => fetchData())               // Promesas
usePaginationMedical(patients, 10)        // Paginación
useLocalStorage('key', initialValue)      // localStorage
useToggle(false)                          // Boolean state
```

---

## 📦 COMPONENTES DE FORMULARIO CREADOS

### 1. `MedicalInput.jsx` - Input con label, error, unit
```jsx
<MedicalInput
  label="Presión Sistólica"
  unit="mmHg"
  type="number"
  value={sys}
  onChange={handleChange}
  error={errors.sys}
  required
/>
```

### 2. `VitalsInput.jsx` - Grid especializado para vitales
```jsx
<VitalsGrid
  vitals={formData.vitals}
  onVitalChange={handleVitalChange}
  errors={errors}
/>
// Renderiza automáticamente: PA, FC, FR, Temp, SpO2, Peso, Talla
```

### 3. `DiagnosisInput.jsx` - Manejo de diagnósticos con búsqueda
```jsx
<DiagnosisInput
  diagnoses={formData.diagnoses}
  onDiagnosisAdd={addDiagnosis}
  onDiagnosisRemove={removeDiagnosis}
  maxDiagnoses={5}
/>
```

---

## 🚀 PRÓXIMOS PASOS

### PASO 4: Refactorizar componentes
1. Comenzar con **Emergencia.jsx**
2. Extraer lógica → `hooks/useEmergenciaForm.js`
3. Dividir en secciones → `components/sections/`
4. Usar nuevos hooks y colores

**Ejemplo refactorizado:**
```javascript
// modules/emergencia/Emergencia.jsx
import { useEmergenciaForm } from './hooks/useEmergenciaForm';
import EmergenciaForm from './components/EmergenciaForm';

export const Emergencia = () => {
  const { formData, handleChange, handleSubmit, errors } = useEmergenciaForm();
  
  return <EmergenciaForm formData={formData} ... />;
};
```

---

## 📚 Referencias Rápidas

### Importar colores
```javascript
import { colors, semantic, modules, badges } from '@/shared/theme';
```

### Importar hooks
```javascript
import { 
  useForm,
  useMedicalValidation, 
  useFirestoreQuery,
  useDebounce 
} from '@/shared/hooks';
```

### Importar componentes de formulario
```javascript
import { 
  MedicalInput, 
  VitalsGrid, 
  DiagnosisInput 
} from '@/shared/components/forms';
```

---

## ✅ Ventajas de la Nueva Arquitectura

| Antes | Después |
|-------|---------|
| 300+ líneas por componente | 50-100 líneas por componente |
| Colores hardcoded | Sistema de diseño centralizado |
| Sin hooks reutilizables | 8+ hooks profesionales |
| Difícil mantener | Fácil de mantener |
| Escalabilidad limitada | Escalable a 100+ features |
| Sin validaciones médicas | Validaciones integradas |
| Código duplicado | DRY - Don't Repeat Yourself |

---

## 📊 Estadísticas

- ✅ **Carpetas creadas**: 10+
- ✅ **Archivos creados**: 15+
- ✅ **Líneas de código reutilizable**: 1000+
- ✅ **Hooks disponibles**: 8+
- ✅ **Componentes de formulario**: 3+
- ✅ **Colores en sistema**: 200+

**Resultado: Una arquitectura profesional, escalable y mantenible.**
