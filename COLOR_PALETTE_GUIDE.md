# Guía de Paleta de Colores Uniforme - Clínica Atlas

## 📋 Paleta de Colores Principal

```
#595759  - GRIS OSCURO    (Títulos, Headers, Elementos principales)
#76c4d5  - AZUL TURQUESA  (Módulo Médico - Color primario)
#69c9ba  - VERDE TURQUESA (Módulo Enfermería - Color primario)
#4ea685  - VERDE OSCURO   (Acentos, Hover, Detalles)
```

---

## 🎨 Aplicación de Colores por Módulo

### **MÓDULO MÉDICO** (MedicalModule.jsx)
- **Color Primario:** `#76c4d5` (Azul Turquesa)
- **Header:** Fondo gradiente `from-[#76c4d5] to-[#69c9ba]` / Texto blanco
- **Botón Volver:** Fondo `#76c4d5` → Hover `#4ea685`
- **Título Principal:** Texto `#595759` (gris oscuro)
- **Bordes de Tarjetas:** `border-[#76c4d5]/30` a `border-[#76c4d5]/40`
- **Fondo del Modal:** Gradiente `from-[#f0fafb] to-white`
- **Badge de Estado:** Fondo `#595759` → Hover `#4ea685`
- **Signos Vitales:** Fondo `from-[#76c4d5]/20 to-[#69c9ba]/15`

---

### **MÓDULO ENFERMERÍA** (NursingModule.jsx)
- **Color Primario:** `#69c9ba` (Verde Turquesa)
- **Header:** Fondo gradiente `from-[#595759] to-[#595759]/90` / Texto blanco
- **Botón Volver:** Fondo `#69c9ba` → Hover `#4ea685`
- **Título Principal:** Texto `#595759` (gris oscuro)
- **Título Módulo:** Fondo `from-[#69c9ba] to-[#4ea685]` / Texto blanco
- **Bordes de Tarjetas:** `border-[#69c9ba]/30`
- **Botón Registro:** Fondo `from-[#69c9ba] to-[#4ea685]`
- **Fondo del Modal:** Gradiente `from-[#f0fbf9] to-white`
- **Historial Activo:** `bg-[#69c9ba]/20 border-[#69c9ba]/40`
- **Signos Vitales:** Fondo `from-[#69c9ba]/15 to-[#76c4d5]/10`

---

### **CONSENTIMIENTOS** (Consentimientos.jsx)
- **Fondo Principal:** Gradiente `from-[#ffffff] via-[#76c4d5]/5 to-[#76c4d5]/15`
- **Tarjeta:** Borde `border-[#76c4d5]/30`
- **Botones:** Fondo `from-[#76c4d5] to-[#69c9ba]` → Hover `from-[#4ea685] to-[#69c9ba]`
- **Título:** Fondo `from-[#595759] to-[#595759]/90` / Texto blanco

---

## 🎯 Estándares de Color por Elemento

### **Headers y Títulos Principales**
```css
/* Fondo de header */
bg-gradient-to-r from-[#595759] to-[#595759]/90

/* Títulos grandes */
text-[#595759] font-extrabold

/* Badges de estado */
bg-[#595759] text-white
```

### **Botones de Acción**
```css
/* Botones primarios */
bg-gradient-to-r from-[COLOR_PRIMARIO] to-[#4ea685]
hover:shadow-lg

/* Botones secundarios */
border-[COLOR_PRIMARIO]
text-[#595759]
hover:bg-[COLOR_PRIMARIO]/10

/* Botones de volver */
bg-[COLOR_PRIMARIO] → hover:bg-[#4ea685]
```

### **Bordes y Divisores**
```css
/* Bordes normales */
border-[COLOR_PRIMARIO]/30   /* Suave */
border-[COLOR_PRIMARIO]/40   /* Medio */

/* Divisores (hr) */
h-px bg-slate-200
```

### **Fondos Gradientes**
```css
/* Fondos de secciones */
bg-gradient-to-b from-[COLOR_PRIMARIO]/10 to-transparent

/* Fondos de tarjetas de vitales */
bg-gradient-to-br from-[COLOR_PRIMARIO]/20 to-[OTRO_COLOR]/15
```

### **Hover y Estados Activos**
```css
/* Hover general */
hover:bg-[COLOR_PRIMARIO]/10 transition

/* Foco/Activo */
ring-2 ring-[COLOR_PRIMARIO] ring-offset-1
border-[COLOR_PRIMARIO]/50
```

---

## 📐 Reglas de Legibilidad

1. **Textos oscuros:** Siempre `text-[#595759]` en fondos claros
2. **Textos claros:** Siempre `text-white` en fondos oscuros
3. **Contraste mínimo:** Usar `text-xs font-semibold` para texto pequeño
4. **Espacios:** Padding estandarizado `px-3 py-2` para inputs
5. **Bordes de inputs:** `border border-[COLOR]/25` con `focus:border-[COLOR]`

---

## 🔄 Elementos Conectados Entre Módulos

| Elemento | Módulo Médico | Módulo Enfermería | Consentimientos |
|----------|---------------|-------------------|-----------------|
| **Color Primario** | #76c4d5 | #69c9ba | Ambos |
| **Header Background** | #76c4d5→#69c9ba | #595759 | #595759 |
| **Botón Primario** | #76c4d5 | #69c9ba | #76c4d5→#69c9ba |
| **Letrero Principal** | Azul turquesa | Verde turquesa | Gris oscuro |
| **Hover Buttons** | → #4ea685 | → #4ea685 | → #4ea685 |

---

## ✅ Checklist para Nuevos Componentes

- [ ] Usar colores de la paleta (sin 007e8f ni 1c3f6e antiguos)
- [ ] Aplicar `#595759` para títulos principales
- [ ] Usar color primario del módulo para acentos
- [ ] Aplicar `#4ea685` para hover/énfasis
- [ ] Gradientes con `from-[#595759]` o `from-[COLOR_PRIMARIO]`
- [ ] Bordes con `/30` o `/40` de opacidad
- [ ] Textos con `text-[#595759]` en fondos claros
- [ ] Fondos modales con gradiente `from-[color]/10 to-white`

---

## 🎨 Ejemplos de Combinaciones Armónicas

### **Botón Primario (Módulo Médico)**
```jsx
className="bg-gradient-to-r from-[#76c4d5] to-[#4ea685] text-white hover:shadow-lg"
```

### **Botón Primario (Módulo Enfermería)**
```jsx
className="bg-gradient-to-r from-[#69c9ba] to-[#4ea685] text-white hover:shadow-lg"
```

### **Tarjeta con Borde**
```jsx
className="rounded-lg border border-[#76c4d5]/40 bg-white hover:shadow-md"
```

### **Header Uniforme**
```jsx
className="bg-gradient-to-r from-[#595759] to-[#595759]/90 text-white px-5 py-4"
```

### **Fondo Gradiente Suave**
```jsx
className="bg-gradient-to-b from-[#76c4d5]/10 to-transparent"
```

---

**Fecha de Actualización:** Marzo 16, 2026  
**Versión:** 1.0  
**Aplicado a:** MedicalModule.jsx | NursingModule.jsx | Consentimientos.jsx
