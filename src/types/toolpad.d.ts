import { FC, ReactNode } from 'react';

declare module '@toolpad/core/DashboardLayout' {
  export interface DashboardLayoutProps {
    children?: ReactNode;
    toolbarItems?: ReactNode;
  }

  export const DashboardLayout: FC<DashboardLayoutProps>;
}
