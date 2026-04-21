-- Run this migration to add avatar support to users.
-- Execute once against your PostgreSQL database.
-- Also create a public "avatars" bucket in Supabase Storage.

ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
