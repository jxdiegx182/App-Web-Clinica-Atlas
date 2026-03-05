# 🏥 Integración Firebase Firestore - Módulo de Enfermería

## ✅ Cambios Realizados

### Archivo Modificado
- **`src/pages/NursingModule.jsx`**

### Cambios Específicos

#### 1. **Imports Agregados**
```javascript
import { useAuth } from '@/contexts/AuthContext';
```
Permite obtener datos del usuario autenticado (nombre, UID, perfil).

#### 2. **Nuevo Estado**
```javascript
const [isSavingFirebase, setIsSavingFirebase] = useState(false);
```
Controla el estado de carga al guardar en Firebase.

#### 3. **Hook useAuth()**
```javascript
const { user, profile } = useAuth();
```
Obtiene los datos de la enfermera autenticada:
- `user.uid`: ID único de Firebase Authentication
- `profile.nombre`: Nombre de la enfermera
- `profile.rol`: Rol del usuario

#### 4. **Función: `saveVitalSigns()`**
Guarda signos vitales directamente en Firestore:

```javascript
await addDoc(
  collection(db, "admisiones", mainId, "vital_signs"),
  {
    presion, pulso, temperatura, satO2, glucosa, peso, fr, diuresis,
    enfermera, nurseUid, observaciones, horaRegistro,
    createdAt: serverTimestamp()
  }
)
```

**Validaciones incluidas:**
- ✓ Verifica ID de admisión
- ✓ Verifica autenticación del usuario
- ✓ Verifica que al menos un vital esté registrado
- ✓ Convierte valores numéricos automáticamente
- ✓ Limpia el formulario después de guardar
- ✓ Muestra notificación de éxito/error

#### 5. **Función: `saveClinicalData(collectionName, data)`**
Función genérica para futuras extensiones:

```javascript
const saveClinicalData = async (collectionName, data) => {
  const clinicalRef = collection(db, 'admisiones', mainId, collectionName);
  const docRef = await addDoc(clinicalRef, {
    ...data,
    nurseUid: user.uid,
    nurseName: profile?.nombre,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}
```

#### 6. **Actualización: `handleSaveModal()`**
Ahora ejecuta `saveVitalSigns()` cuando se guarde el modal correspondiente:

```javascript
const handleSaveModal = async () => {
  if (activeModalId === 'signos_vitales') {
    await saveVitalSigns();
  }
  // ...
};
```

#### 7. **UI Mejorada: Botón de Guardar**
El botón ahora muestra estado de carga:
- ✓ Deshabilitado mientras se guarda
- ✓ Texto cambia a "⏳ Guardando..." 
- ✓ Reducida opacidad visual

---

## 🗄️ Estructura en Firestore

### Ubicación de Datos
```
admisiones/{admissionId}/vital_signs/{vitalId}
```

### Documento Guardado
```json
{
  "presion": "120/80",           // Formato string
  "pulso": 78,                   // Número
  "temperatura": 36.8,           // Número con decimales
  "satO2": 97,                   // Número
  "glucosa": 105,                // Número
  "peso": 75,                    // Número
  "fr": 16,                      // Frecuencia respiratoria
  "diuresis": 1200,              // mL
  "enfermera": "ENF. PATRICIA GUAMAN",
  "nurseUid": "uid_de_firebase",
  "observaciones": "Paciente reporta...",
  "horaRegistro": "14:30",
  "createdAt": {".sv": "timestamp"}  // Timestamp del servidor
}
```

---

## 🚀 Cómo Probar

### 1. **Verificar Autenticación**
- Asegúrate de estar logueado como enfermera
- La app debe mostrar tu nombre en el módulo

### 2. **Registrar Signos Vitales**
```
1. Navega a Módulo de Enfermería
2. Click en "Signos Vitales" o "+ Registrar"
3. Ingresa valores (ej: PA 120/80, Pulso 78, etc.)
4. Click en "Guardar"
5. Verifica el toast de confirmación
```

