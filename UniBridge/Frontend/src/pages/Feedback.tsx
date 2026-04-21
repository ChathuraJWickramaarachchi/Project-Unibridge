import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Send, Star, CheckCircle,
  Loader2, ChevronDown, Lightbulb, Bug, ThumbsUp,
  AlertCircle, LayoutGrid, Upload, Search,
  TrendingUp, Clock, Users, CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import FeedbackService from "@/services/feedbackService";

/* ─── Data ──────────────────────────────────────────────────────────────── */

const categories = [
  {
    value: "general",
    label: "General",
    sub: "General thoughts",
    icon: LayoutGrid,
    color: "bg-blue-50 text-blue-600 border-blue-200",
    dot: "bg-blue-500",
  },
  {
    value: "bug",
    label: "Bug Report",
    sub: "Report issue",
    icon: Bug,
    color: "bg-red-50 text-red-600 border-red-200",
    dot: "bg-red-500",
  },
  {
    value: "feature",
    label: "Feature Request",
    sub: "New idea",
    icon: Lightbulb,
    color: "bg-yellow-50 text-yellow-600 border-yellow-200",
    dot: "bg-yellow-500",
  },
  {
    value: "complaint",
    label: "Complaint",
    sub: "Share concern",
    icon: AlertCircle,
    color: "bg-orange-50 text-orange-600 border-orange-200",
    dot: "bg-orange-500",
  },
  {
    value: "compliment",
    label: "Compliment",
    sub: "Positive feedback",
    icon: ThumbsUp,
    color: "bg-green-50 text-green-600 border-green-200",
    dot: "bg-green-500",
  },
];

const moods = [
  { label: "Love it", emoji: "😍" },
  { label: "Happy",   emoji: "😊" },
  { label: "Neutral", emoji: "😐" },
  { label: "Unhappy", emoji: "😟" },
  { label: "Terrible",emoji: "😱" },
];

const stats = [
  { icon: MessageSquare, value: "156", label: "Total Feedback", color: "text-blue-500"   },
  { icon: Star,          value: "4.3", label: "Average Rating",  color: "text-yellow-500" },
  { icon: CheckSquare,   value: "142", label: "Resolved",        color: "text-green-500"  },
  { icon: Clock,         value: "14",  label: "Pending",         color: "text-orange-500" },
];

/* ─── Component ─────────────────────────────────────────────────────────── */

