import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Send, Star, CheckCircle, Quote,
  Loader2, ChevronRight, Lightbulb, Bug, ThumbsUp,
  AlertCircle, Smile, LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import FeedbackService from "@/services/feedbackService";

const categories = [
  { value: "general", label: "General", icon: LayoutGrid, color: "bg-blue-50 text-blue-600 border-blue-200" },
  { value: "bug", label: "Bug Report", icon: Bug, color: "bg-red-50 text-red-600 border-red-200" },
  { value: "feature", label: "Feature Request", icon: Lightbulb, color: "bg-yellow-50 text-yellow-600 border-yellow-200" },
  { value: "complaint", label: "Complaint", icon: AlertCircle, color: "bg-orange-50 text-orange-600 border-orange-200" },
  { value: "compliment", label: "Compliment", icon: ThumbsUp, color: "bg-green-50 text-green-600 border-green-200" },
];

const Feedback = () => {
  const [formData, setFormData] = useState({
    name: "", email: "", subject: "", message: "", rating: 0, category: "general",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [publicFeedback, setPublicFeedback] = useState<any[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    loadPublicFeedback();
  }, []);

  const loadPublicFeedback = async () => {
    try {
      setLoadingFeedback(true);
      const response = await FeedbackService.getPublicFeedback(1, 6);
      if (response.success) setPublicFeedback(response.data || []);
    } catch (error) {
      console.error("Error loading public feedback:", error);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const response = await FeedbackService.createFeedback(formData);
    setIsSubmitting(false);
    if (response.success) {
      setIsSubmitted(true);
      toast({ title: "Success", description: "Thank you for your feedback!" });
    } else {
      toast({ title: "Error", description: response.error || "Failed to submit feedback", variant: "destructive" });
    }
  };

  const selectedCategory = categories.find((c) => c.value === formData.category);

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/8 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.7, 0.4, 0.7] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Share Your Thoughts</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-5xl md:text-6xl font-heading font-bold text-foreground mb-6"
          >
            We Value Your <span className="text-primary">Feedback</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-8"
          >
            Help us improve UniBridge by sharing your thoughts, suggestions,
            or reporting any issues you've encountered.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex justify-center"
          >
            <motion.button
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              onClick={() => document.getElementById("feedback-content")?.scrollIntoView({ behavior: "smooth" })}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronRight className="w-6 h-6 rotate-90" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div id="feedback-content" className="py-10 px-4">
        <div className="max-w-6xl mx-auto space-y-10">

          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                  className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6"
                >
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </motion.div>
                <h2 className="text-3xl font-heading font-bold text-foreground mb-3">Thank You!</h2>
                <p className="text-muted-foreground max-w-md mb-8">
                  Your feedback has been submitted successfully. We appreciate your input and will use it to improve UniBridge.
                </p>
                <Button onClick={() => setIsSubmitted(false)} variant="outline" size="lg">
                  Submit Another Feedback
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* Feedback Form */}
                <motion.div
                  className="lg:col-span-2"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="border border-border shadow-sm">
                    <CardContent className="p-8">
                      <h2 className="text-xl font-bold text-foreground mb-1">Submit Your Feedback</h2>
                      <p className="text-sm text-muted-foreground mb-6">
                        Fill in the form below and we'll get back to you as soon as possible.
                      </p>

                      <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name + Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                              Your Name <span className="text-destructive">*</span>
                            </label>
                            <Input name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1.5">
                              Email Address <span className="text-destructive">*</span>
                            </label>
                            <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" required />
                          </div>
                        </div>

                        {/* Subject */}
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Subject</label>
                          <Input name="subject" value={formData.subject} onChange={handleChange} placeholder="What's this about?" />
                        </div>

                        {/* Category */}
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                          <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                              <button
                                key={cat.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, category: cat.value })}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-200 ${
                                  formData.category === cat.value
                                    ? cat.color + " shadow-sm scale-105"
                                    : "border-border text-muted-foreground hover:border-primary/50"
                                }`}
                              >
                                <cat.icon className="w-3.5 h-3.5" />
                                {cat.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Star Rating */}
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Rating</label>
                          <div className="flex gap-2 items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <motion.button
                                key={star}
                                type="button"
                                onClick={() => setFormData({ ...formData, rating: star })}
                                onMouseEnter={() => setHoveredStar(star)}
                                onMouseLeave={() => setHoveredStar(0)}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`w-8 h-8 transition-colors ${
                                    star <= (hoveredStar || formData.rating)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              </motion.button>
                            ))}
                            {(hoveredStar || formData.rating) > 0 && (
                              <span className="text-sm text-muted-foreground ml-2">
                                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][hoveredStar || formData.rating]}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Message */}
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">
                            Your Message <span className="text-destructive">*</span>
                          </label>
                          <Textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Tell us what you think..."
                            rows={5}
                            required
                            className="resize-none"
                          />
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Sending...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Send className="w-4 h-4" />
                              Submit Feedback
                            </span>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Sidebar */}
                <motion.div
                  className="space-y-5"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                >
                  {/* Selected Category Info */}
                  <Card className="border border-border shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-foreground mb-3">Selected Category</h3>
                      {selectedCategory && (
                        <div className={`flex items-center gap-3 p-3 rounded-lg border ${selectedCategory.color}`}>
                          <selectedCategory.icon className="w-5 h-5 shrink-0" />
                          <div>
                            <p className="font-semibold text-sm">{selectedCategory.label}</p>
                            <p className="text-xs opacity-75">
                              {formData.category === "general" && "Share any general thoughts"}
                              {formData.category === "bug" && "Report a technical issue"}
                              {formData.category === "feature" && "Suggest a new feature"}
                              {formData.category === "complaint" && "Report a concern"}
                              {formData.category === "compliment" && "Share positive experience"}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Contact Info */}
                  <Card className="border border-border shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-foreground mb-4">Other Ways to Reach Us</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                          <p className="text-sm font-medium text-foreground">unibridge@gmail.com</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                          <p className="text-sm font-medium text-foreground">+94 11587469</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Office</p>
                          <p className="text-sm font-medium text-foreground">SLIIT Malabe Campus,<br />New Kandy Road, Malabe</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Response Time */}
                  <Card className="border border-primary/20 bg-primary/5 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Smile className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-primary">Response Time</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        We typically respond to feedback within <span className="font-semibold text-foreground">24–48 hours</span> during business days.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Public Feedback Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="pt-6"
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl font-heading font-bold text-foreground mb-3">
                What People Are <span className="text-primary">Saying</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Read feedback from our community
              </p>
            </div>

            {loadingFeedback ? (
              <div className="flex justify-center py-16">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full"
                />
              </div>
            ) : publicFeedback.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicFeedback.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card className="h-full border border-border hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Quote className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground text-sm">{item.name}</h4>
                            <span className="text-xs text-muted-foreground capitalize px-2 py-0.5 bg-muted rounded-full">
                              {item.category}
                            </span>
                          </div>
                        </div>

                        {item.rating > 0 && (
                          <div className="flex gap-0.5 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${i < item.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                              />
                            ))}
                          </div>
                        )}

                        <p className="text-muted-foreground text-sm line-clamp-4 italic">
                          "{item.message}"
                        </p>

                        {item.subject && (
                          <p className="text-xs text-primary mt-3 font-medium truncate">{item.subject}</p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No public feedback yet. Be the first to share your thoughts!</p>
              </motion.div>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Feedback;
