"use client";
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Breadcrumbs, { breadcrumbsClasses } from '@mui/material/Breadcrumbs';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import HomeIcon from '@mui/icons-material/Home';
import Box from '@mui/material/Box';

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  [`& .${breadcrumbsClasses.separator}`]: {
    margin: 1,
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: 'center',
  },
}));

// Helper to generate title case
const toTitleCase = (text: string): string => {
  return text
    .replace(/-|_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
};

export default function NavbarBreadcrumbs() {
  const pathname = usePathname();
  
  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = () => {
    // Skip empty segments and create breadcrumb trail
    const segments = pathname.split('/').filter(Boolean);
    
    if (segments.length === 0) {
      return [{ name: 'Home', path: '/', active: true }];
    }
    
    // Start with dashboard
    const breadcrumbs = [{ name: 'Dashboard', path: '/dashboard_test', active: false }];
    
    // Build path progressively
    let currentPath = '/dashboard_test';
    segments.forEach((segment, index) => {
      // Skip the first segment if it's already dashboard_test
      if (index === 0 && segment === 'dashboard_test') {
        return;
      }
      
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1 || 
                    (index === segments.length - 2 && segment === 'dashboard_test');
      
      breadcrumbs.push({
        name: toTitleCase(segment),
        path: currentPath,
        active: isLast
      });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbs = generateBreadcrumbs();

  return ( 
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
    >
      {breadcrumbs.map((breadcrumb, index) => (
        <Box key={breadcrumb.path} sx={{ display: 'flex', alignItems: 'center' }}>
          {index === 0 && <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />}
          
          {breadcrumb.active ? (
            <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600 }}>
              {breadcrumb.name}
            </Typography>
          ) : (
            <Link href={breadcrumb.path} style={{ textDecoration: 'none' }}>
              <Typography variant="body1" color="text.secondary">
                {breadcrumb.name}
              </Typography>
            </Link>
          )}
        </Box>
      ))}
    </StyledBreadcrumbs>
  );
}
