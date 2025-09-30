import React, { lazy, Suspense } from 'react';
import { Spin } from 'antd';

const SubmissionForm = lazy(() => import('./SubmissionForm'));

const LazySubmissionForm: React.FC<any> = (props) => (
  <Suspense fallback={<Spin size="large" />}>
    <SubmissionForm {...props} />
  </Suspense>
);

export default LazySubmissionForm;