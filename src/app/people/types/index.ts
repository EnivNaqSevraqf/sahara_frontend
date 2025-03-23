export interface Team {
  number: number;
  name: string;
  details: string;
  techStacks?: string;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  role: 'Student' | 'TA';
}

export interface BetaTestPair {
  pairNumber: string;
  teamNames: string;
  commonTechStacks: string;
}

export interface TA {
  id: number;
  name: string;
  email: string;
} 