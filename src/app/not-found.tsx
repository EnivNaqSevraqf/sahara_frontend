'use client';

import { Suspense } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
// import ClientComponentWrapper from '@/components/ClientComponentWrapper';

function NotFoundContent() {
  

  return (
    <h1>404 not found</h1>
  );
}

export default function NotFound() {
  return (
    <Suspense>
      <NotFoundContent />
    </Suspense>
  );
}