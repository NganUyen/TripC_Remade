-- Quick test to verify Supabase connection
-- Run this in Supabase SQL Editor first to test

SELECT NOW() as current_time, 
       current_database() as database_name,
       version() as postgres_version;
