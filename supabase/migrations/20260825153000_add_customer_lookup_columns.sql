alter table public.orders
  add column customer_name_normalized text generated always as (
    lower(regexp_replace(btrim(customer_name), '\s+', ' ', 'g'))
  ) stored,
  add column customer_phone_digits text generated always as (
    regexp_replace(customer_phone, '\D', '', 'g')
  ) stored;

create index orders_customer_name_normalized_idx
  on public.orders(customer_name_normalized);

create index orders_customer_phone_digits_idx
  on public.orders(customer_phone_digits);

comment on column public.orders.customer_name_normalized is
  'Generated lookup helper for server-side customer searches. Do not return publicly.';
comment on column public.orders.customer_phone_digits is
  'Generated lookup helper for server-side phone searches. Sensitive; do not return publicly.';
