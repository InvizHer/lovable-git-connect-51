import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, MessageCircle, Trash2, ExternalLink, TrendingUp, BarChart3, Settings, Star } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { User, Session } from "@supabase/supabase-js";
import AdminHeader from "@/components/AdminHeader";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";

interface ComplaintBox {
  id: string;
  title: string;
  description: string | null;
  category?: string;
  token: string;
  created_at: string;
  complaint_count?: number;
  feedback_count?: number;
  avg_rating?: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [boxes, setBoxes] = useState<ComplaintBox[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [deletingBox, setDeletingBox] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/login");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/login");
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchBoxes();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      return;
    }

    setProfile(data);
  };

  const fetchBoxes = async () => {
    if (!user) return;

    const { data: boxesData, error: boxesError } = await supabase
      .from("complaint_boxes")
      .select("*")
      .eq("admin_id", user.id)
      .order("created_at", { ascending: false });

    if (boxesError) {
      toast.error("Failed to load complaint boxes");
      return;
    }

    const boxesWithStats = await Promise.all(
      (boxesData || []).map(async (box) => {
        const { count: complaintCount } = await supabase
          .from("complaints")
          .select("*", { count: "exact", head: true })
          .eq("box_id", box.id);

        const { count: feedbackCount } = await supabase
          .from("feedbacks")
          .select("*", { count: "exact", head: true })
          .eq("box_id", box.id);

        const { data: feedbackData } = await supabase
          .from("feedbacks")
          .select("rating")
          .eq("box_id", box.id);

        const avgRating = feedbackData && feedbackData.length > 0
          ? feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length
          : 0;

        return { 
          ...box, 
          complaint_count: complaintCount || 0,
          feedback_count: feedbackCount || 0,
          avg_rating: avgRating
        };
      })
    );

    setBoxes(boxesWithStats);
  };

  const handleDeleteBox = async (boxId: string) => {
    setDeletingBox(boxId);

    try {
      const { error } = await supabase
        .from("complaint_boxes")
        .delete()
        .eq("id", boxId);

      if (error) throw error;

      toast.success("Complaint box deleted successfully");
      fetchBoxes();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete complaint box");
    } finally {
      setDeletingBox(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <AdminHeader />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <Skeleton className="h-20 w-full rounded-2xl" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
            </div>
            <Skeleton className="h-48 rounded-2xl" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Skeleton className="h-80 rounded-2xl" />
              <Skeleton className="h-80 rounded-2xl" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const totalComplaints = boxes.reduce((sum, box) => sum + (box.complaint_count || 0), 0);
  const totalFeedbacks = boxes.reduce((sum, box) => sum + (box.feedback_count || 0), 0);
  const overallRating = boxes.length > 0 && totalFeedbacks > 0
    ? boxes.reduce((sum, box) => sum + (box.avg_rating || 0) * (box.feedback_count || 0), 0) / totalFeedbacks
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <SEOHead 
        title="Admin Dashboard"
        description="Manage your complaint boxes, review submissions, track analytics, and respond to feedback in your TellUs admin dashboard."
        keywords="admin dashboard, complaint management, box management, analytics, feedback review"
      />
      <AdminHeader />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 sm:p-8 rounded-3xl shadow-[var(--shadow-strong)] border-primary/20"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-3xl font-bold gradient-text mb-2">
                  Welcome back, {profile?.username} 👋
                </h1>
                <p className="text-md text-muted-foreground">
                  Here's your personal complaint management dashboard
                </p>
              </div>
              <Button
                onClick={() => navigate("/create-box")}
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 gap-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Create New Box</span>
                <span className="sm:hidden">Create New</span>
              </Button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            <Card className="glass-card border-primary/30 hover:border-primary/50 transition-all hover:shadow-[var(--shadow-glow-primary)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Boxes</p>
                    <p className="text-3xl font-bold gradient-text mt-1">{boxes.length}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-accent/30 hover:border-accent/50 transition-all hover:shadow-[var(--shadow-glow-accent)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Complaints</p>
                    <p className="text-3xl font-bold gradient-text mt-1">{totalComplaints}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20">
                    <TrendingUp className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-success/30 hover:border-success/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Feedbacks</p>
                    <p className="text-3xl font-bold text-success mt-1">{totalFeedbacks}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-success/20">
                    <BarChart3 className="w-6 h-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-warning/30 hover:border-warning/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                    <p className="text-3xl font-bold text-warning mt-1">
                      {overallRating > 0 ? overallRating.toFixed(1) : "N/A"}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-warning/20">
                    <Star className="w-6 h-6 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Complaint Boxes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold gradient-text">Your Complaint Boxes</h2>
            </div>
            
            {boxes.length === 0 ? (
              <Card className="glass-card border-dashed border-2 border-primary/30">
                <CardContent className="py-20 text-center">
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 w-fit mx-auto mb-6">
                    <MessageCircle className="w-16 h-16 text-primary opacity-50" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">No complaint boxes yet</h3>
                  <p className="text-lg text-muted-foreground mb-6">
                    Create your first complaint box to get started!
                  </p>
                  <Button 
                    onClick={() => navigate("/create-box")} 
                    size="lg"
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Box
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {boxes.map((box, index) => (
                  <motion.div
                    key={box.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <Card className="glass-card hover:shadow-[var(--shadow-strong)] transition-all duration-300 group border-primary/20 hover:border-primary/40 h-full flex flex-col">
                      <CardHeader className="flex-1">
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 w-fit group-hover:scale-110 transition-transform">
                            <MessageCircle className="w-8 h-8 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-xl break-words line-clamp-2 group-hover:text-primary transition-colors mb-2">
                              {box.title}
                            </CardTitle>
                            {box.category && (
                              <div className="mb-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium border border-accent/30">
                                  {box.category}
                                </span>
                              </div>
                            )}
                            <CardDescription className="text-sm break-words line-clamp-2">
                              {box.description || "No description"}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">Complaints</p>
                            <p className="text-lg font-bold text-primary">{box.complaint_count}</p>
                          </div>
                          <div className="text-center border-x border-border">
                            <p className="text-xs text-muted-foreground mb-1">Feedbacks</p>
                            <p className="text-lg font-bold text-accent">{box.feedback_count}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">Rating</p>
                            <p className="text-lg font-bold text-warning">
                              {box.avg_rating && box.avg_rating > 0 ? box.avg_rating.toFixed(1) : "N/A"}
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Created {new Date(box.created_at).toLocaleDateString()}
                        </p>
                        
                        {/* Actions */}
                        <div className="flex flex-col gap-2 pt-2">
                          <Button
                            onClick={() => navigate(`/manage/${box.id}`)}
                            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 gap-2"
                            size="sm"
                          >
                            <Settings className="w-4 h-4" />
                            Manage
                          </Button>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              onClick={() => navigate(`/analytics/${box.id}`)}
                              variant="outline"
                              size="sm"
                              className="border-primary/30 hover:bg-primary/10"
                            >
                              <BarChart3 className="w-4 h-4 mr-1" />
                              <span className="text-xs">Analytics</span>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-destructive/50 text-destructive hover:bg-destructive hover:text-white"
                                  disabled={deletingBox === box.id}
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  <span className="text-xs">{deletingBox === box.id ? "Deleting..." : "Delete"}</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete this complaint box and all associated complaints. 
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteBox(box.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
