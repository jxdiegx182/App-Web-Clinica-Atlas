import { db } from '@/firebaseConfig';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

/**
 * Servicio especializado para operaciones de Emergencia
 * Maneja todos los datos relacionados con formularios de emergencia
 */

export const emergenciaService = {
  /**
   * Guarda un nuevo registro de emergencia en Firestore
   */
  async guardarEmergencia(formData, mainId) {
    try {
      const docRef = await addDoc(collection(db, 'mains', mainId, 'emergencias'), {
        ...formData,
        examenesMarcados: Array.from(formData.examenesMarcados),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { id: docRef.id, ...formData };
    } catch (error) {
      console.error('Error guardando emergencia:', error);
      throw new Error('No se pudo guardar el registro de emergencia');
    }
  },

  /**
   * Actualiza un registro de emergencia existente
   */
  async actualizarEmergencia(mainId, emergenciaId, formData) {
    try {
      const docRef = doc(db, 'mains', mainId, 'emergencias', emergenciaId);
      await updateDoc(docRef, {
        ...formData,
        examenesMarcados: Array.from(formData.examenesMarcados),
        updatedAt: serverTimestamp(),
      });
      return { id: emergenciaId, ...formData };
    } catch (error) {
      console.error('Error actualizando emergencia:', error);
      throw new Error('No se pudo actualizar el registro de emergencia');
    }
  },

  /**
   * Valida datos críticos de emergencia
   */
  validarFormularioEmergencia(formData) {
    const errores = [];

    // Validaciones críticas
    if (!formData.apellidoPaterno?.trim()) {
      errores.push('Apellido paterno es requerido');
    }
    if (!formData.primerNombre?.trim()) {
      errores.push('Primer nombre es requerido');
    }
    if (!formData.cedula?.trim()) {
      errores.push('Cédula es requerida');
    }
    if (!formData.fechaAdmision) {
      errores.push('Fecha de admisión es requerida');
    }
    if (!formData.horaAtencion) {
      errores.push('Hora de atención es requerida');
    }

    // Validar vitales si están presentes
    if (formData.vitales) {
      const { pa, fc, fr, tempBucal, peso, talla, saturacion } = formData.vitales;
      
      if (fc && (isNaN(fc) || fc < 0 || fc > 300)) {
        errores.push('Frecuencia cardíaca debe estar entre 0 y 300');
      }
      if (fr && (isNaN(fr) || fr < 0 || fr > 100)) {
        errores.push('Frecuencia respiratoria debe estar entre 0 y 100');
      }
      if (tempBucal && (isNaN(tempBucal) || tempBucal < 35 || tempBucal > 42)) {
        errores.push('Temperatura debe estar entre 35°C y 42°C');
      }
      if (peso && (isNaN(peso) || peso < 0)) {
        errores.push('Peso no puede ser negativo');
      }
    }

    // Validar Glasgow si está presente
    if (formData.glasgowOcular || formData.glasgowVerbal || formData.glasgowMotora) {
      const total = (parseInt(formData.glasgowOcular) || 0) + 
                    (parseInt(formData.glasgowVerbal) || 0) + 
                    (parseInt(formData.glasgowMotora) || 0);
      if (total < 3 || total > 15) {
        errores.push('Escala de Glasgow debe estar entre 3 y 15');
      }
    }

    return {
      valido: errores.length === 0,
      errores
    };
  },

  /**
   * Genera un resumen de emergencia para vista previa
   */
  generarResumenEmergencia(formData) {
    return {
      paciente: {
        nombre: `${formData.primerNombre} ${formData.apellidoPaterno}`,
        cedula: formData.cedula,
        edad: formData.edad,
        genero: formData.genero,
      },
      admision: {
        fecha: formData.fechaAdmision,
        hora: formData.horaAtencion,
        institucion: formData.institucion,
        unidad: formData.unidadOperativa,
      },
      motivo: {
        trauma: formData.trauma,
        causaClin: formData.causaClin,
        grupoSanguineo: formData.grupoSanguineo,
      },
      vitales: formData.vitales,
      glasgowTotal: (parseInt(formData.glasgowOcular) || 0) + 
                    (parseInt(formData.glasgowVerbal) || 0) + 
                    (parseInt(formData.glasgowMotora) || 0),
      diagnosticos: {
        ingreso: formData.diagIngreso,
        alta: formData.diagAlta,
      },
      medicamentos: formData.medicamentos,
    };
  },

  /**
   * Prepara datos para exportación a PDF
   */
  prepararParaPDF(formData, mainId) {
    return {
      mainId,
      ...formData,
      examenesMarcados: Array.from(formData.examenesMarcados),
      timestamp: new Date().toISOString(),
    };
  },
};
