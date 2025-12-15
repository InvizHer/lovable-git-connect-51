-- =====================================================
-- TellUs - Complete Database Setup Script
-- =====================================================
-- Anonymous Complaint Management System
-- Run this ENTIRE script in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 0: EXTENSIONS
-- =====================================================

-- Needed for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- STEP 1: DROP EXISTING OBJECTS (Clean Setup)
-- =====================================================

-- Drop policies first (if tables exist)
DO $$ 
BEGIN
  -- Profiles policies
  DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Anyone can check profile existence" ON public.profiles;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ 
BEGIN
  -- Complaint boxes policies
  DROP POLICY IF EXISTS "Admins can view their own complaint boxes" ON public.complaint_boxes;
  DROP POLICY IF EXISTS "Anyone can view complaint boxes by token" ON public.complaint_boxes;
  DROP POLICY IF EXISTS "Admins can insert their own complaint boxes" ON public.complaint_boxes;
  DROP POLICY IF EXISTS "Admins can update their own complaint boxes" ON public.complaint_boxes;
  DROP POLICY IF EXISTS "Admins can delete their own complaint boxes" ON public.complaint_boxes;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ 
BEGIN
  -- Complaints policies
  DROP POLICY IF EXISTS "Admins can view complaints in their boxes" ON public.complaints;
  DROP POLICY IF EXISTS "Anyone can view complaints by token" ON public.complaints;
  DROP POLICY IF EXISTS "Anyone can insert complaints" ON public.complaints;
  DROP POLICY IF EXISTS "Admins can update complaints in their boxes" ON public.complaints;
  DROP POLICY IF EXISTS "Admins can delete complaints in their boxes" ON public.complaints;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ 
BEGIN
  -- Feedbacks policies
  DROP POLICY IF EXISTS "Anyone can view feedbacks" ON public.feedbacks;
  DROP POLICY IF EXISTS "Anyone can insert feedbacks" ON public.feedbacks;
  DROP POLICY IF EXISTS "Admins can delete feedbacks in their boxes" ON public.feedbacks;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ 
BEGIN
  -- Analytics policies
  DROP POLICY IF EXISTS "Admins can view analytics for their boxes" ON public.analytics;
  DROP POLICY IF EXISTS "Admins can manage analytics for their boxes" ON public.analytics;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Drop triggers (with error handling)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_complaint_boxes_updated_at ON public.complaint_boxes;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_complaints_updated_at ON public.complaints;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_analytics_updated_at ON public.analytics;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_analytics_on_complaint_change ON public.complaints;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DO $$ BEGIN
  DROP TRIGGER IF EXISTS update_analytics_on_feedback_change ON public.feedbacks;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Drop functions
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_box_analytics() CASCADE;
DROP FUNCTION IF EXISTS public.update_feedback_analytics() CASCADE;
DROP FUNCTION IF EXISTS public.check_user_exists(UUID) CASCADE;

-- Drop tables (CASCADE handles dependencies)
DROP TABLE IF EXISTS public.analytics CASCADE;
DROP TABLE IF EXISTS public.feedbacks CASCADE;
DROP TABLE IF EXISTS public.complaints CASCADE;
DROP TABLE IF EXISTS public.complaint_boxes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- =====================================================
-- STEP 2: CREATE TABLES
-- =====================================================

