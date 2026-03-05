# Guía de Integración Firebase - Módulo de Enfermería

## Estado Actual ✅

El módulo de enfermería está totalmente integrado con Firebase Firestore para guardar **Signos Vitales**.

### Estructura en Firestore

```
admisiones/{admissionId}/
├── vital_signs/
│   ├── {vitalId1}
│   │   ├── presion: "120/80"
│   │   ├── pulso: 78
│   │   ├── temperatura: 36.8
│   │   ├── satO2: 97
│   │   ├── glucosa: 105
│   │   ├── peso: 75
│   │   ├── fr: 16
│   │   ├── diuresis: 1200
│   │   ├── enfermera: "ENF. PATRICIA GUAMAN"
│   │   ├── nurseUid: "firebaseUID"
│   │   ├── observaciones: "Paciente reporta dolor leve"
│   │   ├── horaRegistro: "14:30"
│   │   └── createdAt: timestamp()
```

## Funciones Disponibles

### 1. `saveVitalSigns()` - Gaurdar Signos Vitales

**Ubicación:** `NursingModule.jsx` (línea ~750)

**Uso:** Se ejecuta automáticamente al presionar "Guardar" en el modal de Signos Vitales.

**Validaciones incluidas:**
- ✓ Verifica que admissionId esté presente
- ✓ Verifica que el usuario esté autenticado
- ✓ Verifica que al menos un vital esté registrado
- ✓ Convierte valores numéricos correctamente
- ✓ Limpia el formulario después de guardar
- ✓ Muestra toast de éxito/error

**Ejemplo de datos guardados:**
```javascript
{
  presion: "120/80",
  pulso: 78,
  temperatura: 36.8,
  satO2: 97,
  glucosa: 105,
  peso: 75,
  fr: 16,
  diuresis: 1200,
  enfermera: "ENF. PATRICIA GUAMAN",
  nurseUid: "user123",
  observaciones: "Paciente estable",
  horaRegistro: "14:30",
  createdAt: serverTimestamp()
}
```

### 2. `saveClinicalData(collectionName, data)` - Guardar Datos Clínicos Genéricos

**Ubicación:** `NursingModule.jsx` (línea ~820)

**Uso:** Función base para guardar en cualquier subcolección clínica.

**Parámetros:**
- `collectionName` (string): Nombre de la subcolección (ej: "nursing_notes", "medication_records")
- `data` (object): Datos a guardar

**Ejemplo de uso:**
```javascript
// Guardar nota de enfermería
await saveClinicalData('nursing_notes', {
  nota: "Paciente permanece estable...",
  turno: "Mañana 07:00-19:00",
  estadoGeneral: "Crítico",
});

// Resultado en Firestore:
admisiones/{admissionId}/nursing_notes/{docId}
{
  nota: "...",
  turno: "...",
  estadoGeneral: "...",
  nurseUid: "user123",
  nurseName: "Patricia Guaman",
  createdAt: serverTimestamp()
}
```

---

## Cómo Extender a Otras Subcolecciones

### Ejemplo: Agregar "Notas de Enfermería"

#### 1. Crear la función específica en `NursingModule.jsx`

```javascript
const saveNursingNotes = async () => {
  try {
    if (!mainId || !user) return;
    setIsSavingFirebase(true);

    const noteData = {
      estadoGeneral: forms.informe_enf.estadoGeneral,
      cuidados: forms.informe_enf.cuidados,
      novedades: forms.informe_enf.novedades,
      turno: forms.informe_enf.turno,
      fecha: forms.informe_enf.fecha,
    };

    const docId = await saveClinicalData('nursing_notes', noteData);
    
    if (docId) {
      // Limpiar el formulario
      setForms(prev => ({
        ...prev,
        informe_enf: {
          ...prev.informe_enf,
          estadoGeneral: '',
          cuidados: '',
          novedades: '',
        }
      }));
    }
  } catch (error) {
    console.error('Error guardando notas de enfermería:', error);
  } finally {
    setIsSavingFirebase(false);
  }
};
```

#### 2. Actualizar `handleSaveModal()`

```javascript
const handleSaveModal = async () => {
  if (activeModalId === 'signos_vitales') {
    await saveVitalSigns();
  } else if (activeModalId === 'informe_enf') {
    await saveNursingNotes();
  } else if (activeModalId === 'registro_oxigeno') {
    await saveOxygenRecords();
  }
  // ... más modulós
};
```

---

## Subcolecciones Preparadas para Integración

Las siguientes subcolecciones están **listas para conectar**:

### 1. **nursing_notes** - Notas de Enfermería
- Turno: Mañana/Noche
- Estado general del paciente
- Cuidados realizados
- Novedades e incidentes

### 2. **medication_records** - Registro de Medicación
- Medicamento
- Dosis/Vía
- Hora de administración
- Observaciones

### 3. **oxygen_records** - Registro de Oxígeno
- Dispositivo (Cánula, Mascarilla, etc.)
- Flujo O2
- FiO2 estimado
- SAT O2
- Frecuencia respiratoria

### 4. **fluid_balance** - Balance de Fluidos
- Ingesta total (mL)
- Eliminación total (mL)
- Balance final
- Detalles/observaciones

### 5. **diet_orders** - Órdenes de Dieta
- Tipo de dieta
- Restricciones especiales
- Horarios (Desayuno, Almuerzo, Merienda)
- Indicaciones especiales

### 6. **medication_discharge** - Descargo de Medicación
- Medicamento
- Presentación
- Cantidad usada
- Motivo
- Enfermera que descarga
- Turno

---

## Configuración de Firestore Rules

Asegúrate de que tus reglas de Firestore permitan la escritura en subcolecciones:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Acceso a admisiones completas (lectura)
    match /admisiones/{admissionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      (request.auth.token.role == 'enfermera' || 
                       request.auth.token.role == 'medico' ||
                       request.auth.token.role == 'admin');

      // Subcolecciones clínicas (lectura/escritura para enfermeras)
      match /{subcollection=**} {
        allow read: if request.auth != null;
        allow write: if request.auth != null && 
                        (request.auth.token.role == 'enfermera' || 
                         request.auth.token.role == 'admin');
      }
    }
  }
}
```

---

## Variables de Entorno Requeridas

Verifica que `.env` tenga:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## Debugging y Logging

El código incluye logs automáticos en la consola:

```javascript
// Signos vitales guardados exitosamente
✅ Signos vitales guardados en Firebase: {
  admissionId: "...",
  docId: "...",
  data: {...}
}

// Error al guardar
❌ Error al guardar signos vitales: {...}
```

Abre la consola del navegador (F12) para ver estos logs.

---

## Testing Manual

1. **Navegar al Módulo de Enfermería**
   - ID de admisión debe estar en la URL: `/enfermeria/admision123`

2. **Registrar Signos Vitales**
   - Ingresa valores en los campos
   - Presiona "Guardar"
   - Verifica el toast de éxito

3. **Verificar en Firestore Console**
   - Ve a [Firebase Console](https://console.firebase.google.com)
   - Navega a `admisiones/{admissionId}/vital_signs`
   - Deberías ver el documento creado con timestamp

---

## Próximos Pasos

- [ ] Agregar lectura de signos vitales anteriores
- [ ] Crear gráficos de tendencias de vitales
- [ ] Implementar exportación a PDF con historial
- [ ] Agregar alertas automáticas por valores críticos
- [ ] Crear historial por mes/año
- [ ] Integrar con módulo médico para alertas bidireccionales
