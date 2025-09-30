import React, { lazy, Suspense } from 'react';
import { Spin } from 'antd';

const UserStats = lazy(() => import('./UserStats'));

const LazyUserStats: React.FC<any> = (props) => (
  <Suspense fallback={<Spin size="large" />}>
    <UserStats {...props} />
  </Suspense>
);

export default LazyUserStats;