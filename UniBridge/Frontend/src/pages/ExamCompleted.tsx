import { useNavigate } from "react-router-dom";
import { ShieldCheck, XSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const ExamCompleted = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    window.close();
    setTimeout(() => {
      // In case window.close() is blocked, navigate to a neutral page.
      navigate("/");
    }, 300);
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="bg-card rounded-3xl p-10 max-w-3xl w-full shadow-xl text-center">
        <div className="mx-auto mb-6 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
          <ShieldCheck className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-3xl font-heading font-bold text-foreground mb-4">Exam Completed</h1>
        <p className="text-muted-foreground mb-6">
          Your exam session has finished. Safe Exam Browser is still active in a locked mode. Please use the button below to close the exam window.
        </p>

        <div className="space-y-4 text-left max-w-xl mx-auto">
          <div className="p-4 bg-muted/50 rounded-2xl">
            <h2 className="font-semibold text-foreground mb-2">Close SEB</h2>
            <p className="text-sm text-muted-foreground">
              If the browser window does not close automatically, use the Safe Exam Browser menu or close button inside the SEB application.
            </p>
          </div>
          <div className="p-4 bg-muted/50 rounded-2xl">
            <h2 className="font-semibold text-foreground mb-2">If close is blocked</h2>
            <p className="text-sm text-muted-foreground">
              In some systems, automatic window closing is blocked. If that happens, close the Safe Exam Browser window manually from the OS.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row justify-center">
          <Button onClick={handleClose} className="w-full sm:w-auto">
            <XSquare className="w-4 h-4 mr-2" />
            Close Safe Exam Browser
          </Button>
          <Button variant="outline" onClick={() => navigate('/')} className="w-full sm:w-auto">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExamCompleted;
