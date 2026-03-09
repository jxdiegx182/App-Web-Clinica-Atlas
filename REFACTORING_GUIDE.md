/**
 * ====================================================================
 * GUÍA DE REFACTORIZACIÓN - CÓMO USAR EL NUEVO SISTEMA
 * ====================================================================
 * 
 * Archivo: MIGRATION_GUIDE.md
 * Versión: 1.0
 * Clínica Atlas - Sistema de Gestión Hospitalaria
 */

# 🚀 GUÍA DE REFACTORIZACIÓN COMPLETA

## 1. INTRODUCCIÓN

La arquitectura ha sido **completamente reestructurada** en 4 pasos:

✅ **Paso 1**: Sistema de colores profesional médico
✅ **Paso 2**: 9 Hooks reutilizables extraídos
✅ **Paso 3**: Estructura modular por features
❌ **Paso 4**: Refactorización incremental de componentes (EN PROCESO)

---

## 2. NUEVA ESTRUCTURA DE CARPETAS

```
src/
├── App.jsx
├── main.jsx
├── index.css
├── firebaseConfig.js
│
├── modules/                    ⭐ NUEVO - Organizado por features
│   ├── emergencia/
│   │   ├── Emergencia.jsx     # Componente principal
│   │   ├── components/        # Subcomponentes
│   │   ├── hooks/             # Hooks específicos del módulo
│   │   ├── services/          # Servicios/API
│   │   └── types/             # Types del módulo
│   ├── anamnesis/
│   ├── evolucion/
│   ├── dashboard/
│   └── ...otros módulos
│
├── shared/                     ⭐ NUEVO - Código compartido
│   ├── components/
│   │   ├── ui/                # Botones, Cards, etc (Radix)
│   │   ├── forms/             # Componentes de formulario
│   │   ├── medical/           # Vitales, Diagnósticos, etc
│   │   └── layouts/           # Layouts reutilizables
│   ├── hooks/                 # 9 hooks reutilizables
│   │   ├── index.js           # useForm, useAsync, useDebounce...
│   ├── theme/                 # Sistema de diseño
│   │   ├── colors.js          # Paleta profesional
│   │   ├── typography.js      # Tipografía y espaciado
│   │   ├── shadows.js         # Sombras y efectos
│   │   └── index.js           # Exportación centralizada
│   └── etc/
│
├── services/                   # Servicios globales
│   ├── authService.js
│   ├── userService.js
│   ├── patientService.js      # ⭐ NUEVO
│   └── ...
│
├── contexts/                   # Contextos global
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx        # ⭐ NUEVO (opcional)
│
├── types/                      # ⭐ NUEVO - TypeScript types
│   ├── patient.types.js
│   ├── forms.types.js
│   └── ...
│
├── pages/                      # ⭐ Migrar aquí los componentes de página
│   └── (mantener por compatibilidad)
│
└── constants/
    ├── roles.js
    ├── accessControl.js
    └── ...
```

---

## 3. SISTEMA DE COLORES GLOBAL

### Antes ❌
```javascript
// Diseminado en todos los componentes
<Badge className="bg-red-100 text-red-700">URGENTE</Badge>
<Badge className="bg-amber-100 text-amber-700">PENDIENTE</Badge>
<Badge className="bg-yellow-100 text-yellow-700">FIRMA</Badge>
```

### Después ✅
```javascript
import { semanticColors, getStatusColor } from '@/shared/theme/colors';

// Opción 1: Usar helpers
const statusColor = getStatusColor('urgente'); // Retorna objeto con bg, text, badge
<Badge style={{ background: statusColor.bg, color: statusColor.text }}>
  {statusColor.badge}
</Badge>

// Opción 2: Usar tokens semánticos directos
<Badge style={{ 
  background: semanticColors.statusUrgent.bg,
  color: semanticColors.statusUrgent.text 
}}>
  🚨 URGENTE
</Badge>
```

### Paleta de Colores Disponibles
```javascript
// Estados médicos
semanticColors.statusUrgent      // 🚨 Crítico/Emergencia
semanticColors.statusPending     // ⚠️  Pendiente
semanticColors.statusCompleted   // ✅ Completado/Estable
semanticColors.statusInfo        // ℹ️  Información

// Botones
semanticColors.button.primary    // Azul profesional
semanticColors.button.secondary  // Gris
semanticColors.button.danger     // Rojo

// Texto
semanticColors.text.primary      // Negro
semanticColors.text.secondary    // Gris oscuro
semanticColors.text.disabled     // Gris claro
```

---

## 4. HOOKS REUTILIZABLES

### Hook 1: `useForm` - Manejo de formularios

```javascript
import { useForm } from '@/shared/hooks';

// Uso básico
const { formData, handleChange, handleSubmit, errors } = useForm(
  { nombre: '', email: '' },                    // Valores iniciales
  async (data) => saveToDB(data),               // onSubmit
  (data) => validateForm(data)                  // Validación optional
);

// En el componente
return (
  <form onSubmit={handleSubmit}>
    <input 
      value={formData.nombre}
      onChange={(e) => handleChange('nombre', e.target.value)}
    />
    {errors.nombre && <p>{errors.nombre}</p>}
    <button type="submit">Guardar</button>
  </form>
);
```

