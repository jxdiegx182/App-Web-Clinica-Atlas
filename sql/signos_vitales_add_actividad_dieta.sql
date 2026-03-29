-- Supabase migration: campos extras en signos_vitales para Evolucion
-- Ejecutar en SQL Editor de Supabase

alter table if exists public.signos_vitales
  add column if not exists actividad_movilizacion text,
  add column if not exists dieta_indicada text;
