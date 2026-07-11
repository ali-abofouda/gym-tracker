insert into public.profiles (id, display_name, pin_hash) values
('00000000-0000-0000-0000-000000000001', 'علي', null),
('00000000-0000-0000-0000-000000000002', 'فاروق', null),
('00000000-0000-0000-0000-000000000003', 'أبو ريا', null),
('00000000-0000-0000-0000-000000000004', 'عبده', null),
('00000000-0000-0000-0000-000000000005', 'الديب', null)
on conflict (id) do update set
  display_name = excluded.display_name;
