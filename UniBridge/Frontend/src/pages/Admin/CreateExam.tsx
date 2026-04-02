import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import examService from "@/services/examService";
import { Loader2, Plus, CheckCircle } from "lucide-react";

const CreateExam = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    timeLimit: "",
    passingScore: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.timeLimit || !formData.passingScore) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: formData.title,
        description: formData.description,
        timeLimit: parseInt(formData.timeLimit),
        passingScore: parseInt(formData.passingScore)
      };

      const response = await examService.createExam(payload);

      if (response.success) {
        toast({
          title: "Success",
          description: "Exam created successfully!"
        });
        setSuccess(true);
        setFormData({ title: "", description: "", timeLimit: "", passingScore: "" });
        
        // Reset success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create exam",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Plus className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Create New Exam</h1>
      </div>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>Exam created successfully! You can now add questions to it.</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Exam Details</CardTitle>
          <CardDescription>Enter the basic information for your exam</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Exam Title *</label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Java Fundamentals Quiz"
                maxLength={100}
                required
              />
              <p className="text-xs text-gray-500">{formData.title.length}/100</p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Description</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter exam description..."
                maxLength={1000}
                rows={4}
              />
              <p className="text-xs text-gray-500">{formData.description.length}/1000</p>
            </div>

            {/* Time Limit */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Time Limit (minutes) *</label>
                <Input
                  type="number"
                  name="timeLimit"
                  value={formData.timeLimit}
                  onChange={handleChange}
                  placeholder="e.g., 60"
                  min="1"
                  required
                />
              </div>

              {/* Passing Score */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Passing Score (%) *</label>
                <Input
                  type="number"
                  name="passingScore"
                  value={formData.passingScore}
                  onChange={handleChange}
                  placeholder="e.g., 50"
                  min="0"
                  max="100"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Exam
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>• After creating an exam, you can add questions through the "Add Questions" section</p>
          <p>• Time limit should be in minutes (e.g., 60 for 1 hour)</p>
          <p>• Passing score is the percentage needed to pass the exam</p>
          <p>• You can edit or delete exams from the "View Exams" section</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateExam;
