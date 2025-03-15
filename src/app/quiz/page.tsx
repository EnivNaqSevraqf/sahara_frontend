'use client';
import React from "react";
import { Box, Grid, Card, CardContent, Typography, Button } from "@mui/material";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

const quizzes = [
  { id: 3, title: "Quiz 3", deadline: "05-02-2025", score: "- / 6", attempt: true },
  { id: 2, title: "Quiz 2", deadline: "30-01-2025", score: "6 / 6", attempt: false },
  { id: 1, title: "Quiz 1", deadline: "23-01-2025", score: "4 / 6", attempt: false },
];

export default function QuizPage() {
  const router = useRouter();
  

  const handleQuizClick = (quizId: number) => {
    router.push(`/quiz/${quizId}`);
  };

  return (
    <Box display="flex">
      <Sidebar />
      <Box flexGrow={1} p={3}>
        <Typography variant="h4" gutterBottom>
          QUIZZES
        </Typography>
        <Grid container spacing={2}>
          {quizzes.map((quiz) => (
            <Grid item xs={12} key={quiz.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{quiz.title}</Typography>
                  <Typography variant="body2">Deadline: {quiz.deadline}</Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Typography variant="body2">Score: {quiz.score}</Typography>
                    {quiz.attempt && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleQuizClick(quiz.id)}
                      >
                        Attempt
                      </Button>
                    )}
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
