import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminHeader from "@/components/AdminHeader";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { User, Lock, Mail, ArrowLeft, LogOut } from "lucide-react";
import { 
  getCurrentAdmin, 
  isAuthenticated, 
  logoutAdmin, 
  updateAdminProfile, 
  updateAdminPassword,
  getAdminById,
  type Admin 
} from "@/lib/auth";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    
    const currentAdmin = getCurrentAdmin();
    if (!currentAdmin) {
      navigate("/login");
      return;
    }
    
    // Fetch fresh admin data from database
    const { admin: freshAdmin, error } = await getAdminById(currentAdmin.id);
    if (error || !freshAdmin) {
      toast.error("Failed to load profile");
      navigate("/login");
      return;
    }
    
    setAdmin(freshAdmin);
    setUsername(freshAdmin.username || "");
    setLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin) return;
    
    setUpdating(true);

    try {
      const { success, error } = await updateAdminProfile(admin.id, username);

      if (error) {
        toast.error(error);
        return;
      }

      if (success) {
        toast.success("Profile updated successfully");
        // Refresh admin data
        const { admin: freshAdmin } = await getAdminById(admin.id);
        if (freshAdmin) {
          setAdmin(freshAdmin);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin) return;
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setUpdating(true);

    try {
      const { success, error } = await updateAdminPassword(admin.id, newPassword);

      if (error) {
        toast.error(error);
        return;
      }

      if (success) {
        toast.success("Password updated successfully");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <AdminHeader />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-5xl mx-auto space-y-8">
            <Skeleton className="h-16 w-80 rounded-2xl" />
            <div className="grid md:grid-cols-2 gap-6">
              <Skeleton className="h-96 rounded-2xl" />
              <Skeleton className="h-96 rounded-2xl" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AdminHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-accent">
                <User className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold gradient-text">Profile Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account information</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Profile Information */}
            <Card className="glass-card h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  Profile Information
                </CardTitle>
                <CardDescription>Update your profile details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={admin?.email || ""}
                      disabled
                      className="bg-secondary/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={updating} 
                    className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    {updating ? "Updating..." : "Update Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card className="glass-card h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20">
                    <Lock className="h-5 w-5 text-accent" />
                  </div>
                  Change Password
                </CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-11"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={updating} 
                    className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    {updating ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Logout Section */}
          <Card className="glass-card border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-primary/20">
                  <LogOut className="h-5 w-5 text-primary" />
                </div>
                Session Management
              </CardTitle>
              <CardDescription>
                Logout from your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="gap-2 border-primary/30 hover:bg-primary/10"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
