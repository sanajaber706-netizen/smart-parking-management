create table if not exists public.parking_slots (
  id text primary key,
  floor text not null,
  status text not null default 'free',
  vehicle text,
  entry_time text,
  rate text not null default '$5/hr'
);

insert into public.parking_slots (id, floor, status, vehicle, entry_time, rate)
values
  ('A1', 'ground', 'free', '', '', '$5/hr'),
  ('A2', 'ground', 'occupied', 'KA 01 AB 1234', '08:15', '$5/hr'),
  ('A3', 'ground', 'free', '', '', '$5/hr'),
  ('A4', 'ground', 'occupied', 'KA 05 TY 4012', '09:10', '$5/hr'),
  ('A5', 'ground', 'free', '', '', '$5/hr'),
  ('A6', 'ground', 'occupied', 'KA 09 ML 8891', '10:40', '$5/hr'),
  ('A7', 'ground', 'free', '', '', '$5/hr'),
  ('A8', 'ground', 'occupied', 'KA 12 AZ 2308', '11:02', '$5/hr'),
  ('A9', 'ground', 'free', '', '', '$5/hr'),
  ('A10', 'ground', 'occupied', 'KA 16 PQ 4490', '12:15', '$5/hr'),
  ('A11', 'ground', 'free', '', '', '$5/hr'),
  ('A12', 'ground', 'occupied', 'KA 22 RC 1765', '12:50', '$5/hr'),
  ('B1', 'upper', 'free', '', '', '$7/hr'),
  ('B2', 'upper', 'occupied', 'KA 48 LJ 4045', '08:30', '$7/hr'),
  ('B3', 'upper', 'free', '', '', '$7/hr'),
  ('B4', 'upper', 'occupied', 'KA 66 XM 3009', '09:45', '$7/hr'),
  ('B5', 'upper', 'free', '', '', '$7/hr'),
  ('B6', 'upper', 'occupied', 'KA 74 HF 1188', '11:28', '$7/hr'),
  ('B7', 'upper', 'free', '', '', '$7/hr'),
  ('B8', 'upper', 'occupied', 'KA 82 NZ 5527', '13:00', '$7/hr')
on conflict (id) do nothing;

alter table public.parking_slots enable row level security;

create policy if not exists "Allow public read access"
on public.parking_slots
for select
using (true);

create policy if not exists "Allow public update access"
on public.parking_slots
for update
using (true)
with check (true);
