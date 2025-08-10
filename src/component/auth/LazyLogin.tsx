import React, { Suspense } from 'react';
import { Spin } from 'antd';

const Login = React.lazy(() => import('./Login').then(module => ({ default: module.Login })));

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

export const LazyLogin: React.FC = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Login />
  </Suspense>
);
