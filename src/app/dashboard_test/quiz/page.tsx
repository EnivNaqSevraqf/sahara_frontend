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
import { currentConfig } from '@/config';

interface Quiz {
  _id: string;
  form_name: string;
  deadline: string;
  score: string;
  deadline_passed: boolean;
  attempt: boolean;
}

export default function QuizPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const payload = {
    user_id: "123",
  }
  useEffect(() => {
    axios.post(`${currentConfig.apiBaseUrl}/api/get_forms`, payload)
      .then(response => {
        setQuizzes(response.data);
      })
      .catch(error => {
        console.error('Error fetching quizzes:', error);
      });
  }, []);

  const handleQuizClick = (quizId: string) => {
    router.push(`/quiz/${quizId}`);
  };

  return (
    <Box display="flex">
      <Box flexGrow={1} p={3}>
        <Typography variant="h4" gutterBottom>
          QUIZZES
        </Typography>
        <Grid container spacing={2}>
          {quizzes.map((quiz) => (
            <Grid item xs={12} key={quiz._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Title: {quiz.form_name}</Typography>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                      label="Deadline"
                      value={dayjs(quiz.deadline)}
                      readOnly
                      // renderInput={(params) => <TextField {...params} />}
                    />
                  </LocalizationProvider>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Typography variant="body2">Score: {quiz.score}</Typography>
                    {(!quiz.deadline_passed && quiz.attempt) && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleQuizClick(quiz._id)}
                      >
                        Attempt
                      </Button>
                    )}
                    {
                      (quiz.deadline_passed && quiz.attempt) && (
                        <Typography variant="body2" color="error">Deadline Passed</Typography>
                      )  
                    }
                    {
                      (!quiz.attempt) && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleQuizClick(quiz._id)}
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