### 3. **Verificar en Firebase Console**
```
1. Ve a https://console.firebase.google.com
2. Selecciona tu proyecto (atlas-606a7)
3. Firestore Database → admisiones → {admissionId} → vital_signs
4. Deberías ver el documento recién creado con timestamp
```

### 4. **Verificar en Navegador (DevTools)**
```
1. Abre la consola (F12)
2. Busca el log: "✅ Signos vitales guardados en Firebase:"
3. Expande el objeto para ver los datos guardados
```

---

## 📋 Checklist de Validación

- [ ] El archivo compila sin errores
- [ ] useAuth() obtiene correctamente user.uid y profile.nombre
- [ ] Al presionar "Guardar", saveVitalSigns() se ejecuta
- [ ] Los valores se guardan correctamente en Firestore
- [ ] El formulario se limpia después de guardar
- [ ] El botón muestra estado de carga
- [ ] Los errores se muestran correctamente
- [ ] Los logs aparecen en la consola

---

## 🔧 Variables Requeridas en .env

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## 📚 Archivos de Referencia

- **`FIREBASE_INTEGRATION_GUIDE.md`** - Guía completa de integración
- **`EXAMPLES_FUTURE_EXTENSIONS.js`** - Ejemplos para agregar más subcolecciones

---

## 🔄 Flujo de Trabajo

```
┌─────────────────────────────────┐
│  Usuario entra a Módulo         │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Abre modal "Signos Vitales"    │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Ingresa valores (useState)     │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Presiona "Guardar"             │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  saveVitalSigns() validación    │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  addDoc() → Firestore           │
│  /admisiones/{id}/vital_signs   │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Documento creado + timestamp   │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Toast de confirmación          │
│  Formulario limpiado            │
│  Modal cerrado                  │
└─────────────────────────────────┘
```

---

## 🚨 Manejo de Errores

### Error: "No se encontró el ID de la admisión"
- **Causa:** La URL no tiene el parámetro `admissionId`
- **Solución:** Asegúrate de navegar desde una ruta como `/enfermeria/{admissionId}`

### Error: "Usuario no autenticado"
- **Causa:** useAuth() no está disponible
- **Solución:** Verifica que AuthProvider envuelve el componente

### Error: "Firestore permission-denied"
- **Causa:** Las reglas de Firestore no permiten escritura
- **Solución:** Ajusta las reglas según el archivo de guía

---

## 🎯 Próximos Pasos

Para agregar otras subcolecciones:

1. **Consulta `EXAMPLES_FUTURE_EXTENSIONS.js`**
2. **Copia el ejemplo correspondiente** (ej: saveNursingNotes)
3. **Actualiza `handleSaveModal()`** para incluir el nuevo modal
4. **Prueba localmente** antes de deploying

---

## 📞 Soporte

Si encuentras problemas:

1. **Revisa los logs** en la consola (F12)
2. **Verifica Firestore Console** para ver si se guardó
3. **Confirma autenticación** - El usuario debe estar logueado
4. **Valida el admissionId** en la URL

---

## ✨ Características Listas

✅ Guardar signos vitales en Firestore  
✅ Validación automática de datos  
✅ Limpieza de formulario post-guardar  
✅ Feedback visual con toasts  
✅ Logs en consola para debugging  
✅ Estructura preparada para futuras extensiones  
✅ Timestamps automáticos del servidor  
✅ Soporte para múltiples registros por paciente  

---

## 📝 Notas Importantes

1. **Cada vez que se presiona "Guardar"** se crea un **nuevo documento** en vital_signs
2. **El timestamp es del servidor**, no del cliente (más seguro)
3. **Los datos se almacenan por drip** - múltiples registros a lo largo del tiempo
4. **El UID de la enfermera** se guarda automáticamente para auditoría
5. **Los valores numéricos se convierten automáticamente** para consistencia en la BD

---

**Versión:** 1.0  
**Última actualización:** 2026-03-04  
**Desarrollador:** Sistema Clínico Atlas
