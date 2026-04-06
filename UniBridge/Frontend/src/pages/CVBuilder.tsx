/**
 * CVBuilder Page
 *
 * This component handles the CV building flow:
 *   1. A form to collect user details (name, email, phone, education, skills, experience)
 *   2. Form validation with clear inline error messages
 *   3. A professional CV preview layout
 *   4. A "Download CV" button that navigates to the /payment page
 *
 * IMPORTANT ARCHITECTURE NOTE (fixes the "one character" input bug):
 *   The form and preview JSX are rendered DIRECTLY in the return statement
 *   instead of being wrapped in inner component functions (CVForm / CVPreview).
 *   Defining them as functions inside the parent caused React to treat them as
 *   brand-new components on every render, which unmounted/remounted the DOM and
 *   destroyed input focus after each keystroke.
 *
 * Flow: Fill Form -> Preview CV -> Click Download -> navigate("/payment")
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Eye,
  CreditCard,
  ArrowLeft,
} from "lucide-react";

// ─── Type Definitions ───────────────────────────────────────────────────────

/** Shape of the CV form data – used here and passed to the Payment page */
export interface CVFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  education: string;
  skills: string;
  experience: string;
}

/** Shape of form validation errors */
interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  education?: string;
  skills?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

const CVBuilder = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // ── Single useState object for all form fields ──
  // This is the recommended pattern for controlled components.
  const [formData, setFormData] = useState<CVFormData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    education: "",
    skills: "",
    experience: "",
  });

  // Validation errors state
  const [errors, setErrors] = useState<FormErrors>({});

  // Toggle between the form view and the preview view
  const [showPreview, setShowPreview] = useState(false);

  // ─── Form Validation ──────────────────────────────────────────────────

  /**
   * Validates all required form fields.
   * Returns true when every field passes, false otherwise.
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Full Name: required
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    // Email: required + valid format
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone: required
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    // Address: required
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    // Education: required
    if (!formData.education.trim()) {
      newErrors.education = "Education details are required";
    }

    // Skills: required
    if (!formData.skills.trim()) {
      newErrors.skills = "Skills are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Event Handlers ───────────────────────────────────────────────────

  /**
   * Generic change handler for every input / textarea.
   * Uses the field's `name` attribute to update the correct key in formData.
   * Uses the functional updater form of setState so we always spread from the
   * latest state – this is safer than spreading from a stale closure.
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear the error for this field as soon as the user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  /** Validates the form and switches to the preview view */
  const handlePreview = () => {
    if (validateForm()) {
      setShowPreview(true);
    } else {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
    }
  };

  /** Returns from preview back to the editable form */
  const handleBackToForm = () => {
    setShowPreview(false);
  };

  /**
   * Navigates to the Payment page.
   * The CV form data is passed via React Router's state so the Payment page
   * can generate the PDF after a successful payment.
   */
  const handleDownloadClick = () => {
    navigate("/payment", { state: { cvData: formData } });
  };

  // ─── Render ───────────────────────────────────────────────────────────
  //
  // IMPORTANT: The form and preview are rendered as plain JSX here, NOT as
  // inner component functions. This prevents React from unmounting/remounting
  // the DOM on every state change, which was causing the input focus bug.
  //

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)]">
      {showPreview ? (
        /* ────────────────────── CV PREVIEW VIEW ────────────────────── */
        <div className="max-w-3xl mx-auto">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={handleBackToForm}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Form
          </Button>

          {/* CV Document */}
          <div className="bg-white rounded-lg shadow-lg border border-border overflow-hidden">
            {/* CV Header – Name and Contact */}
            <div className="bg-[hsl(220,60%,22%)] text-white px-8 py-8">
              <h1 className="text-3xl font-bold font-heading tracking-wide">
                {formData.fullName}
              </h1>
              <div className="mt-3 flex flex-wrap gap-4 text-sm opacity-90">
                <span>{formData.email}</span>
                <span className="hidden sm:inline">|</span>
                <span>{formData.phone}</span>
              </div>
            </div>

            {/* CV Body – Sections */}
            <div className="px-8 py-6 space-y-6">
              {/* Education Section */}
              <div>
                <h2 className="text-lg font-bold font-heading text-[hsl(220,60%,22%)] border-b-2 border-[hsl(220,60%,22%)] pb-1 mb-3">
                  EDUCATION
                </h2>
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {formData.education}
                </p>
              </div>

              {/* Skills Section – split by comma into tags */}
              <div>
                <h2 className="text-lg font-bold font-heading text-[hsl(220,60%,22%)] border-b-2 border-[hsl(220,60%,22%)] pb-1 mb-3">
                  SKILLS
                </h2>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.split(",").map((skill, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full border border-gray-200"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience Section – only shown when provided */}
              {formData.experience.trim() && (
                <div>
                  <h2 className="text-lg font-bold font-heading text-[hsl(220,60%,22%)] border-b-2 border-[hsl(220,60%,22%)] pb-1 mb-3">
                    EXPERIENCE
                  </h2>
                  <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {formData.experience}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Download CV button – bottom-right, navigates to payment page */}
          <div className="flex justify-end mt-6">
            <Button
              onClick={handleDownloadClick}
              className="gap-2 px-6"
              size="lg"
            >
              <CreditCard className="w-4 h-4" />
              Download CV - $4.99
            </Button>
          </div>

          {/* Payment info note */}
          <p className="text-xs text-muted-foreground text-right mt-2">
            You will be redirected to a secure payment page
          </p>
        </div>
      ) : (
        /* ────────────────────── CV FORM VIEW ───────────────────────── */
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
              <FileText className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-3xl font-bold font-heading text-foreground">
              Build Your CV
            </h1>
            <p className="text-muted-foreground mt-2">
              Fill in your details below to generate a professional CV
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePreview();
              }}
              className="space-y-5"
            >
              {/* ── Full Name Field ── */}
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="e.g. John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={errors.fullName ? "border-destructive" : ""}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName}</p>
                )}
              </div>

              {/* ── Email Address Field ── */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              {/* ── Phone Number Field ── */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="e.g. +1 234 567 8900"
                  value={formData.phone}
                  onChange={handleChange}
                  className={errors.phone ? "border-destructive" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
              </div>

              {/* ── Address Field ── */}
              <div className="space-y-2">
                <Label htmlFor="address">
                  Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Main Street, City, Country"
                  required
                />
                {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
              </div>

              {/* ── Education Field ── */}
              <div className="space-y-2">
                <Label htmlFor="education">
                  Education <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="education"
                  name="education"
                  placeholder="e.g. BSc Computer Science, University of XYZ, 2020-2024"
                  value={formData.education}
                  onChange={handleChange}
                  className={errors.education ? "border-destructive" : ""}
                  rows={3}
                />
                {errors.education && (
                  <p className="text-sm text-destructive">
                    {errors.education}
                  </p>
                )}
              </div>

              {/* ── Skills Field ── */}
              <div className="space-y-2">
                <Label htmlFor="skills">
                  Skills <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="skills"
                  name="skills"
                  placeholder="e.g. React, Node.js, Python, Team Leadership"
                  value={formData.skills}
                  onChange={handleChange}
                  className={errors.skills ? "border-destructive" : ""}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Separate skills with commas for better formatting
                </p>
                {errors.skills && (
                  <p className="text-sm text-destructive">{errors.skills}</p>
                )}
              </div>

              {/* ── Experience Field (optional) ── */}
              <div className="space-y-2">
                <Label htmlFor="experience">
                  Experience{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="experience"
                  name="experience"
                  placeholder="e.g. Software Developer Intern at ABC Corp, Jun-Aug 2023..."
                  value={formData.experience}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              {/* Preview CV Button */}
              <Button type="submit" className="w-full gap-2" size="lg">
                <Eye className="w-4 h-4" />
                Preview CV
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CVBuilder;
