import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  GraduationCap, 
  Building, 
  MapPin, 
  Calendar,
  Edit,
  Save,
  X,
  ArrowLeft,
  Settings,
  Camera,
  Upload,
  Trash2,
  FileText,
  Download,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import SettingsComponent from "@/components/Settings";
import {
  validateUniversity,
  validateMajor,
  validateYear,
  validateGPA,
  validateBio,
  validateSkills,
} from "@/lib/validation";

const Profile = () => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { section } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.profile?.avatar || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvPreview, setCvPreview] = useState<string | null>(user?.profile?.cv || null);
  const [cvFileName, setCvFileName] = useState<string>(user?.profile?.cvName || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    university: user?.profile?.university || "",
    major: user?.profile?.major || "",
    year: user?.profile?.year || "",
    semester: user?.profile?.semester || "",
    gpa: user?.profile?.gpa || "",
    bio: user?.profile?.bio || "",
    skills: user?.profile?.skills?.join(", ") || ""
  });

  // Update avatar and CV preview when user changes
  useEffect(() => {
    if (user?.profile?.avatar) {
      setAvatarPreview(user.profile.avatar);
    }
    if (user?.profile?.cv) {
      setCvPreview(user.profile.cv);
      setCvFileName(user.profile.cvName || "CV.pdf");
    }
  }, [user]);

  // Set active tab based on URL section parameter
  const [activeTab, setActiveTab] = useState(section === 'settings' ? 'settings' : 'profile');

  // Update active tab when section parameter changes
  useEffect(() => {
    if (section === 'settings') {
      setActiveTab('settings');
    } else {
      setActiveTab('profile');
    }
  }, [section]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCvClick = () => {
    if (isEditing && cvInputRef.current) {
      cvInputRef.current.click();
    }
  };

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type (PDF, DOC, DOCX)
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Please upload a PDF or Word document",
          variant: "destructive"
        });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "CV file size should be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setCvFile(file);
      setCvFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCvPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCv = () => {
    setCvFile(null);
    setCvPreview(null);
    setCvFileName("");
    if (cvInputRef.current) {
      cvInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size should be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    // Validate form fields
    const universityValidation = validateUniversity(profileData.university);
    const majorValidation = validateMajor(profileData.major);
    const yearValidation = validateYear(profileData.year.toString());
    const gpaValidation = validateGPA(profileData.gpa.toString());
    const bioValidation = validateBio(profileData.bio);
    const skillsValidation = validateSkills(profileData.skills);
    
    if (!universityValidation.isValid) {
      toast({
        title: "Validation Error",
        description: universityValidation.error,
        variant: "destructive"
      });
      return;
    }
    
    if (!majorValidation.isValid) {
      toast({
        title: "Validation Error",
        description: majorValidation.error,
        variant: "destructive"
      });
      return;
    }
    
    if (!yearValidation.isValid) {
      toast({
        title: "Validation Error",
        description: yearValidation.error,
        variant: "destructive"
      });
      return;
    }
    
    if (!gpaValidation.isValid) {
      toast({
        title: "Validation Error",
        description: gpaValidation.error,
        variant: "destructive"
      });
      return;
    }
    
    if (!bioValidation.isValid) {
      toast({
        title: "Validation Error",
        description: bioValidation.error,
        variant: "destructive"
      });
      return;
    }
    
    if (!skillsValidation.isValid) {
      toast({
        title: "Validation Error",
        description: skillsValidation.error,
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const updateData: any = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        address: profileData.address,
        profile: {
          university: profileData.university,
          major: profileData.major,
          year: profileData.year,
          semester: profileData.semester,
          gpa: profileData.gpa,
          bio: profileData.bio,
          skills: profileData.skills.split(",").map(skill => skill.trim()).filter(skill => skill)
        }
      };

      // Include avatar if changed
      if (avatarFile) {
        updateData.profile.avatar = avatarPreview;
      } else if (avatarPreview === null && user?.profile?.avatar) {
        // Avatar was removed
        updateData.profile.avatar = null;
      }

      // Include CV if changed
      if (cvFile) {
        updateData.profile.cv = cvPreview;
        updateData.profile.cvName = cvFileName;
      } else if (cvPreview === null && user?.profile?.cv) {
        // CV was removed
        updateData.profile.cv = null;
        updateData.profile.cvName = null;
      }

      const response = await updateProfile(updateData);

      if (response.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully"
        });
        setIsEditing(false);
        setAvatarFile(null);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update profile",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <div className="flex-1 text-center">
            <h1 className="text-3xl font-heading font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-2">Manage your personal information and preferences</p>
          </div>
          <div className="w-24"></div> {/* Spacer for alignment */}
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-sm grid-cols-2 mx-auto">
            <TabsTrigger value="profile" onClick={() => navigate('/profile')}>Profile</TabsTrigger>
            <TabsTrigger value="settings" onClick={() => navigate('/profile/settings')}>Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card */}
              <motion.div
                className="lg:col-span-1"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="sticky top-24">
                  <CardHeader className="text-center">
                    {/* Avatar Upload Section */}
                    <div className="relative mx-auto mb-4">
                      <div 
                        className={`w-28 h-28 rounded-full overflow-hidden mx-auto flex items-center justify-center ${
                          isEditing ? 'cursor-pointer ring-4 ring-primary/20 hover:ring-primary/40' : ''
                        } transition-all ${avatarPreview ? '' : 'bg-primary'}`}
                        onClick={handleAvatarClick}
                      >
                        {avatarPreview ? (
                          <img 
                            src={avatarPreview} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-14 h-14 text-primary-foreground" />
                        )}
                        
                        {/* Edit overlay */}
                        {isEditing && (
                          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                            <Camera className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      
                      {/* Remove button */}
                      {isEditing && avatarPreview && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveAvatar();
                          }}
                          className="absolute -bottom-1 -right-1 w-8 h-8 bg-destructive rounded-full flex items-center justify-center text-white hover:bg-destructive/90 transition-colors shadow-lg"
                          title="Remove photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      
                      {/* Upload indicator */}
                      {isEditing && !avatarPreview && (
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
                          <Upload className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    
                    {isEditing && (
                      <p className="text-xs text-muted-foreground mb-2">
                        Click to upload photo (max 5MB)
                      </p>
                    )}
                    
                    <CardTitle className="text-xl">
                      {user.firstName} {user.lastName}
                    </CardTitle>
                    <p className="text-muted-foreground capitalize">{user.role}</p>
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mt-2">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-center gap-2">
                      <Button 
                        onClick={() => setIsEditing(!isEditing)}
                        variant={isEditing ? "outline" : "default"}
                        size="sm"
                      >
                        {isEditing ? (
                          <>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </>
                        ) : (
                          <>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Profile
                          </>
                        )}
                      </Button>
                      {isEditing && (
                        <Button 
                          onClick={handleSave}
                          disabled={loading}
                          size="sm"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {loading ? "Saving..." : "Save"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Profile Details */}
              <motion.div
                className="lg:col-span-2 space-y-6"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">First Name</label>
                        <Input
                          name="firstName"
                          value={profileData.firstName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={isEditing ? "" : "bg-muted"}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Last Name</label>
                        <Input
                          name="lastName"
                          value={profileData.lastName}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={isEditing ? "" : "bg-muted"}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <Input
                        name="email"
                        value={profileData.email}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone Number</label>
                        <Input
                          name="phone"
                          value={profileData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={isEditing ? "" : "bg-muted"}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Address</label>
                        <Input
                          name="address"
                          value={profileData.address}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={isEditing ? "" : "bg-muted"}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Academic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      Academic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">University</label>
                        <Input
                          name="university"
                          value={profileData.university}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Enter your university"
                          className={isEditing ? "" : "bg-muted"}
                          onBlur={(e) => {
                            const validation = validateUniversity(e.target.value);
                            if (!validation.isValid && e.target.value) {
                              toast({
                                title: "Validation Error",
                                description: validation.error,
                                variant: "destructive"
                              });
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Major</label>
                        <Input
                          name="major"
                          value={profileData.major}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Enter your major"
                          className={isEditing ? "" : "bg-muted"}
                          onBlur={(e) => {
                            const validation = validateMajor(e.target.value);
                            if (!validation.isValid && e.target.value) {
                              toast({
                                title: "Validation Error",
                                description: validation.error,
                                variant: "destructive"
                              });
                            }
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Year of Study</label>
                        <Input
                          name="year"
                          type="number"
                          value={profileData.year}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Enter year (1-10)"
                          min="1"
                          max="10"
                          className={isEditing ? "" : "bg-muted"}
                          onBlur={(e) => {
                            const validation = validateYear(e.target.value);
                            if (!validation.isValid && e.target.value) {
                              toast({
                                title: "Validation Error",
                                description: validation.error,
                                variant: "destructive"
                              });
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Semester</label>
                        <Input
                          name="semester"
                          type="number"
                          value={profileData.semester}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Enter semester (1-8)"
                          min="1"
                          max="8"
                          className={isEditing ? "" : "bg-muted"}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">GPA</label>
                        <Input
                          name="gpa"
                          type="number"
                          step="0.01"
                          value={profileData.gpa}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Enter GPA (0.00 - 4.00)"
                          min="0"
                          max="4"
                          className={isEditing ? "" : "bg-muted"}
                          onBlur={(e) => {
                            const validation = validateGPA(e.target.value);
                            if (!validation.isValid && e.target.value) {
                              toast({
                                title: "Validation Error",
                                description: validation.error,
                                variant: "destructive"
                              });
                            }
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* About */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      About Me
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <label className="block text-sm font-medium mb-2">Bio</label>
                      <Textarea
                        name="bio"
                        value={profileData.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Tell us about yourself..."
                        rows={4}
                        className={isEditing ? "" : "bg-muted"}
                        onBlur={(e) => {
                          const validation = validateBio(e.target.value);
                          if (!validation.isValid && e.target.value) {
                            toast({
                              title: "Validation Error",
                              description: validation.error,
                              variant: "destructive"
                            });
                          }
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* CV Upload Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Curriculum Vitae (CV)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {cvPreview ? (
                        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                          <FileText className="w-10 h-10 text-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{cvFileName || "CV.pdf"}</p>
                            <p className="text-sm text-muted-foreground">Uploaded CV</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={cvPreview}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-secondary rounded-lg transition-colors"
                              title="View CV"
                            >
                              <Eye className="w-5 h-5" />
                            </a>
                            <a
                              href={cvPreview}
                              download={cvFileName || "CV.pdf"}
                              className="p-2 hover:bg-secondary rounded-lg transition-colors"
                              title="Download CV"
                            >
                              <Download className="w-5 h-5" />
                            </a>
                            {isEditing && (
                              <button
                                onClick={handleRemoveCv}
                                className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                                title="Remove CV"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground mb-2">No CV uploaded yet</p>
                          {isEditing && (
                            <p className="text-sm text-muted-foreground">Click below to upload your CV</p>
                          )}
                        </div>
                      )}
                      
                      {isEditing && (
                        <div>
                          <input
                            ref={cvInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleCvChange}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCvClick}
                            className="w-full"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {cvPreview ? "Replace CV" : "Upload CV"}
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">
                            Accepted formats: PDF, DOC, DOCX (max 5MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <label className="block text-sm font-medium mb-2">Skills (comma separated)</label>
                      <Input
                        name="skills"
                        value={profileData.skills}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="e.g., JavaScript, React, Node.js, Python"
                        className={isEditing ? "" : "bg-muted"}
                        onBlur={(e) => {
                          const validation = validateSkills(e.target.value);
                          if (!validation.isValid && e.target.value) {
                            toast({
                              title: "Validation Error",
                              description: validation.error,
                              variant: "destructive"
                            });
                          }
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <SettingsComponent />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;