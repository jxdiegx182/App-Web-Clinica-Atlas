import { supabase } from '@/lib/supabaseClient';

const ADMISIONES_TABLE = import.meta.env.VITE_SUPABASE_ADMISIONES_TABLE || 'admisiones';
const PACIENTES_TABLE = import.meta.env.VITE_SUPABASE_PACIENTES_TABLE || 'pacientes';
const SIGNOS_VITALES_TABLE =
  import.meta.env.VITE_SUPABASE_SIGNOS_VITALES_TABLE || 'signos_vitales';

function mapSupabaseError(error, fallbackMessage) {
  if (!error) return new Error(fallbackMessage);
  const wrapped = new Error(error.message || fallbackMessage);
  wrapped.code = error.code;
  wrapped.details = error.details;
  wrapped.hint = error.hint;
  return wrapped;
}

const toMainDataFromPaciente = (paciente = {}, admision = {}) => ({
  firstName: paciente.nombres || '',
  firstName_lower: (paciente.nombres || '').toLowerCase(),
  lastName: paciente.apellidos || '',
  lastName_lower: (paciente.apellidos || '').toLowerCase(),
  idType: '',
  cedula: paciente.cedula || '',
  phone: paciente.telefono || '',
  gender: paciente.genero || '',
  maritalStatus: paciente.estado_civil || '',
  servicio: paciente.servicio || '',
  ubicacion: paciente?.ubicacion || {},
  seguro: paciente.seguro_medico || '',
  medico: paciente.medico_tratante || '',
  estado: admision.estado || 'Atención',
});

const toSecondaryDataFromPaciente = (paciente = {}) => ({
  nacionalidad: paciente.nacionalidad || '',
  placeOfBirth: paciente.lugar_nacimiento || '',
  dateOfBirth: paciente.fecha_nacimiento || '',
  country: paciente.pais || '',
  province: paciente.provincia || '',
  canton: paciente.canton || '',
  direccion: paciente.direccion || '',
  calleprin: paciente.calle_principal || '',
  callesecun: paciente.calle_secundaria || '',
  numero: paciente.numero || '',
  referencia: paciente.referencia || '',
  ocupacion: paciente.ocupacion || '',
  instituto: paciente.empresa || '',
  puesto: paciente.puesto_trabajo || '',
  descripcion: paciente.descripcion_laboral || '',
  correo: paciente.correo || '',
});

const toPacienteColumns = ({ mainData = {}, secondaryData = {}, createdAt = null }) => ({
  created_at: createdAt || new Date().toISOString(),
  nombres: mainData.firstName || '',
  apellidos: mainData.lastName || '',
  cedula: mainData.cedula || '',
  telefono: mainData.phone || '',
  genero: mainData.gender || '',
  estado_civil: mainData.maritalStatus || '',
  seguro_medico: mainData.seguro || '',
  medico_tratante: mainData.medico || '',
  servicio: mainData.servicio || '',
  ubicacion: mainData.ubicacion || {},
  nacionalidad: secondaryData.nacionalidad || null,
  lugar_nacimiento: secondaryData.placeOfBirth || null,
  fecha_nacimiento: secondaryData.dateOfBirth || null,
  pais: secondaryData.country || null,
  provincia: secondaryData.province || null,
  canton: secondaryData.canton || null,
  direccion: secondaryData.direccion || null,
  calle_principal: secondaryData.calleprin || null,
  calle_secundaria: secondaryData.callesecun || null,
  numero: secondaryData.numero || null,
  referencia: secondaryData.referencia || null,
  ocupacion: secondaryData.ocupacion || null,
  empresa: secondaryData.instituto || null,
  puesto_trabajo: secondaryData.puesto || null,
  descripcion_laboral: secondaryData.descripcion || null,
  correo: secondaryData.correo || null,
});

async function getAdmisionById(admisionId) {
  const { data, error } = await supabase
    .from(ADMISIONES_TABLE)
    .select('*')
    .eq('id', admisionId)
    .single();
  if (error) throw mapSupabaseError(error, 'No se pudo obtener la admision.');
  return data;
}

