import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Copy, Upload, X, Send } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getComplaintCategories } from "@/utils/categoryMapping";

const SubmitComplaint = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [box, setBox] = useState<any>(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [successDialog, setSuccessDialog] = useState(false);
  const [complaintToken, setComplaintToken] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [complaintCategory, setComplaintCategory] = useState("");
  const [customComplaintCategory, setCustomComplaintCategory] = useState("");

  useEffect(() => {
    fetchBox();
  }, [token]);

  const fetchBox = async () => {
    const { data, error } = await supabase
      .from("complaint_boxes")
      .select("*")
      .eq("token", token)
      .single();

    if (error || !data) {
      toast.error("Invalid complaint box link");
      navigate("/");
      return;
    }

    setBox(data);
    setPasswordRequired(!!data.password);
    setAuthenticated(!data.password);
    setLoading(false);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === box.password) {
      setAuthenticated(true);
      toast.success("Access granted");
    } else {
      toast.error("Incorrect password");
    }
  };

  const generateComplaintToken = () => {
    return "CPL-" + Math.random().toString(36).substring(2, 12).toUpperCase();
  };

  const getCategoryOptions = () => {
    if (!box) return [];
    return getComplaintCategories(box.category);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file size (5MB limit)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      e.target.value = "";
      return;
    }

    // Check file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Only images, PDF, and DOC files are allowed");
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !message) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!complaintCategory) {
      toast.error("Please select a complaint category");
      return;
    }

    if (complaintCategory === "Other" && !customComplaintCategory) {
      toast.error("Please specify the complaint category");
      return;
    }

    setSubmitting(true);
    setUploadProgress(true);
    
    try {
      const newToken = generateComplaintToken();
      const finalComplaintCategory = complaintCategory === "Other" ? customComplaintCategory : complaintCategory;
      
      let attachmentUrl = null;
      let attachmentName = null;
      let attachmentType = null;

      // Upload file if attached
      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${newToken}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("complaint-attachments")
          .upload(filePath, file);

        if (uploadError) {
          toast.error("Failed to upload file");
          setUploadProgress(false);
          setSubmitting(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from("complaint-attachments")
          .getPublicUrl(filePath);

        attachmentUrl = urlData.publicUrl;
        attachmentName = file.name;
        attachmentType = file.type;
      }

      const { error } = await supabase
        .from("complaints")
        .insert([
          {
            box_id: box.id,
            title,
            message,
            complaint_category: finalComplaintCategory,
            token: newToken,
            status: "received",
            attachment_url: attachmentUrl,
            attachment_name: attachmentName,
            attachment_type: attachmentType,
          },
        ]);

      if (error) {
        toast.error(error.message);
        return;
      }

      // Store in localStorage
      const storedComplaints = JSON.parse(
        localStorage.getItem("myComplaints") || "[]"
      );
      storedComplaints.push({ token: newToken, boxId: box.id, title: title });
      localStorage.setItem("myComplaints", JSON.stringify(storedComplaints));

      setComplaintToken(newToken);
      setSuccessDialog(true);
      setTitle("");
      setMessage("");
      setFile(null);
      setComplaintCategory("");
      setCustomComplaintCategory("");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setSubmitting(false);
      setUploadProgress(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(complaintToken);
    toast.success("Token copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (passwordRequired && !authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="glass-card shadow-[var(--shadow-strong)]">
          <CardHeader>
            <CardTitle>Password Required</CardTitle>
            <CardDescription>
              This complaint box is password protected. Please enter the password to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Submit
              </Button>
            </form>
          </CardContent>
        </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="animate-fade-in">
            <Card className="glass-card border-primary/30 shadow-[var(--shadow-strong)]">
              <CardHeader>
                <CardTitle className="text-3xl sm:text-4xl gradient-text">{box.title}</CardTitle>
              <CardDescription>
                {box.description || "Submit your complaint anonymously"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitComplaint} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Complaint Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Brief description of your complaint"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={submitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complaintCategory" className="text-base flex items-center gap-2">
                    Complaint Category <span className="text-destructive">*</span>
                  </Label>
                  {getCategoryOptions().length > 0 ? (
                    <>
                      <select
                        id="complaintCategory"
                        value={complaintCategory}
                        onChange={(e) => {
                          setComplaintCategory(e.target.value);
                          if (e.target.value !== "Other") {
                            setCustomComplaintCategory("");
                          }
                        }}
                        disabled={submitting}
                        required
                        className="flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-primary/50"
                      >
                        <option value="" className="text-muted-foreground">Select complaint category...</option>
                        {getCategoryOptions().map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      {complaintCategory === "Other" && (
                        <div className="mt-2 animate-fade-in">
                          <Input
                            placeholder="Please specify your complaint category..."
                            value={customComplaintCategory}
                            onChange={(e) => setCustomComplaintCategory(e.target.value)}
                            disabled={submitting}
                            required
                            className="text-base h-12 rounded-lg border-2 focus-visible:border-primary transition-all duration-200"
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <Input
                      id="complaintCategory"
                      placeholder="Enter complaint category..."
                      value={complaintCategory}
                      onChange={(e) => setComplaintCategory(e.target.value)}
                      disabled={submitting}
                      required
                      className="text-base h-12 rounded-lg border-2 focus-visible:border-primary transition-all duration-200"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">
                    Your Complaint <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your complaint in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={submitting}
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">
                    Attachment (Optional)
                  </Label>
                  <div className="space-y-3">
                    <Input
                      id="file"
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                      disabled={submitting}
                      className="cursor-pointer"
                    />
                    {file && (
                      <div className="space-y-3 p-3 sm:p-4 bg-secondary/50 rounded-lg border border-border max-w-full overflow-hidden">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Upload className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="text-xs sm:text-sm flex-1 truncate font-medium">{file.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFile(null)}
                            disabled={submitting}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        {file.type.startsWith("image/") && (
                          <div className="relative w-full max-w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                            <img
                              src={URL.createObjectURL(file)}
                              alt="Preview"
                              className="block w-full h-auto object-contain max-w-full max-h-[180px] sm:max-h-[260px] md:max-h-[360px]"
                            />
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Max 5MB. Supported: Images (JPG, PNG, WEBP), PDF, DOC, DOCX
                    </p>
                  </div>
                </div>

                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> Your complaint will be submitted anonymously. 
                    You will receive a unique tracking token to check the status of your complaint.
                  </p>
                </div>

                <Button type="submit" disabled={submitting} className="w-full h-12 text-base bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {uploadProgress ? "Uploading..." : "Submitting..."}
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Submit Complaint
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          </div>

          <div className="animate-fade-in">
            <Card className="glass-card">
            <CardHeader>
              <CardTitle>Track Your Complaint</CardTitle>
              <CardDescription>
                Already submitted? Track your complaint status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/track")}
              >
                Track Complaint Status
              </Button>
            </CardContent>
          </Card>
          </div>
        </div>
      </main>

      <Dialog open={successDialog} onOpenChange={setSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complaint Submitted Successfully!</DialogTitle>
            <DialogDescription>
              Your complaint has been submitted. Save this tracking token to check the status later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-secondary p-4 rounded-lg">
              <p className="text-sm font-mono text-center text-lg font-semibold">
                {complaintToken}
              </p>
            </div>
            <Button onClick={copyToken} className="w-full">
              <Copy className="w-4 h-4 mr-2" />
              Copy Token
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              You can also track your complaint from your browser's history
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubmitComplaint;