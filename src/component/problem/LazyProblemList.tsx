import { lazy } from 'react';

export const LazyProblemList = lazy(() => 
  import('./ProblemList').then(module => ({ default: module.ProblemList }))
);