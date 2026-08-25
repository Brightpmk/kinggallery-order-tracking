insert into public.orders (
  id,
  order_code,
  customer_name,
  customer_phone,
  source,
  status,
  tracking_number,
  shipping_provider,
  created_at,
  updated_at
) values
  (
    '11111111-1111-4111-8111-111111111111',
    'DT-2026-2001',
    'Alex Sample',
    '+66 80 000 1001',
    'google_form',
    'shipped',
    'KEXFAKE2001001',
    'Kerry Express',
    '2026-08-18T09:15:00+00:00',
    '2026-08-20T11:40:00+00:00'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'DT-2026-2002',
    'Jamie Example',
    '+66 80 000 1002',
    'line',
    'preparing',
    null,
    null,
    '2026-08-19T14:05:00+00:00',
    '2026-08-21T06:20:00+00:00'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'DT-2026-2003',
    'Taylor Demo',
    '+66 80 000 1003',
    'manual',
    'pending',
    null,
    null,
    '2026-08-22T02:35:00+00:00',
    '2026-08-22T02:35:00+00:00'
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'DT-2026-2004',
    'Alex Sample',
    '+66-80-000-1001',
    'manual',
    'delivered',
    'THPFAKE2004001',
    'Thailand Post',
    '2026-08-10T04:10:00+00:00',
    '2026-08-14T09:45:00+00:00'
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    'DT-2026-2005',
    'Casey Cancelled',
    '+66 80 000 1005',
    'line',
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
  variant,
  size,
  quantity,
  unit_price,
  currency
) values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    '11111111-1111-4111-8111-111111111111',
    'Linen Everyday Shirt',
    'Sage',
    'M',
    1,
    890.00,
    'THB'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    '11111111-1111-4111-8111-111111111111',
    'Cotton Wide-Leg Pants',
    'Black',
    'L',
    1,
    1290.00,
    'THB'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
    '22222222-2222-4222-8222-222222222222',
    'Ribbed Knit Tank',
    'Ivory',
    'S',
    2,
    490.00,
    'THB'
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
    '33333333-3333-4333-8333-333333333333',
    'Relaxed Denim Jacket',
    'Washed Blue',
    'Free Size',
    1,
    1590.00,
    'THB'
  ),
  (
    '99999999-9999-4999-8999-999999999991',
    '44444444-4444-4444-8444-444444444444',
    'Boxy Pocket Tee',
    'Cream',
    'M',
    1,
    390.00,
    'THB'
  ),
  (
    '99999999-9999-4999-8999-999999999992',
    '55555555-5555-4555-8555-555555555555',
    'Pleated Midi Skirt',
    'Charcoal',
    'S',
    1,
    990.00,
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
    'Order submitted through the public form.',
    '2026-08-18T09:15:00+00:00'
  ),
  (
    'dddddddd-dddd-4ddd-8ddd-ddddddddddd2',
    '11111111-1111-4111-8111-111111111111',
    'confirmed',
    'Payment verified by staff.',
    '2026-08-18T13:25:00+00:00'
  ),
  (
    'dddddddd-dddd-4ddd-8ddd-ddddddddddd3',
    '11111111-1111-4111-8111-111111111111',
    'preparing',
    'Items prepared for shipment.',
    '2026-08-19T04:30:00+00:00'
  ),
  (
    'dddddddd-dddd-4ddd-8ddd-ddddddddddd4',
    '11111111-1111-4111-8111-111111111111',
    'shipped',
    'Package handed to carrier.',
    '2026-08-20T11:40:00+00:00'
  ),
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee1',
    '22222222-2222-4222-8222-222222222222',
    'pending',
    'Manual order entered from chat.',
    '2026-08-19T14:05:00+00:00'
  ),
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee2',
    '22222222-2222-4222-8222-222222222222',
    'confirmed',
    'Order details confirmed.',
    '2026-08-20T03:10:00+00:00'
  ),
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee3',
    '22222222-2222-4222-8222-222222222222',
    'preparing',
    'Order is being packed.',
    '2026-08-21T06:20:00+00:00'
  ),
  (
    'ffffffff-ffff-4fff-8fff-fffffffffff1',
    '33333333-3333-4333-8333-333333333333',
    'pending',
    'Order created by staff.',
    '2026-08-22T02:35:00+00:00'
  ),
  (
    '77777777-7777-4777-8777-777777777771',
    '44444444-4444-4444-8444-444444444444',
    'pending',
    'Order created by staff.',
    '2026-08-10T04:10:00+00:00'
  ),
  (
    '77777777-7777-4777-8777-777777777772',
    '44444444-4444-4444-8444-444444444444',
    'confirmed',
    'Order details confirmed.',
    '2026-08-10T06:20:00+00:00'
  ),
  (
    '77777777-7777-4777-8777-777777777773',
    '44444444-4444-4444-8444-444444444444',
    'preparing',
    'Items prepared for shipment.',
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
    'Manual order entered from chat.',
    '2026-08-23T05:00:00+00:00'
  ),
  (
    '88888888-8888-4888-8888-888888888882',
    '55555555-5555-4555-8555-555555555555',
    'cancelled',
    'Order cancelled before shipment.',
    '2026-08-23T08:30:00+00:00'
  )
on conflict (id) do nothing;
