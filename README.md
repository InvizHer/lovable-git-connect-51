# TellUs - Anonymous Digital Complaint Box System

![TellUs Logo](https://img.shields.io/badge/TellUs-Complaint%20Management-blue)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📖 Table of Contents

- [Project Overview](#-project-overview)
- [Inspiration & Concept](#-inspiration--concept)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Database Schema](#-database-schema)
- [Project Structure](#-project-structure)
- [Design System](#-design-system)
- [Installation & Setup](#-installation--setup)
- [Configuration](#️-configuration)
- [Deployment](#-deployment)
- [User Guide](#-user-guide)
- [Admin Guide](#-admin-guide)
- [Security Features](#-security-features)
- [Performance Optimization](#-performance-optimization)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Project Overview

**TellUs** is a modern, secure, and user-friendly digital complaint box system designed for educational institutions, organizations, and communities. It transforms the traditional physical complaint box concept into a powerful web-based platform that enables anonymous complaint submission while providing administrators with comprehensive tools to manage, track, respond to, and analyze complaints efficiently.

### Project Motivation

This project addresses the limitations of traditional physical complaint boxes by providing:
- **Accessibility**: Submit complaints anytime, anywhere
- **Traceability**: Track complaint status without revealing identity
- **Efficiency**: Automated organization and analytics
- **Transparency**: Real-time status updates and admin responses
- **Security**: Robust data protection and privacy measures

### Use Cases

- **Educational Institutions**: Student grievances, faculty feedback, campus issues
- **Corporate Organizations**: Employee concerns, workplace issues, HR complaints
- **Government Offices**: Citizen complaints, public service feedback
- **Healthcare Facilities**: Patient concerns, service quality feedback
- **Community Organizations**: Member feedback, community issues

---

## 💡 Inspiration & Concept

### The Physical Complaint Box Legacy

In schools, colleges, and many organizations, physical complaint boxes have been a cornerstone of anonymous feedback collection for decades. These boxes, typically mounted on walls, allowed individuals to:
- Submit written complaints anonymously on paper
- Voice concerns without fear of identification
- Report issues in a confidential manner

### The Digital Transformation

**TellUs** digitizes this trusted concept while addressing its limitations:

#### Problems with Physical Complaint Boxes:
1. ❌ **Limited Accessibility**: Only available at specific physical locations
2. ❌ **No Tracking**: No way to track status or receive updates
3. ❌ **Manual Processing**: Time-consuming to collect, read, and organize
4. ❌ **No Analytics**: Difficult to identify trends or patterns
5. ❌ **Response Limitations**: No direct communication channel with complainants
6. ❌ **Lost Submissions**: Papers can be lost or damaged
7. ❌ **Limited Evidence**: Difficult to attach supporting documents/images

#### TellUs Solutions:
1. ✅ **24/7 Accessibility**: Submit from anywhere, anytime
2. ✅ **Real-time Tracking**: Unique tokens to monitor complaint status
3. ✅ **Automated Management**: Digital organization and categorization
4. ✅ **Comprehensive Analytics**: Visual dashboards and insights
5. ✅ **Two-way Communication**: Admin replies visible to complainants
6. ✅ **Secure Storage**: Cloud-based permanent storage
7. ✅ **File Attachments**: Support for images, PDFs, and documents

---

## ✨ Key Features

### For Complainants (Users)

#### Anonymous Submission
- **Zero Registration**: No account creation or email required
- **Complete Anonymity**: No personal information collected
- **Password Protection**: Optional password-protected complaint boxes
- **Secure Submission**: End-to-end secure data transmission

#### Complaint Management
- **Rich Text Input**: Title and detailed message fields
- **File Attachments**: Upload images, PDFs, DOC/DOCX files (up to 5MB)
- **Image Preview**: Preview images before submission
- **Unique Tracking Token**: Receive a CPL-XXXXXXXX format token instantly

#### Status Tracking
- **Real-time Updates**: Track complaint status changes
- **Status Categories**:
  - 🔵 **Received**: Complaint successfully submitted
  - 🟡 **Under Review**: Admin is reviewing the complaint
  - 🟢 **Solved**: Complaint has been resolved
- **Admin Responses**: View replies from administrators
- **Browser History**: Access previously submitted complaints
- **Search by Token**: Quick lookup using tracking token

#### Feedback System
- **Rate Boxes**: Provide 1-5 star ratings for complaint boxes
- **Written Feedback**: Optional feedback messages
- **Public Ratings**: View average ratings and feedback from other users

#### User Experience
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Dark/Light Mode**: Toggle between themes
- **Modern UI**: Clean, intuitive interface with animations
- **Instant Notifications**: Toast notifications for all actions
- **Accessibility**: WCAG 2.1 compliant design

### For Administrators

#### Authentication & Security
- **Secure Login**: Email/password authentication via Supabase
- **Session Management**: Persistent sessions with auto-refresh tokens
- **Profile Management**: Update username, email, password
- **Account Deletion**: Secure account removal with cascade delete

#### Complaint Box Management
- **Create Unlimited Boxes**: No limit on complaint boxes
- **Custom Titles & Descriptions**: Personalize each box
- **Password Protection**: Optional access control
- **Edit Box Details**: Update title and description anytime
- **Unique Shareable Links**: Auto-generated public URLs
- **Copy Link Functionality**: One-click link copying

#### Complaint Management
- **Centralized Dashboard**: View all boxes and statistics
- **Advanced Search**: Search by title, message, or token
- **Status Filtering**: Filter by received/under_review/solved
- **Sorting Options**: Sort by newest or oldest
- **Bulk Operations**: Manage multiple complaints efficiently
- **Status Updates**: Change complaint status with one click
- **Reply System**: Send responses to complainants
- **View Details**: Full complaint details with attachments
- **Delete Complaints**: Remove inappropriate submissions
- **File Management**: View and download all file types

#### Analytics & Insights
- **Visual Dashboards**: Interactive charts and graphs using Recharts
- **Time Range Selection**: Week, month, quarter, year views
- **Key Metrics**:
  - Total complaints received
  - Average box ratings
  - Total feedbacks received
  - Resolution rate percentage
- **Trend Analysis**: Line charts showing complaints over time
- **Status Distribution**: Pie charts for complaint categories
- **Rating Trends**: Track rating changes over time
- **Export Data**: Download analytics for reporting

#### User Interface
- **Modern Dashboard**: Professional admin panel
- **Statistics Cards**: Key metrics at a glance
- **Scroll-aware Header**: Auto-hide/show on scroll
- **Smooth Animations**: Framer Motion transitions
- **Loading States**: Skeleton screens for better UX
- **Error Handling**: Comprehensive error messages

---

## 🛠 Technology Stack

### Frontend Technologies

#### Core Framework
- **React 18.3.1**: Modern UI library with hooks and concurrent features
- **TypeScript 5.0**: Type-safe development with enhanced IDE support
- **Vite**: Lightning-fast build tool and dev server with HMR

#### UI Libraries & Components
- **Tailwind CSS 3.x**: Utility-first CSS framework for rapid styling
- **shadcn/ui**: High-quality, accessible component library built on Radix UI
- **Radix UI Primitives**: Unstyled, accessible components (40+ components)
- **Lucide React**: Beautiful, consistent icon library (1000+ icons)
- **Framer Motion 12.x**: Production-ready animation library

#### State Management & Data Fetching
- **TanStack Query 5.83.0**: Powerful async state management with caching
- **React Router DOM 6.30.1**: Declarative client-side routing
- **React Hook Form 7.x**: Performant forms with easy validation
- **Zod 3.x**: TypeScript-first schema validation

#### Visualization & UI Enhancements
- **Recharts 2.15.4**: Composable charting library for analytics
- **date-fns 3.6.0**: Modern date utility library
- **Sonner**: Beautiful toast notifications
- **next-themes**: Dark mode support with system preference detection

### Backend Infrastructure (Supabase)

TellUs uses **Supabase** as its complete backend solution. All database operations, authentication, storage, and serverless functions are powered by your own Supabase project.

#### Database & Authentication
- **PostgreSQL 15**: Robust relational database
- **Supabase Auth**: Built-in authentication with JWT tokens
- **Storage**: File storage with access controls (complaint-attachments bucket)
- **Edge Functions**: Deno-based serverless functions
- **Realtime**: WebSocket-based real-time subscriptions (optional)

#### Security Features
- **Row-Level Security (RLS)**: Database-level access control on all tables
- **JWT Tokens**: Secure authentication tokens
- **Bcrypt Hashing**: Secure password storage (via Supabase Auth)
- **HTTPS**: Encrypted data transmission
- **CORS**: Proper cross-origin configuration for edge functions

### Development Tools

#### Code Quality
- **ESLint**: JavaScript/TypeScript linting with React rules
- **TypeScript Compiler**: Type checking and compilation
- **PostCSS**: CSS processing and optimization
- **Autoprefixer**: Automatic CSS vendor prefixing

#### Build & Deployment
- **Vite**: Production bundling with code splitting
- **esbuild**: Fast JavaScript/TypeScript bundler
- **Rollup**: Module bundler for production builds

---

## 🏗 System Architecture

### Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                  │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Public     │  │    Admin     │  │    Shared    │     │
│  │   Pages      │  │    Pages     │  │  Components  │     │
│  │              │  │              │  │              │     │
│  │ - Landing    │  │ - Dashboard  │  │ - Header     │     │
│  │ - Submit     │  │ - Manage     │  │ - Footer     │     │
│  │ - Track      │  │ - Analytics  │  │ - Forms      │     │
│  │              │  │ - Profile    │  │ - Cards      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         State Management (TanStack Query)           │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ REST API / WebSockets
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE BACKEND                           │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │     Auth     │  │   Storage    │     │
│  │   Database   │  │    Service   │  │   Bucket     │     │
│  │              │  │              │  │              │     │
│  │ - Tables     │  │ - Sessions   │  │ - Files      │     │
│  │ - RLS        │  │ - JWT        │  │ - Images     │     │
│  │ - Triggers   │  │ - Providers  │  │ - PDFs       │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Edge Functions (Deno Runtime)             │    │
│  │         - delete-account: Account removal           │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

#### Complaint Submission Flow
```
User Input → Frontend Validation → File Upload (if any) → 
Database Insert → Token Generation → Confirmation Dialog → 
LocalStorage Save → Success Notification
```

#### Admin Complaint Management Flow
```
Admin Login → Session Verification → Fetch Complaints → 
Display with Filters → Admin Action (Update/Reply/Delete) → 
Database Update → Real-time Refresh → Success Notification
```

#### Analytics Generation Flow
```
Complaint Status Change → Database Trigger → Analytics Function → 
Aggregate Calculations → Analytics Table Update → 
Dashboard Refresh → Visual Charts Update
```

---

## 🗄 Database Schema

### Entity Relationship Diagram

```
┌─────────────────────┐
│     auth.users      │ (Managed by Supabase Auth)
│                     │
│ - id (UUID) PK      │
│ - email             │
│ - encrypted_password│
│ - created_at        │
└──────────┬──────────┘
           │
           │ 1:1
           ▼
┌─────────────────────┐
│      profiles       │
│                     │
│ - id (UUID) PK/FK   │◄───────────┐
│ - username          │            │
│ - email             │            │ 1:N
│ - created_at        │            │
└─────────────────────┘            │
                                   │
┌─────────────────────┐            │
│  complaint_boxes    │            │
│                     │            │
│ - id (UUID) PK      │────────────┘
│ - admin_id (FK)     │
│ - title             │
│ - description       │
│ - token (unique)    │
│ - password          │
│ - created_at        │
│ - updated_at        │
└──────────┬──────────┘
           │
           │ 1:N
           ├────────────────┬────────────────┐
           ▼                ▼                ▼
┌─────────────────┐  ┌──────────────┐  ┌──────────────┐
│   complaints    │  │  feedbacks   │  │  analytics   │
│                 │  │              │  │              │
│ - id (UUID) PK  │  │ - id (PK)    │  │ - id (PK)    │
│ - box_id (FK)   │  │ - box_id (FK)│  │ - box_id (FK)│
│ - title         │  │ - rating     │  │ - date       │
│ - message       │  │ - message    │  │ - total_*    │
│ - status        │  │ - created_at │  │ - avg_rating │
│ - token (unique)│  └──────────────┘  │ - created_at │
│ - admin_reply   │                    │ - updated_at │
│ - replied_at    │                    └──────────────┘
│ - attachment_*  │
│ - created_at    │
│ - updated_at    │
└─────────────────┘
```

### Table Definitions

#### 1. profiles
Stores extended user information linked to Supabase Auth users.

| Column      | Type      | Constraints           | Description                    |
|-------------|-----------|----------------------|--------------------------------|
| id          | UUID      | PRIMARY KEY          | References auth.users(id)      |
| username    | TEXT      | NOT NULL             | User's display name            |
| email       | TEXT      | NOT NULL             | User's email address           |
| created_at  | TIMESTAMP | NOT NULL, DEFAULT now() | Account creation timestamp  |

**Purpose**: Extend auth.users with application-specific profile data.

**Relationships**: 
- 1:N with complaint_boxes (one user can create many boxes)

#### 2. complaint_boxes
Stores complaint boxes created by administrators.

| Column       | Type      | Constraints              | Description                        |
|--------------|-----------|-------------------------|------------------------------------|
| id           | UUID      | PRIMARY KEY, DEFAULT uuid() | Unique box identifier         |
| admin_id     | UUID      | NOT NULL, FOREIGN KEY   | References profiles(id)            |
| title        | TEXT      | NOT NULL                | Box title/name                     |
| description  | TEXT      | NULLABLE                | Box description                    |
| token        | TEXT      | NOT NULL, UNIQUE        | Public access token                |
| password     | TEXT      | NULLABLE                | Optional access password           |
| created_at   | TIMESTAMP | NOT NULL, DEFAULT now() | Creation timestamp                 |
| updated_at   | TIMESTAMP | NOT NULL, DEFAULT now() | Last modification timestamp        |

**Indexes**:
- `idx_complaint_boxes_admin_id` on admin_id
- `idx_complaint_boxes_token` on token

**Purpose**: Define complaint collection endpoints with access control.

**Relationships**:
- N:1 with profiles (many boxes belong to one admin)
- 1:N with complaints (one box has many complaints)
- 1:N with feedbacks (one box has many feedbacks)
- 1:N with analytics (one box has many analytics records)

#### 3. complaints
Stores individual complaints submitted anonymously.

| Column          | Type      | Constraints              | Description                    |
|-----------------|-----------|-------------------------|--------------------------------|
| id              | UUID      | PRIMARY KEY, DEFAULT uuid() | Unique complaint identifier |
| box_id          | UUID      | NOT NULL, FOREIGN KEY   | References complaint_boxes(id) |
| title           | TEXT      | NOT NULL                | Complaint title/summary        |
| message         | TEXT      | NOT NULL                | Detailed complaint message     |
| status          | TEXT      | NOT NULL, DEFAULT 'received' | Current status            |
| token           | TEXT      | NOT NULL, UNIQUE        | Tracking token (CPL-XXXXXXXX)  |
| attachment_url  | TEXT      | NULLABLE                | File storage URL               |
| attachment_name | TEXT      | NULLABLE                | Original filename              |
| attachment_type | TEXT      | NULLABLE                | MIME type                      |
| admin_reply     | TEXT      | NULLABLE                | Administrator's response       |
| replied_at      | TIMESTAMP | NULLABLE                | Reply timestamp                |
| created_at      | TIMESTAMP | NOT NULL, DEFAULT now() | Submission timestamp           |
| updated_at      | TIMESTAMP | NOT NULL, DEFAULT now() | Last modification timestamp    |

**Indexes**:
- `idx_complaints_box_id` on box_id
- `idx_complaints_token` on token
- `idx_complaints_status` on status

**Status Values**:
- `received`: Initial state after submission
- `under_review`: Admin is reviewing the complaint
- `solved`: Complaint has been resolved

**Purpose**: Store all complaint submissions with full tracking capability.

**Relationships**:
- N:1 with complaint_boxes (many complaints belong to one box)

#### 4. feedbacks
Stores anonymous feedback ratings for complaint boxes.

| Column      | Type      | Constraints              | Description                    |
|-------------|-----------|-------------------------|--------------------------------|
| id          | UUID      | PRIMARY KEY, DEFAULT uuid() | Unique feedback identifier  |
| box_id      | UUID      | NOT NULL, FOREIGN KEY   | References complaint_boxes(id) |
| rating      | INTEGER   | NOT NULL, CHECK (1-5)   | Rating from 1 to 5 stars       |
| message     | TEXT      | NULLABLE                | Optional feedback message      |
| created_at  | TIMESTAMP | NOT NULL, DEFAULT now() | Submission timestamp           |

**Indexes**:
- `idx_feedbacks_box_id` on box_id
- `idx_feedbacks_created_at` on created_at

**Purpose**: Collect user satisfaction ratings for complaint boxes.

**Relationships**:
- N:1 with complaint_boxes (many feedbacks belong to one box)

#### 5. analytics
Stores daily aggregated analytics data for complaint boxes.

| Column              | Type         | Constraints                | Description                    |
|---------------------|--------------|---------------------------|--------------------------------|
| id                  | UUID         | PRIMARY KEY, DEFAULT uuid() | Unique record identifier     |
| box_id              | UUID         | NOT NULL, FOREIGN KEY     | References complaint_boxes(id) |
| date                | DATE         | NOT NULL, DEFAULT today() | Analytics date                 |
| total_complaints    | INTEGER      | NOT NULL, DEFAULT 0       | Total complaints count         |
| received_count      | INTEGER      | NOT NULL, DEFAULT 0       | Count with 'received' status   |
| in_progress_count   | INTEGER      | NOT NULL, DEFAULT 0       | Count with 'under_review' status |
| resolved_count      | INTEGER      | NOT NULL, DEFAULT 0       | Count with 'solved' status     |
| rejected_count      | INTEGER      | NOT NULL, DEFAULT 0       | Count with 'rejected' status   |
| avg_rating          | NUMERIC(3,2) | NULLABLE                  | Average feedback rating        |
| total_feedbacks     | INTEGER      | NOT NULL, DEFAULT 0       | Total feedbacks count          |
| created_at          | TIMESTAMP    | NOT NULL, DEFAULT now()   | Creation timestamp             |
| updated_at          | TIMESTAMP    | NOT NULL, DEFAULT now()   | Last update timestamp          |

**Constraints**:
- UNIQUE(box_id, date) - One record per box per day

**Indexes**:
- `idx_analytics_box_id` on box_id
- `idx_analytics_date` on date
- `idx_analytics_box_date` on (box_id, date)

**Purpose**: Provide time-series analytics data for admin dashboards.

**Relationships**:
- N:1 with complaint_boxes (many analytics records belong to one box)

### Database Functions

#### 1. handle_new_user()
**Trigger**: AFTER INSERT on auth.users  
**Purpose**: Automatically create a profile record when a new user signs up.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 2. update_updated_at_column()
**Trigger**: BEFORE UPDATE on complaint_boxes, complaints, analytics  
**Purpose**: Automatically update the updated_at timestamp on row modifications.

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### 3. update_box_analytics()
**Trigger**: AFTER INSERT/UPDATE/DELETE on complaints  
**Purpose**: Automatically update analytics when complaints change.

**Logic**:
1. Extract box_id from the complaint
2. Count complaints by status
3. Upsert into analytics table for current date
4. Update status counts and totals

#### 4. update_feedback_analytics()
**Trigger**: AFTER INSERT/UPDATE/DELETE on feedbacks  
**Purpose**: Automatically update analytics when feedbacks change.

**Logic**:
1. Extract box_id from the feedback
2. Calculate average rating
3. Count total feedbacks
4. Upsert into analytics table for current date

### Row-Level Security (RLS)

RLS policies ensure data security at the database level:

#### profiles
- ✅ Users can view/update their own profile
- ❌ Users cannot view other profiles

#### complaint_boxes
- ✅ Admins can CRUD their own boxes
- ✅ Anyone can view boxes by token (for submission)
- ❌ Admins cannot modify others' boxes

#### complaints
- ✅ Anyone can insert complaints (anonymous)
- ✅ Anyone can view complaints by token (for tracking)
- ✅ Admins can view/update/delete complaints in their boxes
- ❌ Admins cannot access complaints in others' boxes

#### feedbacks
- ✅ Anyone can insert feedbacks (anonymous)
- ✅ Anyone can view feedbacks
- ✅ Admins can delete feedbacks in their boxes
- ❌ Admins cannot delete feedbacks in others' boxes

#### analytics
- ✅ Admins can view analytics for their boxes
- ❌ Admins cannot view analytics for others' boxes

### Storage Bucket

#### complaint-attachments
- **Type**: Public bucket
- **Size Limit**: 5MB per file
- **Allowed MIME Types**:
  - Images: JPEG, PNG, GIF, WEBP
  - Documents: PDF, DOC, DOCX
  - Spreadsheets: XLS, XLSX
  - Text: TXT

**RLS Policies**:
- ✅ Anyone can upload files
- ✅ Anyone can view files (public URLs)
- ✅ Admins can delete files in their boxes' complaints
- ❌ Users cannot delete others' files

---

## 📁 Project Structure

```
tellus/
├── public/                      # Static public assets
│   ├── _redirects              # Netlify redirects configuration
│   ├── robots.txt              # SEO robots file
│   └── favicon.ico             # Site favicon
│
├── src/                        # Source code
│   ├── components/             # React components
│   │   ├── ui/                # shadcn/ui components (40+ components)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   └── ... (and more)
│   │   │
│   │   ├── AdminHeader.tsx    # Admin navigation header
│   │   ├── FrontendHeader.tsx # Public pages header
│   │   ├── Footer.tsx         # Site footer
│   │   ├── NavLink.tsx        # Navigation link component
│   │   ├── SEOHead.tsx        # SEO meta tags component
│   │   └── ThemeToggle.tsx    # Dark/light theme switcher
│   │
│   ├── pages/                 # Page components (routes)
│   │   ├── Landing.tsx        # Landing page (/)
│   │   ├── Login.tsx          # Admin login (/login)
│   │   ├── Signup.tsx         # Admin registration (/signup)
│   │   ├── Dashboard.tsx      # Admin dashboard (/dashboard)
│   │   ├── CreateBox.tsx      # Create complaint box (/create-box)
│   │   ├── ManageBox.tsx      # Manage complaints (/manage/:id)
│   │   ├── Analytics.tsx      # Analytics dashboard (/analytics/:id)
│   │   ├── Profile.tsx        # Admin profile (/profile)
│   │   ├── ComplaintBox.tsx   # Submit complaint (/complaint/:token)
│   │   ├── SubmitComplaint.tsx # Alternative submit page (/submit/:token)
│   │   ├── TrackComplaint.tsx # Track complaint (/track)
│   │   ├── Index.tsx          # Legacy index page
│   │   └── NotFound.tsx       # 404 error page
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-mobile.tsx     # Mobile device detection
│   │   ├── use-toast.ts       # Toast notifications
│   │   └── use-scroll-header.tsx # Scroll-aware header visibility
│   │
│   ├── integrations/          # External service integrations
│   │   └── supabase/
│   │       ├── client.ts      # Supabase client configuration
│   │       └── types.ts       # Auto-generated TypeScript types
│   │
│   ├── lib/                   # Utility libraries
│   │   └── utils.ts           # Helper functions (cn, etc.)
│   │
│   ├── App.tsx                # Main app component with routing
│   ├── App.css                # App-specific styles
│   ├── main.tsx               # Application entry point
│   ├── index.css              # Global styles & design system
│   └── vite-env.d.ts          # Vite environment types
│
├── supabase/                  # Supabase backend configuration
│   ├── SETUP_GUIDE.md         # Complete database setup documentation
│   ├── EDGE_FUNCTIONS_GUIDE.md # Edge functions deployment guide
│   ├── config.toml            # Supabase project & edge function config
│   ├── setup.sql              # Single comprehensive database setup file
│   ├── migrations/            # Database migrations (auto-generated)
│   └── functions/             # Edge functions
│       └── delete-account/    # Secure account deletion function
│           └── index.ts
│
├── .env                       # Environment variables (not in git)
├── .gitignore                 # Git ignore rules
├── components.json            # shadcn/ui configuration
├── eslint.config.js           # ESLint configuration
├── index.html                 # HTML entry point
├── netlify.toml               # Netlify deployment config
├── package.json               # Node dependencies
├── postcss.config.js          # PostCSS configuration
├── README.md                  # Project documentation
├── render.yaml                # Render deployment config
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── tsconfig.app.json          # App-specific TS config
├── tsconfig.node.json         # Node-specific TS config
├── vercel.json                # Vercel deployment config
├── vite.config.ts             # Vite build configuration
└── wrangler.toml              # Cloudflare Workers config
```

### Key Directories Explained

#### `/src/components/ui/`
Contains all reusable UI components from shadcn/ui. These are:
- Fully customizable and themed
- Accessible (WCAG 2.1 compliant)
- Built on Radix UI primitives
- Styled with Tailwind CSS

#### `/src/pages/`
Contains all route components:
- **Public Routes**: Landing, ComplaintBox, TrackComplaint
- **Auth Routes**: Login, Signup
- **Protected Routes**: Dashboard, CreateBox, ManageBox, Analytics, Profile

#### `/src/hooks/`
Custom React hooks for reusable logic:
- `use-mobile`: Detects mobile devices
- `use-toast`: Manages toast notifications
- `use-scroll-header`: Controls header visibility on scroll

#### `/supabase/`
Backend configuration and scripts:
- **`SETUP_GUIDE.md`**: Complete step-by-step setup instructions
- **`setup.sql`**: Single comprehensive database setup file (run this once)
- **`config.toml`**: Supabase project configuration and edge function settings
- **`functions/`**: Serverless edge functions (delete-account)
- **`migrations/`**: Auto-generated migration files (don't edit manually)

**Important**: Use only `setup.sql` for database setup - it contains everything you need.

---

## 🎨 Design System

### Color Palette

The design system uses HSL color format for consistency and easy theming:

#### Light Mode
```css
:root {
  --background: 0 0% 100%;          /* White background */
  --foreground: 222.2 84% 4.9%;     /* Dark text */
  
  --primary: 221.2 83.2% 53.3%;     /* Blue #3B82F6 */
  --primary-foreground: 210 40% 98%; /* White text on primary */
  
  --accent: 270.7 91.0% 65.1%;      /* Purple #A855F7 */
  --accent-foreground: 210 40% 98%; /* White text on accent */
  
  --muted: 210 40% 96.1%;           /* Light gray */
  --muted-foreground: 215.4 16.3% 46.9%; /* Muted text */
  
  --card: 0 0% 100%;                /* Card background */
  --card-foreground: 222.2 84% 4.9%; /* Card text */
  
  --border: 214.3 31.8% 91.4%;      /* Border color */
  --input: 214.3 31.8% 91.4%;       /* Input border */
  --ring: 221.2 83.2% 53.3%;        /* Focus ring */
}
```

#### Dark Mode
```css
.dark {
  --background: 222.2 84% 4.9%;     /* Dark background */
  --foreground: 210 40% 98%;        /* Light text */
  
  --primary: 217.2 91.2% 59.8%;     /* Brighter blue */
  --primary-foreground: 222.2 47.4% 11.2%; /* Dark text on primary */
  
  --accent: 270.7 91.0% 65.1%;      /* Purple (same) */
  --accent-foreground: 222.2 47.4% 11.2%; /* Dark text on accent */
  
  /* ... other dark mode colors */
}
```

### Custom Design Tokens

#### Gradients
```css
--gradient-primary: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)));
--gradient-card: linear-gradient(145deg, hsl(var(--background)), hsl(var(--muted)));
```

#### Shadows
```css
--shadow-subtle: 0 2px 8px rgba(0, 0, 0, 0.04);
--shadow-medium: 0 4px 16px rgba(0, 0, 0, 0.08);
--shadow-strong: 0 8px 32px rgba(0, 0, 0, 0.12);
--shadow-glow-primary: 0 0 40px hsl(var(--primary) / 0.3);
--shadow-glow-accent: 0 0 40px hsl(var(--accent) / 0.3);
```

#### Animations
```css
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}
```

### Typography

#### Font Families
- **Body**: DM Sans (sans-serif)
- **Headings**: Lexend (sans-serif)
- **Code/Special**: Space Grotesk (monospace)

#### Font Sizes (Tailwind)
```javascript
fontSize: {
  xs: ['0.75rem', { lineHeight: '1rem' }],
  sm: ['0.875rem', { lineHeight: '1.25rem' }],
  base: ['1rem', { lineHeight: '1.5rem' }],
  lg: ['1.125rem', { lineHeight: '1.75rem' }],
  xl: ['1.25rem', { lineHeight: '1.75rem' }],
  '2xl': ['1.5rem', { lineHeight: '2rem' }],
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  '5xl': ['3rem', { lineHeight: '1' }],
}
```

### Component Styling Guidelines

1. **Use Semantic Tokens**: Always use CSS variables, never hardcode colors
2. **Gradient Text**: Apply `.gradient-text` class for gradient headings
3. **Glass Morphism**: Use `.glass-card` for frosted glass effects
4. **Responsive Design**: Mobile-first approach with Tailwind breakpoints
5. **Accessibility**: Maintain WCAG 2.1 AA contrast ratios

---

## 🚀 Installation & Setup

### Prerequisites

Ensure you have the following installed:
- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Git**: Latest version ([Download](https://git-scm.com/))
- **Supabase Account**: Free tier available ([Sign up](https://supabase.com))

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/tellus.git
cd tellus
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- React, TypeScript, Vite
- Tailwind CSS, shadcn/ui components
- Supabase client, TanStack Query
- All other dependencies from package.json

### Step 3: Set Up Supabase Backend

**For complete, step-by-step setup instructions, see [SETUP_GUIDE.md](supabase/SETUP_GUIDE.md)**

Quick overview:

1. **Create a Supabase Project**:
   - Sign up at [https://supabase.com](https://supabase.com)
   - Create a new project and copy your credentials

2. **Run Complete Database Setup**:
   - Open Supabase SQL Editor
   - Copy and run the entire `supabase/setup.sql` file
   - This single file creates all tables, functions, triggers, and RLS policies

3. **Deploy Edge Functions** (for account deletion):
   ```bash
   supabase functions deploy
   ```
   
   See [Edge Functions Guide](./supabase/EDGE_FUNCTIONS_GUIDE.md) for complete code and detailed instructions.

**Note**: The `setup.sql` file is the only database setup file you need. All migrations and other setup scripts are generated automatically.

### Step 4: Configure Environment Variables

Create a `.env` file in the project root:

```env
# Supabase Configuration (get these from your Supabase project dashboard)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_PROJECT_ID=your-project-id
```

⚠️ **Important**: 
- Never commit `.env` file to version control!
- Get these values from Supabase Dashboard → Settings → API
- TellUs connects **only** to your Supabase project - no third-party services

### Step 5: Start Development Server

```bash
npm run dev
```

The application will be available at: `http://localhost:5173`

### Step 6: Verify Installation

1. **Check Landing Page**: Open browser to `http://localhost:5173`
2. **Test Signup**: Navigate to `/signup` and create an admin account
3. **Create Test Box**: Log in and create a complaint box
4. **Submit Test Complaint**: Visit the complaint box URL and submit a test
5. **Check Analytics**: Verify analytics dashboard shows data

---

## ⚙️ Configuration

### Tailwind Configuration

Edit `tailwind.config.ts` to customize:

```typescript
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Add custom colors
        brand: {
          50: '#eff6ff',
          // ... more shades
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        heading: ['Lexend', 'sans-serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### Vite Configuration

Edit `vite.config.ts` for build optimization:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Expose to network
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable for production
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
})
```

### SEO Configuration

Each page includes SEO metadata via the `SEOHead` component:

```tsx
<SEOHead 
  title="TellUs - Anonymous Complaint Management"
  description="Submit and track complaints anonymously"
  keywords="complaint box, anonymous feedback, digital suggestion box"
/>
```

Customize in individual page components.

---

## 🌐 Deployment

### Netlify Deployment

#### Using Netlify UI

1. **Connect Repository**:
   - Log in to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Select your repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`

2. **Set Environment Variables**:
   - Go to Site settings → Environment variables
   - Add all variables from `.env` file

3. **Deploy**:
   - Click "Deploy site"
   - Wait for build completion
   - Site will be live at `https://your-site.netlify.app`

#### Using Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build project
npm run build

# Deploy
netlify deploy --prod
```

Configuration file: `netlify.toml`

### Vercel Deployment

#### Using Vercel UI

1. **Import Project**:
   - Log in to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your Git repository

2. **Configure**:
   - Framework Preset: Vite
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Add Environment Variables**:
   - Add all variables from `.env`

4. **Deploy**:
   - Click "Deploy"
   - Wait for deployment
   - Site available at `https://your-site.vercel.app`

#### Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Configuration file: `vercel.json`

### Render Deployment

1. **Create Web Service**:
   - Go to [Render Dashboard](https://render.com)
   - Click "New +" → "Web Service"
   - Connect repository

2. **Configure**:
   - Name: tellus
   - Environment: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview`

3. **Environment Variables**:
   - Add all Supabase credentials

4. **Deploy**:
   - Click "Create Web Service"
   - Automatic deployments on git push

Configuration file: `render.yaml`

### Cloudflare Pages

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login
wrangler login

# Deploy
wrangler pages publish dist
```

Configuration file: `wrangler.toml`

### Self-Hosting with Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build image
docker build -t tellus .

# Run container
docker run -p 80:80 tellus
```

### Custom Domain Setup

1. **Add Custom Domain** (Netlify/Vercel):
   - Go to Domain settings
   - Add custom domain
   - Follow DNS configuration instructions

2. **Configure DNS**:
   - Add A record or CNAME record
   - Wait for DNS propagation (~24-48 hours)

3. **Enable HTTPS**:
   - Automatic with Netlify/Vercel
   - Manual: Use Let's Encrypt for self-hosting

---

## 📖 User Guide

### For Complainants

#### Submitting a Complaint

1. **Access Complaint Box**:
   - Receive link from administrator
   - Format: `https://yoursite.com/complaint/xxxxx`

2. **Enter Password** (if required):
   - Enter provided password
   - Click "Submit"

3. **Fill Complaint Form**:
   - **Title**: Brief summary (required)
   - **Message**: Detailed description (required)
   - **Attachment**: Optional file upload (max 5MB)

4. **Review & Submit**:
   - Check all information
   - Click "Submit Complaint"
   - Wait for confirmation

5. **Save Tracking Token**:
   - Copy token (format: CPL-XXXXXXXXXX)
   - Save for future reference
   - Token appears in success dialog

#### Tracking Complaint Status

1. **Visit Track Page**:
   - Go to `https://yoursite.com/track`
   - Or click "Track Complaint" button

2. **Enter Token**:
   - Paste or type your tracking token
   - Click "Search"

3. **View Details**:
   - See current status
   - Read admin reply (if any)
   - Download attachments
   - Check timestamps

#### Providing Feedback

1. **Rate Complaint Box**:
   - Scroll to feedback section
   - Select star rating (1-5)
   - Optionally add message

2. **Submit Feedback**:
   - Click "Submit Feedback"
   - View confirmation

---

## 👨‍💼 Admin Guide

### Getting Started

#### Creating an Account

1. **Navigate to Signup**:
   - Go to `https://yoursite.com/signup`

2. **Fill Registration Form**:
   - Username
   - Email address
   - Password (min 6 characters)
   - Confirm password

3. **Submit**:
   - Click "Create Account"
   - Verify email (if enabled)
   - Automatically logged in

#### Creating Your First Complaint Box

1. **Access Dashboard**:
   - Log in to admin panel
   - Click "Create New Box"

2. **Configure Box**:
   - **Title**: Clear, descriptive name
   - **Description**: Purpose and guidelines
   - **Password**: Optional access control

3. **Create & Share**:
   - Click "Create Complaint Box"
   - Copy share link
   - Distribute to users

### Managing Complaints

#### Viewing Complaints

1. **Navigate to Box**:
   - Go to Dashboard
   - Click on complaint box
   - View all complaints

2. **Filter & Search**:
   - Use search bar for keywords
   - Filter by status
   - Sort by date

#### Updating Status

1. **Select Complaint**:
   - Click on complaint card
   - View full details

2. **Change Status**:
   - Click status dropdown
   - Select new status:
     - Received
     - Under Review
     - Solved

3. **Save**:
   - Status updates automatically
   - Notification sent

#### Replying to Complaints

1. **Open Reply Dialog**:
   - Click "Reply" button
   - View complaint details

2. **Write Response**:
   - Type your message
   - Be professional and helpful
   - Click "Submit Reply"

3. **Verify**:
   - Reply appears in complaint details
   - Visible to complainant via tracking

### Analytics Dashboard

#### Accessing Analytics

1. **Navigate**:
   - Go to complaint box
   - Click "Analytics" button

2. **Select Time Range**:
   - Last 7 days
   - Last month
   - Last quarter
   - Last year

#### Understanding Metrics

1. **Total Complaints**:
   - All complaints received
   - Includes all statuses

2. **Average Rating**:
   - Mean feedback rating
   - Scale: 0-5 stars

3. **Total Feedbacks**:
   - Number of feedback submissions
   - Separate from complaints

4. **Resolution Rate**:
   - Percentage of solved complaints
   - Formula: (Solved / Total) × 100

#### Reading Charts

1. **Trends Tab**:
   - Line chart showing complaints over time
   - Compare with feedbacks trend

2. **Status Tab**:
   - Pie chart of status distribution
   - Current snapshot of complaint states

3. **Ratings Tab**:
   - Line chart of average ratings
   - Track satisfaction over time

---

## 🔐 Security Features

### Database Connection Security

**TellUs connects exclusively to your Supabase project** - there are no third-party database services or cloud platforms involved. All data is stored in your own Supabase PostgreSQL database.

- ✅ **Direct Supabase Connection**: Uses only the Supabase client library
- ✅ **No External Services**: All data stays in your Supabase project
- ✅ **Full Data Ownership**: You own and control all data
- ✅ **Secure Credentials**: API keys stored in environment variables only
- ✅ **RLS Enforcement**: All database access controlled by Row Level Security policies

**Configuration**: Check `src/integrations/supabase/client.ts` - it uses only your Supabase credentials from `.env`

### Authentication Security

1. **Password Hashing**: Bcrypt via Supabase Auth
2. **JWT Tokens**: Secure session management
3. **Token Refresh**: Automatic token renewal
4. **Session Persistence**: Secure localStorage storage
5. **Edge Function Auth**: JWT verification on serverless functions

### Data Protection

1. **Row-Level Security**: Database-level access control
2. **Input Validation**: Client and server-side validation
3. **SQL Injection Prevention**: Parameterized queries
4. **XSS Protection**: React's built-in escaping

### Privacy Features

1. **Anonymous Submission**: No user tracking
2. **No IP Logging**: IP addresses not stored
3. **No Cookies**: No tracking cookies
4. **Data Encryption**: HTTPS for all communications

### File Upload Security

1. **File Type Validation**: Whitelist of allowed types
2. **Size Limits**: 5MB maximum file size
3. **Virus Scanning**: Recommended for production
4. **Secure Storage**: Supabase storage with RLS

---

## ⚡ Performance Optimization

### Frontend Optimization

1. **Code Splitting**: Automatic route-based splitting
2. **Lazy Loading**: Dynamic imports for heavy components
3. **Image Optimization**: Lazy loading and proper sizing
4. **Bundle Size**: Tree-shaking and minification

### Backend Optimization

1. **Database Indexing**: Strategic indexes on frequently queried columns
2. **Query Optimization**: Efficient JOINs and filtering
3. **Caching**: TanStack Query caching strategy
4. **Connection Pooling**: Supabase handles automatically

### Best Practices

1. **Minimize Re-renders**: React.memo and useMemo
2. **Optimize Images**: WebP format, proper dimensions
3. **Reduce Bundle**: Remove unused dependencies
4. **Enable Compression**: Gzip/Brotli on server

---

## 🔧 Troubleshooting

### Common Issues

#### Issue: "Invalid API key"
**Solution**:
1. Verify `.env` file has correct Supabase credentials
2. Check for typos in environment variables
3. Restart development server after env changes

#### Issue: "Database connection failed" or "Failed to send request to edge function"
**Solution**:
1. **Verify Supabase project is active** in your Supabase dashboard
2. **Check internet connection**
3. **Ensure edge functions are deployed**:
   ```bash
   supabase functions list
   ```
4. **Verify config.toml** has the correct project_id and function configuration
5. **Check RLS policies** are properly set up via setup.sql
6. **Restart development server** after any Supabase changes
7. **For edge function errors**: Deploy the function using:
   ```bash
   supabase functions deploy delete-account
   ```

#### Issue: "File upload fails"
**Solution**:
1. Check file size is under 5MB
2. Verify file type is allowed
3. Ensure storage bucket exists
4. Check storage policies

#### Issue: "Analytics not updating"
**Solution**:
1. Verify database triggers are created
2. Check analytics functions in SQL editor
3. Manually trigger analytics update
4. Clear browser cache

---

## 🤝 Contributing

### Development Workflow

1. **Fork Repository**:
   ```bash
   git clone https://github.com/yourusername/tellus.git
   cd tellus
   ```

2. **Create Feature Branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Changes**:
   - Write code
   - Follow style guidelines
   - Add comments
   - Test thoroughly

4. **Commit Changes**:
   ```bash
   git add .
   git commit -m "Add amazing feature"
   ```

5. **Push Branch**:
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Create Pull Request**:
   - Go to GitHub
   - Click "New Pull Request"
   - Describe changes
   - Wait for review

### Code Style Guidelines

#### TypeScript
- Use TypeScript for all files
- Define proper interfaces
- Avoid `any` type
- Use meaningful variable names

#### React
- Use functional components
- Implement proper hooks
- Follow component composition
- Keep components small and focused

#### CSS
- Use Tailwind utility classes
- Follow design system tokens
- Avoid inline styles
- Maintain responsive design

---

## 📄 License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2024 TellUs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Contact & Support

### Project Links
- **GitHub**: [https://github.com/yourusername/tellus](https://github.com/yourusername/tellus)
- **Documentation**: [https://docs.tellus.app](https://docs.tellus.app)
- **Issues**: [https://github.com/yourusername/tellus/issues](https://github.com/yourusername/tellus/issues)

### Community
- **Discord**: Join our community server
- **Twitter**: Follow for updates
- **Blog**: Read development updates

---

## 🙏 Acknowledgments

- **React Team**: For the amazing React library
- **Tailwind Labs**: For Tailwind CSS
- **Supabase Team**: For the excellent backend platform
- **shadcn**: For the beautiful UI components
- **Radix UI**: For accessible component primitives
- **Vercel**: For hosting and deployment tools

---

## 📊 Project Statistics

- **Total Lines of Code**: ~15,000+
- **Components**: 50+ React components
- **Database Tables**: 5 tables
- **Edge Functions**: 1 function
- **Deployment Options**: 5+ platforms
- **Contributors**: Open for contributions
- **License**: MIT (Open Source)

---

**Built with ❤️ using React, TypeScript, Tailwind CSS, and Supabase**

*Transforming traditional complaint boxes into modern digital solutions*
