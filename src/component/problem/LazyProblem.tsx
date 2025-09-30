import React, { lazy, Suspense } from 'react';

const Problem = lazy(() => import('./Problem'));

const LazyProblem = () => (
    <Suspense fallback={<div>Loading...</div>}>
        <Problem />
    </Suspense>
);

export { LazyProblem };
