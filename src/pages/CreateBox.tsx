import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, ArrowLeft, Lock } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import AdminHeader from "@/components/AdminHeader";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const CreateBox = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          navigate("/login");
        } else {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const generateToken = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };

  const handleCreateBox = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast.error("Please enter a title");
      return;
    }

    if (!category) {
      toast.error("Please select a category");
      return;
    }

    if (category === "Other" && !customCategory) {
      toast.error("Please enter a custom category");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to create a complaint box");
      return;
    }

    setLoading(true);
    
    try {
      const token = generateToken();
      const finalCategory = category === "Other" ? customCategory : category;
      
      const { data, error } = await supabase
        .from("complaint_boxes")
        .insert([
          {
            admin_id: user.id,
            title,
            description: description || null,
            category: finalCategory,
            password: password || null,
            token,
          },
        ])
        .select()
        .single();

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Complaint box created successfully!");
      navigate(`/manage/${data.id}`);
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AdminHeader />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold gradient-text mb-2">Create Complaint Box</h1>
            <p className="text-muted-foreground text-lg">
              Set up a new space for anonymous feedback
            </p>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="glass-card border-primary/20 shadow-[var(--shadow-strong)]">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Plus className="w-6 h-6 text-primary" />
                  Box Details
                </CardTitle>
                <CardDescription>
                  Provide information about your complaint box
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateBox} className="space-y-6">
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Label htmlFor="title" className="text-base flex items-center gap-2">
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Student Feedback Box"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={loading}
                      required
                      className="text-base h-12"
                    />
                  </motion.div>

                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Label htmlFor="description" className="text-base">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the purpose of this complaint box..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={loading}
                      rows={5}
                      className="text-base resize-none"
                    />
                  </motion.div>

                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 }}
                  >
                    <Label htmlFor="category" className="text-base flex items-center gap-2">
                      Category <span className="text-destructive">*</span>
                    </Label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        if (e.target.value !== "Other") {
                          setCustomCategory("");
                        }
                      }}
                      disabled={loading}
                      required
                      className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select category...</option>
                      <optgroup label="Education">
                        <option value="School">School</option>
                        <option value="College">College</option>
                        <option value="University">University</option>
                      </optgroup>
                      <optgroup label="Corporate / Office">
                        <option value="HR">HR</option>
                        <option value="Manager">Manager</option>
                        <option value="IT Department">IT Department</option>
                        <option value="Finance">Finance</option>
                      </optgroup>
                      <optgroup label="Hostel / PG">
                        <option value="Warden">Warden</option>
                        <option value="Mess">Mess</option>
                        <option value="Security">Security</option>
                        <option value="Maintenance">Maintenance</option>
                      </optgroup>
                      <optgroup label="General">
                        <option value="Public Service">Public Service</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Customer Support">Customer Support</option>
                      </optgroup>
                      <option value="Other">Other (Custom)</option>
                    </select>
                  </motion.div>

                  {category === "Other" && (
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Label htmlFor="customCategory" className="text-base flex items-center gap-2">
                        Custom Category <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="customCategory"
                        placeholder="Enter your custom category..."
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        disabled={loading}
                        required
                        className="text-base h-12"
                      />
                    </motion.div>
                  )}

                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Label htmlFor="password" className="text-base flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password (Optional)
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Leave empty for no password protection"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="text-base h-12"
                    />
                    <p className="text-sm text-muted-foreground flex items-start gap-2 bg-secondary/50 p-3 rounded-lg">
                      <span className="text-primary">💡</span>
                      Users will need this password to access and submit complaints
                    </p>
                  </motion.div>

                  <motion.div 
                    className="flex flex-col sm:flex-row gap-3 pt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Button 
                      type="submit" 
                      disabled={loading} 
                      className="flex-1 h-12 text-base bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-5 w-5" />
                          Create Complaint Box
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/dashboard")}
                      disabled={loading}
                      className="flex-1 h-12 text-base"
                    >
                      Cancel
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateBox;
