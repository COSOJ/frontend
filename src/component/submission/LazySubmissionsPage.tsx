import React, { lazy, Suspense } from 'react';
import { Spin } from 'antd';

const SubmissionsPage = lazy(() => import('./SubmissionsPage'));

const LazySubmissionsPage: React.FC<any> = (props) => (
  <Suspense fallback={<Spin size="large" />}>
    <SubmissionsPage {...props} />
  </Suspense>
);

export default LazySubmissionsPage;