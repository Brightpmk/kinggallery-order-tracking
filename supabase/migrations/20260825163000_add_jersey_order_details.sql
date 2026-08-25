create type public.jersey_color as enum (
  'CANDY PINK',
  'IGNITE RED',
  'COPPER ROSE',
  'SHADOW BLACK',
  'SONIC BLUE',
  'AURA GREEN'
);

create type public.jersey_size as enum (
  'XS',
  'S',
  'M',
  'L',
  'XL',
  '2XL',
  '3XL',
  '4XL',
  '5XL'
);

create type public.delivery_method as enum (
  'pickup',
  'shipping'
);

alter table public.orders
  add column delivery_method public.delivery_method not null default 'shipping',
  add constraint orders_pickup_has_no_shipping_fields_check check (
    delivery_method = 'shipping'
    or (tracking_number is null and shipping_provider is null)
  );

alter table public.order_items
  add column jersey_color public.jersey_color,
  add column jersey_size public.jersey_size,
  add column print_name text,
  add column shirt_number text,
  add column university_abbreviation text,
  add constraint order_items_print_name_length_check check (
    print_name is null or char_length(print_name) between 1 and 40
  ),
  add constraint order_items_shirt_number_format_check check (
    shirt_number is null or shirt_number ~ '^[0-9]{1,3}$'
  ),
  add constraint order_items_university_abbreviation_length_check check (
    university_abbreviation is null
    or char_length(university_abbreviation) between 2 and 80
  );

comment on column public.orders.delivery_method is
  'Order-level delivery method. Pickup orders must not use shipping provider or tracking number fields.';
comment on column public.order_items.jersey_color is
  'Controlled jersey color for this item.';
comment on column public.order_items.jersey_size is
  'Controlled jersey size for this item.';
comment on column public.order_items.print_name is
  'Customer-requested printed name for this jersey item.';
comment on column public.order_items.shirt_number is
  'Customer-requested printed shirt number for this jersey item.';
comment on column public.order_items.university_abbreviation is
  'University abbreviation printed on this jersey item. Values are not enumerated so new universities can be added without a schema migration.';
