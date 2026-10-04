import React, { lazy, Suspense } from 'react';
import { Spin } from 'antd';
import { UserStatsProps } from './UserStats';

const UserStats = lazy(() => import('./UserStats').then((module) => ({ default: module.UserStatsComponent })));

export const LazyUserStats: React.FC<UserStatsProps> = ({ userId, userHandle }) => (
  <Suspense fallback={<Spin size="large" />}>
    <UserStats userId={userId} userHandle={userHandle} />
  </Suspense>
);
