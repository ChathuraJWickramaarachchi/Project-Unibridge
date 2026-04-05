import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search,
  Briefcase,
  Building2,
  Users,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Star,
  MapPin,
  Clock,
  GraduationCap,
  ChevronRight
} from "lucide-react";

// Animated counter hook
const useCounter = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  return count;
};

const Index = () => {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const internshipCount = useCounter(2500);
  const companyCount = useCounter(800);

  const images = [
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
  ];

  const texts = ["Internship", "Career", "Future"];
  const currentTextArray = texts[textIndex].split("");

  useEffect(() => {
    const imageTimer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(imageTimer);
  }, [images.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (currentText.length < currentTextArray.length) {
          setCurrentText((prev) => prev + currentTextArray[prev.length]);
        } else {
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText((prev) => prev.slice(0, -1));
        } else {
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? 100 : 150);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, textIndex, currentTextArray]);

  const features = [
    { icon: Briefcase, title: "Curated Opportunities", description: "Handpicked internships from verified companies, tailored for university students." },
    { icon: Building2, title: "Top Companies", description: "Connect with leading organizations across multiple industries and sectors." },
    { icon: Users, title: "Mentor Matching", description: "Get paired with industry mentors to guide your internship journey." },
    { icon: TrendingUp, title: "Career Growth", description: "Track applications, build your profile, and accelerate your professional growth." },
  ];

  const howItWorks = [
    { step: "01", title: "Create Profile", description: "Sign up and build your student profile with your skills and interests." },
    { step: "02", title: "Browse Jobs", description: "Explore thousands of internship opportunities from top companies." },
    { step: "03", title: "Apply & Connect", description: "Apply to positions and connect directly with employers." },
    { step: "04", title: "Get Hired", description: "Land your dream internship and kickstart your career." },
  ];

  const testimonials = [
    { name: "Sarah Johnson", role: "Computer Science Student", company: "Google Intern", quote: "UniBridge helped me land my dream internship at Google. The platform is incredibly user-friendly!" },
    { name: "Michael Chen", role: "Business Major", company: "Microsoft Intern", quote: "I found multiple opportunities within a week. Highly recommend for any student looking for internships." },
    { name: "Emily Davis", role: "Engineering Student", company: "Tesla Intern", quote: "The mentor matching feature is amazing. My mentor guided me through the entire application process." },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Images */}
        <div className="absolute inset-0">
          {images.map((image, index) => (
            <motion.img
              key={index}
              src={image}
              alt=""
              initial={{ scale: 1.1 }}
              animate={{ scale: index === currentImageIndex ? 1 : 1.1, opacity: index === currentImageIndex ? 1 : 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/70" />
          
          {/* Animated blobs */}
          <motion.div
            className="absolute top-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
        </div>

        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-6 px-4 py-2 bg-accent/20 text-accent border-accent/30 hover:bg-accent/30">
                <Star className="w-3 h-3 mr-1 fill-accent" />
                Trusted by 5,000+ University Students
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-primary-foreground mb-6 leading-tight"
            >
              Find Your Perfect{" "}
              <span className="text-accent">{currentText}</span>
              <span className="inline-block w-1 h-16 bg-accent animate-pulse ml-1" />
              <br />
              Opportunity
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto"
            >
              Connect with top companies offering opportunities tailored for university students. 
              Launch your career with UniBridge today.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-2xl p-2 shadow-2xl">
                <div className="flex-1 flex items-center gap-3 px-4">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by job title, company, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 bg-transparent focus-visible:ring-0 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl px-8">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              {!isAuthenticated ? (
                <>
                  <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full px-8">
                    <Link to="/auth">
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 rounded-full px-8">
                    <Link to="/companies">Browse Companies</Link>
                  </Button>
                </>
              ) : (
                <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full px-8">
                  <Link to="/jobs">
                    Find Internships
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap justify-center gap-8 md:gap-16"
            >
              {[
                { value: `${internshipCount}+`, label: "Active Internships" },
                { value: `${companyCount}+`, label: "Partner Companies" },
                { value: "95%", label: "Success Rate" },
              ].map((stat, i) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-heading font-bold text-accent">{stat.value}</div>
                  <div className="text-sm text-primary-foreground/60">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronRight className="w-6 h-6 text-white/50 rotate-90" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4" variant="secondary">Why Choose Us</Badge>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Everything You Need to <span className="text-primary">Succeed</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform provides all the tools and resources you need to land your dream internship.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="group bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4" variant="secondary">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Your Journey to <span className="text-primary">Success</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to land your dream internship
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="text-6xl font-heading font-bold text-primary/10 mb-4">{item.step}</div>
                <h3 className="font-heading font-semibold text-xl text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
                {i < howItWorks.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-8 -right-4 w-8 h-8 text-muted-foreground/30" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Preview */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-center md:justify-between mb-12"
          >
            <div>
              <Badge className="mb-4" variant="secondary">Featured Opportunities</Badge>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                Latest <span className="text-primary">Internships</span>
              </h2>
            </div>
            <Button asChild variant="outline" className="mt-4 md:mt-0">
              <Link to="/jobs">
                View All Jobs
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Software Engineering Intern", company: "Google", location: "Mountain View, CA", type: "Full-time", posted: "2 days ago" },
              { title: "Marketing Intern", company: "Microsoft", location: "Redmond, WA", type: "Part-time", posted: "3 days ago" },
              { title: "Data Science Intern", company: "Amazon", location: "Seattle, WA", type: "Full-time", posted: "1 week ago" },
            ].map((job, i) => (
              <motion.div
                key={job.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="secondary">{job.type}</Badge>
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-1">{job.title}</h3>
                <p className="text-primary font-medium mb-3">{job.company}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {job.posted}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4" variant="secondary">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Success <span className="text-primary">Stories</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hear from students who found their dream internships through UniBridge
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-foreground mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-xs text-primary">{testimonial.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-4">
              Ready to Start Your Career Journey?
            </h2>
            <p className="text-primary-foreground/80 mb-8 text-lg">
              Join thousands of students who have found their dream internships through UniBridge.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full px-8">
                    <Link to="/auth">Create Free Account</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 rounded-full px-8">
                    <Link to="/about">Learn More</Link>
                  </Button>
                </>
              ) : (
                <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full px-8">
                  <Link to="/jobs">Browse Internships</Link>
                </Button>
              )}
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-primary-foreground/60 text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Free to join
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Cancel anytime
              </span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