-- Profiles Table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Complaint Boxes Table
CREATE TABLE public.complaint_boxes (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Complaints Table (CASCADE DELETE when box is deleted)
CREATE TABLE public.complaints (
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

-- Feedbacks Table (CASCADE DELETE when box is deleted)
CREATE TABLE public.feedbacks (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  box_id UUID NOT NULL REFERENCES public.complaint_boxes(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Analytics Table (CASCADE DELETE when box is deleted)
CREATE TABLE public.analytics (
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
-- STEP 3: CREATE INDEXES
-- =====================================================

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_complaint_boxes_admin_id ON public.complaint_boxes(admin_id);
CREATE INDEX idx_complaint_boxes_token ON public.complaint_boxes(token);
CREATE INDEX idx_complaints_box_id ON public.complaints(box_id);
CREATE INDEX idx_complaints_token ON public.complaints(token);
CREATE INDEX idx_complaints_status ON public.complaints(status);
CREATE INDEX idx_feedbacks_box_id ON public.feedbacks(box_id);
CREATE INDEX idx_feedbacks_created_at ON public.feedbacks(created_at);
CREATE INDEX idx_analytics_box_id ON public.analytics(box_id);
CREATE INDEX idx_analytics_date ON public.analytics(date);
CREATE INDEX idx_analytics_box_date ON public.analytics(box_id, date);

-- =====================================================
-- STEP 4: CREATE FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
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

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Function to check if user profile exists (for login verification)
CREATE OR REPLACE FUNCTION public.check_user_exists(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = user_id
  );
$$;

-- Function to update analytics on complaint changes
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
  v_box_id := COALESCE(NEW.box_id, OLD.box_id);

  -- If the parent complaint box is being deleted (cascade), skip analytics updates
  IF v_box_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.complaint_boxes WHERE id = v_box_id
  ) THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

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

-- Function to update analytics on feedback changes
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
  v_box_id := COALESCE(NEW.box_id, OLD.box_id);

  -- If the parent complaint box is being deleted (cascade), skip analytics updates
  IF v_box_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.complaint_boxes WHERE id = v_box_id
  ) THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

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
-- STEP 5: CREATE TRIGGERS
-- =====================================================

-- Auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-update timestamps
CREATE TRIGGER update_complaint_boxes_updated_at
  BEFORE UPDATE ON public.complaint_boxes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_analytics_updated_at
  BEFORE UPDATE ON public.analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-update analytics
CREATE TRIGGER update_analytics_on_complaint_change
  AFTER INSERT OR UPDATE OR DELETE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_box_analytics();

CREATE TRIGGER update_analytics_on_feedback_change
  AFTER INSERT OR UPDATE OR DELETE ON public.feedbacks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_feedback_analytics();

-- =====================================================
-- STEP 6: ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 7: CREATE RLS POLICIES - PROFILES
-- =====================================================

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Allow checking if profile exists (for login verification)
CREATE POLICY "Anyone can check profile existence"
  ON public.profiles FOR SELECT TO anon, authenticated
  USING (true);

-- =====================================================
-- STEP 8: CREATE RLS POLICIES - COMPLAINT BOXES
-- =====================================================

CREATE POLICY "Admins can view their own complaint boxes"
  ON public.complaint_boxes FOR SELECT TO authenticated
  USING (auth.uid() = admin_id);

CREATE POLICY "Anyone can view complaint boxes by token"
  ON public.complaint_boxes FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert their own complaint boxes"
  ON public.complaint_boxes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = admin_id);

CREATE POLICY "Admins can update their own complaint boxes"
  ON public.complaint_boxes FOR UPDATE TO authenticated
  USING (auth.uid() = admin_id);

CREATE POLICY "Admins can delete their own complaint boxes"
  ON public.complaint_boxes FOR DELETE TO authenticated
  USING (auth.uid() = admin_id);

-- =====================================================
-- STEP 9: CREATE RLS POLICIES - COMPLAINTS
-- =====================================================

CREATE POLICY "Admins can view complaints in their boxes"
  ON public.complaints FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.complaint_boxes
      WHERE public.complaint_boxes.id = complaints.box_id
      AND public.complaint_boxes.admin_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view complaints by token"
  ON public.complaints FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert complaints"
  ON public.complaints FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update complaints in their boxes"
  ON public.complaints FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.complaint_boxes
      WHERE public.complaint_boxes.id = complaints.box_id
      AND public.complaint_boxes.admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete complaints in their boxes"
  ON public.complaints FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.complaint_boxes
      WHERE public.complaint_boxes.id = complaints.box_id
      AND public.complaint_boxes.admin_id = auth.uid()
    )
  );

-- =====================================================
-- STEP 10: CREATE RLS POLICIES - FEEDBACKS
-- =====================================================

CREATE POLICY "Anyone can view feedbacks"
  ON public.feedbacks FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert feedbacks"
  ON public.feedbacks FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can delete feedbacks in their boxes"
  ON public.feedbacks FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.complaint_boxes
      WHERE public.complaint_boxes.id = feedbacks.box_id
      AND public.complaint_boxes.admin_id = auth.uid()
    )
  );

-- =====================================================
-- STEP 11: CREATE RLS POLICIES - ANALYTICS
-- =====================================================

CREATE POLICY "Admins can view analytics for their boxes"
  ON public.analytics FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.complaint_boxes
      WHERE public.complaint_boxes.id = analytics.box_id
      AND public.complaint_boxes.admin_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage analytics for their boxes"
  ON public.analytics FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.complaint_boxes
      WHERE public.complaint_boxes.id = analytics.box_id
      AND public.complaint_boxes.admin_id = auth.uid()
    )
  );

-- =====================================================
-- STEP 12: CREATE STORAGE BUCKET
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'complaint-attachments',
  'complaint-attachments',
  true,
  5242880,
  ARRAY[
    'image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 13: CREATE STORAGE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Anyone can upload complaint attachments" ON storage.objects;
CREATE POLICY "Anyone can upload complaint attachments"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'complaint-attachments');

DROP POLICY IF EXISTS "Anyone can view complaint attachments" ON storage.objects;
CREATE POLICY "Anyone can view complaint attachments"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'complaint-attachments');

DROP POLICY IF EXISTS "Admins can delete complaint attachments" ON storage.objects;
CREATE POLICY "Admins can delete complaint attachments"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'complaint-attachments'
    AND EXISTS (
      SELECT 1 FROM public.complaints c
      JOIN public.complaint_boxes cb ON c.box_id = cb.id
      WHERE cb.admin_id = auth.uid()
      AND c.attachment_url LIKE '%' || storage.objects.name || '%'
    )
  );

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- 
-- CASCADE DELETE BEHAVIOR:
-- When a complaint box is deleted, the following are
-- automatically deleted due to ON DELETE CASCADE:
--   - All complaints in that box
--   - All feedbacks for that box
--   - All analytics data for that box
--
-- AUTHENTICATION NOTES:
-- - The handle_new_user trigger creates a profile when
--   a user signs up via Supabase Auth
-- - The check_user_exists function verifies if a user
--   has a profile in the database
--
-- NEXT STEPS:
-- 1. Go to Authentication > Providers, enable Email
-- 2. Optionally disable "Confirm email" for testing
-- 3. Get API credentials from Settings > API
-- 4. Add to .env: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY
-- =====================================================
