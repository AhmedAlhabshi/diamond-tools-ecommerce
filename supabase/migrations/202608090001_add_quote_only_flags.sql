alter table public.products
add column if not exists quote_only boolean not null default false;

alter table public.product_variants
add column if not exists quote_only boolean not null default false;