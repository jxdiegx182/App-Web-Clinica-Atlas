/**
 * SERVICIO DE MEDICACIÓN — Clínica Atlas
 * Centraliza todas las queries de medicación que antes estaban inline en Dashboard.jsx
 */
import { supabase } from '@/lib/supabaseClient.js';

const MEDICATION_ADMIN_TABLE =
  import.meta.env.VITE_SUPABASE_MEDICATION_ADMIN_TABLE || 'medicamentos_administraciones';

// ============================================================================
// HELPERS PUROS (sin dependencia de Supabase)
// ============================================================================

function parseHourToMinutes(hour) {
  const text = String(hour || '').trim();
  const match = text.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return Number.POSITIVE_INFINITY;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (Number.isNaN(h) || Number.isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
    return Number.POSITIVE_INFINITY;
  }
  return h * 60 + m;
}

const formatMinutesToHour = (minutes) => {
  const safe = ((minutes % 1440) + 1440) % 1440;
  const hh = String(Math.floor(safe / 60)).padStart(2, '0');
  const mm = String(safe % 60).padStart(2, '0');
  return `${hh}:${mm}`;
};

export const getMedicationScheduleHours = (item, record = {}) => {
  const baseHour = String(item?.hora_inicio || item?.horaPrimeraToma || '').trim();
  const nextHour = String(item?.proxima_toma || item?.proximaToma || '').trim();
  const interval = Number(item?.intervalo_horas || 0);
  const hasInterval = Number.isFinite(interval) && interval > 0;
  const generated = new Set();
  [baseHour, nextHour]
    .filter((hour) => hour && hour !== '--')
    .forEach((hour) => generated.add(hour));

  if (hasInterval) {
    const startMin = parseHourToMinutes(baseHour);
    const nextMin = parseHourToMinutes(nextHour);
    const maxSteps = Math.max(1, Math.ceil(24 / interval));
    if (Number.isFinite(startMin)) {
      for (let i = 1; i <= maxSteps; i += 1) {
        generated.add(formatMinutesToHour(startMin + i * interval * 60));
      }
    }
    if (Number.isFinite(nextMin)) {
      for (let i = 1; i <= maxSteps; i += 1) {
        generated.add(formatMinutesToHour(nextMin + i * interval * 60));
      }
    }
  }

  const hours = [
    ...Array.from(generated),
    ...(Array.isArray(record?.horariosProgramados) ? record.horariosProgramados : []),
    ...Object.keys(record?.administracionesPorHora || {}),
  ]
    .map((hour) => String(hour || '').trim())
    .filter((hour) => hour && hour !== '--');

  return Array.from(new Set(hours)).sort(
    (a, b) => parseHourToMinutes(a) - parseHourToMinutes(b)
  );
};

function toSupabaseError(error, fallbackMessage) {
  if (!error) return new Error(fallbackMessage);
  const wrapped = new Error(error.message || fallbackMessage);
  wrapped.code = error.code;
  wrapped.details = error.details;
  wrapped.hint = error.hint;
  return wrapped;
}

export const buildMedicationRecordsByKey = (administraciones = []) => {
  const records = {};
  const toMillis = (value) => {
    if (!value) return 0;
    const parsed = value?.toDate ? value.toDate() : new Date(value);
    const time = parsed.getTime();
    return Number.isNaN(time) ? 0 : time;
  };

  (administraciones || []).forEach((row) => {
    const medicationKey = row?.medicamento_id;
    const scheduledHour = String(row?.hora_programada || row?.hora || '').trim();
    if (!medicationKey || !scheduledHour) return;

    if (!records[medicationKey]) {
      records[medicationKey] = {
        medicationKey,
        horariosProgramados: [],
        administracionesPorHora: {},
      };
    }

    const existingHourData = records[medicationKey].administracionesPorHora[scheduledHour];
    const existingTime = toMillis(existingHourData?.confirmationTime);
    const incomingTime = toMillis(row?.timestamp || row?.created_at) || Date.now();

    if (!records[medicationKey].horariosProgramados.includes(scheduledHour)) {
      records[medicationKey].horariosProgramados.push(scheduledHour);
    }

    if (!existingHourData || incomingTime >= existingTime) {
      records[medicationKey].administracionesPorHora[scheduledHour] = {
        confirmada: Boolean(row?.confirmado || row?.estado === 'administrado'),
        confirmationTime: row?.timestamp || row?.created_at || '',
        confirmadoPor: row?.confirmado_por || '',
        estado: row?.estado || (row?.confirmado ? 'administrado' : 'pendiente'),
      };
    }
  });

  return records;
};

// ============================================================================
// QUERIES SUPABASE
// ============================================================================

/**
 * Obtiene el plan de medicación (medicamentos de evolución clínica) para una admisión.
 */
export async function getMedicationPlanByAdmisionId(admisionId) {
  const { data: evolutions, error } = await supabase
    .from('clinical_evolution')
    .select(
      `
        id,
        created_at,
        medicamentos (
          id,
          clinical_evolution_id,
          medicamento,
          via,
          frecuencia,
          hora_inicio,
          intervalo_horas,
          proxima_toma,
          presentacion,
          administra,
          cantidad,
          indicacion,
          created_at
        )
      `
    )
    .eq('admision_id', admisionId)
    .order('created_at', { ascending: false });

  if (error) {
    throw toSupabaseError(error, `No se pudo cargar medicación para admisión ${admisionId}.`);
  }

  const medications = [];
  (evolutions || []).forEach((evolution) => {
    (evolution?.medicamentos || []).forEach((med) => {
      medications.push({
        ...med,
        source: 'Registro medicación',
        clinical_evolution_id: med?.clinical_evolution_id || evolution?.id || null,
      });
    });
  });

  return medications;
}

/**
 * Obtiene los registros de administración de medicamentos para una admisión.
 */
export async function getMedicationAdminRecords(admisionId) {
  const { data, error } = await supabase
    .from(MEDICATION_ADMIN_TABLE)
    .select('*')
    .eq('admision_id', admisionId)
    .order('timestamp', { ascending: false });

  if (error && error.code !== '42P01') {
    throw toSupabaseError(error, `No se pudieron cargar checks de medicación para admisión ${admisionId}.`);
  }

  return data || [];
}

/**
 * Registra una administración de medicamento.
 */
export async function registerMedicationAdministration(payload) {
  const { error } = await supabase.from(MEDICATION_ADMIN_TABLE).insert([payload]);
  if (error) {
    throw toSupabaseError(error, 'No se pudo registrar la administración.');
  }
}

/**
 * Crea un canal de suscripción realtime para cambios de medicación.
 * Retorna la función para remover el canal.
 */
export function subscribeMedicationChanges(channelName, onReload) {
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'clinical_evolution' },
      onReload
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'medicamentos' },
      onReload
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: MEDICATION_ADMIN_TABLE },
      onReload
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        console.warn('⚠️ Realtime de medicamentos no disponible. Se usará refresco automático.');
      }
    });

  return () => supabase.removeChannel(channel);
}
