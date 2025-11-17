import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar, TrendingUp, MessageSquare, Star, BarChart3, PieChart, Activity, ArrowLeft } from "lucide-react";
import AdminHeader from "@/components/AdminHeader";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, LineChart, Line } from "recharts";

interface Analytics {
  date: string;
  total_complaints: number;
  received_count: number;
  in_progress_count: number;
  resolved_count: number;
  rejected_count: number;
  avg_rating: number | null;
  total_feedbacks: number;
}

interface CategoryStats {
  category: string;
  count: number;
  received: number;
  under_review: number;
  solved: number;
  resolution_rate: number;
}

const COLORS = {
  received: "hsl(var(--primary))",
  in_progress: "hsl(var(--accent))",
  resolved: "hsl(var(--success))",
  rejected: "hsl(var(--destructive))",
};

const Analytics = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [box, setBox] = useState<any>(null);
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [timeRange, setTimeRange] = useState("week");
  const [totalComplaints, setTotalComplaints] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [totalFeedbacks, setTotalFeedbacks] = useState(0);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      } else {
        fetchBoxDetails();
        fetchAnalytics();
        fetchCategoryStats();
      }
    });
  }, [id, navigate, timeRange]);

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
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const { data: analyticsData, error } = await supabase
      .from("analytics")
      .select("*")
      .eq("box_id", id)
      .gte("date", startDate.toISOString().split("T")[0])
      .order("date", { ascending: true });

    if (error) {
      toast.error("Failed to load analytics");
      setLoading(false);
      return;
    }

    setAnalytics(analyticsData || []);

    // Calculate totals
    const total = analyticsData?.reduce((sum, a) => sum + a.total_complaints, 0) || 0;
    const totalFb = analyticsData?.reduce((sum, a) => sum + a.total_feedbacks, 0) || 0;
    const ratings = analyticsData?.filter(a => a.avg_rating !== null).map(a => a.avg_rating!) || [];
    const avgR = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;

    setTotalComplaints(total);
    setTotalFeedbacks(totalFb);
    setAvgRating(avgR);
    setLoading(false);
  };

  const fetchCategoryStats = async () => {
    const { data: complaints, error } = await supabase
      .from("complaints")
      .select("*")
      .eq("box_id", id);

    if (error) {
      console.error("Failed to load category stats:", error);
      return;
    }

    // Group by category and calculate stats
    const categoryMap = new Map<string, { count: number; received: number; under_review: number; solved: number }>();
    
    complaints?.forEach((complaint: any) => {
      const category = complaint.complaint_category || "Uncategorized";
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { count: 0, received: 0, under_review: 0, solved: 0 });
      }
      const stats = categoryMap.get(category)!;
      stats.count++;
      if (complaint.status === "received") stats.received++;
      else if (complaint.status === "under_review") stats.under_review++;
      else if (complaint.status === "solved") stats.solved++;
    });

    const statsArray: CategoryStats[] = Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      count: stats.count,
      received: stats.received,
      under_review: stats.under_review,
      solved: stats.solved,
      resolution_rate: stats.count > 0 ? Math.round((stats.solved / stats.count) * 100) : 0,
    })).sort((a, b) => b.count - a.count);

    setCategoryStats(statsArray);
  };

  const getStatusDistribution = () => {
    const latest = analytics[analytics.length - 1];
    if (!latest) return [];

    return [
      { name: "Received", value: latest.received_count, color: COLORS.received },
      { name: "In Progress", value: latest.in_progress_count, color: COLORS.in_progress },
      { name: "Resolved", value: latest.resolved_count, color: COLORS.resolved },
      { name: "Rejected", value: latest.rejected_count, color: COLORS.rejected },
    ].filter(item => item.value > 0);
  };

  const getTrendData = () => {
    return analytics.map(a => ({
      date: new Date(a.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      complaints: a.total_complaints,
      feedbacks: a.total_feedbacks,
      rating: a.avg_rating || 0,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <AdminHeader />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-10 w-32 rounded-xl" />
              <Skeleton className="h-12 w-64 rounded-xl" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-40 rounded-2xl" />
            </div>
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const statusData = getStatusDistribution();
  const trendData = getTrendData();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AdminHeader />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4 animate-fade-in">
            <Button
              variant="ghost"
              onClick={() => navigate(`/manage/${id}`)}
              className="mb-2 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Manage
            </Button>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold gradient-text">Analytics</h1>
                <p className="text-lg text-muted-foreground mt-2">{box?.title}</p>
              </div>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[200px] glass">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
            <Card className="glass-card hover:shadow-[var(--shadow-glow-primary)] transition-all duration-300 border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                      <MessageSquare className="w-4 h-4 text-primary" />
                    </div>
                    Total Complaints
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold gradient-text">{totalComplaints}</p>
                </CardContent>
              </Card>

            <Card className="glass-card hover:shadow-[var(--shadow-glow-accent)] transition-all duration-300 border-accent/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20">
                      <Star className="w-4 h-4 text-accent" />
                    </div>
                    Average Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold gradient-text">{avgRating.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground mt-2">out of 5.0</p>
                </CardContent>
              </Card>

            <Card className="glass-card hover:shadow-[var(--shadow-glow-primary)] transition-all duration-300 border-primary/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                      <TrendingUp className="w-4 h-4 text-primary" />
                    </div>
                    Total Feedbacks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold gradient-text">{totalFeedbacks}</p>
                </CardContent>
              </Card>

            <Card className="glass-card hover:shadow-[var(--shadow-glow-accent)] transition-all duration-300 border-accent/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20">
                      <Activity className="w-4 h-4 text-accent" />
                    </div>
                    Resolution Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold gradient-text">
                    {totalComplaints > 0
                      ? ((analytics[analytics.length - 1]?.resolved_count || 0) / totalComplaints * 100).toFixed(0)
                      : 0}%
                  </p>
                </CardContent>
              </Card>
          </div>

          {/* Charts */}
          <div className="animate-fade-in">
            <Tabs defaultValue="trends" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 glass">
                <TabsTrigger value="trends">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Trends</span>
                </TabsTrigger>
                <TabsTrigger value="status">
                  <PieChart className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Status</span>
                </TabsTrigger>
                <TabsTrigger value="categories">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Categories</span>
                </TabsTrigger>
                <TabsTrigger value="ratings">
                  <Star className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Ratings</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trends" className="space-y-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <BarChart3 className="w-6 h-6 text-primary" />
                      Complaints & Feedbacks Trend
                    </CardTitle>
                    <CardDescription>Track complaints and feedback submissions over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {trendData.length === 0 ? (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        No data available for selected period
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--background))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "12px",
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="complaints"
                            stroke="hsl(var(--primary))"
                            strokeWidth={3}
                            name="Complaints"
                          />
                          <Line
                            type="monotone"
                            dataKey="feedbacks"
                            stroke="hsl(var(--accent))"
                            strokeWidth={3}
                            name="Feedbacks"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="status" className="space-y-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <PieChart className="w-6 h-6 text-primary" />
                      Status Distribution
                    </CardTitle>
                    <CardDescription>Current breakdown of complaint statuses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {statusData.length === 0 ? (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        No complaints yet
                      </div>
                    ) : (
                      <div className="flex flex-col lg:flex-row items-center gap-8">
                        <ResponsiveContainer width="100%" height={350}>
                          <RechartsPie>
                            <Pie
                              data={statusData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={120}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "12px",
                              }}
                            />
                          </RechartsPie>
                        </ResponsiveContainer>
                        <div className="space-y-3">
                          {statusData.map((item) => (
                            <div key={item.name} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                              <div
                                className="w-5 h-5 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="font-medium">{item.name}</span>
                              <Badge variant="secondary" className="ml-auto">{item.value}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="categories" className="space-y-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <BarChart3 className="w-6 h-6 text-primary" />
                      Category Analysis
                    </CardTitle>
                    <CardDescription>Complaint distribution and resolution by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {categoryStats.length === 0 ? (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        No category data available
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={categoryStats}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis 
                              dataKey="category" 
                              stroke="hsl(var(--muted-foreground))"
                              angle={-45}
                              textAnchor="end"
                              height={100}
                              fontSize={12}
                            />
                            <YAxis stroke="hsl(var(--muted-foreground))" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px"
                              }}
                            />
                            <Legend />
                            <Bar dataKey="count" fill="hsl(var(--primary))" name="Total" />
                            <Bar dataKey="solved" fill="hsl(var(--success))" name="Solved" />
                          </BarChart>
                        </ResponsiveContainer>

                        <div className="grid gap-3">
                          {categoryStats.map((stat) => (
                            <div 
                              key={stat.category}
                              className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card/70 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-sm">{stat.category}</h4>
                                <Badge variant={stat.resolution_rate > 70 ? "default" : "secondary"}>
                                  {stat.resolution_rate}% Resolved
                                </Badge>
                              </div>
                              <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                                <div>
                                  <span className="font-medium text-foreground">{stat.count}</span> Total
                                </div>
                                <div>
                                  <span className="font-medium text-foreground">{stat.received}</span> Received
                                </div>
                                <div>
                                  <span className="font-medium text-foreground">{stat.under_review}</span> In Progress
                                </div>
                                <div>
                                  <span className="font-medium text-foreground">{stat.solved}</span> Solved
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ratings" className="space-y-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Star className="w-6 h-6 text-primary" />
                      Rating Trends
                    </CardTitle>
                    <CardDescription>Average ratings over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {trendData.length === 0 ? (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        No ratings available for selected period
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                          <YAxis domain={[0, 5]} stroke="hsl(var(--muted-foreground))" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--background))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "12px",
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="rating"
                            stroke="hsl(var(--accent))"
                            strokeWidth={3}
                            name="Average Rating"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Analytics;
