import React, { lazy, Suspense } from 'react';
import { Spin } from 'antd';

const SubmissionsPage = lazy(() => import('./SubmissionsPage').then((module) => ({ default: module.SubmissionsPage })));

export const LazySubmissionsPage: React.FC = () => (
  <Suspense fallback={<Spin size="large" />}>
    <SubmissionsPage />
  </Suspense>
);
