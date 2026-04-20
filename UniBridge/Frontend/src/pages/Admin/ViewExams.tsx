import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import examService from "@/services/examService";
import { Loader2, Trash2, Edit2, Eye } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const ViewExams = () => {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Edit State
  const [editingExam, setEditingExam] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    timeLimit: "",
    passingScore: "",
    status: "active"
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      const response = await examService.getAllAdminExams();
      if (response.success) {
        setExams(response.data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load exams",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (exam: any) => {
    console.log("[FRONTEND] Edit button clicked for exam:", exam._id);
    setEditingExam(exam);
    setEditForm({
      title: exam.title || "",
      description: exam.description || "",
      timeLimit: exam.timeLimit?.toString() || "",
      passingScore: exam.passingScore?.toString() || "",
      status: exam.status || "active"
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExam) return;

    try {
      setUpdating(true);
      console.log("[FRONTEND] Submitting update for exam:", editingExam._id);
      
      const payload = {
        title: editForm.title,
        description: editForm.description,
        timeLimit: parseInt(editForm.timeLimit),
        passingScore: parseInt(editForm.passingScore),
        status: editForm.status
      };

      console.log("[FRONTEND] Update payload:", payload);
      
      const response = await examService.updateAdminExam(editingExam._id, payload);

      if (response.success) {
        toast({
          title: "Success",
          description: "Exam updated successfully"
        });
        setEditingExam(null);
        loadExams();
      }
    } catch (error: any) {
      console.error("[FRONTEND] Update error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update exam",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      const response = await examService.deleteAdminExam(deleteId);

      if (response.success) {
        toast({
          title: "Success",
          description: "Exam deleted successfully"
        });
        loadExams();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete exam",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Eye className="w-6 h-6" />
        <h1 className="text-3xl font-bold">View Exams</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Exams</CardTitle>
          <CardDescription>
            {exams.length} exam(s) total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No exams found. Create one to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[25%]">Title</TableHead>
                    <TableHead className="w-[25%]">Description</TableHead>
                    <TableHead>Time Limit</TableHead>
                    <TableHead>Passing Score</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map((exam) => (
                    <TableRow key={exam._id}>
                      <TableCell className="font-semibold">{exam.title}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {exam.description?.substring(0, 30)}...
                      </TableCell>
                      <TableCell>{exam.timeLimit} min</TableCell>
                      <TableCell>{exam.passingScore}%</TableCell>
                      <TableCell>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          {exam.questionCount}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(exam.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={deleting}
                            onClick={() => handleEditClick(exam)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteId(exam._id)}
                            disabled={deleting}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exam</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This will also delete all questions associated with this exam.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Exam Dialog */}
      <Dialog open={!!editingExam} onOpenChange={() => setEditingExam(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Exam</DialogTitle>
            <DialogDescription>
              Update the details for "{editingExam?.title}"
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Exam Title</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeLimit">Time Limit (min)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  value={editForm.timeLimit}
                  onChange={(e) => setEditForm({ ...editForm, timeLimit: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passingScore">Pass Score (%)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  max="100"
                  value={editForm.passingScore}
                  onChange={(e) => setEditForm({ ...editForm, passingScore: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setEditingExam(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updating}>
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewExams;
