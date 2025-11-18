import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, MessageSquare, TrendingUp, Lock, Sparkles, Zap, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FrontendHeader from "@/components/FrontendHeader";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Anonymous & Secure",
      description: "Submit complaints anonymously with complete privacy and security.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: MessageSquare,
      title: "Easy Communication",
      description: "Simple interface for both administrators and users to communicate effectively.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: TrendingUp,
      title: "Track Status",
      description: "Monitor complaint status in real-time with unique tracking tokens.",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Lock,
      title: "Protected Access",
      description: "Optional password protection for complaint boxes ensures controlled access.",
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead 
        title="Anonymous Feedback Platform"
        description="A modern, secure platform for anonymous feedback and complaint management in educational institutions and organizations. Submit and track complaints anonymously."
        keywords="complaint management, anonymous feedback, educational institutions, feedback system, secure complaints, track complaints"
      />
      <FrontendHeader />
      
      {/* Hero Section */}
      <section className="relative flex-1 flex items-center overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 py-16 sm:py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left Content */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Anonymous & Secure Platform</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                Your Voice,
                <span className="gradient-text block">Your Privacy</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Empower your institution with a secure feedback system. Submit complaints anonymously, track progress transparently, and foster better communication.
              </p>
              
              <div className="flex gap-4 justify-center lg:justify-start flex-wrap">
                <Button 
                  size="lg" 
                  className="text-base px-8 py-6 rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg"
                  onClick={() => navigate("/login")}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Get Started
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-base px-8 py-6 rounded-full border-2"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up Free
                </Button>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-6 pt-4">
                <div className="text-center">
                  <div className="text-xl font-bold gradient-text">100%</div>
                  <div className="text-xs text-muted-foreground">Anonymous</div>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="text-center">
                  <div className="text-xl font-bold gradient-text">Secure</div>
                  <div className="text-xs text-muted-foreground">Encrypted</div>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="text-center">
                  <div className="text-xl font-bold gradient-text">Fast</div>
                  <div className="text-xs text-muted-foreground">Real-time</div>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative hidden lg:block">
              <div className="relative">
                {/* Main Card */}
                <div className="glass-card p-8 rounded-3xl border-2 border-primary/20 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">Complaint Box</div>
                      <div className="text-sm text-muted-foreground">Anonymous Feedback</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-muted rounded-full w-3/4" />
                    <div className="h-3 bg-muted rounded-full w-full" />
                    <div className="h-3 bg-muted rounded-full w-5/6" />
                  </div>
                  <div className="mt-6 flex gap-2">
                    <div className="h-10 flex-1 bg-gradient-to-r from-primary to-accent rounded-xl" />
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="absolute -top-6 -right-6 glass-card p-4 rounded-2xl border shadow-xl">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Encrypted</span>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 glass-card p-4 rounded-2xl border shadow-xl">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-accent" />
                    <span className="text-sm font-medium">Track Status</span>
                  </div>
                </div>

                {/* Background Shapes */}
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-6xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <motion.div className="text-center mb-16" variants={itemVariants}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 gradient-text">
                Why Choose TellUs?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Built for educational institutions and organizations that value transparency and effective communication
              </p>
            </motion.div>
            
            <motion.div 
              className="grid md:grid-cols-2 gap-6"
              variants={containerVariants}
            >
              {features.map((feature, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="glass-card border-2 hover:border-primary/50 transition-all duration-300 group h-full">
                    <CardHeader>
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl sm:text-2xl">{feature.title}</CardTitle>
                      <CardDescription className="text-base">{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-6xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.h2 
              className="text-3xl sm:text-4xl font-bold text-center mb-16 gradient-text"
              variants={itemVariants}
            >
              How It Works
            </motion.h2>
            
            <div className="grid md:grid-cols-2 gap-12">
              <motion.div className="space-y-6" variants={itemVariants}>
                <h3 className="text-2xl font-semibold text-primary flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  For Administrators
                </h3>
                <div className="space-y-4">
                  {[
                    { step: "1", title: "Create Account", desc: "Sign up as an administrator with your credentials" },
                    { step: "2", title: "Create Complaint Box", desc: "Set up complaint boxes with optional password protection" },
                    { step: "3", title: "Share Link", desc: "Distribute the unique link to your students or staff" },
                    { step: "4", title: "Manage Complaints", desc: "Review, update status, and resolve complaints efficiently" }
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4 glass-card p-4 rounded-xl">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center font-bold shadow-lg">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div className="space-y-6" variants={itemVariants}>
                <h3 className="text-2xl font-semibold text-primary flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-accent to-purple-600">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  For Users
                </h3>
                <div className="space-y-4">
                  {[
                    { step: "1", title: "Access Box", desc: "Open the complaint box link shared by your administrator" },
                    { step: "2", title: "Submit Complaint", desc: "Write your complaint anonymously - no login required" },
                    { step: "3", title: "Get Token", desc: "Receive a unique tracking token for your complaint" },
                    { step: "4", title: "Track Status", desc: "Check your complaint status anytime using your token" }
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4 glass-card p-4 rounded-xl">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-accent to-purple-600 text-white flex items-center justify-center font-bold shadow-lg">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        className="py-24 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIiBvcGFjaXR5PSIuMTUiLz48L2c+PC9zdmc+')] opacity-20" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.h2 
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Ready to Get Started?
            </motion.h2>
            <motion.p 
              className="text-lg sm:text-xl text-white drop-shadow-md max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              Join educational institutions and organizations using TellUs for better communication
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-10 py-6 rounded-2xl bg-white text-primary hover:bg-white/90 shadow-2xl font-semibold"
                onClick={() => navigate("/signup")}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Create Your Account
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
};

export default Landing;
