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
import AdminHeader from "@/components/AdminHeader";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { getCurrentAdmin, isAuthenticated, type Admin } from "@/lib/auth";

const CreateBox = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    
    const currentAdmin = getCurrentAdmin();
    if (!currentAdmin) {
      navigate("/login");
      return;
    }
    
    setAdmin(currentAdmin);
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

    if (!admin) {
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
            admin_id: admin.id,
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
            <h1 className="text-4xl font-bold gradient-text mb-2">Create New Complaint Box</h1>
            <p className="text-muted-foreground text-lg">
              Start to set up a new complaint box by filling details below
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
                      className="flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-primary/50"
                    >
                      <option value="" className="text-muted-foreground">Select category...</option>
                      
                      <optgroup label="🎓 Education" className="font-semibold">
                        <option value="School">School</option>
                        <option value="College">College</option>
                        <option value="University">University</option>
                        <option value="Examination Cell">Examination Cell</option>
                        <option value="Admission Office">Admission Office</option>
                        <option value="Library">Library</option>
                        <option value="Laboratory">Laboratory</option>
                        <option value="Sports Department">Sports Department</option>
                        <option value="Accounts / Fees Department">Accounts / Fees Department</option>
                        <option value="Hostel Office">Hostel Office</option>
                      </optgroup>
                      
                      <optgroup label="🏢 Corporate / Office" className="font-semibold">
                        <option value="HR">HR</option>
                        <option value="Manager">Manager</option>
                        <option value="IT Department">IT Department</option>
                        <option value="Finance">Finance</option>
                        <option value="Administration">Administration</option>
                        <option value="Operations">Operations</option>
                        <option value="Customer Support">Customer Support</option>
                        <option value="Vendor Management">Vendor Management</option>
                        <option value="Sales Team">Sales Team</option>
                      </optgroup>
                      
                      <optgroup label="🏘 Hostel / PG" className="font-semibold">
                        <option value="Warden">Warden</option>
                        <option value="Mess">Mess</option>
                        <option value="Security">Security</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Electricity / Water">Electricity / Water</option>
                        <option value="Cleanliness">Cleanliness</option>
                        <option value="Room Issues">Room Issues</option>
                      </optgroup>
                      
                      <optgroup label="🏥 Healthcare / Medical" className="font-semibold">
                        <option value="Hospital">Hospital</option>
                        <option value="Clinic">Clinic</option>
                        <option value="Pharmacy">Pharmacy</option>
                        <option value="Billing Department">Billing Department</option>
                        <option value="Nursing Staff">Nursing Staff</option>
                        <option value="Doctor Behaviour">Doctor Behaviour</option>
                        <option value="Emergency Services">Emergency Services</option>
                        <option value="Medical Negligence">Medical Negligence</option>
                      </optgroup>
                      
                      <optgroup label="🏛 Public Service / Government" className="font-semibold">
                        <option value="Municipal Corporation">Municipal Corporation</option>
                        <option value="Water Supply Board">Water Supply Board</option>
                        <option value="Electricity Department">Electricity Department</option>
                        <option value="Road & Transport Department">Road & Transport Department</option>
                        <option value="Police Department">Police Department</option>
                        <option value="Public Grievance Cell">Public Grievance Cell</option>
                        <option value="Ration / Public Distribution">Ration / Public Distribution</option>
                        <option value="Government Office (UID / Passport / Licensing)">Government Office</option>
                      </optgroup>
                      
                      <optgroup label="🛍 Customer Service / Retail" className="font-semibold">
                        <option value="Product Quality">Product Quality</option>
                        <option value="Billing / Pricing">Billing / Pricing</option>
                        <option value="Delivery Issue">Delivery Issue</option>
                        <option value="Refund / Return">Refund / Return</option>
                        <option value="Warranty Claim">Warranty Claim</option>
                        <option value="Service Centre">Service Centre</option>
                        <option value="Store Staff Behaviour">Store Staff Behaviour</option>
                      </optgroup>
                      
                      <optgroup label="🏡 Housing Society / Apartments" className="font-semibold">
                        <option value="Society Management">Society Management</option>
                        <option value="Security Guards">Security Guards</option>
                        <option value="Cleaning / Housekeeping">Cleaning / Housekeeping</option>
                        <option value="Parking Issues">Parking Issues</option>
                        <option value="Maintenance Team">Maintenance Team</option>
                        <option value="Lift / Facility Issues">Lift / Facility Issues</option>
                        <option value="Neighbour Disturbance">Neighbour Disturbance</option>
                      </optgroup>
                      
                      <optgroup label="🚗 Transport / Travel" className="font-semibold">
                        <option value="Bus Service">Bus Service</option>
                        <option value="Train Service">Train Service</option>
                        <option value="Taxi / Cab">Taxi / Cab</option>
                        <option value="Auto / Rickshaw">Auto / Rickshaw</option>
                        <option value="Driver Behaviour">Driver Behaviour</option>
                        <option value="Overcharging">Overcharging</option>
                        <option value="Delay / Cancellation">Delay / Cancellation</option>
                      </optgroup>
                      
                      <optgroup label="💻 Technology / IT Support" className="font-semibold">
                        <option value="Software Issue">Software Issue</option>
                        <option value="Hardware Issue">Hardware Issue</option>
                        <option value="Network / Wi-Fi Issue">Network / Wi-Fi Issue</option>
                        <option value="Online Portal Problem">Online Portal Problem</option>
                        <option value="Account / Login Issue">Account / Login Issue</option>
                        <option value="Data Loss">Data Loss</option>
                        <option value="Security Concern">Security Concern</option>
                      </optgroup>
                      
                      <optgroup label="🍽 Food & Dining" className="font-semibold">
                        <option value="Canteen">Canteen</option>
                        <option value="Cafeteria">Cafeteria</option>
                        <option value="Restaurant">Restaurant</option>
                        <option value="Food Quality">Food Quality</option>
                        <option value="Staff Behaviour">Staff Behaviour</option>
                        <option value="Hygiene Issues">Hygiene Issues</option>
                      </optgroup>
                      
                      <optgroup label="🎭 Events & Activities" className="font-semibold">
                        <option value="Event Management">Event Management</option>
                        <option value="Cultural Activities">Cultural Activities</option>
                        <option value="Sports Events">Sports Events</option>
                        <option value="Registration Problems">Registration Problems</option>
                        <option value="Miscommunication">Miscommunication</option>
                      </optgroup>
                      
                      <optgroup label="📦 General" className="font-semibold">
                        <option value="Complaint About Staff">Complaint About Staff</option>
                        <option value="Service Delay">Service Delay</option>
                        <option value="Behavioural Misconduct">Behavioural Misconduct</option>
                        <option value="Mismanagement">Mismanagement</option>
                        <option value="Safety Concern">Safety Concern</option>
                        <option value="Facility Issue">Facility Issue</option>
                      </optgroup>
                      
                      <optgroup label="🟦 Other" className="font-semibold">
                        <option value="Other">Custom Category</option>
                      </optgroup>
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
                      Password Protection (Optional)
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Leave empty for public access"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="text-base h-12"
                    />
                    <p className="text-sm text-muted-foreground">
                      If set, users will need to enter this password to submit complaints
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 text-base bg-gradient-to-r from-primary to-accent hover:opacity-90"
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
