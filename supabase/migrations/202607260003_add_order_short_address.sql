alter table public.orders
  add column if not exists short_address text null;

alter table public.orders
  drop constraint if exists orders_short_address_format;

alter table public.orders
  add constraint orders_short_address_format
  check (
    short_address is null
    or short_address ~ '^[A-Z]{4}[0-9]{4}$'
  );
