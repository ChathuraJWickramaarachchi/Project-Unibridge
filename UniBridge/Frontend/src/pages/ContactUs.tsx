import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Mail,
  MapPin,
  Phone,
  Send,
  Clock,
  CheckCircle,
  Loader2,
  ChevronDown,
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
} from "lucide-react";
import { MessageCircle, ChevronRight, X, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ContactUs = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5001"}/api/contact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      if (response.ok) {
        toast({ title: "Success", description: "Your message has been sent successfully!" });
        setIsSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "An error occurred while sending your message.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getOfficeStatus = () => {
    const now = new Date();
    const day = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const isWeekday = day >= 1 && day <= 5;
    const isWithinHours = currentTime >= 9 * 60 && currentTime < 18 * 60;
    return isWeekday && isWithinHours
      ? { open: true, label: "Open Now" }
      : { open: false, label: "Closed Now" };
  };

  const officeStatus = getOfficeStatus();

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      content: "unibridge@gmail.com",
      description: "We reply within 24 hours",
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: Phone,
      title: "Phone",
      content: "+94 11587469",
      description: "Mon-Fri 9am-6pm IST",
      iconColor: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      icon: MapPin,
      title: "Office",
      content: "SLIIT Malabe Campus",
      description: "New Kandy Road, Malabe",
      iconColor: "text-purple-500",
      bgColor: "bg-purple-50",
      onClick: () => setShowMapModal(true),
    },
    {
      icon: Clock,
      title: "Working Hours",
      content: "Monday – Friday",
      description: "9:00 AM – 6:00 PM IST",
      iconColor: "text-orange-500",
      bgColor: "bg-orange-50",
      onClick: () => setShowHoursModal(true),
    },
  ];

  const faqs = [
    {
      question: "How quickly do you respond?",
      answer: "We aim to respond to all inquiries within 24 hours during business days.",
    },
    {
      question: "Do you offer phone support?",
      answer: "Yes, phone support is available Monday–Friday, 9am–6pm IST.",
    },
    {
      question: "Can I visit your office?",
      answer: "Absolutely! We welcome visitors. Please schedule an appointment first.",
    },
  ];

  const socialLinks = [
    { label: "Twitter", icon: Twitter, href: "https://twitter.com" },
    { label: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
    { label: "Instagram", icon: Instagram, href: "https://instagram.com" },
    { label: "Facebook", icon: Facebook, href: "https://facebook.com" },
  ];

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
            <MessageCircle className="w-4 h-4" />
            <span>We're Here to Help</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="text-5xl md:text-6xl font-heading font-bold text-foreground mb-6"
          >
            Get in <span className="text-primary">Touch</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-8"
          >
            Have questions about UniBridge? We'd love to hear from you. Send us a
            message and we'll respond as soon as possible.
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
              onClick={() => document.getElementById('contact-content')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ChevronRight className="w-6 h-6 rotate-90" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      <div id="contact-content" className="py-10 px-4">
        <div className="max-w-6xl mx-auto space-y-8">

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactInfo.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <Card
                className={`border border-border hover:shadow-md transition-shadow h-full ${
                  (item as any).onClick ? 'cursor-pointer' : ''
                }`}
                onClick={(item as any).onClick}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 rounded-xl ${item.bgColor} flex items-center justify-center mx-auto mb-3`}>
                    <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm font-medium text-foreground">{item.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                  {item.title === "Working Hours" && (
                    <div className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                      officeStatus.open
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        officeStatus.open ? "bg-green-500" : "bg-red-500"
                      }`} />
                      {officeStatus.label} — Click for details
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content: Form + Right Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border border-border shadow-sm h-full">
              <CardContent className="p-8">
                <h2 className="text-xl font-bold text-foreground mb-1">Send us a Message</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Fill out the form below and we'll get back to you shortly.
                </p>

                <AnimatePresence mode="wait">
                  {isSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-10"
                    >
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Message Sent!</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Thank you for reaching out. We'll respond within 24 hours.
                      </p>
                      <Button onClick={() => setIsSubmitted(false)} variant="outline" size="sm">
                        Send Another Message
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.form
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                            Full Name <span className="text-destructive">*</span>
                          </label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                            Email Address <span className="text-destructive">*</span>
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-1.5">
                          Subject <span className="text-destructive">*</span>
                        </label>
                        <Input
                          id="subject"
                          name="subject"
                          type="text"
                          placeholder="What is this about?"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1.5">
                          Message <span className="text-destructive">*</span>
                        </label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Tell us more about your inquiry..."
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={5}
                          className="resize-none"
                        />
                      </div>

                      <Button type="submit" disabled={loading} className="w-full" size="lg">
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            Send Message
                          </span>
                        )}
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Panel: FAQ + Map + Social */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="space-y-4"
          >
            {/* FAQ */}
            <Card className="border border-border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground text-lg">Frequently Asked Questions</h3>
                </div>
                <div className="space-y-2">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-sm font-medium text-foreground">{faq.question}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-muted-foreground shrink-0 ml-2 transition-transform duration-200 ${
                            openFaqIndex === index ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      <AnimatePresence>
                        {openFaqIndex === index && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="px-4 pb-3 text-sm text-muted-foreground border-t border-border pt-2">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Interactive Map */}
            <Card className="border border-border shadow-sm overflow-hidden">
              <div className="h-40 bg-muted relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.798511730846!2d79.9727!3d6.9147!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae256db1a6771c5%3A0x2c63e344ab9a7536!2sSri%20Lanka%20Institute%20of%20Information%20Technology%20(SLIIT)!5e0!3m2!1sen!2slk!4v1709123456789!5m2!1sen!2slk"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Interactive Map</p>
                    <p className="text-xs text-muted-foreground">SLIIT Malabe Campus, New Kandy Road, Malabe</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Connect With Us */}
            <Card className="border border-border shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-bold text-foreground mb-1">Connect With Us</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Follow us on social media for updates, tips, and community highlights.
                </p>
                <div className="flex gap-2 flex-wrap">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                    >
                      <social.icon className="w-4 h-4" />
                      {social.label}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        </div>
      </div>
      {/* Map Modal */}
      <AnimatePresence>
        {showMapModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowMapModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-card rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="text-lg font-bold text-foreground">Our Location</h3>
                <button
                  onClick={() => setShowMapModal(false)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="aspect-video relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.798511730846!2d79.9727!3d6.9147!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae256db1a6771c5%3A0x2c63e344ab9a7536!2sSri%20Lanka%20Institute%20of%20Information%20Technology%20(SLIIT)!5e0!3m2!1sen!2slk!4v1709123456789!5m2!1sen!2slk"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                />
              </div>
              <div className="p-4 border-t border-border flex items-center justify-between">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm font-medium text-foreground">SLIIT Malabe Campus, New Kandy Road, Malabe, Sri Lanka</p>
                </div>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=6.9147,79.9727"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shrink-0 ml-4"
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Working Hours Modal */}
      <AnimatePresence>
        {showHoursModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowHoursModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-card rounded-2xl overflow-hidden max-w-sm w-full shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-foreground">Office Status</h3>
                <button
                  onClick={() => setShowHoursModal(false)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center py-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                  className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                    officeStatus.open ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  <Clock className={`w-10 h-10 ${
                    officeStatus.open ? "text-green-600" : "text-red-500"
                  }`} />
                </motion.div>
                <h4 className={`text-2xl font-bold mb-1 ${
                  officeStatus.open ? "text-green-600" : "text-red-500"
                }`}>
                  {officeStatus.open ? "We're Open!" : "Currently Closed"}
                </h4>
                <p className="text-muted-foreground text-sm">
                  {officeStatus.open
                    ? "Our team is available to help you right now."
                    : "We're currently outside working hours."}
                </p>
              </div>

              <div className="border-t border-border pt-4 mt-4 space-y-2">
                <h5 className="font-semibold text-foreground mb-3">Working Hours</h5>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monday – Friday</span>
                  <span className="font-medium text-foreground">9:00 AM – 6:00 PM</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Saturday – Sunday</span>
                  <span className="font-medium text-foreground">Closed</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Timezone</span>
                  <span className="font-medium text-foreground">IST (GMT+5:30)</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ContactUs;
