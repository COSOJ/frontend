import React, { Suspense } from 'react';
import { Spin } from 'antd';

const Signup = React.lazy(() => import('./Signup').then(module => ({ default: module.Signup })));

const LoadingSpinner = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
    }}
  >
    <Spin size="large" tip="Loading..." />
  </div>
);

export const LazySignup: React.FC = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Signup />
  </Suspense>
);
