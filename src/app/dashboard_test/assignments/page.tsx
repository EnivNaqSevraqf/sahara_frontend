'use client';
import React, { useState } from "react";
import { 
  Button, 
  Card, 
  CardContent, 
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";

interface Assignment {
  name: string;
  description: string; 
  file: File | null;
  dueDate: string;
}

const assignments: Assignment[] = [
  { name: "C++ Assignment", description: "placeholder", file: null, dueDate: "2025-03-07" },
  { name: "Bash Script Assignment", description: "placeholder", file: null, dueDate: "2025-03-28" },
  { name: "Python Programming", description: "placeholder", file: null, dueDate: "2025-04-17" },
];

const AssignmentsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<{ [key: string]: File | null }>({});
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [pendingUpload, setPendingUpload] = useState<{ file: File | null, assignmentName: string | null }>({
    file: null,
    assignmentName: null
  });

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>, name: string) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setPendingUpload({ file, assignmentName: name });
      setConfirmationOpen(true);
    }
  };

  const handleConfirmUpload = () => {
    if (pendingUpload.file && pendingUpload.assignmentName) {
      const assignmentName: string = pendingUpload.assignmentName;
      setSubmissions((prev) => ({ 
        ...prev, 
        [assignmentName]: pendingUpload.file 
      }));
    }
    setConfirmationOpen(false);
    setPendingUpload({ file: null, assignmentName: null });
  };

  const handleCancelUpload = () => {
    setConfirmationOpen(false);
    setPendingUpload({ file: null, assignmentName: null });
  };

  const handleRemove = (name: string) => {
    setSubmissions((prev) => ({ ...prev, [name]: null }));
  };

  const handleDownload = (name: string) => {
    const file = submissions[name];
    if (file) {
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const currentDate = new Date();

  return (
    <div>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Ongoing Assignments
      </Typography>
      {assignments.map((assignment) => {
        const dueDate = new Date(assignment.dueDate);
        const isPast = dueDate < currentDate;
        const submittedFile = submissions[assignment.name];

        if (!isPast) {
          return (
            <Card key={assignment.name} style={{ marginBottom: 16, padding: 16 }}>
              <CardContent>
                <Typography variant="h6">{assignment.name}</Typography>
                <Typography color="textSecondary">Description: {assignment.description}</Typography>
                <Typography color="textSecondary">Due: {assignment.dueDate}</Typography>

                {!submittedFile && (
                  <>
                    <input
                      type="file"
                      onChange={(e) => handleUpload(e, assignment.name)}
                      accept=".txt,.pdf,.zip,.docx"
                      style={{ display: "none" }}
                      id={`upload-${assignment.name}`}
                    />
                    <label htmlFor={`upload-${assignment.name}`}>
                      <Button
                        component="span"
                        variant="contained"
                        style={{ backgroundColor: "#1E88E5", color: "white", marginTop: 10 }}
                        startIcon={<CloudUploadIcon />}
                      >
                        Upload Document
                      </Button>
                    </label>
                  </>
                )}

                {submittedFile && (
                  <>
                    <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
                      Uploaded: {submittedFile.name}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleRemove(assignment.name)}
                      style={{ marginLeft: 8, marginTop: 10 }}
                    >
                      Remove Document
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload(assignment.name)}
                      style={{ marginLeft: 8, marginTop: 10 }}
                    >
                      Download Submission
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          );
        }
      })}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmationOpen}
        onClose={handleCancelUpload}
        aria-labelledby="upload-confirmation-dialog-title"
        aria-describedby="upload-confirmation-dialog-description"
      >
        <DialogTitle id="upload-confirmation-dialog-title">
          Confirm File Submission
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="upload-confirmation-dialog-description">
            Are you sure you want to submit the file? You can change your submission anytime before the due date.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelUpload} color="primary">
            No
          </Button>
          <Button onClick={handleConfirmUpload} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>


      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Previous Assignments
      </Typography>
      {assignments.map((assignment) => {
        const dueDate = new Date(assignment.dueDate);
        const isPast = dueDate < currentDate;
        const submittedFile = submissions[assignment.name];

        if (isPast) {
          return (
            <Card key={assignment.name} style={{ marginBottom: 16, padding: 16 }}>
              <CardContent>
                <Typography variant="h6">{assignment.name}</Typography>
                <Typography color="textSecondary">Description: {assignment.description}</Typography>
                <Typography color="textSecondary">Due: {assignment.dueDate}</Typography>
                {submittedFile && (
                  <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
                    Submitted: {submittedFile.name}
                  </Typography>
                )}
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleDownload(assignment.name)}
                  disabled={!submittedFile}
                  style={{
                    backgroundColor: submittedFile ? "#1E88E5" : "#E0E0E0",
                    color: submittedFile ? "white" : "#A0A0A0",
                    marginTop: 10,
                  }}
                >
                  Download Submission
                </Button>
              </CardContent>
            </Card>
          );
        }
      })}
    </div>
  );
};

export default AssignmentsPage;