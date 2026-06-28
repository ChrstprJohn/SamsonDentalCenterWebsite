-- Remove gender column from dependents table
ALTER TABLE dependents DROP COLUMN IF EXISTS gender;

-- We can drop the enum type if no other tables use it. Currently it is only used by dependents.
-- Let's check schema.sql to see if gender enum is used anywhere else. It doesn't look like it.
DROP TYPE IF EXISTS gender;
