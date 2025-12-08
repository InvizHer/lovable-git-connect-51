import { supabase } from "@/integrations/supabase/client";

// Admin type for the custom authentication system
export interface Admin {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

// Session type stored in localStorage
export interface AdminSession {
  admin: Admin;
  expires_at: number; // Unix timestamp
}

const SESSION_KEY = "tellus_admin_session";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Get current session from localStorage
export const getSession = (): AdminSession | null => {
  try {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return null;
    
    const session: AdminSession = JSON.parse(sessionStr);
    
    // Check if session has expired
    if (Date.now() > session.expires_at) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    
    return session;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

// Get current admin from session
export const getCurrentAdmin = (): Admin | null => {
  const session = getSession();
  return session?.admin ?? null;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getSession() !== null;
};

// Save session to localStorage
const saveSession = (admin: Admin): void => {
  const session: AdminSession = {
    admin,
    expires_at: Date.now() + SESSION_DURATION,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

// Clear session from localStorage
export const clearSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

// Register a new admin
export const registerAdmin = async (
  username: string,
  email: string,
  password: string
): Promise<{ admin: Admin | null; error: string | null }> => {
  try {
    const { data, error } = await (supabase.rpc as any)("register_admin", {
      p_username: username,
      p_email: email,
      p_password: password,
    });

    if (error) {
      return { admin: null, error: error.message };
    }

    if (!data || data.length === 0) {
      return { admin: null, error: "Registration failed" };
    }

    const admin: Admin = {
      id: data[0].id,
      username: data[0].username,
      email: data[0].email,
      created_at: data[0].created_at,
    };

    // Save session
    saveSession(admin);

    return { admin, error: null };
  } catch (err: any) {
    return { admin: null, error: err.message || "Registration failed" };
  }
};

// Login admin
export const loginAdmin = async (
  email: string,
  password: string
): Promise<{ admin: Admin | null; error: string | null }> => {
  try {
    const { data, error } = await (supabase.rpc as any)("login_admin", {
      p_email: email,
      p_password: password,
    });

    if (error) {
      return { admin: null, error: error.message };
    }

    if (!data || data.length === 0) {
      return { admin: null, error: "Invalid email or password" };
    }

    const admin: Admin = {
      id: data[0].id,
      username: data[0].username,
      email: data[0].email,
      created_at: data[0].created_at,
    };

    // Save session
    saveSession(admin);

    return { admin, error: null };
  } catch (err: any) {
    return { admin: null, error: err.message || "Login failed" };
  }
};

// Logout admin
export const logoutAdmin = (): void => {
  clearSession();
};

// Update admin profile
export const updateAdminProfile = async (
  adminId: string,
  username: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { error } = await (supabase.from as any)("admins")
      .update({ username })
      .eq("id", adminId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Update session with new username
    const session = getSession();
    if (session) {
      session.admin.username = username;
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || "Update failed" };
  }
};

// Update admin password
export const updateAdminPassword = async (
  adminId: string,
  newPassword: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { error } = await (supabase.rpc as any)("update_admin_password", {
      p_admin_id: adminId,
      p_new_password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || "Password update failed" };
  }
};

// Get admin by ID (for profile page)
export const getAdminById = async (
  adminId: string
): Promise<{ admin: Admin | null; error: string | null }> => {
  try {
    const { data, error } = await (supabase.from as any)("admins")
      .select("id, username, email, created_at")
      .eq("id", adminId)
      .single();

    if (error) {
      return { admin: null, error: error.message };
    }

    return { admin: data as Admin, error: null };
  } catch (err: any) {
    return { admin: null, error: err.message || "Failed to fetch admin" };
  }
};