### Hook 2: `useAsync` - Operaciones asincrónicas

```javascript
import { useAsync } from '@/shared/hooks';

const { data, loading, error, execute, retry } = useAsync(
  fetchPatientData,     // Función async
  true,                 // Ejecutar inmediatamente
  [patientId]           // Dependencias
);

if (loading) return <p>Cargando...</p>;
if (error) return <p>Error: {error}</p>;
return <div>{data}</div>;
```

### Hook 3: `useDebounce` - Búsqueda y filtrado

```javascript
import { useDebounce } from '@/shared/hooks';

const debouncedSearch = useDebounce((term) => {
  fetch(`/api/search?q=${term}`)
    .then(res => setResults(res));
}, 500);  // 500ms de espera

return (
  <input 
    onChange={(e) => debouncedSearch(e.target.value)}
    placeholder="Buscar paciente..."
  />
);
```

### Hook 4: `usePagination` - Paginación

```javascript
import { usePagination } from '@/shared/hooks';

const { 
  currentPage, 
  currentItems,    // Items de la página actual
  totalPages, 
  goToPage 
} = usePagination(allPatients, 20);  // 20 items por página

return (
  <>
    {currentItems.map(patient => <PatientCard key={patient.id} {...patient} />)}
    <button onClick={() => goToPage(currentPage + 1)}>Siguiente</button>
  </>
);
```

### Hook 5: `useLocalStorage` - Persistencia local

```javascript
import { useLocalStorage } from '@/shared/hooks';

const [theme, setTheme] = useLocalStorage('app-theme', 'light');

// Automáticamente sincroniza con localStorage
setTheme('dark');  // Se guarda en localStorage automáticamente
```

### Otros Hooks Disponibles
- `usePrevious(value)` - Obtiene el valor anterior
- `useToggle(initialValue)` - Toggle booleano
- `useArray(initialValue)` - Manejo de arrays (push, remove, filter, etc)

---

## 5. REFACTORIZACIÓN DE COMPONENTES

### Patrón: Separar Lógica de Presentación

#### ANTES ❌ - Todo junto
```javascript
// Emergencia.jsx - Monolítico (300+ líneas)
export const Emergencia = () => {
  const [formData, setFormData] = useState({...}); // Lógica
  const [errors, setErrors] = useState({});        // Lógica
  const [loading, setLoading] = useState(false);   // Lógica
  
  const handleInputChange = (field, value) => {    // Lógica
    // ...
  };
  
  const handleSubmit = async () => {               // Lógica
    // ...
  };
  
  return (
    <div>                                          // Presentación
      {/* 500+ líneas de JSX */}
    </div>
  );
};
```

#### DESPUÉS ✅ - Separado

**Paso 1: Extraer hook de lógica**
```javascript
// src/modules/emergencia/hooks/useEmergenciaForm.js
export const useEmergenciaForm = () => {
  const { formData, handleChange, handleSubmit, errors } = useForm(
    { /* valores iniciales */ },
    async (data) => saveEmergencia(data),
    (data) => validateEmergencia(data)
  );
  
  return { formData, handleChange, handleSubmit, errors };
};
```

**Paso 2: Usar hook en el componente**
```javascript
// src/modules/emergencia/Emergencia.jsx
import { useEmergenciaForm } from './hooks/useEmergenciaForm';
import { EmergenciaForm } from './components/EmergenciaForm';

export const Emergencia = () => {
  const { formData, handleChange, handleSubmit, errors } = useEmergenciaForm();
  
  return <EmergenciaForm 
    data={formData}
    onChange={handleChange}
    onSubmit={handleSubmit}
    errors={errors}
  />;
};
```

**Paso 3: Componente puro de presentación**
```javascript
// src/modules/emergencia/components/EmergenciaForm.jsx
export const EmergenciaForm = ({ data, onChange, onSubmit, errors }) => {
  return (
    <form onSubmit={onSubmit}>
      <section>
        <h2>Información de Institución</h2>
        <input
          value={data.institucion}
          onChange={(e) => onChange('institucion', e.target.value)}
          className={errors.institucion ? 'border-red-500' : ''}
        />
        {errors.institucion && <p className="text-red-600">{errors.institucion}</p>}
      </section>
      {/* Más secciones... */}
      <button type="submit">Guardar</button>
    </form>
  );
};
```

---

## 6. EJEMPLO: Refactorizar Emergencia

