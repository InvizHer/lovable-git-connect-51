-- =====================================================
-- TellUs - Complete Database Setup Script
-- =====================================================
-- Anonymous Complaint Management System
-- This script sets up the entire database schema for TellUs
-- Run this in your Supabase SQL Editor to set up the database
-- =====================================================

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Profiles Table
-- Stores additional user information linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Complaint Boxes Table
-- Stores complaint boxes created by admins
CREATE TABLE IF NOT EXISTS public.complaint_boxes (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
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
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  box_id UUID NOT NULL,
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
CREATE TABLE IF NOT EXISTS public.feedbacks (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  box_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Analytics Table
-- Stores daily analytics data aggregated for complaint boxes
CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  box_id UUID NOT NULL,
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

-- Function to handle new user creation and create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    new.email
  );
  RETURN new;
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

-- Trigger for auto-creating user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Triggers for updating updated_at column
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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CREATE RLS POLICIES FOR PROFILES
-- =====================================================

-- Profiles: Users can view their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Profiles: Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Profiles: Users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- =====================================================
-- 7. CREATE RLS POLICIES FOR COMPLAINT BOXES
-- =====================================================

-- Complaint Boxes: Admins can view their own boxes
DROP POLICY IF EXISTS "Admins can view their own complaint boxes" ON public.complaint_boxes;
CREATE POLICY "Admins can view their own complaint boxes"
  ON public.complaint_boxes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = admin_id);

-- Complaint Boxes: Anyone can view by token (for submission page)
DROP POLICY IF EXISTS "Anyone can view complaint boxes by token" ON public.complaint_boxes;
CREATE POLICY "Anyone can view complaint boxes by token"
  ON public.complaint_boxes
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Complaint Boxes: Admins can insert their own boxes
DROP POLICY IF EXISTS "Admins can insert their own complaint boxes" ON public.complaint_boxes;
CREATE POLICY "Admins can insert their own complaint boxes"
  ON public.complaint_boxes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = admin_id);

-- Complaint Boxes: Admins can update their own boxes
DROP POLICY IF EXISTS "Admins can update their own complaint boxes" ON public.complaint_boxes;
CREATE POLICY "Admins can update their own complaint boxes"
  ON public.complaint_boxes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = admin_id);

-- Complaint Boxes: Admins can delete their own boxes
DROP POLICY IF EXISTS "Admins can delete their own complaint boxes" ON public.complaint_boxes;
CREATE POLICY "Admins can delete their own complaint boxes"
  ON public.complaint_boxes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = admin_id);

-- =====================================================
-- 8. CREATE RLS POLICIES FOR COMPLAINTS
-- =====================================================

-- Complaints: Admins can view complaints in their boxes
DROP POLICY IF EXISTS "Admins can view complaints in their boxes" ON public.complaints;
CREATE POLICY "Admins can view complaints in their boxes"
  ON public.complaints
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM complaint_boxes
      WHERE complaint_boxes.id = complaints.box_id
      AND complaint_boxes.admin_id = auth.uid()
    )
  );

-- Complaints: Anyone can view complaints by token (for tracking)
DROP POLICY IF EXISTS "Anyone can view complaints by token" ON public.complaints;
CREATE POLICY "Anyone can view complaints by token"
  ON public.complaints
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Complaints: Anyone can insert complaints (anonymous submission)
DROP POLICY IF EXISTS "Anyone can insert complaints" ON public.complaints;
CREATE POLICY "Anyone can insert complaints"
  ON public.complaints
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Complaints: Admins can update complaints in their boxes
DROP POLICY IF EXISTS "Admins can update complaints in their boxes" ON public.complaints;
CREATE POLICY "Admins can update complaints in their boxes"
  ON public.complaints
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM complaint_boxes
      WHERE complaint_boxes.id = complaints.box_id
      AND complaint_boxes.admin_id = auth.uid()
    )
  );

-- Complaints: Admins can delete complaints in their boxes
DROP POLICY IF EXISTS "Admins can delete complaints in their boxes" ON public.complaints;
CREATE POLICY "Admins can delete complaints in their boxes"
  ON public.complaints
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM complaint_boxes
      WHERE complaint_boxes.id = complaints.box_id
      AND complaint_boxes.admin_id = auth.uid()
    )
  );

-- =====================================================
-- 9. CREATE RLS POLICIES FOR FEEDBACKS
-- =====================================================

-- Anyone can view feedbacks
DROP POLICY IF EXISTS "Anyone can view feedbacks" ON public.feedbacks;
CREATE POLICY "Anyone can view feedbacks"
  ON public.feedbacks
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Anyone can insert feedbacks (anonymous feedback)
DROP POLICY IF EXISTS "Anyone can insert feedbacks" ON public.feedbacks;
CREATE POLICY "Anyone can insert feedbacks"
  ON public.feedbacks
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins can delete feedbacks in their boxes
DROP POLICY IF EXISTS "Admins can delete feedbacks in their boxes" ON public.feedbacks;
CREATE POLICY "Admins can delete feedbacks in their boxes"
  ON public.feedbacks
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM complaint_boxes
      WHERE complaint_boxes.id = feedbacks.box_id
      AND complaint_boxes.admin_id = auth.uid()
    )
  );

-- =====================================================
-- 10. CREATE RLS POLICIES FOR ANALYTICS
-- =====================================================

-- Admins can view analytics for their boxes
DROP POLICY IF EXISTS "Admins can view analytics for their boxes" ON public.analytics;
CREATE POLICY "Admins can view analytics for their boxes"
  ON public.analytics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM complaint_boxes
      WHERE complaint_boxes.id = analytics.box_id
      AND complaint_boxes.admin_id = auth.uid()
    )
  );

-- Admins can manage analytics for their boxes
DROP POLICY IF EXISTS "Admins can manage analytics for their boxes" ON public.analytics;
CREATE POLICY "Admins can manage analytics for their boxes"
  ON public.analytics
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM complaint_boxes
      WHERE complaint_boxes.id = analytics.box_id
      AND complaint_boxes.admin_id = auth.uid()
    )
  );

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

-- Storage: Admins can delete attachments from complaints in their boxes
DROP POLICY IF EXISTS "Admins can delete complaint attachments" ON storage.objects;
CREATE POLICY "Admins can delete complaint attachments"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'complaint-attachments'
    AND EXISTS (
      SELECT 1
      FROM complaints c
      JOIN complaint_boxes cb ON c.box_id = cb.id
      WHERE cb.admin_id = auth.uid()
      AND c.attachment_url LIKE '%' || storage.objects.name || '%'
    )
  );

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- Your TellUs database is now ready to use!
-- 
-- Next steps:
-- 1. Configure authentication settings in Supabase Dashboard:
--    - Go to Authentication > Providers
--    - Enable Email provider
--    - Enable "Confirm email" or disable it for testing
-- 
-- 2. Get your API credentials from Settings > API:
--    - Project URL
--    - anon/public key
--    - service_role key (keep this secret!)
-- 
-- 3. Add credentials to your .env file:
--    VITE_SUPABASE_URL=your-project-url
--    VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
-- 
-- 4. Start building your application!
-- =====================================================
