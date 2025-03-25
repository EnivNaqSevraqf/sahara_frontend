'use client';
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Grid, Card, CardContent, Typography, Button, TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';

interface Form {
  _id: string;
  form_name: string;
  deadline: string;
  score: string;
  deadline_passed: boolean;
  attempt: boolean;
}

export default function FormPage() {
  const router = useRouter();
  const [Forms, setForms] = useState<Form[]>([]);
  const payload = {
    user_id: "123",
  }
  useEffect(() => {
    axios.post('http://localhost:8000/api/get_forms', payload)
      .then(response => {
        setForms(response.data);
      })
      .catch(error => {
        console.error('Error fetching Forms:', error);
      });
  }, []);

  const handleFormClick = (FormId: string) => {
    router.push(`/Form/${FormId}`);
  };

  return (
    <Box display="flex">
      <Box flexGrow={1} p={3}>
        <Typography variant="h4" gutterBottom>
          Forms
        </Typography>
        <Grid container spacing={2}>
          {Forms.map((Form) => (
            <Grid item xs={12} key={Form._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Title: {Form.form_name}</Typography>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                      label="Deadline"
                      value={dayjs(Form.deadline)}
                      readOnly
                      // renderInput={(params) => <TextField {...params} />}
                    />
                  </LocalizationProvider>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Typography variant="body2">Score: {Form.score}</Typography>
                    {(!Form.deadline_passed && Form.attempt) && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleFormClick(Form._id)}
                      >
                        Attempt
                      </Button>
                    )}
                    {
                      (Form.deadline_passed && Form.attempt) && (
                        <Typography variant="body2" color="error">Deadline Passed</Typography>
                      )  
                    }
                    {
                      (!Form.attempt) && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleFormClick(Form._id)}
                          color="success"
                          >View Attempt</Button>
                        // <Typography variant="body2" color="success">Attempted</Typography>
                      )
                    }
                    
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
