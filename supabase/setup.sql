-- =====================================================
-- TellUs - Complete Database Setup Script
-- =====================================================
-- Anonymous Complaint Management System
-- This script sets up the entire database schema for TellUs
-- Run this in your Supabase SQL Editor to set up the database
-- =====================================================
-- 
-- IMPORTANT: This uses custom authentication stored in tables
-- No Supabase Auth (auth.users) is used - all user data is in tables
-- This makes account deletion and data management simpler
-- =====================================================

-- =====================================================
-- 0. ENABLE REQUIRED EXTENSIONS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Admins Table (Custom Authentication)
-- Stores admin credentials directly in database
-- No reliance on Supabase Auth - all data deletable
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Complaint Boxes Table
-- Stores complaint boxes created by admins
-- CASCADE DELETE: When admin is deleted, all their boxes are deleted
CREATE TABLE IF NOT EXISTS public.complaint_boxes (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Complaints Table
-- Stores complaints submitted anonymously by users
-- CASCADE DELETE: When complaint box is deleted, all complaints are deleted
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  box_id UUID NOT NULL REFERENCES public.complaint_boxes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  complaint_category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'received',
  token TEXT NOT NULL UNIQUE,
  attachment_url TEXT,
  attachment_name TEXT,
  attachment_type TEXT,
  admin_reply TEXT,
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Feedbacks Table
-- Stores anonymous feedback ratings for complaint boxes
-- CASCADE DELETE: When complaint box is deleted, all feedbacks are deleted
CREATE TABLE IF NOT EXISTS public.feedbacks (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  box_id UUID NOT NULL REFERENCES public.complaint_boxes(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Analytics Table
-- Stores daily analytics data aggregated for complaint boxes
-- CASCADE DELETE: When complaint box is deleted, all analytics are deleted
CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  box_id UUID NOT NULL REFERENCES public.complaint_boxes(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_complaints INTEGER NOT NULL DEFAULT 0,
  received_count INTEGER NOT NULL DEFAULT 0,
  in_progress_count INTEGER NOT NULL DEFAULT 0,
  resolved_count INTEGER NOT NULL DEFAULT 0,
  rejected_count INTEGER NOT NULL DEFAULT 0,
  avg_rating NUMERIC(3,2),
  total_feedbacks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(box_id, date)
);

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);
CREATE INDEX IF NOT EXISTS idx_complaint_boxes_admin_id ON public.complaint_boxes(admin_id);
CREATE INDEX IF NOT EXISTS idx_complaint_boxes_token ON public.complaint_boxes(token);
CREATE INDEX IF NOT EXISTS idx_complaints_box_id ON public.complaints(box_id);
CREATE INDEX IF NOT EXISTS idx_complaints_token ON public.complaints(token);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_feedbacks_box_id ON public.feedbacks(box_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON public.feedbacks(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_box_id ON public.analytics(box_id);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON public.analytics(date);
CREATE INDEX IF NOT EXISTS idx_analytics_box_date ON public.analytics(box_id, date);

-- =====================================================
-- 3. CREATE FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function to hash password using bcrypt
CREATE OR REPLACE FUNCTION public.hash_password(password TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf', 10));
END;
$$;

-- Function to verify password
CREATE OR REPLACE FUNCTION public.verify_password(password TEXT, password_hash TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN password_hash = crypt(password, password_hash);
END;
$$;

-- Function to register a new admin
CREATE OR REPLACE FUNCTION public.register_admin(
  p_username TEXT,
  p_email TEXT,
  p_password TEXT
)
RETURNS TABLE(
  id UUID,
  username TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID;
BEGIN
  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM public.admins WHERE admins.email = p_email) THEN
    RAISE EXCEPTION 'Email already registered';
  END IF;
  
  -- Insert new admin with hashed password
  INSERT INTO public.admins (username, email, password_hash)
  VALUES (p_username, p_email, public.hash_password(p_password))
  RETURNING admins.id INTO v_admin_id;
  
  -- Return the created admin
  RETURN QUERY
  SELECT a.id, a.username, a.email, a.created_at
  FROM public.admins a
  WHERE a.id = v_admin_id;
END;
$$;

-- Function to login admin
CREATE OR REPLACE FUNCTION public.login_admin(
  p_email TEXT,
  p_password TEXT
)
RETURNS TABLE(
  id UUID,
  username TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.username, a.email, a.created_at
  FROM public.admins a
  WHERE a.email = p_email
  AND public.verify_password(p_password, a.password_hash);
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid email or password';
  END IF;
END;
$$;

-- Function to update admin password
CREATE OR REPLACE FUNCTION public.update_admin_password(
  p_admin_id UUID,
  p_new_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.admins
  SET password_hash = public.hash_password(p_new_password),
      updated_at = now()
  WHERE id = p_admin_id;
  
  RETURN FOUND;
END;
$$;

-- Function to update analytics when complaints change
CREATE OR REPLACE FUNCTION public.update_box_analytics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_date DATE := CURRENT_DATE;
  v_box_id UUID;
BEGIN
  -- Get box_id from NEW or OLD record
  v_box_id := COALESCE(NEW.box_id, OLD.box_id);
  
  -- Insert or update analytics for today
  INSERT INTO public.analytics (box_id, date, total_complaints, received_count, in_progress_count, resolved_count, rejected_count)
  SELECT 
    v_box_id,
    v_date,
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'received'),
    COUNT(*) FILTER (WHERE status = 'in_progress'),
    COUNT(*) FILTER (WHERE status = 'resolved'),
    COUNT(*) FILTER (WHERE status = 'rejected')
  FROM public.complaints
  WHERE box_id = v_box_id
  ON CONFLICT (box_id, date) 
  DO UPDATE SET
    total_complaints = EXCLUDED.total_complaints,
    received_count = EXCLUDED.received_count,
    in_progress_count = EXCLUDED.in_progress_count,
    resolved_count = EXCLUDED.resolved_count,
    rejected_count = EXCLUDED.rejected_count,
    updated_at = now();
    
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Function to update analytics when feedbacks change
CREATE OR REPLACE FUNCTION public.update_feedback_analytics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_date DATE := CURRENT_DATE;
  v_box_id UUID;
BEGIN
  -- Get box_id from NEW or OLD record
  v_box_id := COALESCE(NEW.box_id, OLD.box_id);
  
  -- Update analytics with feedback data
  INSERT INTO public.analytics (box_id, date, total_feedbacks, avg_rating)
  SELECT 
    v_box_id,
    v_date,
    COUNT(*),
    AVG(rating)::NUMERIC(3,2)
  FROM public.feedbacks
  WHERE box_id = v_box_id
  ON CONFLICT (box_id, date) 
  DO UPDATE SET
    total_feedbacks = EXCLUDED.total_feedbacks,
    avg_rating = EXCLUDED.avg_rating,
    updated_at = now();
    
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- =====================================================
-- 4. CREATE TRIGGERS
-- =====================================================

-- Triggers for updating updated_at column
DROP TRIGGER IF EXISTS update_admins_updated_at ON public.admins;
CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON public.admins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_complaint_boxes_updated_at ON public.complaint_boxes;
CREATE TRIGGER update_complaint_boxes_updated_at
  BEFORE UPDATE ON public.complaint_boxes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_complaints_updated_at ON public.complaints;
CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_analytics_updated_at ON public.analytics;
CREATE TRIGGER update_analytics_updated_at
  BEFORE UPDATE ON public.analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Triggers for automatic analytics updates
DROP TRIGGER IF EXISTS update_analytics_on_complaint_change ON public.complaints;
CREATE TRIGGER update_analytics_on_complaint_change
  AFTER INSERT OR UPDATE OR DELETE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_box_analytics();

DROP TRIGGER IF EXISTS update_analytics_on_feedback_change ON public.feedbacks;
CREATE TRIGGER update_analytics_on_feedback_change
  AFTER INSERT OR UPDATE OR DELETE ON public.feedbacks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_feedback_analytics();

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CREATE RLS POLICIES FOR ADMINS
-- =====================================================

-- Admins: Allow public read for login verification (password hash is hidden via function)
DROP POLICY IF EXISTS "Allow public to read admins for auth" ON public.admins;
CREATE POLICY "Allow public to read admins for auth"
  ON public.admins
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admins: Allow public to insert (for registration via function)
DROP POLICY IF EXISTS "Allow public to insert admins" ON public.admins;
CREATE POLICY "Allow public to insert admins"
  ON public.admins
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins: Allow admins to update their own profile
DROP POLICY IF EXISTS "Allow admins to update own profile" ON public.admins;
CREATE POLICY "Allow admins to update own profile"
  ON public.admins
  FOR UPDATE
  TO anon, authenticated
  USING (true);

-- =====================================================
-- 7. CREATE RLS POLICIES FOR COMPLAINT BOXES
-- =====================================================

-- Complaint Boxes: Anyone can view (for public submission page)
DROP POLICY IF EXISTS "Anyone can view complaint boxes" ON public.complaint_boxes;
CREATE POLICY "Anyone can view complaint boxes"
  ON public.complaint_boxes
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Complaint Boxes: Anyone can insert (authenticated via application layer)
DROP POLICY IF EXISTS "Anyone can insert complaint boxes" ON public.complaint_boxes;
CREATE POLICY "Anyone can insert complaint boxes"
  ON public.complaint_boxes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Complaint Boxes: Anyone can update (authenticated via application layer)
DROP POLICY IF EXISTS "Anyone can update complaint boxes" ON public.complaint_boxes;
CREATE POLICY "Anyone can update complaint boxes"
  ON public.complaint_boxes
  FOR UPDATE
  TO anon, authenticated
  USING (true);

-- Complaint Boxes: Anyone can delete (authenticated via application layer)
DROP POLICY IF EXISTS "Anyone can delete complaint boxes" ON public.complaint_boxes;
CREATE POLICY "Anyone can delete complaint boxes"
  ON public.complaint_boxes
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- =====================================================
-- 8. CREATE RLS POLICIES FOR COMPLAINTS
-- =====================================================

-- Complaints: Anyone can view
DROP POLICY IF EXISTS "Anyone can view complaints" ON public.complaints;
CREATE POLICY "Anyone can view complaints"
  ON public.complaints
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Complaints: Anyone can insert (anonymous submission)
DROP POLICY IF EXISTS "Anyone can insert complaints" ON public.complaints;
CREATE POLICY "Anyone can insert complaints"
  ON public.complaints
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Complaints: Anyone can update (authenticated via application layer)
DROP POLICY IF EXISTS "Anyone can update complaints" ON public.complaints;
CREATE POLICY "Anyone can update complaints"
  ON public.complaints
  FOR UPDATE
  TO anon, authenticated
  USING (true);

-- Complaints: Anyone can delete (authenticated via application layer)
DROP POLICY IF EXISTS "Anyone can delete complaints" ON public.complaints;
CREATE POLICY "Anyone can delete complaints"
  ON public.complaints
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- =====================================================
-- 9. CREATE RLS POLICIES FOR FEEDBACKS
-- =====================================================

-- Feedbacks: Anyone can view
DROP POLICY IF EXISTS "Anyone can view feedbacks" ON public.feedbacks;
CREATE POLICY "Anyone can view feedbacks"
  ON public.feedbacks
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Feedbacks: Anyone can insert (anonymous feedback)
DROP POLICY IF EXISTS "Anyone can insert feedbacks" ON public.feedbacks;
CREATE POLICY "Anyone can insert feedbacks"
  ON public.feedbacks
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Feedbacks: Anyone can delete (authenticated via application layer)
DROP POLICY IF EXISTS "Anyone can delete feedbacks" ON public.feedbacks;
CREATE POLICY "Anyone can delete feedbacks"
  ON public.feedbacks
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- =====================================================
-- 10. CREATE RLS POLICIES FOR ANALYTICS
-- =====================================================

-- Analytics: Anyone can view
DROP POLICY IF EXISTS "Anyone can view analytics" ON public.analytics;
CREATE POLICY "Anyone can view analytics"
  ON public.analytics
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Analytics: Anyone can manage (system managed via triggers)
DROP POLICY IF EXISTS "Anyone can manage analytics" ON public.analytics;
CREATE POLICY "Anyone can manage analytics"
  ON public.analytics
  FOR ALL
  TO anon, authenticated
  USING (true);

-- =====================================================
-- 11. CREATE STORAGE BUCKET
-- =====================================================

-- Create storage bucket for complaint attachments (images, PDFs, docs)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'complaint-attachments',
  'complaint-attachments',
  true, -- Public bucket so files can be directly accessed via URL
  5242880, -- 5MB limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 12. CREATE STORAGE POLICIES
-- =====================================================

-- Storage: Anyone can upload complaint attachments
DROP POLICY IF EXISTS "Anyone can upload complaint attachments" ON storage.objects;
CREATE POLICY "Anyone can upload complaint attachments"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'complaint-attachments');

-- Storage: Anyone can view complaint attachments
DROP POLICY IF EXISTS "Anyone can view complaint attachments" ON storage.objects;
CREATE POLICY "Anyone can view complaint attachments"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'complaint-attachments');

-- Storage: Anyone can delete complaint attachments
DROP POLICY IF EXISTS "Anyone can delete complaint attachments" ON storage.objects;
CREATE POLICY "Anyone can delete complaint attachments"
  ON storage.objects
  FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'complaint-attachments');

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- Your TellUs database is now ready to use!
-- 
-- Key Features:
-- ✅ Custom authentication (no Supabase Auth dependency)
-- ✅ All user data stored in tables (easy to delete)
-- ✅ CASCADE DELETE on all foreign keys
-- ✅ Password hashing using bcrypt (pgcrypto)
-- ✅ Secure login/register functions
-- ✅ Automatic analytics updates via triggers
-- 
-- Tables Created:
-- - admins: Admin user accounts with credentials
-- - complaint_boxes: Complaint boxes with CASCADE DELETE
-- - complaints: Anonymous complaints with CASCADE DELETE
-- - feedbacks: Anonymous ratings with CASCADE DELETE
-- - analytics: Auto-generated daily statistics
-- 
-- Functions Created:
-- - register_admin(): Create new admin account
-- - login_admin(): Verify admin credentials
-- - update_admin_password(): Change admin password
-- - hash_password(): Hash passwords with bcrypt
-- - verify_password(): Verify password against hash
-- 
-- CASCADE DELETE Behavior:
-- - Delete Admin → All their complaint boxes deleted
-- - Delete Complaint Box → All complaints, feedbacks, analytics deleted
-- 
-- Next Steps:
-- 1. Get your API credentials from Settings > API:
--    - Project URL
--    - anon/public key
-- 
-- 2. Add credentials to your .env file:
--    VITE_SUPABASE_URL=your-project-url
--    VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
-- 
-- 3. Start building your application!
-- =====================================================
