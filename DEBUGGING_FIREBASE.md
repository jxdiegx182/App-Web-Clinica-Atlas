# 🔧 Guía de Diagnóstico: Firebase No Guarda Datos

## 📋 Cambios Realizados

### 1. **Reglas de Firestore Actualizadas** ✅
Archivo: `firestore.rules`

Se agregaron permisos para las colecciones:
- `admisiones` (lectura para autenticados)
- `vital_signs` (crear para enfermeras, médicos, admin)
- `nursing_notes`, `medication_records`, `oxygen_records`, `fluid_balance`, `diet_orders` (futuras extensiones)

### 2. **Logging Mejorado en NursingModule.jsx** ✅
Se agregaron verificaciones paso a paso:
- ✅ Verifica que `mainId` exista
- ✅ Verifica que el usuario esté autenticado
- ✅ Verifica que el perfil esté cargado
- ✅ Verifica que haya datos para guardar
- ✅ Muestra errores específicos de Firebase

## 🚀 Pasos Para Solucionar

### PASO 1: Deploy de Reglas de Firestore (CRÍTICO)
```bash
# Opción A: Con Firebase CLI
firebase deploy --only firestore:rules

# Opción B: Manual en Firebase Console
# 1. Ve a https://console.firebase.google.com/
# 2. Selecciona proyecto: atlas-606a7
# 3. Firestore Database → Reglas
# 4. Copia/pega el contenido de firestore.rules
# 5. Publicar
```

### PASO 2: Verificar en DevTools
1. Abre el navegador (F12 → Console)
2. Intenta guardar un signo vital
3. Deberías ver logs como:
   ```
   🔍 [VERIFICACIÓN 1] ID de Admisión: abc123def456
   🔍 [VERIFICACIÓN 2] Usuario: {uid: "...", nombre: "ENF. X", rol: "enfermera"}
   🔍 [VERIFICACIÓN 3] Datos ingresados: {vitals: {...}, hasData: true}
   📝 [PASO 4] Documento preparado: {...}
   📍 [PASO 5] Referencia de colección: admisiones/abc123def456/vital_signs
   ⏳ [PASO 6] Enviando solicitud a Firebase...
   ✅ [ÉXITO] Signos vitales guardados en Firebase: {...}
   ```

4. Si ves error:
   ```
   ❌ [ERROR] Detalles del error: {
     message: "Missing or insufficient permissions",
     code: "permission-denied"
   }
   ```
   → **Esto significa que las reglas NO se desplegaron correctamente**

## 🔍 Checklist de Diagnóstico

| ✅ | Verificación | Cómo Probar |
|---|---|---|
| ? | ¿Las reglas fueron desplegadas? | Intenta guardar → Ve console |
| ? | ¿La enfermera está logeada? | Console: `console.log(user)` debe mostrar uid |
| ? | ¿El perfil se cargó? | Console: `console.log(profile)` debe mostrar nombre y rol |
| ? | ¿El mainId es válido? | Console debería mostrar: `🔍 [VERIFICACIÓN 1] ID: [algo]` |
| ? | ¿Hay datos ingresados? | Console debería mostrar: `hasData: true` |

## 📊 Estados Posibles y Soluciones

### Escenario 1: Error "permission-denied"
```
❌ Error Code: permission-denied
```
**Causa**: Las reglas de Firestore no se desplegaron
**Solución**: Deploy siguiendo PASO 1

### Escenario 2: Error "No se encontró el ID de la admisión"
```
🔍 [VERIFICACIÓN 1] ID de Admisión: undefined
```
**Causa**: La URL no tiene el parámetro `mainId`
**Solución**: Asegúrate de navegar a: `/nursing/ADMISSIONID`

### Escenario 3: Error "Usuario no autenticado"
```
🔍 [VERIFICACIÓN 2] Usuario: {uid: undefined, nombre: undefined, rol: undefined}
```
**Causa**: La enfermera no está logeada o el perfil no se cargó
**Solución**: 
- Verifica que haya una enfermera logeada
- El documento de usuario debe estar en: `users/{uid}` con `rol: "enfermera"`

### Escenario 4: "No hay datos ingresados"
**Causa**: No ingresaste valores en los campos
**Solución**: Ingresa al menos un valor de signo vital antes de guardar

### Escenario 5: Silent Failure (sin errores pero no aparece en Firebase)
```
✅ [ÉXITO] Signos vitales guardados... (pero no aparece en Firebase Console)
```
**Causa**: Problema con serverTimestamp() o del documento
**Solución**: 
- Verifica en Firestore Console que la colección `admisiones` existe
- Verifica que el documento con ese `mainId` existe en `admisiones`

## 🧪 Test Manual en Firestore Console

1. Ve a https://console.firebase.google.com/
2. Selecciona proyecto: `atlas-606a7`
3. Firestore Database → Datos
4. Busca `admisiones` → `[algún_id]` → `vital_signs`
5. Deberías ver nuevos documentos cuando guardes desde la app

## 📧 Información Para Compartir (Si Pides Ayuda)

Cuando reportes el problema, incluye:
1. **Screenshot de la consola** (F12 → Console) con los logs
2. **El código de error exacto** (permission-denied, etc.)
3. **Confirmación**: ¿Las reglas de Firestore fueron desplegadas?
4. **Confirmación**: ¿La enfermera está logeada?
5. **URL de la página**: p.ej., `localhost:5173/nursing/abc123`

## 📚 Documentación Relacionada

- [FIRESTORE_DEPLOYMENT.md](FIRESTORE_DEPLOYMENT.md) - Pasos detallados para desplegar reglas
- [FIREBASE_INTEGRATION_GUIDE.md](FIREBASE_INTEGRATION_GUIDE.md) - Guía completa de integración
- [NursingModule.jsx](src/pages/NursingModule.jsx) - Componente con nueva función saveVitalSigns()

## ✨ Lo Que Se Agregó

### ✅ Función `saveVitalSigns()`
Ubicación: `src/pages/NursingModule.jsx` línea 664

Realiza:
- Validación de admissionId
- Validación de usuario autenticado
- Validación de datos ingresados
- Guardado en `admisiones/{mainId}/vital_signs`
- Logging detallado para debugging
- Manejo de errores específicos

### ✅ Reglas de Firestore
Ubicación: `firestore.rules` líneas 12-47

Permiten:
- Enfermeras: Leer y crear registros clínicos
- Médicos/Admin: Control total
- Usuarios no autenticados: Acceso denegado

### ✅ Botón Guardar Integrado
El botón "GUARDAR" en el modal de Signos Vitales ahora:
- Ejecuta `saveVitalSigns()`
- Muestra estado de carga
- Muestra toast con resultado
- Limpia el formulario tras éxito
