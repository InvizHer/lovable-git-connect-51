import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Search, Calendar, MessageSquare, Download, FileText, Image as ImageIcon, CheckCircle2, Reply, Trash2, HelpCircle, ChevronDown } from "lucide-react";
import FrontendHeader from "@/components/FrontendHeader";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Complaint {
  id: string;
  title: string;
  message: string;
  status: string;
  token: string;
  created_at: string;
  updated_at: string;
  admin_reply: string | null;
  replied_at: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
}

interface StoredComplaint {
  token: string;
  title: string;
}

const TrackComplaint = () => {
  const location = useLocation();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [myComplaints, setMyComplaints] = useState<StoredComplaint[]>([]);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  useEffect(() => {
    // Load complaints from localStorage
    const stored = JSON.parse(localStorage.getItem("myComplaints") || "[]");
    setMyComplaints(stored.map((c: any) => ({ token: c.token, title: c.title || c.token })));

    // Check URL params for token
    const params = new URLSearchParams(location.search);
    const urlToken = params.get("token");
    if (urlToken) {
      setToken(urlToken);
      loadComplaint(urlToken);
    }
  }, [location]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error("Please enter a tracking token");
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("token", token.toUpperCase())
        .single();

      if (error || !data) {
        toast.error("Complaint not found");
        setComplaint(null);
        return;
      }

      setComplaint(data);
    } catch (error: any) {
      toast.error("An error occurred while searching");
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  const loadComplaint = async (complaintToken: string) => {
    setToken(complaintToken);
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("token", complaintToken)
        .single();

      if (error || !data) {
        toast.error("Complaint not found");
        setComplaint(null);
        return;
      }

      setComplaint(data);
    } catch (error: any) {
      toast.error("An error occurred while loading complaint");
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem("myComplaints");
    setMyComplaints([]);
    setClearDialogOpen(false);
    toast.success("Complaint history cleared");
  };

  const handleDeleteSingleComplaint = (tokenToDelete: string) => {
    const stored = JSON.parse(localStorage.getItem("myComplaints") || "[]");
    const updated = stored.filter((c: any) => c.token !== tokenToDelete);
    localStorage.setItem("myComplaints", JSON.stringify(updated));
    setMyComplaints(updated.map((c: any) => ({ token: c.token, title: c.title || c.token })));
    toast.success("Complaint removed from history");
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

  const faqs = [
    {
      question: "How do I track my complaint?",
      answer: "Enter your unique tracking token (e.g., CPL-XXXXXXXXXX) in the search box above and click 'Search'. You'll receive this token when you submit a complaint."
    },
    {
      question: "Where can I find my tracking token?",
      answer: "Your tracking token is displayed immediately after submitting a complaint. It's also stored in your browser if you submitted from this device - check 'Your Recent Complaints' section."
    },
    {
      question: "What do the different statuses mean?",
      answer: "'Received' means your complaint has been submitted successfully. 'Under Review' indicates it's being processed by the administrator. 'Solved' means the issue has been resolved."
    },
    {
      question: "Can I submit additional information after filing a complaint?",
      answer: "Currently, you cannot add information to an existing complaint. If needed, submit a new complaint referencing your previous token."
    },
    {
      question: "How long does it take to get a response?",
      answer: "Response times vary depending on the organization managing the complaint box. Check back regularly using your tracking token for updates."
    },
    {
      question: "Is my complaint really anonymous?",
      answer: "Yes! No personal information is collected when you submit a complaint. Your identity remains completely anonymous to the administrators."
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <FrontendHeader />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <FrontendHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl sm:text-5xl font-bold gradient-text">Track Your Complaint</h1>
            <p className="text-lg text-muted-foreground">
              Enter your tracking token to check the status of your complaint
            </p>
          </div>

          {/* Search Card */}
          <Card className="glass-card border-primary/30 shadow-[var(--shadow-strong)]">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Search className="w-6 h-6 text-primary" />
                  Search by Token
                </CardTitle>
                <CardDescription>
                  Your unique tracking identifier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-5">
                  <div className="space-y-3">
                    <Label htmlFor="token" className="text-base">Tracking Token</Label>
                    <div className="flex gap-3">
                      <Input
                        id="token"
                        placeholder="CPL-XXXXXXXXXX"
                        value={token}
                        onChange={(e) => setToken(e.target.value.toUpperCase())}
                        disabled={loading}
                        className="text-base h-12 font-mono"
                      />
                      <Button 
                        type="submit" 
                        disabled={loading} 
                        className="whitespace-nowrap h-12 px-6 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                      >
                        {loading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <Search className="w-5 h-5 sm:mr-2" />
                            <span className="hidden sm:inline">Search</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

          {myComplaints.length > 0 && !complaint && (
            <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        Your Recent Complaints
                      </CardTitle>
                      <CardDescription>
                        Complaints submitted from this browser
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setClearDialogOpen(true)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {myComplaints.map((storedComplaint, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 group"
                    >
                      <Button
                        variant="outline"
                        className="flex-1 justify-start h-auto py-3 px-4 hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10"
                        onClick={() => loadComplaint(storedComplaint.token)}
                      >
                        <div className="flex flex-col items-start gap-1 text-left min-w-0">
                          <span className="font-medium text-sm truncate w-full">
                            {storedComplaint.title}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {storedComplaint.token}
                          </span>
                        </div>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSingleComplaint(storedComplaint.token)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
          )}

          {complaint && (
            <Card className="glass-card border-2 border-primary/50 shadow-[var(--shadow-glow-primary)]">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="space-y-3 flex-1 min-w-0">
                      <CardTitle className="text-2xl sm:text-3xl break-words gradient-text">{complaint.title}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                        <span className="break-all font-mono">Token: {complaint.token}</span>
                      </div>
                    </div>
                    <div className={`self-start text-base px-4 py-2 rounded-full border font-semibold ${getStatusColor(complaint.status)}`}>
                      {getStatusLabel(complaint.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-5 rounded-xl border border-primary/10">
                    <h4 className="font-semibold mb-3 text-base flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      Your Complaint:
                    </h4>
                    <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{complaint.message}</p>
                  </div>

                  {complaint.admin_reply && (
                    <div className="bg-gradient-to-br from-accent/10 to-primary/10 p-5 rounded-xl border-2 border-accent/30">
                      <h4 className="font-semibold mb-3 text-base flex items-center gap-2 text-accent">
                        <Reply className="w-4 h-4" />
                        Admin Reply:
                      </h4>
                      <p className="text-sm whitespace-pre-wrap break-words mb-3 leading-relaxed">{complaint.admin_reply}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Replied on {new Date(complaint.replied_at!).toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {complaint.attachment_url && (
                    <div className="bg-secondary/30 p-5 rounded-xl border border-border">
                      <h4 className="font-semibold mb-3 text-base">Attachment:</h4>
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {complaint.attachment_type?.startsWith("image/") ? (
                            <div className="p-2 rounded-lg bg-primary/10">
                              <ImageIcon className="w-5 h-5 text-primary flex-shrink-0" />
                            </div>
                          ) : (
                            <div className="p-2 rounded-lg bg-accent/10">
                              <FileText className="w-5 h-5 text-accent flex-shrink-0" />
                            </div>
                          )}
                          <span className="text-sm font-medium truncate">{complaint.attachment_name}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(complaint.attachment_url!, "_blank")}
                          className="gap-2"
                        >
                          <Download className="w-4 h-4" />
                          <span className="hidden sm:inline">Download</span>
                        </Button>
                      </div>
                      {complaint.attachment_type?.startsWith("image/") && (
                        <div className="rounded-xl overflow-hidden border border-border">
                          <img
                            src={complaint.attachment_url}
                            alt="Attachment"
                            className="w-full h-auto object-contain max-h-96"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div className="bg-secondary/50 p-4 rounded-xl">
                      <span className="text-muted-foreground block mb-2 text-xs">Submitted:</span>
                      <p className="font-medium">
                        {new Date(complaint.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-secondary/50 p-4 rounded-xl">
                      <span className="text-muted-foreground block mb-2 text-xs">Last Updated:</span>
                      <p className="font-medium">
                        {new Date(complaint.updated_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {complaint.status === "solved" && (
                    <div className="bg-gradient-to-r from-green-500/10 to-green-500/5 p-5 rounded-xl border-2 border-green-500/30">
                      <p className="text-sm flex items-center gap-2 text-green-500 font-medium">
                        <CheckCircle2 className="w-5 h-5" />
                        Your complaint has been resolved
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
          )}

          {/* FAQ Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>
                Quick answers to common questions about tracking complaints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-border/50">
                    <AccordionTrigger className="text-left hover:no-underline hover:text-primary text-sm sm:text-base">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />

      {/* Clear History Dialog */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent className="glass-card border-destructive/30">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Complaint History?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all saved complaint tokens from this browser. You will need to manually enter your tokens to track complaints in the future.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearHistory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TrackComplaint;