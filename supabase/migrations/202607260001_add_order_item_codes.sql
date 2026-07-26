alter table public.order_items
  add column if not exists product_code text null,
  add column if not exists variant_code text null;

comment on column public.order_items.product_code is
  'Snapshot of the product code when the order was placed.';

comment on column public.order_items.variant_code is
  'Snapshot of the selected variant code when the order was placed.';
