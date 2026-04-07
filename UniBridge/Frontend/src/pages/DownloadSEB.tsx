import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Download, ExternalLink, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import examService from "@/services/examService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DownloadSEB = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [sebDownloaded, setSebDownloaded] = useState(false);

  const downloadSEBConfig = async () => {
    if (!examId) return;

    try {
      setDownloading(true);
      const response = await examService.downloadSEBConfig(examId);

      if (response.success) {
        setSebDownloaded(true);
        toast.success("SEB configuration downloaded successfully!");
      } else {
        toast.error("Failed to download SEB configuration");
      }
    } catch (error) {
      console.error("Error downloading SEB config:", error);
      toast.error("Failed to download SEB configuration");
    } finally {
      setDownloading(false);
    }
  };

  const openSEBDownloadPage = () => {
    window.open('https://safeexambrowser.org/download_en.html', '_blank');
  };

  const startExam = () => {
    if (examId) {
      navigate(`/exam/${examId}`);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-heading">
            Secure Exam Environment
          </CardTitle>
          <p className="text-muted-foreground">
            This exam requires Safe Exam Browser for a secure testing environment
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              To prevent cheating and ensure exam integrity, this exam must be taken using Safe Exam Browser (SEB).
              SEB creates a locked-down environment that prevents access to other applications and system functions.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">Download Safe Exam Browser</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Download and install SEB on your computer. It's free and available for Windows, macOS, and Linux.
                </p>
                <Button
                  onClick={openSEBDownloadPage}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Download SEB
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">Download Exam Configuration</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Download the exam-specific configuration file (.seb) that will automatically start the exam in SEB.
                </p>
                <Button
                  onClick={downloadSEBConfig}
                  disabled={downloading}
                  className="w-full sm:w-auto"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {downloading ? "Downloading..." : "Download Exam Config"}
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">Start the Exam</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  After installing SEB, open the downloaded .seb file to start the exam in the secure environment.
                </p>
                {sebDownloaded && (
                  <div className="flex items-center gap-2 text-green-600 mb-3">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Configuration downloaded successfully</span>
                  </div>
                )}
                <Button
                  onClick={startExam}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Go to Exam Page
                </Button>
              </div>
            </div>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Having trouble? Contact your exam administrator for assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DownloadSEB;