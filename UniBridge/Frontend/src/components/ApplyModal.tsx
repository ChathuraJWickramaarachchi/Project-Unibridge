import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2,
  Upload,
  FileText,
  X,
  CheckCircle2,
  Briefcase,
  MapPin,
  Building2,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

interface Job {
  _id: string;
  title: string;
  type: string;
  location: string;
  departmentId?: { name: string };
  companyId?: { firstName: string; lastName: string };
}

interface ApplyModalProps {
  job: Job | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ApplyModal({ job, open, onClose, onSuccess }: ApplyModalProps) {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    contactNumber: "",
    university: "",
    coverLetter: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Auto-fill from user profile
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        university: user.profile?.university || "",
      }));
    }
  }, [user, open]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setSubmitted(false);
      setCvFile(null);
      setForm({ fullName: "", email: "", contactNumber: "", university: "", coverLetter: "" });
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are accepted");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }
    setCvFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    if (!form.fullName || !form.email || !form.contactNumber || !form.university) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("jobId", job._id);
      formData.append("fullName", form.fullName);
      formData.append("email", form.email);
      formData.append("contactNumber", form.contactNumber);
      formData.append("university", form.university);
      formData.append("coverLetter", form.coverLetter);
      if (cvFile) formData.append("resume", cvFile);

      await axios.post(`${API_URL}/applications`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSubmitted(true);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px] max-h-[92vh] overflow-y-auto">
        {submitted ? (
          /* ── Success State ── */
          <div className="flex flex-col items-center text-center py-8 gap-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Application Submitted!</h2>
            <p className="text-muted-foreground text-sm max-w-xs">
              Your application for <span className="font-semibold text-foreground">"{job.title}"</span> has been sent successfully. Check your notifications for updates.
            </p>
            <Button onClick={onClose} className="mt-2 w-full sm:w-auto px-8">
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-start gap-3 mb-1">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-lg leading-tight">{job.title}</DialogTitle>
                  <DialogDescription className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                    {job.companyId && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {job.companyId.firstName} {job.companyId.lastName}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{job.location}
                    </span>
                    <Badge variant="secondary" className="text-[10px] py-0">
                      {job.type}
                    </Badge>
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              {/* Full Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* Contact & University */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="contactNumber">
                    Contact Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contactNumber"
                    name="contactNumber"
                    value={form.contactNumber}
                    onChange={handleChange}
                    placeholder="+94 77 000 0000"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="university">
                    University <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="university"
                    name="university"
                    value={form.university}
                    onChange={handleChange}
                    placeholder="Your university"
                    required
                  />
                </div>
              </div>

              {/* CV Upload */}
              <div className="space-y-1.5">
                <Label>
                  Upload CV / Resume <span className="text-muted-foreground text-xs">(PDF, max 5MB)</span>
                </Label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors text-center group
                    ${cvFile ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/50 hover:bg-accent/50"}`}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {cvFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-8 h-8 text-primary" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">{cvFile.name}</p>
                        <p className="text-xs text-muted-foreground">{(cvFile.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setCvFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                        className="ml-auto text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Click to upload</span> your CV
                      </p>
                      <p className="text-xs text-muted-foreground">PDF only · Max 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Letter */}
              <div className="space-y-1.5">
                <Label htmlFor="coverLetter">
                  Cover Letter <span className="text-muted-foreground text-xs">(Optional)</span>
                </Label>
                <Textarea
                  id="coverLetter"
                  name="coverLetter"
                  value={form.coverLetter}
                  onChange={handleChange}
                  placeholder="Tell us why you're a great fit for this role..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 gap-2" disabled={submitting}>
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</>
                  ) : (
                    <><GraduationCap className="w-4 h-4" />Submit Application</>
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