const Feedback = () => {
  const [formData, setFormData] = useState({
    name: "", email: "", subject: "", message: "",
    rating: 0, category: "general", mood: "",
  });
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [isSubmitted,  setIsSubmitted]    = useState(false);
  const [publicFeedback, setPublicFeedback] = useState<any[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [hoveredStar, setHoveredStar]     = useState(0);
  const [attachments, setAttachments]     = useState<File[]>([]);
  const [filterTab, setFilterTab]         = useState("all");
  const [searchQuery, setSearchQuery]     = useState("");
  const [isDragging, setIsDragging]       = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadPublicFeedback(); }, []);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 3 - attachments.length);
    setAttachments((prev) => [...prev, ...arr].slice(0, 3));
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

  const filterTabs = [
    { key: "all",     label: "All" },
    { key: "general", label: "General" },
    { key: "bug",     label: "Bug Report" },
    { key: "feature", label: "Feature Request" },
  ];

  const filteredFeedback = publicFeedback.filter((item) => {
    const matchTab = filterTab === "all" || item.category === filterTab;
    const matchSearch =
      !searchQuery ||
      item.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchSearch;
  });

  /* ── resolved progress ── */
  const totalFeedback = 156;
  const resolved      = 142;
  const progressPct   = Math.round((resolved / totalFeedback) * 100);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f0f2f5" }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden px-4"
        style={{
          background: "linear-gradient(135deg, #e8ecf4 0%, #dce3ef 40%, #e8dfd0 100%)",
          paddingTop: "7rem",
          paddingBottom: "5rem",
          minHeight: "340px",
        }}
      >
        <div className="relative max-w-3xl mx-auto text-center">
          {/* badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-gray-300 bg-white/70 backdrop-blur-sm text-sm text-gray-600 font-medium mb-8 shadow-sm"
          >
            <MessageSquare className="w-4 h-4" />
            Your Voice Matters
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15 }}
            className="text-5xl md:text-6xl font-bold mb-5"
            style={{ color: "#1a2340" }}
          >
            Shape Our Future Together
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.3 }}
            className="text-base md:text-lg text-gray-500 max-w-md mx-auto mb-10"
          >
            Your feedback drives innovation. Help us build a better UniBridge experience for everyone.
          </motion.p>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="flex justify-center"
          >
            <button
              onClick={() =>
                document.getElementById("feedback-content")?.scrollIntoView({ behavior: "smooth" })
              }
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Row ────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
            >
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-6 flex flex-col items-center text-center gap-2">
                  <s.icon className={`w-7 h-7 ${s.color}`} />
                  <p className="text-3xl font-bold" style={{ color: "#1a2340" }}>{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Resolution Progress ──────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 mt-6">
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">Resolution Progress</span>
              </div>
              <span className="text-sm font-bold" style={{ color: "#1a2340" }}>{progressPct}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-gray-200 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${progressPct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #1a2340, #2d3a5a)" }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">{resolved} of {totalFeedback} feedback resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div id="feedback-content" className="py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                  className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6"
                >
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </motion.div>
                <h2 className="text-3xl font-bold mb-3" style={{ color: "#1a2340" }}>Thank You!</h2>
                <p className="text-gray-500 max-w-md mb-8">
                  Your feedback has been submitted successfully. We appreciate your input and will
                  use it to improve UniBridge.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Submit Another Feedback
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              >
                {/* ── Form Card ─────────────────────────────────────────── */}
                <motion.div
                  className="lg:col-span-2"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="border-0 shadow-sm bg-white">
                    <CardContent className="p-8">
                      {/* Form header */}
                      <div className="flex items-center gap-3 mb-1">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: "linear-gradient(135deg, #3d5170, #1a2340)" }}
                        >
                          <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold" style={{ color: "#1a2340" }}>
                            Share Your Experience
                          </h2>
                          <p className="text-xs text-gray-400">We'd love to hear from you</p>
                        </div>
                      </div>

                      <div className="my-5 border-b border-gray-100" />

                      <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name + Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              Your Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              placeholder="John Doe"
                              required
                              className="border-gray-200 focus:border-gray-400 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              Email Address <span className="text-red-500">*</span>
                            </label>
                            <Input
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="john@example.com"
                              required
                              className="border-gray-200 focus:border-gray-400 bg-white"
                            />
                          </div>
                        </div>

                        {/* Subject */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
                          <Input
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="What's this about?"
                            className="border-gray-200 focus:border-gray-400 bg-white"
                          />
                        </div>

                        {/* Category */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category{" "}
                            <span className="font-normal text-gray-400">(Select the type of feedback)</span>
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {categories.map((cat) => {
                              const active = formData.category === cat.value;
                              return (
                                <button
                                  key={cat.value}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, category: cat.value })}
                                  className={`relative flex items-center gap-2 px-3 py-2.5 rounded-lg border text-left transition-all duration-200 ${
                                    active
                                      ? "border-gray-800 bg-gray-900 text-white shadow-md"
                                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                  }`}
                                >
                                  {active && (
                                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                                      <CheckCircle className="w-3 h-3 text-gray-900" />
                                    </span>
                                  )}
                                  <cat.icon className="w-4 h-4 shrink-0" />
                                  <div>
                                    <p className="text-xs font-medium leading-tight">{cat.label}</p>
                                    <p className={`text-[10px] leading-tight ${active ? "text-gray-300" : "text-gray-400"}`}>
                                      {cat.sub}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Mood */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">How do you feel?</label>
                          <div className="flex justify-between">
                            {moods.map((m) => (
                              <button
                                key={m.label}
                                type="button"
                                onClick={() => setFormData({ ...formData, mood: m.label })}
                                className={`flex flex-col items-center gap-1 transition-all duration-150 ${
                                  formData.mood === m.label ? "scale-110" : "opacity-70 hover:opacity-100"
                                }`}
                              >
                                <span className="text-3xl">{m.emoji}</span>
                                <span className="text-[11px] text-gray-500">{m.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Star Rating */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                          <div className="flex gap-1 items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <motion.button
                                key={star}
                                type="button"
                                onClick={() => setFormData({ ...formData, rating: star })}
                                onMouseEnter={() => setHoveredStar(star)}
                                onMouseLeave={() => setHoveredStar(0)}
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                className="focus:outline-none"
                              >
                                <Star
                                  className={`w-7 h-7 transition-colors ${
                                    star <= (hoveredStar || formData.rating)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        {/* Message */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Your Message <span className="text-red-500">*</span>
                          </label>
                          <Textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Tell us what you think... Be as detailed as possible!"
                            rows={5}
                            required
                            className="resize-none border-gray-200 focus:border-gray-400 bg-white"
                          />
                        </div>

                        {/* Attachments */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Attachments <span className="font-normal text-gray-400">(Optional)</span>
                          </label>
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
                            className={`w-full rounded-lg border-2 border-dashed flex flex-col items-center justify-center py-8 px-4 cursor-pointer transition-colors ${
                              isDragging ? "border-gray-400 bg-gray-50" : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                          >
                            <Upload className="w-6 h-6 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, PDF up to 10MB (Max 3 files)</p>
                            <input
                              ref={fileInputRef}
                              type="file"
                              multiple
                              accept=".png,.jpg,.jpeg,.pdf"
                              className="hidden"
                              onChange={(e) => handleFiles(e.target.files)}
                            />
                          </div>
                          {attachments.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {attachments.map((f, i) => (
                                <li key={i} className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded px-3 py-1.5">
                                  <span className="truncate max-w-xs">{f.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                                    className="text-red-400 hover:text-red-600 ml-2"
                                  >
                                    ×
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Submit */}
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-3 rounded-lg text-white font-semibold text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-70"
                          style={{ background: "linear-gradient(90deg, #1a2340, #2d3a5a)" }}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Sending…
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Submit Feedback
                            </>
                          )}
                        </button>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* ── Sidebar ───────────────────────────────────────────── */}
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                >
                  {/* Selected Category */}
                  <Card className="border-0 shadow-sm bg-white">
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-gray-800 mb-3 text-sm">Selected Category</h3>
                      {selectedCategory && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <selectedCategory.icon className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-blue-700">{selectedCategory.label}</p>
                            <p className="text-xs text-blue-400">{selectedCategory.sub}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Contact Info */}
                  <Card className="border-0 shadow-sm bg-white">
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-gray-800 mb-3 text-sm">Other Ways to Reach Us</h3>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Email</p>
                          <p className="font-medium text-gray-700">unibridge@gmail.com</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                          <p className="font-medium text-gray-700">070 529 6464</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-0.5">Office</p>
                          <p className="font-medium text-gray-700">
                            SLIIT Malabe Campus,<br />New Kandy Road, Malabe
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Our Commitment */}
                  <Card className="border-0 shadow-sm bg-white">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-gray-600" />
                        <h3 className="font-semibold text-gray-800 text-sm">Our Commitment</h3>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">
                        We typically respond to feedback within{" "}
                        <strong className="text-gray-800">24–48 hours</strong> during business days.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                        <CheckCircle className="w-3.5 h-3.5" />
                        95% resolution rate
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Community Voices ─────────────────────────────────────────────── */}
      <section className="py-14 px-4" style={{ backgroundColor: "#f0f2f5" }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold mb-2" style={{ color: "#1a2340" }}>
              Community <span style={{ color: "#1a2340" }}>Voices</span>
            </h2>
            <p className="text-gray-500 text-sm">
              See what others are saying and join the conversation
            </p>
          </motion.div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-8">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search feedback..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-gray-400 text-gray-700"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilterTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filterTab === tab.key
                      ? "text-white shadow-sm"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                  style={
                    filterTab === tab.key
                      ? { background: "linear-gradient(90deg, #1a2340, #2d3a5a)" }
                      : {}
                  }
                >
                  {tab.key !== "all" && (
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle ${
                      tab.key === "general" ? "bg-blue-400" :
                      tab.key === "bug"    ? "bg-green-400" : "bg-yellow-400"
                    }`} />
                  )}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback cards / empty */}
          {loadingFeedback ? (
            <div className="flex justify-center py-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-9 h-9 border-2 rounded-full"
                style={{ borderColor: "#1a2340", borderTopColor: "transparent" }}
              />
            </div>
          ) : filteredFeedback.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredFeedback.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.07 }}
                  whileHover={{ y: -3 }}
                >
                  <Card className="h-full border-0 shadow-sm bg-white hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                          style={{ background: "linear-gradient(135deg, #1a2340, #2d3a5a)" }}
                        >
                          {item.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                          <span className="text-[10px] text-gray-400 capitalize bg-gray-100 px-2 py-0.5 rounded-full">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      {item.rating > 0 && (
                        <div className="flex gap-0.5 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < item.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                            />
                          ))}
                        </div>
                      )}
                      <p className="text-gray-500 text-sm line-clamp-4 italic">"{item.message}"</p>
                      {item.subject && (
                        <p className="text-xs text-blue-600 mt-2 font-medium truncate">{item.subject}</p>
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
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                <MessageSquare className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-gray-400 text-sm">
                No public feedback yet. Be the first to share your thoughts!
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Feedback;
