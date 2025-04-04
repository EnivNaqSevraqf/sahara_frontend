export type Role = 'Student' | 'Professor' | 'TA' | 'Admin';

export interface Student {
  id: number;
  name: string;
  email: string;
  role: Role;
}