export async function createAdmision(payload) {
  const mainData = payload?.mainData || {};
  const secondaryData = payload?.secondaryData || {};
  const createdAt = payload?.createdAt || new Date().toISOString();
  const admitido = payload?.admitido ?? false;
  let pacienteId = payload?.pacienteId || null;

  if (pacienteId) {
    const pacientePayload = toPacienteColumns({ mainData, secondaryData, createdAt: undefined });
    delete pacientePayload.created_at;
    const { error: pacienteUpdateError } = await supabase
      .from(PACIENTES_TABLE)
      .update(pacientePayload)
      .eq('id', pacienteId);
    if (pacienteUpdateError) {
      throw mapSupabaseError(
        pacienteUpdateError,
        'No se pudo actualizar el paciente existente en Supabase.'
      );
    }
  } else {
    const pacientePayload = toPacienteColumns({ mainData, secondaryData, createdAt });
    const { data: pacienteCreated, error: pacienteError } = await supabase
      .from(PACIENTES_TABLE)
      .insert([pacientePayload])
      .select('id')
      .single();

    if (pacienteError) {
      throw mapSupabaseError(pacienteError, 'No se pudo crear el paciente en Supabase.');
    }

    pacienteId = pacienteCreated.id;
  }

   const admisionPayload = {
    paciente_id: pacienteId,
    fecha_ingreso: createdAt,
    estado: mainData.estado || 'Atención',
    motivo: payload?.motivo || null,
    diagnostico: payload?.diagnostico || null,
    admitido,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(ADMISIONES_TABLE)
    .insert([admisionPayload])
    .select('id')
    .single();

  if (error) {
    const fallbackPayload = { ...admisionPayload };
    
    const fallbackAttempt = await supabase
      .from(ADMISIONES_TABLE)
      .insert([fallbackPayload])
      .select('id')
      .single();

    if (fallbackAttempt.error) {
      // fallback adicional si columnas opcionales no existen en el esquema.
      const fallbackPayload2 = { ...fallbackPayload };
      const fallbackAttempt2 = await supabase
        .from(ADMISIONES_TABLE)
        .insert([fallbackPayload2])
        .select('id')
        .single();

      if (fallbackAttempt2.error) {
        throw mapSupabaseError(
          fallbackAttempt2.error,
          'No se pudo crear la admision en Supabase.'
        );
      }

      return {
        id: fallbackAttempt2.data.id,
        pacienteId,
      };
    }

    return {
      id: fallbackAttempt.data.id,
      pacienteId,
    };
  }

  return {
    id: data.id,
    pacienteId,
  };
}

export async function updateAdmisionById(id, payload) {
  const admision = await getAdmisionById(id);
  const estadoActual = admision?.estado || null;
  const estadoSolicitado = payload?.mainData?.estado || payload?.estado || null;

  // Regla de negocio: una vez en Alta Médica, el estado queda bloqueado.
  if (
    estadoActual === 'Alta Médica' &&
    estadoSolicitado &&
    estadoSolicitado !== 'Alta Médica'
  ) {
    const error = new Error('El estado "Alta Médica" está bloqueado y no puede modificarse.');
    error.code = 'estado_bloqueado_alta_medica';
    throw error;
  }

  if (payload?.mainData || payload?.secondaryData || payload?.servicio || payload?.ubicacion) {
    const pacientePayload = {};
    if (payload?.mainData) {
      pacientePayload.nombres = payload.mainData.firstName || '';
      pacientePayload.apellidos = payload.mainData.lastName || '';
      pacientePayload.cedula = payload.mainData.cedula || '';
      pacientePayload.telefono = payload.mainData.phone || '';
      pacientePayload.genero = payload.mainData.gender || '';
      pacientePayload.estado_civil = payload.mainData.maritalStatus || '';
      pacientePayload.seguro_medico = payload.mainData.seguro || '';
      pacientePayload.medico_tratante = payload.mainData.medico || '';
      pacientePayload.servicio = payload.mainData.servicio || '';
      pacientePayload.ubicacion = payload.mainData.ubicacion || {};
    }
    if (payload?.servicio) {
      pacientePayload.servicio = payload.servicio;
    }
    if (payload?.ubicacion) {
      pacientePayload.ubicacion = payload.ubicacion;
    }
    if (payload?.secondaryData) {
      pacientePayload.nacionalidad = payload.secondaryData.nacionalidad || null;
      pacientePayload.lugar_nacimiento = payload.secondaryData.placeOfBirth || null;
      pacientePayload.fecha_nacimiento = payload.secondaryData.dateOfBirth || null;
      pacientePayload.pais = payload.secondaryData.country || null;
      pacientePayload.provincia = payload.secondaryData.province || null;
      pacientePayload.canton = payload.secondaryData.canton || null;
      pacientePayload.direccion = payload.secondaryData.direccion || null;
      pacientePayload.calle_principal = payload.secondaryData.calleprin || null;
      pacientePayload.calle_secundaria = payload.secondaryData.callesecun || null;
      pacientePayload.numero = payload.secondaryData.numero || null;
      pacientePayload.referencia = payload.secondaryData.referencia || null;
      pacientePayload.ocupacion = payload.secondaryData.ocupacion || null;
      pacientePayload.empresa = payload.secondaryData.instituto || null;
      pacientePayload.puesto_trabajo = payload.secondaryData.puesto || null;
      pacientePayload.descripcion_laboral = payload.secondaryData.descripcion || null;
      pacientePayload.correo = payload.secondaryData.correo || null;
    }

    const { error: pacienteError } = await supabase
      .from(PACIENTES_TABLE)
      .update(pacientePayload)
      .eq('id', admision.paciente_id);

    if (pacienteError) {
      throw mapSupabaseError(pacienteError, 'No se pudo actualizar el paciente.');
    }
  }

const admisionPatch = {};
  if (payload?.mainData?.estado) admisionPatch.estado = payload.mainData.estado;
  if (payload?.estado) admisionPatch.estado = payload.estado;
  if (typeof payload?.admitido === 'boolean') admisionPatch.admitido = payload.admitido;

  if (Object.keys(admisionPatch).length > 0) {
    const { error: admisionError } = await supabase
      .from(ADMISIONES_TABLE)
      .update(admisionPatch)
      .eq('id', id);

    if (admisionError) {
      const fallbackPatch = { ...admisionPatch };

      const { error: admisionErrorFallback } = await supabase
        .from(ADMISIONES_TABLE)
        .update(fallbackPatch)
        .eq('id', id);

     if (admisionErrorFallback) {
        // último fallback si columnas opcionales no existen en el esquema
        const fallbackPatch2 = { ...fallbackPatch };

        const { error: admisionErrorFallback2 } = await supabase
          .from(ADMISIONES_TABLE)
          .update(fallbackPatch2)
          .eq('id', id);

        if (admisionErrorFallback2) {
          throw mapSupabaseError(
            admisionErrorFallback2,
            'No se pudo actualizar la admision en Supabase.'
          );
        }
      }
    }
     }
}

export async function getAdmisionesAdmitidas() {
  const primaryAttempt = await supabase
    .from(ADMISIONES_TABLE)
    .select('id, paciente_id, admitido, fecha_ingreso, estado, motivo, diagnostico, created_at, pacientes(*)')
    .eq('admitido', true)
    .order('fecha_ingreso', { ascending: false });

  let data = primaryAttempt.data;
  let error = primaryAttempt.error;

  if (error) {
    const fallbackAttempt = await supabase
      .from(ADMISIONES_TABLE)
      .select('id, paciente_id, admitido, fecha_ingreso, estado, motivo, diagnostico, created_at, pacientes(*)')
      .eq('admitido', true)
      .order('fecha_ingreso', { ascending: false });

    data = fallbackAttempt.data;
    error = fallbackAttempt.error;
  }

  if (error) {
    throw mapSupabaseError(error, 'No se pudo cargar admisiones admitidas.');
  }

  return (data || []).map((row) => {
    const paciente = row.pacientes || {};
    const mainData = toMainDataFromPaciente(paciente, row);
    const secondaryData = toSecondaryDataFromPaciente(paciente);
    return {
      id: row.id,
      pacienteId: paciente.id,
      createdAt: row.fecha_ingreso || row.created_at,
      mainData,
      secondaryData,
    };
  });
}

export function subscribeAdmisionesAdmitidas(onChange, onError) {
  const channel = supabase
    .channel('admisiones-admitidas-dashboard')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: ADMISIONES_TABLE },
      async () => {
        try {
          const rows = await getAdmisionesAdmitidas();
          onChange(rows);
        } catch (error) {
          if (onError) onError(error);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function getIngresoHistorialByAdmisionId(admisionId) {
  if (!admisionId) return [];

  // Caso principal: recibimos id de admision, resolvemos paciente_id y traemos todo su historial.
  const admisionBaseAttempt = await supabase
    .from(ADMISIONES_TABLE)
    .select('id, paciente_id')
    .eq('id', admisionId)
    .maybeSingle();

  let query = supabase
    .from(ADMISIONES_TABLE)
    .select('*')
    .order('fecha_ingreso', { ascending: false });

  if (!admisionBaseAttempt.error && admisionBaseAttempt.data?.paciente_id) {
    query = query.eq('paciente_id', admisionBaseAttempt.data.paciente_id);
  } else {
    // Fallback: si ya nos pasan paciente_id, usamos ese filtro; si no, mantenemos por id.
    const byPacienteAttempt = await supabase
      .from(ADMISIONES_TABLE)
      .select('*')
      .eq('paciente_id', admisionId)
      .order('fecha_ingreso', { ascending: false });

    if (!byPacienteAttempt.error && (byPacienteAttempt.data || []).length > 0) {
      return (byPacienteAttempt.data || [])
        .filter((row) => row.fecha_ingreso)
        .map((row) => ({
          id: row.id,
          admision_id: row.id,
          paciente_id: row.paciente_id,
          fecha_ingreso: row.fecha_ingreso,
          createdAt: row.fecha_ingreso,
          nota: null,
        }));
    }

    query = query.eq('id', admisionId);
  }

  const { data, error } = await query;
  if (error) {
    throw mapSupabaseError(error, 'No se pudo cargar el historial de ingreso.');
  }

  return (data || [])
    .filter((row) => row.fecha_ingreso)
    .map((row) => ({
      id: row.id,
      admision_id: row.id,
      paciente_id: row.paciente_id,
      fecha_ingreso: row.fecha_ingreso,
      createdAt: row.fecha_ingreso,
      nota: null,
    }));
}

export async function getAdmisionForModuleById(admisionId) {
  const primaryAttempt = await supabase
    .from(ADMISIONES_TABLE)
    .select(
      'id, paciente_id, admitido, fecha_ingreso, created_at, estado, motivo, diagnostico, pacientes(*)'
    )
    .eq('id', admisionId)
    .single();

  if (primaryAttempt.error) {
    const fallbackAttempt = await supabase
      .from(ADMISIONES_TABLE)
      .select(
        'id, paciente_id, admitido, fecha_ingreso, created_at, estado, motivo, diagnostico, pacientes(*)'
      )
      .eq('id', admisionId)
      .single();

    if (fallbackAttempt.error) {
      throw mapSupabaseError(fallbackAttempt.error, 'No se pudo obtener admisión.');
    }

    const row = fallbackAttempt.data;
    const paciente = row.pacientes || {};
    const mainData = toMainDataFromPaciente(paciente, row);
    const secondaryData = toSecondaryDataFromPaciente(paciente);
     return {
      id: row.id,
      ...mainData,
      secondaryData,
      createdAt: row.fecha_ingreso || row.created_at || null,
    };
  }

  const row = primaryAttempt.data;
  const paciente = row.pacientes || {};
  const mainData = toMainDataFromPaciente(paciente, row);
  const secondaryData = toSecondaryDataFromPaciente(paciente);

  return {
    id: row.id,
    ...mainData,
    secondaryData,
    createdAt: row.fecha_ingreso || row.created_at || null,
  };
}

export async function getLatestSignosVitalesByAdmisionId(admisionId) {
  const primaryAttempt = await supabase
    .from(SIGNOS_VITALES_TABLE)
    .select('*')
    .eq('admision_id', admisionId)
    .order('created_at', { ascending: false })
    .limit(1);

  let data = primaryAttempt.data;
  let error = primaryAttempt.error;

  if (error) {
    const fallbackAttempt = await supabase
      .from(SIGNOS_VITALES_TABLE)
      .select('*')
      .eq('admision_id', admisionId)
      .order('createdAt', { ascending: false })
      .limit(1);
    data = fallbackAttempt.data;
    error = fallbackAttempt.error;
  }

  if (error) {
    throw mapSupabaseError(error, 'No se pudieron cargar los signos vitales.');
  }

  const row = (data || [])[0];
  if (!row) return null;

  return {
    presion: row.presion_arterial ?? null,
    pulso: row.frecuencia_cardiaca ?? null,
    temperatura: row.temperatura ?? null,
    satO2: row.saturacion_oxigeno ?? null,
    peso: row.peso ?? null,
    fr: row.frecuencia_respiratoria ?? null,
    glucosa: row.glucemia ?? null,
    diuresis: row.diuresis ?? null,
    enfermera: row.enfermera ?? null,
    horaRegistro: row.hora_registro ?? null,
    observaciones: row.observaciones ?? null,
    createdAt: row.created_at ?? row.createdAt ?? null,
  };
}

export async function insertSignosVitalesByAdmisionId(admisionId, { vitals, enfermera, horaRegistro, observaciones }) {
  const presion_arterial = vitals?.presion || null;
  const frecuencia_cardiaca = vitals?.pulso ? Number(vitals.pulso) : null;
  const temperatura = vitals?.temperatura ? Number(vitals.temperatura) : null;
  const saturacion_oxigeno = vitals?.satO2 ? Number(vitals.satO2) : null;
  const peso = vitals?.peso ? Number(vitals.peso) : null;
  const frecuencia_respiratoria = vitals?.fr ? Number(vitals.fr) : null;
  const glucemia = vitals?.glucosa ? Number(vitals.glucosa) : null;
  const diuresis = vitals?.diuresis ? Number(vitals.diuresis) : null;

  const payload = {
    admision_id: admisionId,
    presion_arterial,
    frecuencia_cardiaca,
    temperatura,
    saturacion_oxigeno,
    peso,
    frecuencia_respiratoria,
    glucemia,
    diuresis,
    enfermera: enfermera || null,
    hora_registro: horaRegistro || null,
    observaciones: observaciones || null,
  };

  const { data, error } = await supabase
    .from(SIGNOS_VITALES_TABLE)
    .insert([payload])
    .select('id')
    .maybeSingle();

  if (error) {
    throw mapSupabaseError(error, 'No se pudieron guardar los signos vitales en Supabase.');
  }

  return data?.id || null;
}

const isMeaningfulValue = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
};

const hasMeaningfulFields = (obj = {}, ignoredKeys = []) => {
  const ignored = new Set(ignoredKeys);
  return Object.entries(obj).some(([key, value]) => {
    if (ignored.has(key)) return false;
    return isMeaningfulValue(value);
  });
};

export async function createClinicalEvolutionWithDetails(payload) {
  if (!payload?.admision_id) {
    throw new Error('admision_id es obligatorio para crear la evolución clínica.');
  }

  const nowIso = new Date().toISOString();
  const toNullable = (value) => {
    if (value === undefined || value === null) return null;
    if (typeof value === 'string' && value.trim() === '') return null;
    return value;
  };
  const firstDefined = (...values) => values.find((value) => value !== undefined);

  const evolutionPayload = {
    admision_id: payload.admision_id,
    evolucion: toNullable(payload.evolucion),
    analisis: toNullable(payload.analisis),
    enfermeria: toNullable(payload.enfermeria),
    actividades: toNullable(payload.actividades),
    observaciones: toNullable(payload.observaciones),
    examen_solicitados: toNullable(
      firstDefined(payload.examen_solicitados, payload.examenes)
    ),
    created_at: nowIso,
  };

  const { data: evolution, error: evolutionError } = await supabase
    .from('clinical_evolution')
    .insert([evolutionPayload])
    .select()
    .single();

  if (evolutionError) {
    throw mapSupabaseError(
      evolutionError,
      'No se pudo crear el registro principal en clinical_evolution.'
    );
  }

  const evolutionId = evolution.id;

  try {
    const normalizeMedicamentoRow = (item = {}) => ({
      clinical_evolution_id: evolutionId,
      medicamento: toNullable(item.medicamento),
      via: toNullable(item.via),
      frecuencia: toNullable(item.frecuencia),
      hora_inicio: toNullable(firstDefined(item.hora_inicio, item.horaPrimeraToma)),
      intervalo_horas: toNullable(
        firstDefined(item.intervalo_horas, item.intervaloHoras)
      ),
      proxima_toma: toNullable(firstDefined(item.proxima_toma, item.proximaToma)),
      presentacion: toNullable(item.presentacion),
      administra: toNullable(item.administra),
      cantidad: toNullable(item.cantidad),
      indicacion: toNullable(item.indicacion),
      created_at: nowIso,
    });

    const medicamentosRows = Array.isArray(payload.medicamentos)
      ? payload.medicamentos
          .map((m) => normalizeMedicamentoRow(m))
          .filter((m) =>
            hasMeaningfulFields(m, ['clinical_evolution_id', 'created_at'])
          )
      : [];

    if (medicamentosRows.length > 0) {
      const { error } = await supabase.from('medicamentos').insert(medicamentosRows);
      if (error) {
        throw mapSupabaseError(error, 'No se pudieron guardar los medicamentos de la evolución.');
      }
    }

    const infusionesSource = Array.isArray(payload.infusiones)
      ? payload.infusiones
      : payload.infusiones
        ? [payload.infusiones]
        : [];

    const normalizeInfusionRow = (item = {}) => ({
      clinical_evolution_id: evolutionId,
      tipo: toNullable(firstDefined(item.tipo, item.infusiones)),
      indicacion: toNullable(item.indicacion),
      frecuencia: toNullable(item.frecuencia),
      created_at: nowIso,
    });

    const infusionesRows = infusionesSource
      .map((i) => normalizeInfusionRow(i))
      .filter((i) =>
        hasMeaningfulFields(i, ['clinical_evolution_id', 'created_at'])
      );

    if (infusionesRows.length > 0) {
      const { error } = await supabase.from('infusiones').insert(infusionesRows);
      if (error) {
        throw mapSupabaseError(error, 'No se pudieron guardar las infusiones de la evolución.');
      }
    }

    if (
      payload.nutricion &&
      hasMeaningfulFields(payload.nutricion, ['id', 'clinical_evolution_id'])
    ) {
      const { id: _localId, clinical_evolution_id: _ignoredId, ...restNutricion } =
        payload.nutricion || {};
      const { error } = await supabase.from('nutricion').insert([
        {
          ...restNutricion,
          clinical_evolution_id: evolutionId,
        },
      ]);
      if (error) {
        throw mapSupabaseError(error, 'No se pudo guardar la nutrición de la evolución.');
      }
    }

    const sv = payload.signos_vitales || {};
    const signosPayload = {
      clinical_evolution_id: evolutionId,
      temperatura_manana: toNullable(
        firstDefined(sv.temperatura_manana, sv.temperatura?.manana)
      ),
      temperatura_tarde: toNullable(
        firstDefined(sv.temperatura_tarde, sv.temperatura?.tarde)
      ),
      temperatura_noche: toNullable(
        firstDefined(sv.temperatura_noche, sv.temperatura?.noche)
      ),
      presion_manana: toNullable(
        firstDefined(
          sv.presion_manana,
          sv.presion?.manana,
          sv.presion_arterial?.manana,
          sv.presionArterial?.manana
        )
      ),
      presion_tarde: toNullable(
        firstDefined(
          sv.presion_tarde,
          sv.presion?.tarde,
          sv.presion_arterial?.tarde,
          sv.presionArterial?.tarde
        )
      ),
      presion_noche: toNullable(
        firstDefined(
          sv.presion_noche,
          sv.presion?.noche,
          sv.presion_arterial?.noche,
          sv.presionArterial?.noche
        )
      ),
      frecuencia_cardiaca_manana: toNullable(
        firstDefined(
          sv.frecuencia_cardiaca_manana,
          sv.frecuencia_cardiaca?.manana,
          sv.frecuenciaCardiaca?.manana
        )
      ),
      frecuencia_cardiaca_tarde: toNullable(
        firstDefined(
          sv.frecuencia_cardiaca_tarde,
          sv.frecuencia_cardiaca?.tarde,
          sv.frecuenciaCardiaca?.tarde
        )
      ),
      frecuencia_cardiaca_noche: toNullable(
        firstDefined(
          sv.frecuencia_cardiaca_noche,
          sv.frecuencia_cardiaca?.noche,
          sv.frecuenciaCardiaca?.noche
        )
      ),
      sat_manana: toNullable(
        firstDefined(sv.sat_manana, sv.sat?.manana, sv.sat_o2?.manana, sv.satO2?.manana)
      ),
      sat_tarde: toNullable(
        firstDefined(sv.sat_tarde, sv.sat?.tarde, sv.sat_o2?.tarde, sv.satO2?.tarde)
      ),
      sat_noche: toNullable(
        firstDefined(sv.sat_noche, sv.sat?.noche, sv.sat_o2?.noche, sv.satO2?.noche)
      ),
    };

    const shouldInsertSignos = Object.entries(signosPayload).some(([key, value]) => {
      if (key === 'clinical_evolution_id') return false;
      return value !== null;
    });

    if (shouldInsertSignos) {
      const { error } = await supabase
        .from('signos_vitales_y_actividades')
        .insert([signosPayload]);

      if (error) {
        throw mapSupabaseError(
          error,
          'No se pudieron guardar los signos vitales en signos_vitales_y_actividades.'
        );
      }
    }
  } catch (childError) {
    throw mapSupabaseError(
      childError,
      'Se creó clinical_evolution, pero falló el guardado de los detalles relacionados.'
    );
  }

  return evolution;
}

export async function getClinicalEvolutionFull(admisionId) {
  const { data, error } = await supabase
    .from('clinical_evolution')
    .select(
      `
        *,
        medicamentos (*),
        infusiones (*),
        nutricion (*),
        signos_vitales_y_actividades (*)
      `
    )
    .eq('admision_id', admisionId)
    .order('created_at', { ascending: false });

  if (error) {
    throw mapSupabaseError(error, 'No se pudo cargar la evolución clínica completa.');
  }

  return data || [];
}

export async function searchAdmisionesByField(field, rawText) {
  const text = String(rawText || '').trim().toLowerCase();
  if (text.length < 2) return [];

  const columnMap = {
    firstName_lower: 'nombres',
    lastName_lower: 'apellidos',
    cedula: 'cedula',
  };

  const targetColumn = columnMap[field];
  if (!targetColumn) return [];

  const { data: pacientes, error: pacientesError } = await supabase
    .from(PACIENTES_TABLE)
    .select('*')
    .ilike(targetColumn, `${text}%`)
    .limit(20);

  if (pacientesError) {
    throw mapSupabaseError(pacientesError, 'No se pudo buscar pacientes en Supabase.');
  }

  const pacienteIds = (pacientes || []).map((p) => p.id);
  if (!pacienteIds.length) return [];

  const { data: admisiones, error: admisionesError } = await supabase
    .from(ADMISIONES_TABLE)
    .select('*')
    .in('paciente_id', pacienteIds)
    .order('fecha_ingreso', { ascending: false });

  if (admisionesError) {
    throw mapSupabaseError(admisionesError, 'No se pudo cargar las admisiones del paciente.');
  }

  const latestByPaciente = {};
  (admisiones || []).forEach((admision) => {
    if (!latestByPaciente[admision.paciente_id]) {
      latestByPaciente[admision.paciente_id] = admision;
    }
  });

  return (pacientes || []).map((paciente) => {
    const admision = latestByPaciente[paciente.id];
    return {
      id: admision?.id || null,
      pacienteId: paciente.id,
      mainData: toMainDataFromPaciente(paciente, admision || {}),
      secondaryData: toSecondaryDataFromPaciente(paciente),
      createdAt: admision?.fecha_ingreso || paciente.created_at || null,
    };
  });
}

