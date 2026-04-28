-- Update all staff emails from @iscc.in to @digitalstudy.me
-- Passwords remain the same (ISCC@Role2025!)

-- Upsert with new digitalstudy.me emails
INSERT INTO "User" (id, email, name, role, "passwordHash", "isActive", "createdAt", "updatedAt")
VALUES
  ('isccadmin00000000000001', 'admin@digitalstudy.me',   'ISCC Admin',      'ADMIN',       '$2b$12$flu.q6iRADrGS1HbVO6FPuxIsFYUWIgLcIbDp40GfMtHXBd1Vqnwe', true, NOW(), NOW()),
  ('isccsales00000000000001', 'sales@digitalstudy.me',   'Sales Counselor', 'SALES_AGENT', '$2b$12$q3WscJQkBz07EViwKS/lH.Qg6ZthddRP7K9h.9JlRcs6pdn2si/Si', true, NOW(), NOW()),
  ('isccfinan00000000000001', 'finance@digitalstudy.me', 'Finance Manager',  'FINANCE',     '$2b$12$7FVqL9DgFrdSNlLmL6eZ4.843npMCTE5PHiyFT5kGJIsbZuWslDrO', true, NOW(), NOW()),
  ('isccstude00000000000001', 'student@digitalstudy.me', 'Demo Student',     'STUDENT',     '$2b$12$OA8VIfBBbaOqzGOFSfu4YOEzYZ1X6hH4kFyQ5SCk7dPihAAvr53oS', true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
  "passwordHash" = EXCLUDED."passwordHash",
  "isActive"     = true,
  "updatedAt"    = NOW();

-- Remove old @iscc.in accounts
DELETE FROM "User" WHERE email IN (
  'admin@iscc.in', 'sales@iscc.in', 'finance@iscc.in', 'student@iscc.in'
);
