-- =============================================
-- FleetManager Pro - Supabase Schema
-- Ejecutar en: Supabase > SQL Editor
-- =============================================

-- Tabla de vehículos
create table vehicles (
  id uuid default gen_random_uuid() primary key,
  brand text not null,
  model text not null,
  plate text not null unique,
  year integer,
  color text,
  km integer default 0,
  status text default 'available' check (status in ('available', 'reserved', 'maintenance')),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabla de reservas
create table reservations (
  id uuid default gen_random_uuid() primary key,
  vehicle_id uuid references vehicles(id) on delete cascade,
  driver_name text not null,
  start_date date not null,
  end_date date not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tabla de mantenimiento
create table maintenance (
  id uuid default gen_random_uuid() primary key,
  vehicle_id uuid references vehicles(id) on delete cascade,
  type text not null,
  date date not null,
  next_date date,
  cost numeric default 0,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Row Level Security (RLS) - solo usuarios autenticados
alter table vehicles enable row level security;
alter table reservations enable row level security;
alter table maintenance enable row level security;

create policy "Authenticated users can do everything on vehicles"
  on vehicles for all using (auth.role() = 'authenticated');

create policy "Authenticated users can do everything on reservations"
  on reservations for all using (auth.role() = 'authenticated');

create policy "Authenticated users can do everything on maintenance"
  on maintenance for all using (auth.role() = 'authenticated');
