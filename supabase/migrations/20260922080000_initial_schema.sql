-- Initial schema for the Hive Inspect FDE template importer.
--
-- Deliberately minimal per CS-0085's correction: the assignment requires
-- faithful import, saved edits, and independent copies. It does not
-- require a per-field audit-history model, and the committed source
-- fixture + checksum + import_runs + the independent evaluator already
-- give strong evidence of original preservation. sections.name,
-- items.name, and comments.raw_text ARE the single editable value for
-- each; there is no separate immutable source_* column per field.

create extension if not exists "pgcrypto";

create table templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_file_name text not null,
  source_file_sha256 text not null,
  -- Nullable: only set when this template was produced by duplicating
  -- another one. Gives copy-lineage evidence without an audit system.
  copied_from_template_id uuid references templates(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table sections (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references templates(id) on delete cascade,
  name text not null,
  ordinal integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index sections_template_id_idx on sections(template_id);

create table items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references sections(id) on delete cascade,
  name text not null,
  ordinal integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index items_section_id_idx on items(section_id);

create table comments (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  name text not null,
  raw_text text,
  comment_type text,
  comment_type_raw text,
  category smallint check (category in (-1, 0, 1)),
  category_raw text,
  options text[],
  options_raw text,
  unit_options text[],
  unit_options_raw text,
  recommendation text,
  source_order_hint integer,
  answer_type text,
  answer_type_raw text,
  default_value text,
  default_value_2 text,
  default_unit_type text,
  default_location text,
  default_estimate_min numeric,
  default_estimate_min_raw text,
  default_estimate_max numeric,
  default_estimate_max_raw text,
  locked text,
  simple_format text,
  disable_photos text,
  uses_count integer,
  uses_count_raw text,
  default_photos jsonb not null default '[]'::jsonb,
  source_last_modified text,
  unmapped_source_fields jsonb not null default '{}'::jsonb,
  source_row_number integer not null,
  source_row_ordinal integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index comments_item_id_idx on comments(item_id);

create table import_runs (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references templates(id) on delete cascade,
  source_file_name text not null,
  source_file_sha256 text not null,
  outcome text not null check (outcome in ('SUCCESS', 'COMPLETED_WITH_ISSUES', 'FAILED')),
  source_row_count integer not null,
  imported_row_count integer not null,
  required_headers text[] not null,
  observed_headers text[] not null,
  created_at timestamptz not null default now()
);
create index import_runs_template_id_idx on import_runs(template_id);

create table import_warnings (
  id uuid primary key default gen_random_uuid(),
  import_run_id uuid not null references import_runs(id) on delete cascade,
  level text not null check (level in ('info', 'warning', 'error')),
  code text not null,
  message text not null,
  source_row_number integer,
  column_name text,
  created_at timestamptz not null default now()
);
create index import_warnings_import_run_id_idx on import_warnings(import_run_id);
