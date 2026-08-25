insert into public.orders (
  id,
  order_code,
  customer_name,
  customer_phone,
  source,
  delivery_method,
  status,
  tracking_number,
  shipping_provider,
  created_at,
  updated_at
) values
  (
    '11111111-1111-4111-8111-111111111111',
    'UJ-2026-3001',
    'Alex Sample',
    '+66 80 000 1001',
    'google_form',
    'pickup',
    'preparing',
    null,
    null,
    '2026-08-18T09:15:00+00:00',
    '2026-08-21T06:20:00+00:00'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'UJ-2026-3002',
    'Jamie Example',
    '+66 80 000 1002',
    'line',
    'shipping',
    'shipped',
    'KEXFAKE3002001',
    'Kerry Express',
    '2026-08-16T04:10:00+00:00',
    '2026-08-20T11:40:00+00:00'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'UJ-2026-3003',
    'Taylor Demo',
    '+66 80 000 1003',
    'manual',
    'shipping',
    'confirmed',
    null,
    null,
    '2026-08-22T02:35:00+00:00',
    '2026-08-22T08:00:00+00:00'
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'UJ-2026-3004',
    'Alex Sample',
    '+66-80-000-1001',
    'google_form',
    'shipping',
    'delivered',
    'THPFAKE3004001',
    'Thailand Post',
    '2026-08-10T05:00:00+00:00',
    '2026-08-14T09:45:00+00:00'
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    'UJ-2026-3005',
    'Casey Cancelled',
    '+66 80 000 1005',
    'line',
    'pickup',
    'cancelled',
    null,
    null,
    '2026-08-23T05:00:00+00:00',
    '2026-08-23T08:30:00+00:00'
  )
on conflict (order_code) do nothing;

insert into public.order_items (
  id,
  order_id,
  product_name,
  jersey_color,
  jersey_size,
  print_name,
  shirt_number,
  university_abbreviation,
  quantity,
  unit_price,
  currency
) values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    '11111111-1111-4111-8111-111111111111',
    'University Jersey Shirt',
    'SHADOW BLACK',
    'L',
    'BRIGHT',
    '21',
    'KMUTT',
    1,
    790.00,
    'THB'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    '11111111-1111-4111-8111-111111111111',
    'University Jersey Shirt',
    'CANDY PINK',
    'M',
    'POKO',
    '8',
    'LARDKRABANG',
    1,
    790.00,
    'THB'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
    '22222222-2222-4222-8222-222222222222',
    'University Jersey Shirt',
    'SONIC BLUE',
    'XL',
    'JAMIE',
    '10',
    'NORTH BANGKOK',
    1,
    790.00,
    'THB'
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
    '33333333-3333-4333-8333-333333333333',
    'University Jersey Shirt',
    'IGNITE RED',
    '5XL',
    'TAYLOR',
    '99',
    'KMUTT',
    1,
    790.00,
    'THB'
  ),
  (
    '99999999-9999-4999-8999-999999999991',
    '44444444-4444-4444-8444-444444444444',
    'University Jersey Shirt',
    'COPPER ROSE',
    'XS',
    'ALEX',
    '7',
    'NORTH BANGKOK',
    1,
    790.00,
    'THB'
  ),
  (
    '99999999-9999-4999-8999-999999999992',
    '55555555-5555-4555-8555-555555555555',
    'University Jersey Shirt',
    'AURA GREEN',
    '3XL',
    'CASEY',
    '5',
    'LARDKRABANG',
    1,
    790.00,
    'THB'
  )
on conflict (id) do nothing;

insert into public.order_status_history (
  id,
  order_id,
  status,
  note,
  created_at
) values
  (
    'dddddddd-dddd-4ddd-8ddd-ddddddddddd1',
    '11111111-1111-4111-8111-111111111111',
    'pending',
    'Jersey order submitted.',
    '2026-08-18T09:15:00+00:00'
  ),
  (
    'dddddddd-dddd-4ddd-8ddd-ddddddddddd2',
    '11111111-1111-4111-8111-111111111111',
    'confirmed',
    'Order details confirmed.',
    '2026-08-18T13:25:00+00:00'
  ),
  (
    'dddddddd-dddd-4ddd-8ddd-ddddddddddd3',
    '11111111-1111-4111-8111-111111111111',
    'preparing',
    'Jerseys are being prepared for pickup.',
    '2026-08-21T06:20:00+00:00'
  ),
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee1',
    '22222222-2222-4222-8222-222222222222',
    'pending',
    'Manual jersey order entered from chat.',
    '2026-08-16T04:10:00+00:00'
  ),
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee2',
    '22222222-2222-4222-8222-222222222222',
    'confirmed',
    'Order details confirmed.',
    '2026-08-16T06:20:00+00:00'
  ),
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee3',
    '22222222-2222-4222-8222-222222222222',
    'preparing',
    'Jersey printing started.',
    '2026-08-18T03:30:00+00:00'
  ),
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee4',
    '22222222-2222-4222-8222-222222222222',
    'shipped',
    'Package handed to carrier.',
    '2026-08-20T11:40:00+00:00'
  ),
  (
    'ffffffff-ffff-4fff-8fff-fffffffffff1',
    '33333333-3333-4333-8333-333333333333',
    'pending',
    'Order created by staff.',
    '2026-08-22T02:35:00+00:00'
  ),
  (
    'ffffffff-ffff-4fff-8fff-fffffffffff2',
    '33333333-3333-4333-8333-333333333333',
    'confirmed',
    'Jersey details confirmed.',
    '2026-08-22T08:00:00+00:00'
  ),
  (
    '77777777-7777-4777-8777-777777777771',
    '44444444-4444-4444-8444-444444444444',
    'pending',
    'Jersey order submitted.',
    '2026-08-10T05:00:00+00:00'
  ),
  (
    '77777777-7777-4777-8777-777777777772',
    '44444444-4444-4444-8444-444444444444',
    'confirmed',
    'Order details confirmed.',
    '2026-08-10T07:20:00+00:00'
  ),
  (
    '77777777-7777-4777-8777-777777777773',
    '44444444-4444-4444-8444-444444444444',
    'preparing',
    'Jersey printing completed.',
    '2026-08-11T03:30:00+00:00'
  ),
  (
    '77777777-7777-4777-8777-777777777774',
    '44444444-4444-4444-8444-444444444444',
    'shipped',
    'Package handed to carrier.',
    '2026-08-12T07:15:00+00:00'
  ),
  (
    '77777777-7777-4777-8777-777777777775',
    '44444444-4444-4444-8444-444444444444',
    'delivered',
    'Package marked as delivered.',
    '2026-08-14T09:45:00+00:00'
  ),
  (
    '88888888-8888-4888-8888-888888888881',
    '55555555-5555-4555-8555-555555555555',
    'pending',
    'Manual jersey order entered from chat.',
    '2026-08-23T05:00:00+00:00'
  ),
  (
    '88888888-8888-4888-8888-888888888882',
    '55555555-5555-4555-8555-555555555555',
    'cancelled',
    'Order cancelled before preparation.',
    '2026-08-23T08:30:00+00:00'
  )
on conflict (id) do nothing;
