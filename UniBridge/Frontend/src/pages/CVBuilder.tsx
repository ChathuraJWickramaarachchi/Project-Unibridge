/**
 * CVBuilder Page  — Enhanced with Photo Upload & Premium CV Design
 *
 * Flow:
 *   1. User fills the form (including uploading a profile photo)
 *   2. Click "Preview CV" → professional two-column preview
 *   3. "Download PDF" triggers window.print() with dedicated @media print styles
 *   4. "Download CV" button also navigates to /payment (original flow kept)
 *
 * Architecture note: form and preview are rendered as plain JSX (not inner
 * component functions) to avoid React re-mounting DOM on every render, which
 * caused the "one character at a time" input bug.
 */

import { useState, useRef, useCallback } from "react";
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
  Download,
  Upload,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  X,
} from "lucide-react";

// ─── Type Definitions ────────────────────────────────────────────────────────

export interface CVFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  careerObjective: string;
  education: string;
  skills: string;
  experience: string;
  certifications: string;
  languages: string;
}

type FormField = keyof CVFormData;

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  linkedin?: string;
  education?: string;
  skills?: string;
  careerObjective?: string;
  experience?: string;
  certifications?: string;
  languages?: string;
}

// ─── Validation Rules ─────────────────────────────────────────────────────────
// Centralised rules make it easy to extend later.

