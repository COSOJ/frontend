import { lazy } from 'react';

export const LazyProblemForm = lazy(() => 
  import('./ProblemForm').then(module => ({ default: module.ProblemForm }))
);