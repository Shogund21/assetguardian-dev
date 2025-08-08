
-- 1) Vendors table
create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  name text not null,
  service_categories text[] not null default '{}',
  contact_name text,
  contact_email text,
  contact_phone text,
  address text,
  status text not null default 'active',
  is_preferred boolean not null default false,
  rating numeric,
  notes text,
  insurance_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vendors enable row level security;

-- RLS: company members or super admins can manage vendors
create policy "Vendors: company member select"
  on public.vendors
  for select
  using (is_member_of(company_id) or can_access_all_data());

create policy "Vendors: company member insert"
  on public.vendors
  for insert
  with check (is_member_of(company_id) or can_access_all_data());

create policy "Vendors: company member update"
  on public.vendors
  for update
  using (is_member_of(company_id) or can_access_all_data())
  with check (is_member_of(company_id) or can_access_all_data());

create policy "Vendors: company member delete"
  on public.vendors
  for delete
  using (is_member_of(company_id) or can_access_all_data());

-- updated_at trigger
drop trigger if exists vendors_set_updated_at on public.vendors;
create trigger vendors_set_updated_at
  before update on public.vendors
  for each row execute procedure public.set_updated_at();

create index if not exists idx_vendors_company_id on public.vendors(company_id);
create index if not exists idx_vendors_name on public.vendors(name);

-- 2) Link vendors to work orders
create table if not exists public.work_order_vendors (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.automated_work_orders(id) on delete cascade,
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  status text not null default 'assigned', -- assigned | quoted | in_progress | completed | cancelled
  assigned_at timestamptz not null default now(),
  quoted_amount numeric,
  approved_amount numeric,
  invoice_number text,
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (work_order_id, vendor_id)
);

alter table public.work_order_vendors enable row level security;

-- RLS: allow access if user belongs to the vendor's company OR to the equipment company of the work order
create policy "WorkOrderVendors: company member select"
  on public.work_order_vendors
  for select
  using (
    exists (
      select 1 from public.vendors v
      where v.id = work_order_vendors.vendor_id
        and (is_member_of(v.company_id) or can_access_all_data())
    )
    or
    exists (
      select 1
      from public.automated_work_orders awo
      join public.equipment e on e.id = awo.asset_id
      where awo.id = work_order_vendors.work_order_id
        and ((e.company_id is null) or is_member_of(e.company_id) or can_access_all_data())
    )
  );

create policy "WorkOrderVendors: company member insert"
  on public.work_order_vendors
  for insert
  with check (
    exists (
      select 1 from public.vendors v
      where v.id = work_order_vendors.vendor_id
        and (is_member_of(v.company_id) or can_access_all_data())
    )
    or
    exists (
      select 1
      from public.automated_work_orders awo
      join public.equipment e on e.id = awo.asset_id
      where awo.id = work_order_vendors.work_order_id
        and ((e.company_id is null) or is_member_of(e.company_id) or can_access_all_data())
    )
  );

create policy "WorkOrderVendors: company member update"
  on public.work_order_vendors
  for update
  using (
    exists (
      select 1 from public.vendors v
      where v.id = work_order_vendors.vendor_id
        and (is_member_of(v.company_id) or can_access_all_data())
    )
    or
    exists (
      select 1
      from public.automated_work_orders awo
      join public.equipment e on e.id = awo.asset_id
      where awo.id = work_order_vendors.work_order_id
        and ((e.company_id is null) or is_member_of(e.company_id) or can_access_all_data())
    )
  )
  with check (
    exists (
      select 1 from public.vendors v
      where v.id = work_order_vendors.vendor_id
        and (is_member_of(v.company_id) or can_access_all_data())
    )
    or
    exists (
      select 1
      from public.automated_work_orders awo
      join public.equipment e on e.id = awo.asset_id
      where awo.id = work_order_vendors.work_order_id
        and ((e.company_id is null) or is_member_of(e.company_id) or can_access_all_data())
    )
  );

create policy "WorkOrderVendors: company member delete"
  on public.work_order_vendors
  for delete
  using (
    exists (
      select 1 from public.vendors v
      where v.id = work_order_vendors.vendor_id
        and (is_member_of(v.company_id) or can_access_all_data())
    )
    or
    exists (
      select 1
      from public.automated_work_orders awo
      join public.equipment e on e.id = awo.asset_id
      where awo.id = work_order_vendors.work_order_id
        and ((e.company_id is null) or is_member_of(e.company_id) or can_access_all_data())
    )
  );

-- updated_at trigger
drop trigger if exists wov_set_updated_at on public.work_order_vendors;
create trigger wov_set_updated_at
  before update on public.work_order_vendors
  for each row execute procedure public.set_updated_at();

create index if not exists idx_wov_work_order_id on public.work_order_vendors(work_order_id);
create index if not exists idx_wov_vendor_id on public.work_order_vendors(vendor_id);

-- 3) Add company_id to work orders and auto-fill it from equipment
alter table public.automated_work_orders
  add column if not exists company_id uuid;

create index if not exists idx_awo_company_id on public.automated_work_orders(company_id);

create or replace function public.set_work_order_company()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.asset_id is not null then
    select e.company_id into new.company_id
    from public.equipment e
    where e.id = new.asset_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_work_order_company on public.automated_work_orders;
create trigger trg_set_work_order_company
  before insert or update of asset_id
  on public.automated_work_orders
  for each row
  execute procedure public.set_work_order_company();
