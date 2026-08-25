# Supabase Database

This directory contains version-controlled database assets for the delivery
tracking application.

## Files

- `migrations/20260825143000_create_order_tracking_schema.sql` creates the
  initial order tracking schema, constraints, indexes, trigger, and RLS posture.
- `migrations/20260825153000_add_customer_lookup_columns.sql` adds generated
  lookup helpers and indexes for normalized full-name and phone searches.
- `migrations/20260825163000_add_jersey_order_details.sql` adds controlled
  jersey color/size values, delivery method, and per-jersey customization fields.
- `seed.sql` contains fictional development rows only. Run it intentionally in a
  local or disposable development database, not as part of production behavior.

## Access Model

Row Level Security is enabled on all order tables. The migration deliberately
does not create broad `anon` or `authenticated` policies. Future customer
tracking should use server-side application logic to validate the order code and
verification value before returning a narrow public response.

## Local Commands

When the Supabase CLI is configured for this project:

```bash
supabase db reset
```

That applies migrations and then runs `seed.sql` against the local development
database. Do not apply seed data to production.
