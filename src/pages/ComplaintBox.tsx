import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Copy, Calendar, MessageSquare, Send, Upload, X, Star, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import FrontendHeader from "@/components/FrontendHeader";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { getComplaintCategories } from "@/utils/categoryMapping";

const ComplaintBox = () => {
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
  const [yourComplaints, setYourComplaints] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [trackToken, setTrackToken] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [complaintCategory, setComplaintCategory] = useState("");
  const [customComplaintCategory, setCustomComplaintCategory] = useState("");

  useEffect(() => {
    fetchBox();
  }, [token]);

  useEffect(() => {
    if (authenticated && box) {
      fetchFeedbacks();
      fetchYourComplaints();
    }
  }, [authenticated, box]);

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

  const fetchYourComplaints = async () => {
    const storedComplaints = JSON.parse(localStorage.getItem("myComplaints") || "[]");
    const boxComplaints = storedComplaints.filter((c: any) => c.boxId === box.id);
    
    if (boxComplaints.length === 0) {
      setYourComplaints([]);
      return;
    }

    const tokens = boxComplaints.map((c: any) => c.token);
    const { data, error } = await supabase
      .from("complaints")
      .select("title, status, token, created_at")
      .in("token", tokens)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setYourComplaints(data);
    }
  };

  const fetchFeedbacks = async () => {
    const { data, error } = await supabase
      .from("feedbacks")
      .select("*")
      .eq("box_id", box.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      setFeedbacks(data);
    }
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

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      e.target.value = "";
      return;
    }

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

      const storedComplaints = JSON.parse(
        localStorage.getItem("myComplaints") || "[]"
      );
      storedComplaints.push({ token: newToken, boxId: box.id });
      localStorage.setItem("myComplaints", JSON.stringify(storedComplaints));

      setComplaintToken(newToken);
      setSuccessDialog(true);
      setTitle("");
      setMessage("");
      setFile(null);
      setComplaintCategory("");
      setCustomComplaintCategory("");
      fetchYourComplaints();
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

  const handleTrack = () => {
    if (trackToken.trim()) {
      navigate(`/track?token=${trackToken}`);
    } else {
      toast.error("Please enter a tracking token");
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();

    if (feedbackRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setSubmittingFeedback(true);

    try {
      const { error } = await supabase
        .from("feedbacks")
        .insert([{
          box_id: box.id,
          rating: feedbackRating,
          message: feedbackMessage.trim() || null,
        }]);

      if (error) {
        toast.error("Failed to submit feedback");
        return;
      }

      toast.success("Feedback submitted successfully!");
      setFeedbackRating(0);
      setFeedbackMessage("");
      fetchFeedbacks();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (passwordRequired && !authenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <FrontendHeader />
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="glass-card border-primary/30 shadow-[var(--shadow-strong)]">
              <CardHeader>
                <CardTitle className="gradient-text text-2xl">Password Required</CardTitle>
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
                      className="bg-background/50"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    Submit
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <FrontendHeader />
      
      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Box Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass-card border-primary/30 shadow-[var(--shadow-strong)]">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-2xl sm:text-3xl lg:text-4xl mb-2 break-words gradient-text">
                      {box.title}
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base break-words">
                      {box.description || "Submit your complaint anonymously"}
                    </CardDescription>
                  </div>
                  <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex-shrink-0">
                    <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Created {new Date(box.created_at).toLocaleDateString()}</span>
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Submit Complaint (Desktop & Mobile) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Submit Complaint */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="glass-card border-primary/20 shadow-[var(--shadow-medium)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl gradient-text">
                      <Send className="h-5 w-5 sm:h-6 sm:w-6" />
                      Submit Your Complaint
                    </CardTitle>
                    <CardDescription>Your identity will remain anonymous</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitComplaint} className="space-y-5">
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
                          className="text-sm sm:text-base bg-background/50"
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
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2"
                              >
                                <Input
                                  placeholder="Please specify your complaint category..."
                                  value={customComplaintCategory}
                                  onChange={(e) => setCustomComplaintCategory(e.target.value)}
                                  disabled={submitting}
                                  required
                                  className="text-base h-12 rounded-lg border-2 focus-visible:border-primary transition-all duration-200"
                                />
                              </motion.div>
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
                          className="text-sm sm:text-base resize-none bg-background/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="file">Attachment (Optional)</Label>
                        <div className="space-y-3">
                          <Input
                            id="file"
                            type="file"
                            accept="image/*,.pdf,.doc,.docx"
                            onChange={handleFileChange}
                            disabled={submitting}
                            className="cursor-pointer text-sm bg-background/50"
                          />
                          {file && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="space-y-3 p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/20"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <Upload className="w-4 h-4 text-primary flex-shrink-0" />
                                  <span className="text-sm flex-1 truncate font-medium">{file.name}</span>
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
                                <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt="Preview"
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(2)} KB
                              </p>
                            </motion.div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Max 5MB. Supported: Images, PDF, DOC, DOCX
                          </p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-4 rounded-lg border border-primary/10">
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          <strong>Note:</strong> Your complaint will be submitted anonymously. 
                          You will receive a unique tracking token to check the status of your complaint.
                        </p>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={submitting} 
                        className="w-full h-12 text-base bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      >
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
              </motion.div>
            </div>

            {/* Right Column - Track, Your Complaints, Share Feedback, Recent Feedbacks (Desktop only) */}
            <div className="hidden lg:block lg:col-span-1 space-y-6">
              {/* Track Complaint */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="glass-card border-accent/20 shadow-[var(--shadow-medium)]">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Track Complaint
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Enter tracking token
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-col gap-2">
                      <Input
                        placeholder="CPL-XXXXXXXXXX"
                        value={trackToken}
                        onChange={(e) => setTrackToken(e.target.value)}
                        className="text-sm bg-background/50"
                      />
                      <Button onClick={handleTrack} className="w-full bg-gradient-to-r from-accent to-primary hover:opacity-90">
                        Track
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Your Complaints */}
              {yourComplaints.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card className="glass-card shadow-[var(--shadow-medium)]">
                    <CardHeader>
                      <CardTitle className="text-lg">Your Complaints</CardTitle>
                      <CardDescription className="text-xs">
                        From this box
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {yourComplaints.map((complaint, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <div className="space-y-2 p-3 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
                              <p className="text-sm font-medium line-clamp-1 break-words">
                                {complaint.title}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <Badge variant="outline" className="text-xs">
                                  {complaint.status.replace("_", " ")}
                                </Badge>
                              </div>
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs"
                                onClick={() => navigate(`/track?token=${complaint.token}`)}
                              >
                                Track →
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Share Feedback */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="glass-card border-accent/30 shadow-[var(--shadow-medium)]">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 gradient-text">
                      <Star className="w-5 h-5 fill-primary text-primary" />
                      Share Feedback
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Rate this complaint box
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitFeedback} className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Rating *</Label>
                        <div className="flex gap-1 justify-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setFeedbackRating(star)}
                              className="transition-all hover:scale-110"
                            >
                              <Star
                                className={`w-7 h-7 ${
                                  star <= feedbackRating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="feedback-message" className="text-sm">
                          Message (Optional)
                        </Label>
                        <Textarea
                          id="feedback-message"
                          placeholder="Share your thoughts..."
                          value={feedbackMessage}
                          onChange={(e) => setFeedbackMessage(e.target.value)}
                          disabled={submittingFeedback}
                          rows={2}
                          className="text-sm resize-none bg-background/50"
                        />
                      </div>

                      <Button 
                        type="submit" 
                        disabled={submittingFeedback || feedbackRating === 0} 
                        className="w-full bg-gradient-to-r from-accent to-primary hover:opacity-90"
                      >
                        {submittingFeedback ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Feedbacks */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card className="glass-card shadow-[var(--shadow-medium)]">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Star className="w-5 h-5 fill-accent text-accent" />
                      Recent Feedbacks
                    </CardTitle>
                    <CardDescription className="text-xs">
                      What others say
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {feedbacks.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        No feedbacks yet
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {feedbacks.map((feedback, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <div className="space-y-2 p-3 rounded-lg bg-gradient-to-br from-accent/5 to-primary/5 border border-accent/10">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-3 h-3 ${
                                      star <= feedback.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                ))}
                              </div>
                              {feedback.message && (
                                <p className="text-xs text-muted-foreground line-clamp-2 break-words">
                                  {feedback.message}
                                </p>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {new Date(feedback.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {index < feedbacks.length - 1 && (
                              <Separator className="my-2" />
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Mobile sections - Track, Your Complaints, Share Feedback, Recent Feedbacks */}
            <div className="lg:hidden space-y-6">
              {/* Track Complaint - Mobile */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="glass-card border-accent/20 shadow-[var(--shadow-medium)]">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Track Your Complaint
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Enter your tracking token to check complaint status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="CPL-XXXXXXXXXX"
                        value={trackToken}
                        onChange={(e) => setTrackToken(e.target.value)}
                        className="text-sm sm:text-base bg-background/50"
                      />
                      <Button onClick={handleTrack} className="whitespace-nowrap bg-gradient-to-r from-accent to-primary hover:opacity-90">
                        Track
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Your Complaints - Mobile */}
              {yourComplaints.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card className="glass-card shadow-[var(--shadow-medium)]">
                    <CardHeader>
                      <CardTitle className="text-lg sm:text-xl">Your Complaints</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Complaints you submitted to this box
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {yourComplaints.map((complaint, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <div className="space-y-2 p-3 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
                              <p className="text-sm font-medium line-clamp-2 break-words">
                                {complaint.title}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <Badge variant="outline" className="text-xs">
                                  {complaint.status.replace("_", " ")}
                                </Badge>
                                <span>
                                  {new Date(complaint.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs"
                                onClick={() => navigate(`/track?token=${complaint.token}`)}
                              >
                                Track Status →
                              </Button>
                            </div>
                            {index < yourComplaints.length - 1 && (
                              <Separator className="my-3" />
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Submit Feedback - Mobile */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="glass-card border-accent/30 shadow-[var(--shadow-medium)]">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2 gradient-text">
                      <Star className="w-5 h-5 fill-primary text-primary" />
                      Share Your Feedback
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Rate your experience with this complaint box
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitFeedback} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Rating <span className="text-destructive">*</span></Label>
                        <div className="flex gap-2 justify-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setFeedbackRating(star)}
                              className="transition-all hover:scale-110"
                            >
                              <Star
                                className={`w-8 h-8 sm:w-10 sm:h-10 ${
                                  star <= feedbackRating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="feedback-message-mobile">
                          Message (Optional)
                        </Label>
                        <Textarea
                          id="feedback-message-mobile"
                          placeholder="Share your thoughts..."
                          value={feedbackMessage}
                          onChange={(e) => setFeedbackMessage(e.target.value)}
                          disabled={submittingFeedback}
                          rows={3}
                          className="text-sm sm:text-base resize-none bg-background/50"
                        />
                      </div>

                      <Button 
                        type="submit" 
                        disabled={submittingFeedback || feedbackRating === 0} 
                        className="w-full bg-gradient-to-r from-accent to-primary hover:opacity-90"
                      >
                        {submittingFeedback ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Feedback"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Feedbacks - Mobile */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card className="glass-card shadow-[var(--shadow-medium)]">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                      <Star className="w-5 h-5 fill-accent text-accent" />
                      Recent Feedbacks
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      What others are saying
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {feedbacks.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No feedbacks yet
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {feedbacks.map((feedback, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <div className="space-y-2 p-3 rounded-lg bg-gradient-to-br from-accent/5 to-primary/5 border border-accent/10">
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-3 h-3 ${
                                      star <= feedback.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                ))}
                              </div>
                              {feedback.message && (
                                <p className="text-sm text-muted-foreground line-clamp-3 break-words">
                                  {feedback.message}
                                </p>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {new Date(feedback.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {index < feedbacks.length - 1 && (
                              <Separator className="my-3" />
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <Dialog open={successDialog} onOpenChange={setSuccessDialog}>
        <DialogContent className="sm:max-w-md glass-card border-primary/30">
          <DialogHeader>
            <DialogTitle className="gradient-text text-xl">Complaint Submitted Successfully!</DialogTitle>
            <DialogDescription>
              Your complaint has been submitted. Save this tracking token to check the status later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-4 rounded-lg border border-primary/20">
              <p className="text-sm font-mono text-center text-base sm:text-lg font-semibold break-all gradient-text">
                {complaintToken}
              </p>
            </div>
            <Button onClick={copyToken} className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
              <Copy className="w-4 h-4 mr-2" />
              Copy Token
            </Button>
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              You can also track your complaint from your browser's history
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComplaintBox;
