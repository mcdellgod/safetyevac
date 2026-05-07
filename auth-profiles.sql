create schema if not exists app_private;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nom text not null default '',
  email text not null,
  telephone text,
  batiment text,
  zone text,
  role text not null default 'employe' check (role in (
    'admin',
    'chef_securite',
    'guide_file',
    'secouriste',
    'employe',
    'visiteur_temporaire'
  )),
  statut_actif boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can read own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own profile"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create or replace function app_private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function app_private.set_updated_at();

create or replace function app_private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (user_id, nom, email, telephone, batiment, zone, role, statut_actif)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nom', ''),
    coalesce(new.email, new.raw_user_meta_data ->> 'email', ''),
    nullif(new.raw_user_meta_data ->> 'telephone', ''),
    nullif(new.raw_user_meta_data ->> 'batiment', ''),
    nullif(new.raw_user_meta_data ->> 'zone', ''),
    case
      when new.raw_user_meta_data ->> 'role' in (
        'admin',
        'chef_securite',
        'guide_file',
        'secouriste',
        'employe',
        'visiteur_temporaire'
      )
      then new.raw_user_meta_data ->> 'role'
      else 'employe'
    end,
    true
  )
  on conflict (user_id) do update set
    nom = excluded.nom,
    email = excluded.email,
    telephone = excluded.telephone,
    batiment = excluded.batiment,
    zone = excluded.zone,
    role = excluded.role,
    statut_actif = excluded.statut_actif;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_profile on auth.users;
create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row execute function app_private.handle_new_user();
