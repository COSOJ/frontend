import React, { lazy, Suspense } from 'react';

const Problem = lazy(() => import('./Problem'));

const LazyProblem = () => (
    <Suspense fallback={<div>Loading...</div>}>
        <Problem
            problemDescription='This is a sample problem description for the Problem component.'
            tags={['Arrays', 'Data Structures']}
            title='2D Array - DS'

        />
    </Suspense>
);

export { LazyProblem };
