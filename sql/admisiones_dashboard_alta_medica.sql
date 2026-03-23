-- Mantener trazabilidad temporal para lógica de Alta Médica en Dashboard
alter table if exists public.admisiones
  add column if not exists updated_at timestamptz default now();

create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_updated_at_admisiones on public.admisiones;

create trigger trg_set_updated_at_admisiones
before update on public.admisiones
for each row
execute function public.set_updated_at_timestamp();

-- Índices para consultas del Dashboard e historial por paciente
create index if not exists idx_admisiones_paciente_fecha_ingreso
  on public.admisiones (paciente_id, fecha_ingreso desc);

create index if not exists idx_admisiones_admitido_fecha_ingreso
  on public.admisiones (admitido, fecha_ingreso desc);

create index if not exists idx_admisiones_estado_updated_at
  on public.admisiones (estado, updated_at desc);
