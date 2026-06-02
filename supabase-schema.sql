-- ============================================================
-- STATIONLY — Supabase Schema
-- Copia y pega este SQL en: Supabase > SQL Editor > New query
-- ============================================================

-- 1. TABLA PRINCIPAL
create table if not exists public.setups (
  id          uuid primary key default gen_random_uuid(),
  user_name   text not null,
  title       text not null,
  category    text not null default 'workstation',
  tags        text[] not null default '{}',
  image_url   text,
  likes       integer not null default 0,
  created_at  timestamptz not null default now()
);

-- 2. ÍNDICES
create index if not exists setups_created_at_idx on public.setups (created_at desc);
create index if not exists setups_category_idx   on public.setups (category);

-- 3. RLS (Row Level Security)
alter table public.setups enable row level security;

-- Cualquiera puede leer
create policy "Setups son públicos"
  on public.setups for select
  using (true);

-- Cualquiera puede insertar (auth se añadirá en v2)
create policy "Cualquiera puede publicar"
  on public.setups for insert
  with check (true);

-- Cualquiera puede actualizar likes
create policy "Cualquiera puede dar like"
  on public.setups for update
  using (true)
  with check (true);

-- 4. FUNCIÓN RPC para likes atómicos
create or replace function public.toggle_like(setup_id uuid, delta integer)
returns integer
language plpgsql
as $$
declare
  new_likes integer;
begin
  update public.setups
  set likes = greatest(0, likes + delta)
  where id = setup_id
  returning likes into new_likes;
  return new_likes;
end;
$$;

-- 5. STORAGE BUCKET para imágenes
-- (Ejecutar por separado si falla)
insert into storage.buckets (id, name, public)
values ('setups', 'setups', true)
on conflict (id) do nothing;

-- Policy para subir imágenes
create policy "Subida pública de imágenes"
  on storage.objects for insert
  with check (bucket_id = 'setups');

-- Policy para ver imágenes
create policy "Imágenes públicas"
  on storage.objects for select
  using (bucket_id = 'setups');

-- 6. DATOS DE EJEMPLO (opcional)
insert into public.setups (user_name, title, category, tags, likes) values
  ('NightCrawlerFX', 'The Purple Shrine',      'rgb',         array['RTX 4090','Samsung Odyssey','Corsair K100','HyperX Cloud III'], 312),
  ('StreamQueen',    'Cozy Broadcast HQ',       'streaming',   array['Elgato 4K60','Shure SM7B','Stream Deck XL','Sony A7III'],      289),
  ('SilentCoderX',   'Monochrome Master',        'minimal',     array['M2 Mac Studio','LG 5K Ultrafine','Keychron Q1','MX Master 3S'],501),
  ('VortexGaming',   'Battle Command Center',    'gaming',      array['i9-13900K','RTX 4080','ASUS ROG Swift','SteelSeries Apex Pro'],178),
  ('NeonDrifter',    'RGB Galaxy Station',       'rgb',         array['Lian Li PC-O11','NZXT Kraken','Logitech G915','Razer Naga X'], 445),
  ('MidnightDev',    'Dual Screen Developer',    'workstation', array['Dell XPS 15','2x LG 27UK850','Ducky One 2','Logitech MX Vertical'],234),
  ('PixelArchitect', 'Creative Minimal',         'minimal',     array['iPad Pro M2','Apple Studio Display','Magic Keyboard','AirPods Max'],390),
  ('GhostRunner99',  'The Dark Fortress',        'gaming',      array['AMD 7950X','RX 7900 XTX','Alienware AW3423DW','Razer Huntsman V2'],617)
on conflict do nothing;
