# 🔐 Guía de Despliegue de Reglas de Firestore

## Problema Identificado
Las reglas de Firestore no permitían escribir en la colección `admisiones`. Se han actualizado en `firestore.rules`.

## ✅ Pasos para Desplegar

### Opción 1: Usando Firebase CLI (RECOMENDADO)

1. **Asegúrate de tener Firebase CLI instalado:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Inicia sesión en Firebase:**
   ```bash
   firebase login
   ```

3. **Navega a la carpeta del proyecto:**
   ```bash
   cd e:\Diego\A IMAGENES CLINICA ATLAS\PROYECTO-CLINICA-ATLAS\App-Web-Clinica-Atlas
   ```

4. **Despliega las reglas:**
   ```bash
   firebase deploy --only firestore:rules
   ```

5. **Verifica que se desplegó correctamente:**
   ```bash
   firebase deploy --only firestore:rules --debug
   ```

### Opción 2: Usando Firebase Console (Manual)

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `atlas-606a7`
3. En el menú izquierdo, ve a **Firestore Database** → **Règles**
4. Copia todo el contenido de `firestore.rules` del repositorio
5. Pega en el editor de reglas de Firebase Console
6. Haz clic en **Publicar**

## 📋 Reglas Desplegadas

Se han agregado reglas para:
- ✅ `admisiones` (col. principal)
- ✅ `vital_signs` (subcolección)
- ✅ `nursing_notes` (subcolección)
- ✅ `medication_records` (subcolección)
- ✅ `oxygen_records` (subcolección)
- ✅ `fluid_balance` (subcolección)
- ✅ `diet_orders` (subcolección)

Las enfermeras (`rol: 'enfermera'`) pueden:
- ✅ **Leer**: Cualquier documento en admisiones
- ✅ **Crear**: Nuevos registros en las subcolecciones clínicas
- ❌ **Actualizar/Eliminar**: Solo médicos y admin

## 🔍 Verificar Que Funciona

1. Abre las **DevTools** en el navegador (F12)
2. Ve a la pestaña **Console**
3. Intenta guardar signos vitales
4. Deberías ver en la consola:
   ```
   ✅ Signos vitales guardados en Firebase: {...}
   ```

Si ves error de permisos:
```
Error: Missing or insufficient permissions (firestore/permission-denied)
```

Significa que las reglas aún no se han desplegado correctamente.

## 🧪 Test de Seguridad

Puedes usar el **Firebase Rules Simulator** en la consola para probar:
1. Ve a **Firestore** → **Reglas** → **Probar**
2. Selecciona la operación: **create**
3. Ruta: `admisiones/{admissionId}/vital_signs`
4. Auth: Usa un uid de una enfermera
5. Datos: Usa datos de ejemplo

## ❌ Si Sigue Sin Funcionar

1. Verifica que la enfermera esté logeada (debe existir en colección `users`)
2. Verifica que tenga `rol: 'enfermera'` en su documento
3. Verifica que `mainId` (admissionId) sea válido en la URL
4. Abre DevTools → Network → Firestore para ver las solicitudes
