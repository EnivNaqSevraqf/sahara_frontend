'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Typography, Paper, CircularProgress, Link } from '@mui/material';

const GitHubLinkComponent = () => {
  const [githubLink, setGithubLink] = useState('');
  const [hasExistingLink, setHasExistingLink] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchGithubLink();
  }, []);

  const fetchGithubLink = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:8000/project/github');
      if (response.data && response.data.link) {
        setGithubLink(response.data.link);
        setHasExistingLink(true);
      }
    } catch (error) {
      console.error('Error fetching GitHub link:', error);
    } finally {
      setIsLoading(false);
    }
  };

interface GithubResponse {
    link: string;
}

interface SubmitEvent extends React.FormEvent<HTMLFormElement> {
    preventDefault(): void;
}

const handleSubmit = async (e: SubmitEvent): Promise<void> => {
    e.preventDefault();

    if (!githubLink.trim()) {
        setErrorMessage('Please enter a GitHub link');
        return;
    }

    if (!githubLink.includes('github.com')) {
        setErrorMessage('Please enter a valid GitHub URL');
        return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
        const endpoint: string = 'http://localhost:8000/project';
        const method: 'put' | 'post' = hasExistingLink ? 'put' : 'post';

        await axios[method]<GithubResponse>(endpoint, { githubLink });

        setHasExistingLink(true);
        alert(hasExistingLink ? 'GitHub link updated successfully!' : 'GitHub link added successfully!');
    } catch (error: unknown) {
        console.error('Error saving GitHub link:', error);
        setErrorMessage('Failed to save link. Please try again.');
    } finally {
        setIsLoading(false);
    }
};

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Enter the link to you Github Repository
      </Typography>

      {hasExistingLink && (
        <Paper elevation={3} sx={{ p: 2, mb: 3, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
          <Link href={githubLink} target="_blank" rel="noopener noreferrer" sx={{ color: 'inherit' }}>
            {githubLink}
          </Link>
        </Paper>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx= {{ width: '600px', mx: 'auto' }}>
        <TextField
          // fullWidth
          variant="outlined"
          label="GitHub Repository Link"
          value={githubLink}
          onChange={(e) => setGithubLink(e.target.value)}
          placeholder="https://github.com/username/repository"
          disabled={isLoading}
          error={!!errorMessage}
          helperText={errorMessage}
          sx={{ mb: 2, width: '100%' }}
        />
        </Box>

        <Box display="flex" justifyContent="center">
          <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : hasExistingLink ? 'Edit Link' : 'Add Link'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default GitHubLinkComponent;
