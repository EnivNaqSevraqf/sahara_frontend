'use client';
import { Button, ButtonProps } from '@mui/material';
import { useRouter } from 'next/navigation';

interface NavigationButtonProps extends ButtonProps {
  href: string;
}

const NavigationButton = ({ href, children, ...props }: NavigationButtonProps) => {
  const router = useRouter();

  return (
    <Button
      {...props}
      onClick={() => router.push(href)}
    >
      {children}
    </Button>
  );
};

export default NavigationButton; 