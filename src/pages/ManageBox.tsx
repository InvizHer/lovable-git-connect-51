import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Loader2, Copy, Trash2, Search, Filter, Eye, Reply, 
  Calendar, MessageSquare, Download, FileText, Image as ImageIcon, 
  BarChart3, Edit, Save, X, ArrowUpDown, QrCode, MessageCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import AdminHeader from "@/components/AdminHeader";
import Footer from "@/components/Footer";
import { QRCodeSection } from "@/components/QRCodeSection";
import { StatusUpdateDialog } from "@/components/StatusUpdateDialog";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Complaint {
  id: string;
  title: string;
  message: string;
  complaint_category?: string;
  status: string;
  token: string;
  created_at: string;
  admin_reply: string | null;
  replied_at: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
}

const ManageBox = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [box, setBox] = useState<any>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  
  // Edit box state
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editCustomCategory, setEditCustomCategory] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  
  // QR Code modal state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  
  // Status update dialog state
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [complaintToUpdate, setComplaintToUpdate] = useState<Complaint | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      } else {
        fetchBoxDetails();
        fetchComplaints();
      }
    });
  }, [id, navigate]);

  useEffect(() => {
    filterComplaints();
  }, [complaints, searchQuery, statusFilter, sortBy]);

  const filterComplaints = () => {
    let filtered = [...complaints];

    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.token.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    setFilteredComplaints(filtered);
  };

  const fetchBoxDetails = async () => {
    const { data, error } = await supabase
      .from("complaint_boxes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Failed to load complaint box");
      navigate("/dashboard");
      return;
    }

    setBox(data);
    setEditTitle(data.title);
    setEditDescription(data.description || "");
    setEditCategory((data as any).category || "");
    setEditCustomCategory("");
    setLoading(false);
  };

  const fetchComplaints = async () => {
    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .eq("box_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load complaints");
      return;
    }

    setComplaints(data || []);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!editCategory) {
      toast.error("Category is required");
      return;
    }

    const finalCategory = editCategory === "Other" ? editCustomCategory.trim() : editCategory;

    if (editCategory === "Other" && !editCustomCategory.trim()) {
      toast.error("Please enter a custom category");
      return;
    }

    setSavingEdit(true);

    const { error } = await supabase
      .from("complaint_boxes")
      .update({ 
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        category: finalCategory
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update complaint box");
      setSavingEdit(false);
      return;
    }

    toast.success("Complaint box updated successfully");
    setBox({ ...box, title: editTitle.trim(), description: editDescription.trim(), category: finalCategory });
    setEditMode(false);
    setSavingEdit(false);
  };

  const handleStatusUpdate = async (complaintId: string, newStatus: string, note?: string) => {
    const { error } = await supabase
      .from("complaints")
      .update({ status: newStatus })
      .eq("id", complaintId);

    if (error) {
      toast.error("Failed to update status");
      return;
    }

    toast.success("Status updated successfully");
    fetchComplaints();
  };

  const handleOpenStatusDialog = (complaint: Complaint) => {
    setComplaintToUpdate(complaint);
    setStatusDialogOpen(true);
  };

  const handleDeleteComplaint = async () => {
    if (!complaintToDelete) return;

    const { error } = await supabase
      .from("complaints")
      .delete()
      .eq("id", complaintToDelete);

    if (error) {
      toast.error("Failed to delete complaint");
      return;
    }

    toast.success("Complaint deleted successfully");
    setDeleteDialogOpen(false);
    setComplaintToDelete(null);
    fetchComplaints();
  };

  const handleViewComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setViewDialogOpen(true);
  };

  const handleReplyClick = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setReplyText(complaint.admin_reply || "");
    setReplyDialogOpen(true);
  };

  const handleSubmitReply = async () => {
    if (!selectedComplaint || !replyText.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    setSubmittingReply(true);

    const { error } = await supabase
      .from("complaints")
      .update({ 
        admin_reply: replyText,
        replied_at: new Date().toISOString()
      })
      .eq("id", selectedComplaint.id);

    if (error) {
      toast.error("Failed to submit reply");
      setSubmittingReply(false);
      return;
    }

    toast.success("Reply submitted successfully");
    setReplyDialogOpen(false);
    setSubmittingReply(false);
    setReplyText("");
    fetchComplaints();
  };

  const copyLink = () => {
    const link = `${window.location.origin}/complaint/${box.token}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received":
        return "bg-blue-500/10 text-blue-500 border-blue-500/30";
      case "under_review":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
      case "solved":
        return "bg-green-500/10 text-green-500 border-green-500/30";
      default:
        return "bg-secondary text-secondary-foreground border-secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "received":
        return "Received";
      case "under_review":
        return "Under Review";
      case "solved":
        return "Solved";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <AdminHeader />
        <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <AdminHeader />

      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Box Details with Icon */}
          <div className="animate-fade-in">
            <Card className="glass-card border-primary/30 shadow-[var(--shadow-strong)]">
              <CardHeader>
                {!editMode ? (
                  <>
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
                        <MessageCircle className="w-8 h-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl sm:text-3xl gradient-text mb-2">
                          {box.title}
                        </CardTitle>
                        <CardDescription className="text-base sm:text-md">
                          {box.description || "Submit your complaint anonymously"}
                        </CardDescription>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    <div className="space-y-2">
                      <Label htmlFor="edit-title">Title</Label>
                      <Input
                        id="edit-title"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="text-xl sm:text-2xl font-bold bg-background/50"
                        disabled={savingEdit}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="bg-background/50 resize-none"
                        rows={3}
                        disabled={savingEdit}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-category">Category</Label>
                      <select
                        id="edit-category"
                        value={editCategory}
                        onChange={(e) => {
                          setEditCategory(e.target.value);
                          if (e.target.value !== "Other") {
                            setEditCustomCategory("");
                          }
                        }}
                        disabled={savingEdit}
                        className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select a category</option>
                        <optgroup label="Education">
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
                        <optgroup label="Corporate / Office">
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
                        <optgroup label="Hostel / PG">
                          <option value="Warden">Warden</option>
                          <option value="Mess">Mess</option>
                          <option value="Security">Security</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Electricity / Water">Electricity / Water</option>
                          <option value="Cleanliness">Cleanliness</option>
                          <option value="Room Issues">Room Issues</option>
                        </optgroup>
                        <optgroup label="Other">
                          <option value="Other">Other (Custom)</option>
                        </optgroup>
                      </select>
                    </div>
                    {editCategory === "Other" && (
                      <div 
                        className="space-y-2 animate-fade-in"
                      >
                        <Label htmlFor="edit-custom-category">Custom Category</Label>
                        <Input
                          id="edit-custom-category"
                          placeholder="Enter your custom category"
                          value={editCustomCategory}
                          onChange={(e) => setEditCustomCategory(e.target.value)}
                          className="bg-background/50"
                          disabled={savingEdit}
                        />
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={handleSaveEdit} 
                        disabled={savingEdit}
                        className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      >
                        {savingEdit ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setEditMode(false);
                          setEditTitle(box.title);
                          setEditDescription(box.description || "");
                          setEditCategory(box.category || "");
                          setEditCustomCategory("");
                        }}
                        disabled={savingEdit}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Desktop Actions */}
                <div className="hidden sm:flex flex-wrap gap-3">
                  {!editMode && (
                    <Button 
                      onClick={() => setEditMode(true)}
                      variant="outline"
                      className="border-primary/30 hover:bg-primary/10"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  <Button onClick={copyLink} className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/analytics/${id}`)}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setQrModalOpen(true)}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    QR Code
                  </Button>
                </div>

                {/* Mobile Actions */}
                <div className="sm:hidden grid grid-cols-2 gap-3">
                  {!editMode && (
                    <Button 
                      onClick={() => setEditMode(true)}
                      variant="outline"
                      className="border-primary/30 hover:bg-primary/10"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  <Button onClick={copyLink} className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/analytics/${id}`)}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Stats
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setQrModalOpen(true)}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    QR Code
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground bg-gradient-to-br from-primary/5 to-accent/5 p-4 rounded-xl border border-primary/10">
                  💡 Share this link with users to allow them to submit complaints anonymously
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search, Filter, and Sort */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl gradient-text">
                  Complaints ({filteredComplaints.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title, message, or token..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-background/50"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[180px] bg-background/50">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="received">Received</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="solved">Solved</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="w-full sm:w-[160px] bg-background/50">
                        <ArrowUpDown className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Complaints List */}
          {filteredComplaints.length === 0 ? (
            <Card className="glass-card animate-fade-in">
                <CardContent className="py-16 text-center">
                  <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-lg text-muted-foreground">
                    {complaints.length === 0
                      ? "No complaints submitted yet"
                      : "No complaints match your search"}
                  </p>
                </CardContent>
              </Card>
          ) : (
            <div className="space-y-4 animate-fade-in">
              {filteredComplaints.map((complaint) => (
                <Card key={complaint.id} className="glass-card border-primary/20 hover:shadow-[var(--shadow-strong)] hover:border-primary/40 transition-all duration-300">
                    <CardHeader>
                      <div className="flex flex-row sm:flex-row justify-between gap-3">
                        <div className="space-y-2 flex-1 min-w-0">
                          <CardTitle className="text-lg sm:text-xl break-words">{complaint.title}</CardTitle>
                          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>{new Date(complaint.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className={`self-start px-4 py-2 rounded-full border text-sm font-semibold ${getStatusColor(complaint.status)}`}>
                          {getStatusLabel(complaint.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm line-clamp-2 text-muted-foreground break-words">
                        {complaint.message}
                      </p>
                      
                      {complaint.admin_reply && (
                        <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-3 rounded-lg border border-primary/10 space-y-1">
                          <p className="text-xs font-semibold text-primary">Admin Reply:</p>
                          <p className="text-sm break-words">{complaint.admin_reply}</p>
                          <p className="text-xs text-muted-foreground">
                            Replied on {new Date(complaint.replied_at!).toLocaleString()}
                          </p>
                        </div>
                      )}

                      {/* Desktop Actions */}
                      <div className="hidden sm:flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewComplaint(complaint)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Full
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenStatusDialog(complaint)}
                        >
                          Update Status
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleReplyClick(complaint)}
                        >
                          <Reply className="w-4 h-4 mr-2" />
                          Reply
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setComplaintToDelete(complaint.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>

                      {/* Mobile Actions */}
                      <div className="sm:hidden space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewComplaint(complaint)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleReplyClick(complaint)}
                          >
                            <Reply className="w-4 h-4 mr-2" />
                            Reply
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-primary/30 hover:bg-primary/10 w-full"
                          onClick={() => handleOpenStatusDialog(complaint)}
                        >
                          Update Status
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setComplaintToDelete(complaint.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>

                      <div className="text-xs text-muted-foreground break-all pt-2 border-t">
                        Token: {complaint.token}
                      </div>
                    </CardContent>
                  </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* View Complaint Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto glass-card border-primary/30 p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl break-words gradient-text">
              {selectedComplaint?.title}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Submitted on {selectedComplaint && new Date(selectedComplaint.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold">Category:</Label>
              <div className="mt-1">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm">
                  {selectedComplaint?.complaint_category}
                </span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold">Complaint Message:</Label>
              <div className="mt-2 p-4 bg-secondary/50 rounded-lg border border-border">
                <p className="text-sm whitespace-pre-wrap break-words">{selectedComplaint?.message}</p>
              </div>
            </div>
            
            {selectedComplaint?.admin_reply && (
              <div>
                <Label className="text-sm font-semibold text-primary">Admin Reply:</Label>
                <div className="mt-2 p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                  <p className="text-sm whitespace-pre-wrap break-words">{selectedComplaint.admin_reply}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Replied on {new Date(selectedComplaint.replied_at!).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {selectedComplaint?.attachment_url && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Attachment:</Label>
                <div className="p-3 sm:p-4 bg-secondary/50 rounded-lg border border-border space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {selectedComplaint.attachment_type?.startsWith("image/") ? (
                        <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                      )}
                      <span className="text-xs sm:text-sm font-medium truncate">{selectedComplaint.attachment_name}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(selectedComplaint.attachment_url!, "_blank")}
                      className="w-full sm:w-auto"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  {selectedComplaint.attachment_type?.startsWith("image/") && (
                    <div className="relative w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                      <img
                        src={selectedComplaint.attachment_url}
                        alt="Attachment Preview"
                        className="w-full h-auto object-contain max-w-full max-h-[250px] sm:max-h-[350px] md:max-h-96"
                        onError={(e) => {
                          console.error("Failed to load image:", selectedComplaint.attachment_url);
                          e.currentTarget.style.display = "none";
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="text-destructive text-sm p-4">Failed to load image preview</div>';
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground break-all">
                <strong>Token:</strong> {selectedComplaint?.token}
              </p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                <strong>Status:</strong> 
                <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor(selectedComplaint?.status || "")}`}>
                  {getStatusLabel(selectedComplaint?.status || "")}
                </span>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="max-w-2xl glass-card border-primary/30">
          <DialogHeader>
            <DialogTitle className="break-words gradient-text">Reply to Complaint</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm break-words">
              {selectedComplaint?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reply">Your Reply</Label>
              <Textarea
                id="reply"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
                rows={6}
                className="mt-2 resize-none bg-background/50"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setReplyDialogOpen(false)} disabled={submittingReply}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitReply} 
                disabled={submittingReply}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                {submittingReply ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Reply"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="glass-card border-destructive/30">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the complaint.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteComplaint}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* QR Code Dialog */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md glass-card border-primary/30">
          <DialogHeader>
            <DialogTitle className="gradient-text">Complaint Box QR Code</DialogTitle>
            <DialogDescription>
              Scan to submit complaints
            </DialogDescription>
          </DialogHeader>
          <QRCodeSection boxToken={box?.token || ""} boxTitle={box?.title || ""} />
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      {complaintToUpdate && (
        <StatusUpdateDialog
          open={statusDialogOpen}
          onOpenChange={setStatusDialogOpen}
          currentStatus={complaintToUpdate.status}
          complaintTitle={complaintToUpdate.title}
          onStatusUpdate={(newStatus, note) => 
            handleStatusUpdate(complaintToUpdate.id, newStatus, note)
          }
        />
      )}
    </div>
  );
};

export default ManageBox;
