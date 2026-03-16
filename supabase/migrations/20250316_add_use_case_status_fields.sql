-- Migration: Add is_active and is_poc columns to use_cases table
-- Date: 2026-03-16

-- Add is_active column (default true)
ALTER TABLE public.use_cases 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add is_poc column (default false)
ALTER TABLE public.use_cases 
ADD COLUMN IF NOT EXISTS is_poc BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.use_cases.is_active IS 'Indicates if the use case/product is currently active or obsolete';
COMMENT ON COLUMN public.use_cases.is_poc IS 'Indicates if this is a Proof of Concept (PoC) or production system';
