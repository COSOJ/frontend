import React, { lazy, Suspense } from 'react';
import { Spin } from 'antd';

const SubmissionList = lazy(() => import('./SubmissionList'));

const LazySubmissionList: React.FC<any> = (props) => (
  <Suspense fallback={<Spin size="large" />}>
    <SubmissionList {...props} />
  </Suspense>
);

export default LazySubmissionList;