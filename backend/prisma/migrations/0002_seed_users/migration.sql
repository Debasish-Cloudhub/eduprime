-- ISCC seed users (updated passwords)
INSERT INTO "User" (id, email, name, role, "passwordHash", "isActive", "createdAt", "updatedAt")
VALUES 
  ('clseedadmin0000000001', 'admin@iscc.in', 'ISCC Admin', 'ADMIN', '$2b$12$sEUeb.K5pHSIxfBTUP9hGODdxbPsLdIchc8YYSRdIfw6NSyfff.YC', true, NOW(), NOW()),
  ('clseedsales0000000001', 'sales@iscc.in', 'Sales Counselor', 'SALES_AGENT', '$2b$12$mXhcjyGfubgpm9JGweExee9x2Yrjb6eIsKi13PT0l4W3JeN1rq3uu', true, NOW(), NOW()),
  ('clseedfinan0000000001', 'finance@iscc.in', 'Finance Manager', 'FINANCE', '$2b$12$gvPcO65fW4snxT.aqaA3WuXpONMWxe/U6kKxBaXfuX0ABDH2vHr6C', true, NOW(), NOW()),
  ('clseedstude0000000001', 'student@iscc.in', 'Demo Student', 'STUDENT', '$2b$12$twyykH.SVXYtGAc0MWAxm.LUBTmuwPjKIby7vCEa8sHn4ebcbAOnW', true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET 
  role = EXCLUDED.role,
  "passwordHash" = EXCLUDED."passwordHash",
  "updatedAt" = NOW();

-- Also update old eduprime.in emails if they exist
UPDATE "User" SET email = 'admin@iscc.in', "passwordHash" = '$2b$12$sEUeb.K5pHSIxfBTUP9hGODdxbPsLdIchc8YYSRdIfw6NSyfff.YC' WHERE email = 'admin@eduprime.in' AND id != 'clseedadmin0000000001';
UPDATE "User" SET email = 'sales@iscc.in',   "passwordHash" = '$2b$12$mXhcjyGfubgpm9JGweExee9x2Yrjb6eIsKi13PT0l4W3JeN1rq3uu' WHERE email = 'sales@eduprime.in';
UPDATE "User" SET email = 'finance@iscc.in', "passwordHash" = '$2b$12$gvPcO65fW4snxT.aqaA3WuXpONMWxe/U6kKxBaXfuX0ABDH2vHr6C' WHERE email = 'finance@eduprime.in';
UPDATE "User" SET email = 'student@iscc.in', "passwordHash" = '$2b$12$twyykH.SVXYtGAc0MWAxm.LUBTmuwPjKIby7vCEa8sHn4ebcbAOnW' WHERE email = 'student@eduprime.in';
