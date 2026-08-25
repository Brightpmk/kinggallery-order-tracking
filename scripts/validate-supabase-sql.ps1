$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")
$tempRoot = Join-Path $env:TEMP ("delivery-tracking-phase2-pg-" + [Guid]::NewGuid().ToString("N"))
$dataDir = Join-Path $tempRoot "data"
$logFile = Join-Path $tempRoot "postgres.log"
$databaseName = "delivery_tracking_phase2"
$port = "56543"

New-Item -ItemType Directory -Path $tempRoot | Out-Null

Write-Host "Initializing temporary PostgreSQL cluster..."
& initdb -D $dataDir -A trust --username postgres
Write-Host "Starting temporary PostgreSQL on port $port..."
& pg_ctl -w -t 15 -D $dataDir -o "-p $port -h 127.0.0.1" -l $logFile start

try {
  $env:PGHOST = "127.0.0.1"
  $env:PGPORT = $port
  $env:PGUSER = "postgres"
  $env:PGCONNECT_TIMEOUT = "5"

  Write-Host "Creating validation database..."
  & createdb $databaseName
  Write-Host "Creating Supabase-compatible roles..."
  & psql -d $databaseName -v ON_ERROR_STOP=1 -c "create role anon; create role authenticated;" | Out-Null
  Write-Host "Applying migration..."
  & psql -d $databaseName -v ON_ERROR_STOP=1 -f (Join-Path $projectRoot "supabase\migrations\20260825143000_create_order_tracking_schema.sql") | Out-Null
  Write-Host "Applying development seed data..."
  & psql -d $databaseName -v ON_ERROR_STOP=1 -f (Join-Path $projectRoot "supabase\seed.sql") | Out-Null

  Write-Host "Seed row counts:"
  & psql -d $databaseName -v ON_ERROR_STOP=1 -c "select 'orders' as table_name, count(*) from public.orders union all select 'order_items', count(*) from public.order_items union all select 'order_status_history', count(*) from public.order_status_history order by table_name;"
  Write-Host "RLS status:"
  & psql -d $databaseName -v ON_ERROR_STOP=1 -c "select relname, relrowsecurity from pg_class where relname in ('orders', 'order_items', 'order_status_history') order by relname;"
}
finally {
  & pg_ctl -D $dataDir stop
  Write-Host "Temporary database files left at $tempRoot"
}