### Estructura Propuesta
```
src/modules/emergencia/
├── Emergencia.jsx                    # Container principal
├── components/
│   ├── EmergenciaForm.jsx           # Renderiza el formulario
│   ├── sections/
│   │   ├── InstitutionSection.jsx
│   │   ├── AdmissionSection.jsx
│   │   ├── VitalsSection.jsx
│   │   ├── DiagnosticsSection.jsx
│   │   └── ...
│   └── inputs/
│       ├── VitalsInput.jsx
│       ├── DiagnosticsInput.jsx
│       └── ...
├── hooks/
│   ├── useEmergenciaForm.js
│   ├── useVitalsCalculations.js
│   └── useGlasgowScale.js
├── services/
│   └── emergenciaService.js
└── types/
    └── emergencia.types.js
```

### Código Resultante - Container

```javascript
// src/modules/emergencia/Emergencia.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useEmergenciaForm } from './hooks/useEmergenciaForm';
import { EmergenciaForm } from './components/EmergenciaForm';

export const Emergencia = () => {
  const { mainId } = useParams();
  const form = useEmergenciaForm(mainId);
  
  if (form.loading) return <div>Cargando...</div>;
  
  return <EmergenciaForm {...form} />;
};

export default Emergencia;
```

### Código - Hook de Lógica

```javascript
// src/modules/emergencia/hooks/useEmergenciaForm.js
import { useForm } from '@/shared/hooks';
import { useAsync } from '@/shared/hooks';
import { fetchEmergenciaData, saveEmergencia } from '../services/emergenciaService';

export const useEmergenciaForm = (mainId) => {
  // Fetch datos existentes
  const { data: existingData, loading } = useAsync(
    () => fetchEmergenciaData(mainId),
    !!mainId
  );
  
  // Formulario
  const form = useForm(
    existingData || { /* valores iniciales */ },
    async (data) => saveEmergencia(mainId, data),
    (data) => validateEmergencia(data)
  );
  
  return { ...form, loading };
};
```

---

## 7. CHECKLIST DE REFACTORIZACIÓN

Para cada componente grande, sigue este checklist:

- [ ] **Extraer lógica en hook personalizado** (useComponentForm.js)
- [ ] **Separar en componentes más pequeños** (sections, inputs)
- [ ] **Usar useForm, useAsync y otros hooks** en la lógica
- [ ] **Componente principal actúa como Container**
- [ ] **Componentes hijos son presentación pura**
- [ ] **Usar sistema de colores de `@/shared/theme/colors`**
- [ ] **Agregar PropTypes o TypeScript**
- [ ] **Documentar con comentarios JSDoc**
- [ ] **Crear archivo index.js en el módulo**
- [ ] **Agregar al README del módulo**

---

## 8. IMPORTACIONES - REFERENCIA RÁPIDA

### Sistema de Colores
```javascript
import { medicalTheme, semanticColors, getStatusColor } from '@/shared/theme/colors';
import { typography, spacing, shadows } from '@/shared/theme/typography';
```

### Hooks Reutilizables
```javascript
import { 
  useForm,
  useAsync,
  useDebounce,
  usePagination,
  useLocalStorage,
  usePrevious,
  useToggle,
  useArray
} from '@/shared/hooks';
```

### Componentes Compartidos
```javascript
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
```

### Módulos Específicos
```javascript
import { 
  PatientCard, 
  PatientSearchBar, 
  PatientsGrid 
} from '@/modules/dashboard/components';
```

---

## 9. PRÓXIMOS PASOS

### Prioridad 1: Refactorizar grandes componentes
1. ✅ Dashboard - **EN PROGRESO**
2. ⏳ Emergencia - Por empezar
3. ⏳ Anamnesis - Por empezar
4. ⏳ NursingModule - Por empezar

### Prioridad 2: Crear componentes reutilizables médicos
- [ ] `<VitalsInput />` - Entrada de signos vitales
- [ ] `<DiagnosticsInput />` - Entrada de diagnósticos
- [ ] `<MedicationInput />` - Entrada de medicamentos
- [ ] `<PatientSearch />` - Búsqueda de pacientes

### Prioridad 3: Mejorar servicios
- [ ] `emergenciaService.js`
- [ ] `anamnesisService.js`
- [ ] `evolucionService.js`
- [ ] Caché de datos

---

## 10. TIPS Y MEJORES PRÁCTICAS

✅ **Usa hooks para toda la lógica de negocio**
✅ **Componentes hijos deben ser "puros" (props IN, JSX OUT)**
✅ **Centraliza los estilos en theme/**
✅ **Un módulo = máximo 3-4 niveles de anidamiento**
✅ **Crea index.js en cada módulo para exportaciones limpias**
✅ **Documenta tipos complejos con JSDoc**
✅ **Usa `const` para todo, excepto state**

❌ **No mezcles lógica con presentación**
❌ **No repitas código - extrae a hoooks**
❌ **No uses colores hardcodeados**
❌ **No crees componentes mayores a 150 líneas**
❌ **No hagas llamadas a fetch en componentes**

---

**Documento creado**: 2026-03-09
**Versión**: 1.0
**Mantenedor**: Arquitecto Senior - Clínica Atlas
