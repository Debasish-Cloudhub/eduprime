-- Reset all users to ISCC emails and new passwords
-- This migration forcefully upserts all staff accounts

-- Delete old eduprime.in emails first
DELETE FROM "User" WHERE email IN ('admin@eduprime.in','sales@eduprime.in','finance@eduprime.in','student@eduprime.in');

-- Upsert ISCC staff accounts with new passwords
INSERT INTO "User" (id, email, name, role, "passwordHash", "isActive", "createdAt", "updatedAt")
VALUES
  ('isccadmin00000000000001', 'admin@iscc.in',   'ISCC Admin',       'ADMIN',       '$2b$12$fryk1zl7BRvErblnA6DwDe/5bmet5qlzc4aOMvK6BX77q2H1gzZmK', true, NOW(), NOW()),
  ('isccsales00000000000001', 'sales@iscc.in',   'Sales Counselor',  'SALES_AGENT', '$2b$12$z/0x/ZqVYXsIcfkgvPBZQupd8I6M8du2X4fJ4m9blHVL298SVJzsO', true, NOW(), NOW()),
  ('isccfinan00000000000001', 'finance@iscc.in', 'Finance Manager',  'FINANCE',     '$2b$12$fse9RMbs948oFoFkuJyGjOC1ppLSSx1u5HL4yLaHeu.SFSfyeJwTu', true, NOW(), NOW()),
  ('isccstude00000000000001', 'student@iscc.in', 'Demo Student',     'STUDENT',     '$2b$12$UJnMc4.rAwFeg4eGwjMTY.vEYMTzb6hI5WtAcXVkw/eBJH1ZafSge', true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
  name         = EXCLUDED.name,
  role         = EXCLUDED.role,
  "passwordHash" = EXCLUDED."passwordHash",
  "isActive"   = true,
  "updatedAt"  = NOW();

-- Also fix any existing records with old seed IDs
UPDATE "User" SET
  email = 'admin@iscc.in',
  name  = 'ISCC Admin',
  "passwordHash" = '$2b$12$fryk1zl7BRvErblnA6DwDe/5bmet5qlzc4aOMvK6BX77q2H1gzZmK',
  "isActive" = true,
  "updatedAt" = NOW()
WHERE id = 'clseedadmin0000000001';

UPDATE "User" SET
  email = 'sales@iscc.in',
  name  = 'Sales Counselor',
  "passwordHash" = '$2b$12$z/0x/ZqVYXsIcfkgvPBZQupd8I6M8du2X4fJ4m9blHVL298SVJzsO',
  "isActive" = true,
  "updatedAt" = NOW()
WHERE id = 'clseedsales0000000001';

UPDATE "User" SET
  email = 'finance@iscc.in',
  name  = 'Finance Manager',
  "passwordHash" = '$2b$12$fse9RMbs948oFoFkuJyGjOC1ppLSSx1u5HL4yLaHeu.SFSfyeJwTu',
  "isActive" = true,
  "updatedAt" = NOW()
WHERE id = 'clseedfinan0000000001';

UPDATE "User" SET
  email = 'student@iscc.in',
  name  = 'Demo Student',
  "passwordHash" = '$2b$12$UJnMc4.rAwFeg4eGwjMTY.vEYMTzb6hI5WtAcXVkw/eBJH1ZafSge',
  "isActive" = true,
  "updatedAt" = NOW()
WHERE id = 'clseedstude0000000001';