const RULES = {
  fullName: {
    minLen: 2,
    maxLen: 80,
    pattern: /^[a-zA-Z\s'-]+$/,
    patternMsg: "Name can only contain letters, spaces, hyphens and apostrophes",
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  },
  phone: {
    // Accepts optional +, digits, spaces, dashes and parentheses; 7–15 digits total
    pattern: /^\+?[0-9][\d\s\-().]{6,19}$/,
    patternMsg: "Enter a valid phone number (e.g. +1 234 567 8900)",
  },
  address: {
    minLen: 5,
    maxLen: 200,
  },
  linkedin: {
    // Allow blank OR a plausible linkedin.com URL
    pattern: /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/,
    patternMsg: "Must be a valid LinkedIn profile URL (linkedin.com/in/yourname)",
  },
  careerObjective: {
    minLen: 30,
    maxLen: 500,
  },
  education: {
    minLen: 10,
    maxLen: 1000,
  },
  skills: {
    minCount: 2,    // at least 2 comma-separated items
    maxCount: 30,
    maxLen: 500,
  },
  experience: {
    maxLen: 2000,
  },
  certifications: {
    maxLen: 1000,
  },
  languages: {
    maxLen: 300,
  },
};

/** Validate a single field and return an error string or undefined. */
const validateField = (field: FormField, value: string): string | undefined => {
  const v = value.trim();

  switch (field) {
    case "fullName": {
      if (!v) return "Full name is required";
      if (v.length < RULES.fullName.minLen) return `Name must be at least ${RULES.fullName.minLen} characters`;
      if (v.length > RULES.fullName.maxLen) return `Name must be at most ${RULES.fullName.maxLen} characters`;
      if (!RULES.fullName.pattern.test(v)) return RULES.fullName.patternMsg;
      break;
    }
    case "email": {
      if (!v) return "Email address is required";
      if (!RULES.email.pattern.test(v)) return "Enter a valid email address (e.g. john@example.com)";
      break;
    }
    case "phone": {
      if (!v) return "Phone number is required";
      if (!RULES.phone.pattern.test(v)) return RULES.phone.patternMsg;
      break;
    }
    case "address": {
      if (!v) return "Address is required";
      if (v.length < RULES.address.minLen) return `Address must be at least ${RULES.address.minLen} characters`;
      if (v.length > RULES.address.maxLen) return `Address is too long (max ${RULES.address.maxLen} chars)`;
      break;
    }
    case "linkedin": {
      if (v && !RULES.linkedin.pattern.test(v)) return RULES.linkedin.patternMsg;
      break;
    }
    case "careerObjective": {
      if (!v) return "Career objective is required";
      if (v.length < RULES.careerObjective.minLen)
        return `Too short — write at least ${RULES.careerObjective.minLen} characters to describe your goals`;
      if (v.length > RULES.careerObjective.maxLen)
        return `Career objective is too long (max ${RULES.careerObjective.maxLen} chars)`;
      break;
    }
    case "education": {
      if (!v) return "Education details are required";
      if (v.length < RULES.education.minLen) return `Please provide more detail (at least ${RULES.education.minLen} chars)`;
      if (v.length > RULES.education.maxLen) return `Education section is too long (max ${RULES.education.maxLen} chars)`;
      break;
    }
    case "skills": {
      if (!v) return "Skills are required";
      const count = v.split(",").map((s) => s.trim()).filter(Boolean).length;
      if (count < RULES.skills.minCount) return `Add at least ${RULES.skills.minCount} skills, separated by commas`;
      if (count > RULES.skills.maxCount) return `That's a lot! Keep it to ${RULES.skills.maxCount} skills max`;
      if (v.length > RULES.skills.maxLen) return `Skills section is too long (max ${RULES.skills.maxLen} chars)`;
      break;
    }
    case "experience": {
      if (v.length > RULES.experience.maxLen) return `Experience section is too long (max ${RULES.experience.maxLen} chars)`;
      break;
    }
    case "certifications": {
      if (v.length > RULES.certifications.maxLen) return `Certifications section is too long (max ${RULES.certifications.maxLen} chars)`;
      break;
    }
    case "languages": {
      if (v.length > RULES.languages.maxLen) return `Languages section is too long (max ${RULES.languages.maxLen} chars)`;
      break;
    }
  }
  return undefined;
};

/** Run validation across all fields and return a full errors object. */
const validateAll = (data: CVFormData): FormErrors => {
  const errs: FormErrors = {};
  (Object.keys(data) as FormField[]).forEach((field) => {
    const err = validateField(field, data[field]);
    if (err) errs[field] = err;
  });
  return errs;
};

// Required fields for the progress bar
const REQUIRED_FIELDS: FormField[] = ["fullName", "email", "phone", "address", "careerObjective", "education", "skills"];

// Inject print styles once (idempotent)
const injectPrintStyles = () => {
  if (document.getElementById("cv-print-styles")) return;
  const style = document.createElement("style");
  style.id = "cv-print-styles";
  style.innerHTML = `
    @media print {
      body > *:not(#cv-printable-root) { display: none !important; }
      #cv-printable-root {
        display: block !important;
        position: fixed;
        inset: 0;
        margin: 0;
        padding: 0;
        z-index: 99999;
        background: white;
      }
      @page { margin: 0; size: A4; }
    }
  `;
  document.head.appendChild(style);
};

// ─── Component ───────────────────────────────────────────────────────────────

const CVBuilder = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<CVFormData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    linkedin: "",
    careerObjective: "",
    education: "",
    skills: "",
    experience: "",
    certifications: "",
    languages: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  // Track which fields the user has touched (blurred) so we don't show errors on pristine fields
  const [touched, setTouched] = useState<Partial<Record<FormField, boolean>>>({});
  const [showPreview, setShowPreview] = useState(false);

  // Progress: how many required fields are validly filled
  const completedRequired = REQUIRED_FIELDS.filter(
    (f) => !validateField(f, formData[f])
  ).length;
  const progressPct = Math.round((completedRequired / REQUIRED_FIELDS.length) * 100);

  // ─── Form Validation ──────────────────────────────────────────────────

  /** Run all validations; mark every field as touched; return true if valid. */
  const validateForm = (): boolean => {
    const allErrors = validateAll(formData);
    setErrors(allErrors);
    // Mark everything touched so all errors become visible
    const allTouched = Object.fromEntries(
      (Object.keys(formData) as FormField[]).map((k) => [k, true])
    ) as Partial<Record<FormField, boolean>>;
    setTouched(allTouched);
    return Object.keys(allErrors).length === 0;
  };

  // ─── Event Handlers ───────────────────────────────────────────────────

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const field = name as FormField;
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Re-validate this field live only if it has already been touched
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  /** Mark a field as touched on blur and immediately validate it */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const field = e.target.name as FormField;
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, formData[field]) }));
  };

  /** Convenience: returns the error string only if the field has been touched */
  const fieldError = (field: FormField): string | undefined =>
    touched[field] ? errors[field] : undefined;

  const handlePreview = () => {
    if (validateForm()) {
      injectPrintStyles();
      setShowPreview(true);
    } else {
      toast({ title: "Validation Error", description: "Please fill in all required fields.", variant: "destructive" });
    }
  };

  const handleBackToForm = () => setShowPreview(false);

  const handleDownloadClick = () => {
    navigate("/payment", { state: { cvData: formData } });
  };

  // ─── Helpers ──────────────────────────────────────────────────────────

  const skillList = formData.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const languageList = formData.languages
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);

  const certList = formData.certifications
    .split("\n")
    .map((c) => c.trim())
    .filter(Boolean);

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-4rem)]">
      {showPreview ? (
        /* ──────────────────── CV PREVIEW VIEW ──────────────────────── */
        <div className="max-w-4xl mx-auto">
          {/* Action Bar */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <Button variant="ghost" onClick={handleBackToForm} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Form
            </Button>
            <div className="flex gap-3">
              <Button onClick={handleDownloadClick} className="gap-2 px-6" size="default">
                <CreditCard className="w-4 h-4" />
                Get Premium CV - $9.99
              </Button>
            </div>
          </div>

          {/* ── CV Document ── */}
          <div
            ref={printRef}
            className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200"
            style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}
          >
            {/* ─── Header ─── */}
            <div
              style={{
                background: "linear-gradient(135deg, #1a2a4a 0%, #2d4a7a 60%, #1e3a6e 100%)",
                padding: "2.5rem 2.5rem 2rem",
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: "2rem",
              }}
            >
              {/* Name & Contact */}
              <div style={{ flex: 1 }}>
                <h1
                  style={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    letterSpacing: "0.03em",
                    marginBottom: "0.4rem",
                    lineHeight: 1.2,
                  }}
                >
                  {formData.fullName}
                </h1>
                {formData.careerObjective && (
                  <p style={{ fontSize: "0.85rem", opacity: 0.85, fontStyle: "italic", marginBottom: "0.8rem", maxWidth: "500px" }}>
                    {formData.careerObjective.length > 120
                      ? formData.careerObjective.slice(0, 120) + "…"
                      : formData.careerObjective}
                  </p>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem 1.5rem", fontSize: "0.8rem", opacity: 0.9 }}>
                  {formData.email && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Mail style={{ width: 13, height: 13 }} /> {formData.email}
                    </span>
                  )}
                  {formData.phone && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Phone style={{ width: 13, height: 13 }} /> {formData.phone}
                    </span>
                  )}
                  {formData.address && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <MapPin style={{ width: 13, height: 13 }} /> {formData.address}
                    </span>
                  )}
                  {formData.linkedin && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      🔗 {formData.linkedin}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ─── Two-Column Body ─── */}
            <div style={{ display: "flex", minHeight: "500px" }}>
              {/* Left Sidebar */}
              <div
                style={{
                  width: "35%",
                  background: "#f0f4f9",
                  padding: "1.8rem 1.5rem",
                  borderRight: "1px solid #dde4f0",
                }}
              >
                {/* Skills */}
                <div style={{ marginBottom: "1.8rem" }}>
                  <h2
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      letterSpacing: "0.15em",
                      color: "#1a2a4a",
                      textTransform: "uppercase",
                      borderBottom: "2px solid #2d4a7a",
                      paddingBottom: "0.35rem",
                      marginBottom: "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Star style={{ width: 12, height: 12 }} /> Skills
                  </h2>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    {skillList.map((skill, i) => (
                      <span
                        key={i}
                        style={{
                          background: "#2d4a7a",
                          color: "white",
                          fontSize: "0.7rem",
                          padding: "3px 10px",
                          borderRadius: "999px",
                          fontWeight: 500,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                {languageList.length > 0 && (
                  <div style={{ marginBottom: "1.8rem" }}>
                    <h2
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        letterSpacing: "0.15em",
                        color: "#1a2a4a",
                        textTransform: "uppercase",
                        borderBottom: "2px solid #2d4a7a",
                        paddingBottom: "0.35rem",
                        marginBottom: "0.9rem",
                      }}
                    >
                      🌐 Languages
                    </h2>
                    <ul style={{ paddingLeft: 0, listStyle: "none", margin: 0 }}>
                      {languageList.map((lang, i) => (
                        <li key={i} style={{ fontSize: "0.8rem", color: "#333", marginBottom: 4 }}>
                          • {lang}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Certifications */}
                {certList.length > 0 && (
                  <div>
                    <h2
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        letterSpacing: "0.15em",
                        color: "#1a2a4a",
                        textTransform: "uppercase",
                        borderBottom: "2px solid #2d4a7a",
                        paddingBottom: "0.35rem",
                        marginBottom: "0.9rem",
                      }}
                    >
                      🏅 Certifications
                    </h2>
                    <ul style={{ paddingLeft: 0, listStyle: "none", margin: 0 }}>
                      {certList.map((cert, i) => (
                        <li key={i} style={{ fontSize: "0.78rem", color: "#333", marginBottom: 6, lineHeight: 1.4 }}>
                          ✓ {cert}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Right Content */}
              <div style={{ flex: 1, padding: "1.8rem 2rem" }}>
                {/* Career Objective */}
                {formData.careerObjective && (
                  <div style={{ marginBottom: "1.8rem" }}>
                    <h2
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        letterSpacing: "0.15em",
                        color: "#1a2a4a",
                        textTransform: "uppercase",
                        borderBottom: "2px solid #2d4a7a",
                        paddingBottom: "0.35rem",
                        marginBottom: "0.8rem",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Star style={{ width: 12, height: 12 }} /> Career Objective
                    </h2>
                    <p style={{ fontSize: "0.83rem", color: "#444", lineHeight: 1.7, fontStyle: "italic" }}>
                      {formData.careerObjective}
                    </p>
                  </div>
                )}

                {/* Experience */}
                {formData.experience.trim() && (
                  <div style={{ marginBottom: "1.8rem" }}>
                    <h2
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 800,
                        letterSpacing: "0.15em",
                        color: "#1a2a4a",
                        textTransform: "uppercase",
                        borderBottom: "2px solid #2d4a7a",
                        paddingBottom: "0.35rem",
                        marginBottom: "0.8rem",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Briefcase style={{ width: 12, height: 12 }} /> Experience
                    </h2>
                    <p style={{ fontSize: "0.83rem", color: "#444", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                      {formData.experience}
                    </p>
                  </div>
                )}

                {/* Education */}
                <div style={{ marginBottom: "1.8rem" }}>
                  <h2
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      letterSpacing: "0.15em",
                      color: "#1a2a4a",
                      textTransform: "uppercase",
                      borderBottom: "2px solid #2d4a7a",
                      paddingBottom: "0.35rem",
                      marginBottom: "0.8rem",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <GraduationCap style={{ width: 12, height: 12 }} /> Education
                  </h2>
                  <p style={{ fontSize: "0.83rem", color: "#444", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                    {formData.education}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Strip */}
            <div
              style={{
                background: "linear-gradient(90deg, #2d4a7a, #4a90d9, #2d4a7a)",
                height: "6px",
              }}
            />
          </div>

          <p className="text-xs text-muted-foreground text-right mt-3">
            Click "Download PDF" to save as PDF • or "Get Premium CV" for a beautifully formatted Word/PDF file
          </p>
        </div>
      ) : (
        /* ──────────────────── CV FORM VIEW ─────────────────────────── */
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 shadow-inner">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold font-heading text-foreground">Build Your Professional CV</h1>
            <p className="text-muted-foreground mt-2">Fill in your details to generate a stunning, downloadable CV</p>
          </div>

          {/* ── Completion Progress Bar ── */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">Form completion</span>
              <span
                className="text-xs font-semibold"
                style={{ color: progressPct === 100 ? "#16a34a" : progressPct >= 60 ? "#ca8a04" : "#dc2626" }}
              >
                {progressPct}%
              </span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPct}%`,
                  background:
                    progressPct === 100
                      ? "linear-gradient(90deg,#16a34a,#4ade80)"
                      : progressPct >= 60
                      ? "linear-gradient(90deg,#ca8a04,#facc15)"
                      : "linear-gradient(90deg,#dc2626,#f87171)",
                }}
              />
            </div>
            {progressPct === 100 && (
              <p className="text-xs text-green-600 mt-1 font-medium">✓ All required fields complete — ready to preview!</p>
            )}
          </div>

          {/* Form Card */}
          <div className="bg-card rounded-2xl border border-border p-7 shadow-md space-y-6">

            <form
              onSubmit={(e) => { e.preventDefault(); handlePreview(); }}
              className="space-y-5"
              noValidate
            >
              {/* ── Full Name ── */}
              <div className="space-y-1">
                <Label htmlFor="fullName">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName" name="fullName"
                  placeholder="e.g. John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={RULES.fullName.maxLen}
                  className={fieldError("fullName") ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                <div className="flex justify-between items-center">
                  {fieldError("fullName")
                    ? <p className="text-xs text-destructive">{fieldError("fullName")}</p>
                    : <p className="text-xs text-muted-foreground">Letters, spaces, hyphens and apostrophes only</p>
                  }
                  <span className="text-xs text-muted-foreground ml-auto pl-2">
                    {formData.fullName.length}/{RULES.fullName.maxLen}
                  </span>
                </div>
              </div>

              {/* ── Email & Phone ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                  <Input
                    id="email" name="email" type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={fieldError("email") ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {fieldError("email")
                    ? <p className="text-xs text-destructive">{fieldError("email")}</p>
                    : <p className="text-xs text-muted-foreground">e.g. john@example.com</p>
                  }
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone">Phone <span className="text-destructive">*</span></Label>
                  <Input
                    id="phone" name="phone"
                    placeholder="+1 234 567 8900"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={fieldError("phone") ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {fieldError("phone")
                    ? <p className="text-xs text-destructive">{fieldError("phone")}</p>
                    : <p className="text-xs text-muted-foreground">Include country code for best results</p>
                  }
                </div>
              </div>

              {/* ── Address ── */}
              <div className="space-y-1">
                <Label htmlFor="address">Address <span className="text-destructive">*</span></Label>
                <Input
                  id="address" name="address"
                  placeholder="123 Main Street, City, Country"
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={RULES.address.maxLen}
                  className={fieldError("address") ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                <div className="flex justify-between items-center">
                  {fieldError("address")
                    ? <p className="text-xs text-destructive">{fieldError("address")}</p>
                    : <p className="text-xs text-muted-foreground">Street, city and country</p>
                  }
                  <span className="text-xs text-muted-foreground ml-auto pl-2">
                    {formData.address.length}/{RULES.address.maxLen}
                  </span>
                </div>
              </div>

              {/* ── LinkedIn (optional, validated) ── */}
              <div className="space-y-1">
                <Label htmlFor="linkedin">
                  LinkedIn URL <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="linkedin" name="linkedin"
                  placeholder="linkedin.com/in/johndoe"
                  value={formData.linkedin}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={fieldError("linkedin") ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {fieldError("linkedin")
                  ? <p className="text-xs text-destructive">{fieldError("linkedin")}</p>
                  : <p className="text-xs text-muted-foreground">e.g. linkedin.com/in/johndoe</p>
                }
              </div>

              {/* ── Career Objective ── */}
              <div className="space-y-1">
                <Label htmlFor="careerObjective">
                  Career Objective <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="careerObjective" name="careerObjective"
                  placeholder="A passionate software developer seeking to leverage 2+ years of experience in building scalable web applications..."
                  value={formData.careerObjective}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={3}
                  maxLength={RULES.careerObjective.maxLen}
                  className={fieldError("careerObjective") ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                <div className="flex justify-between items-center">
                  {fieldError("careerObjective")
                    ? <p className="text-xs text-destructive">{fieldError("careerObjective")}</p>
                    : <p className="text-xs text-muted-foreground">Min {RULES.careerObjective.minLen} characters — describe your goals briefly</p>
                  }
                  <span
                    className="text-xs ml-auto pl-2"
                    style={{
                      color: formData.careerObjective.length > RULES.careerObjective.maxLen * 0.9
                        ? "#dc2626" : "#6b7280"
                    }}
                  >
                    {formData.careerObjective.length}/{RULES.careerObjective.maxLen}
                  </span>
                </div>
              </div>

              {/* ── Education ── */}
              <div className="space-y-1">
                <Label htmlFor="education">
                  Education <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="education" name="education"
                  placeholder={"BSc Computer Science, University of XYZ, 2020–2024\nHigh School Diploma, ABC School, 2020"}
                  value={formData.education}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={3}
                  maxLength={RULES.education.maxLen}
                  className={fieldError("education") ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                <div className="flex justify-between items-center">
                  {fieldError("education")
                    ? <p className="text-xs text-destructive">{fieldError("education")}</p>
                    : <p className="text-xs text-muted-foreground">Degree · Institution · Year — one per line</p>
                  }
                  <span className="text-xs text-muted-foreground ml-auto pl-2">
                    {formData.education.length}/{RULES.education.maxLen}
                  </span>
                </div>
              </div>

              {/* ── Skills ── */}
              <div className="space-y-1">
                <Label htmlFor="skills">
                  Skills <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="skills" name="skills"
                  placeholder="React, Node.js, Python, Team Leadership, Communication"
                  value={formData.skills}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={2}
                  maxLength={RULES.skills.maxLen}
                  className={fieldError("skills") ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                <div className="flex justify-between items-center flex-wrap gap-1">
                  {fieldError("skills")
                    ? <p className="text-xs text-destructive">{fieldError("skills")}</p>
                    : <p className="text-xs text-muted-foreground">Separate with commas · min 2, max {RULES.skills.maxCount} skills</p>
                  }
                  <span className="text-xs text-muted-foreground ml-auto pl-2">
                    {skillList.length} skill{skillList.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {/* ── Work Experience ── */}
              <div className="space-y-1">
                <Label htmlFor="experience">
                  Work Experience <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="experience" name="experience"
                  placeholder={"Software Developer Intern — ABC Corp, Jun–Aug 2023\n• Built REST APIs using Node.js\n• Improved app load time by 30%"}
                  value={formData.experience}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={4}
                  maxLength={RULES.experience.maxLen}
                  className={fieldError("experience") ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                <div className="flex justify-between items-center">
                  {fieldError("experience")
                    ? <p className="text-xs text-destructive">{fieldError("experience")}</p>
                    : <p className="text-xs text-muted-foreground">Role · Company · Dates · Key achievements (bullet points work well)</p>
                  }
                  <span className="text-xs text-muted-foreground ml-auto pl-2">
                    {formData.experience.length}/{RULES.experience.maxLen}
                  </span>
                </div>
              </div>

              {/* ── Certifications ── */}
              <div className="space-y-1">
                <Label htmlFor="certifications">
                  Certifications <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="certifications" name="certifications"
                  placeholder={"AWS Certified Developer — 2023\nGoogle UX Design Certificate — 2022"}
                  value={formData.certifications}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={2}
                  maxLength={RULES.certifications.maxLen}
                  className={fieldError("certifications") ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                <div className="flex justify-between items-center">
                  {fieldError("certifications")
                    ? <p className="text-xs text-destructive">{fieldError("certifications")}</p>
                    : <p className="text-xs text-muted-foreground">One certification per line</p>
                  }
                  <span className="text-xs text-muted-foreground ml-auto pl-2">
                    {formData.certifications.length}/{RULES.certifications.maxLen}
                  </span>
                </div>
              </div>

              {/* ── Languages ── */}
              <div className="space-y-1">
                <Label htmlFor="languages">
                  Languages <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="languages" name="languages"
                  placeholder="English (Fluent), French (Intermediate)"
                  value={formData.languages}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={RULES.languages.maxLen}
                  className={fieldError("languages") ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {fieldError("languages")
                  ? <p className="text-xs text-destructive">{fieldError("languages")}</p>
                  : <p className="text-xs text-muted-foreground">Separate with commas</p>
                }
              </div>

              {/* ── Submit ── */}
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full gap-2 h-12 text-base font-semibold"
                  size="lg"
                  disabled={progressPct < 100 && Object.keys(touched).length === 0 ? false : false}
                >
                  <Eye className="w-5 h-5" />
                  Preview My CV
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  <span className="text-destructive">*</span> Required fields — the form will highlight any issues when you click Preview
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CVBuilder;
