import React, { lazy, Suspense } from 'react';

const Problem = lazy(() => import('./Problem').then((module) => ({ default: module.Problem })));

const LazyProblem = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Problem />
  </Suspense>
);

export { LazyProblem };
