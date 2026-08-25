create extension if not exists pgcrypto;

create type public.order_status as enum (
  'pending',
  'confirmed',
  'preparing',
  'shipped',
  'delivered',
  'cancelled'
);

create type public.order_source as enum (
  'google_form',
  'line',
  'manual'
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null,
  customer_name text not null,
  customer_phone text not null,
  source public.order_source not null default 'manual',
  status public.order_status not null default 'pending',
  tracking_number text,
  shipping_provider text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint orders_order_code_key unique (order_code),
  constraint orders_order_code_format_check check (
    order_code ~ '^[A-Z0-9][A-Z0-9-]{5,39}$'
  ),
  constraint orders_customer_name_length_check check (
    char_length(customer_name) between 1 and 120
  ),
  constraint orders_customer_phone_length_check check (
    char_length(customer_phone) between 7 and 32
  ),
  constraint orders_tracking_number_length_check check (
    tracking_number is null or char_length(tracking_number) between 3 and 80
  ),
  constraint orders_shipping_provider_length_check check (
    shipping_provider is null or char_length(shipping_provider) between 2 and 80
  )
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_name text not null,
  variant text,
  size text,
  quantity integer not null,
  unit_price numeric(10, 2),
  currency text not null default 'THB',
  created_at timestamptz not null default now(),

  constraint order_items_product_name_length_check check (
    char_length(product_name) between 1 and 160
  ),
  constraint order_items_variant_length_check check (
    variant is null or char_length(variant) between 1 and 80
  ),
  constraint order_items_size_length_check check (
    size is null or char_length(size) between 1 and 40
  ),
  constraint order_items_quantity_check check (quantity > 0 and quantity <= 999),
  constraint order_items_unit_price_check check (
    unit_price is null or unit_price >= 0
  ),
  constraint order_items_currency_check check (currency ~ '^[A-Z]{3}$')
);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.order_status not null,
  note text,
  created_at timestamptz not null default now(),

  constraint order_status_history_note_length_check check (
    note is null or char_length(note) <= 500
  )
);

create index order_items_order_id_idx
  on public.order_items(order_id);

create index order_status_history_order_id_created_at_idx
  on public.order_status_history(order_id, created_at);

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_set_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;

revoke all on public.orders from anon, authenticated;
revoke all on public.order_items from anon, authenticated;
revoke all on public.order_status_history from anon, authenticated;

comment on table public.orders is
  'Primary order records. Contains customer PII required for fulfillment and verification; do not expose directly to browsers.';
comment on column public.orders.order_code is
  'Public-facing order identifier suitable for customer lookup.';
comment on column public.orders.customer_phone is
  'Sensitive verification value. Compare server-side and never return through public tracking responses.';
comment on table public.order_items is
  'Line items belonging to an order.';
comment on table public.order_status_history is
  'Append-only timeline entries for customer-visible order progress.';
