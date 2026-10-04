import React, { lazy, Suspense } from 'react';
import { Spin } from 'antd';
import { SubmissionListProps } from './SubmissionList';

const SubmissionList = lazy(() => import('./SubmissionList').then((module) => ({ default: module.SubmissionList })));

export const LazySubmissionList: React.FC<SubmissionListProps> = ({
  problemId,
  userId,
  showUserColumn,
  showProblemColumn,
}) => (
  <Suspense fallback={<Spin size="large" />}>
    <SubmissionList
      problemId={problemId}
      userId={userId}
      showUserColumn={showUserColumn}
      showProblemColumn={showProblemColumn}
    />
  </Suspense>
);
