import React, { lazy, Suspense } from 'react';
import { Spin } from 'antd';
import { SubmissionFormProps } from './SubmissionForm';

const SubmissionForm = lazy(() => import('./SubmissionForm').then((module) => ({ default: module.SubmissionForm })));

export const LazySubmissionForm: React.FC<SubmissionFormProps> = ({
  problemId,
  problemTitle,
  onSubmissionCreated,
}) => (
  <Suspense fallback={<Spin size="large" />}>
    <SubmissionForm
      problemId={problemId}
      problemTitle={problemTitle}
      onSubmissionCreated={onSubmissionCreated}
    />
  </Suspense>
);
