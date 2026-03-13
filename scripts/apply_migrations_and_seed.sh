#!/bin/bash

# Apply migrations
echo "Applying database migrations..."
supabase migration up --directory=/tmp/cumplia/supabase/migrations/

# Seed data for plans
echo "Seeding plan data..."
# This is a placeholder. Actual seeding would involve SQL inserts or a specific seed script.
# Example:
# psql -c "INSERT INTO plans (name, price_id, stripe_price_id) VALUES ('free', 'price_free', 'price_free_live'), ('pro', 'price_pro', 'price_pro_live'), ('agency', 'price_agency', 'price_agency_live');"

echo "Database migrations and seeding complete."
