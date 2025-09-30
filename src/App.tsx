import React, { Suspense } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import enUS from 'antd/locale/en_US';

import { AuthProvider, useAuth } from './context/AuthContext';
import { LazyLogin } from './component/auth/LazyLogin';
import { LazySignup } from './component/auth/LazySignup';
import { CustomLayout } from './layout/CustomLayout';
import { LazyLanding } from './component/landing/LazyLanding';
import { LazyPage2 } from './component/LazyPage2';
import { LazyPage3 } from './component/LazyPage3';
import { LazyProblem } from './component/problem/LazyProblem';
import { LazyProblemList } from './component/problem/LazyProblemList';
import { ProblemForm } from './component/problem/ProblemForm';
import LazySubmissionsPage from './component/submission/LazySubmissionsPage';

const DEFAULT_PAGE_LOGGED_IN = '/landing';
const DEFAULT_PAGE_NOT_LOGGED_IN = '/login';

// Loading component for Suspense fallback
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '200px' 
  }}>
    <Spin size="large" />
  </div>
);

const CreateProblemForm = () => <ProblemForm mode="create" />;
const EditProblemForm = () => <ProblemForm mode="edit" />;

const App = () =>
  <AuthProvider>
    <AppBase />
  </AuthProvider>

const AppBase = () => {
  const { isNotLoggedIn, isLoggedIn } = useAuth();
  return (
    <ConfigProvider locale={enUS}>
      <BrowserRouter basename="/frontend">
        <CustomLayout>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {isLoggedIn && <Route path="/landing" element={<LazyLanding />} />}
              {isNotLoggedIn && <Route path="/login" element={<LazyLogin />} />}
              {isNotLoggedIn && <Route path="/signup" element={<LazySignup />} />}
              {isLoggedIn && <Route path="/page2" element={<LazyPage2 />} />}
              {isLoggedIn && <Route path="/page3" element={<LazyPage3 />} />}
              <Route path="/problems" element={<LazyProblemList />} />
              <Route path="/problem/:id" element={<LazyProblem />} />
              <Route path="/submissions" element={<LazySubmissionsPage />} />
              {isLoggedIn && <Route path="/admin/problems/create" element={<CreateProblemForm />} />}
              {isLoggedIn && <Route path="/admin/problems/:id/edit" element={<EditProblemForm />} />}
              <Route
                path="*"
                element={<Navigate to={isLoggedIn ? DEFAULT_PAGE_LOGGED_IN : DEFAULT_PAGE_NOT_LOGGED_IN} replace />}
              />
            </Routes>
          </Suspense>
        </CustomLayout>
      </BrowserRouter>
    </ConfigProvider>
  );
};

// eslint-disable-next-line import/no-default-export
export default App;
