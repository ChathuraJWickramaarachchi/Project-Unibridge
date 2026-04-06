// Validation utilities for the UniBridge application

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return { isValid: false, error: "Email is required" };
  }
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  return { isValid: true };
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }
  if (password.length < 6) {
    return { isValid: false, error: "Password must be at least 6 characters long" };
  }
  if (password.length > 128) {
    return { isValid: false, error: "Password must not exceed 128 characters" };
  }
  return { isValid: true };
};

// Confirm password validation
export const validateConfirmPassword = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, error: "Please confirm your password" };
  }
  if (password !== confirmPassword) {
    return { isValid: false, error: "Passwords do not match" };
  }
  return { isValid: true };
};

// Name validation (first name, last name)
export const validateName = (name: string, fieldName: string): ValidationResult => {
  if (!name) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  if (name.length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters long` };
  }
  if (name.length > 50) {
    return { isValid: false, error: `${fieldName} must not exceed 50 characters` };
  }
  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return { isValid: false, error: `${fieldName} contains invalid characters` };
  }
  return { isValid: true };
};

// OTP validation
export const validateOTP = (otp: string): ValidationResult => {
  if (!otp) {
    return { isValid: false, error: "OTP is required" };
  }
  if (otp.length !== 6) {
    return { isValid: false, error: "OTP must be 6 digits" };
  }
  if (!/^\d+$/.test(otp)) {
    return { isValid: false, error: "OTP must contain only numbers" };
  }
  return { isValid: true };
};

// University validation
export const validateUniversity = (university: string): ValidationResult => {
  if (!university) {
    return { isValid: false, error: "University is required" };
  }
  if (university.length < 2) {
    return { isValid: false, error: "University name must be at least 2 characters long" };
  }
  if (university.length > 100) {
    return { isValid: false, error: "University name must not exceed 100 characters" };
  }
  return { isValid: true };
};

// Major validation
export const validateMajor = (major: string): ValidationResult => {
  if (!major) {
    return { isValid: false, error: "Major is required" };
  }
  if (major.length < 2) {
    return { isValid: false, error: "Major must be at least 2 characters long" };
  }
  if (major.length > 100) {
    return { isValid: false, error: "Major must not exceed 100 characters" };
  }
  return { isValid: true };
};

// Year validation
export const validateYear = (year: string): ValidationResult => {
  if (!year) {
    return { isValid: false, error: "Year is required" };
  }
  const yearNum = parseInt(year, 10);
  if (isNaN(yearNum)) {
    return { isValid: false, error: "Year must be a valid number" };
  }
  if (yearNum < 1 || yearNum > 10) {
    return { isValid: false, error: "Year must be between 1 and 10" };
  }
  return { isValid: true };
};

// Bio validation
export const validateBio = (bio: string): ValidationResult => {
  if (bio.length > 500) {
    return { isValid: false, error: "Bio must not exceed 500 characters" };
  }
  return { isValid: true };
};

// Skills validation
export const validateSkills = (skills: string): ValidationResult => {
  if (skills.length > 500) {
    return { isValid: false, error: "Skills list must not exceed 500 characters" };
  }
  return { isValid: true };
};

// GPA validation
export const validateGPA = (gpa: string): ValidationResult => {
  if (!gpa) {
    return { isValid: true }; // GPA is optional
  }
  const gpaNum = parseFloat(gpa);
  if (isNaN(gpaNum)) {
    return { isValid: false, error: "GPA must be a valid number" };
  }
  if (gpaNum < 0 || gpaNum > 4.0) {
    return { isValid: false, error: "GPA must be between 0 and 4.0" };
  }
  return { isValid: true };
};

// Current password validation
export const validateCurrentPassword = (currentPassword: string): ValidationResult => {
  if (!currentPassword) {
    return { isValid: false, error: "Current password is required" };
  }
  return { isValid: true };
};