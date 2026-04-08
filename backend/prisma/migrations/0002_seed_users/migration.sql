-- Seed demo users with password 'EduPrime@2025'
INSERT INTO "User" (id, email, name, role, "passwordHash", "isActive", "createdAt", "updatedAt")
VALUES 
  ('clseedadmin0000000001', 'admin@eduprime.in', 'Admin User', 'ADMIN', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TqznefyfllZXyU8vC6LF3K8O9hKy', true, NOW(), NOW()),
  ('clseedsales0000000001', 'sales@eduprime.in', 'Sales Agent', 'SALES_AGENT', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TqznefyfllZXyU8vC6LF3K8O9hKy', true, NOW(), NOW()),
  ('clseedfinan0000000001', 'finance@eduprime.in', 'Finance User', 'FINANCE', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TqznefyfllZXyU8vC6LF3K8O9hKy', true, NOW(), NOW()),
  ('clseedstude0000000001', 'student@eduprime.in', 'Student User', 'STUDENT', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TqznefyfllZXyU8vC6LF3K8O9hKy', true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET 
  role = EXCLUDED.role,
  "passwordHash" = EXCLUDED."passwordHash",
  "updatedAt" = NOW();
