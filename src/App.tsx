import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';

import { AuthProvider, useAuth } from './context/AuthContext';
import { LazyLogin } from './component/auth/LazyLogin';
import { LazySignup } from './component/auth/LazySignup';
import { CustomLayout } from './layout/CustomLayout';
import { LazyLanding } from './component/landing/LazyLanding';
import { LazyPage2 } from './component/LazyPage2';
import { LazyPage3 } from './component/LazyPage3';
import { LazyProblem } from './component/problem/LazyProblem';

const DEFAULT_PAGE_LOGGED_IN = '/landing';
const DEFAULT_PAGE_NOT_LOGGED_IN = '/login';

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
          <Routes>
            {isLoggedIn && <Route path="/landing" element={<LazyLanding />} />}
            {isNotLoggedIn && <Route path="/login" element={<LazyLogin />} />}
            {isNotLoggedIn && <Route path="/signup" element={<LazySignup />} />}
            {isLoggedIn && <Route path="/page2" element={<LazyPage2 />} />}
            {isLoggedIn && <Route path="/page3" element={<LazyPage3 />} />}
            {isLoggedIn && <Route path="/problem" element={<LazyProblem />} />}
            <Route
              path="*"
              element={<Navigate to={isLoggedIn ? DEFAULT_PAGE_LOGGED_IN : DEFAULT_PAGE_NOT_LOGGED_IN} replace />}
            />
          </Routes>
        </CustomLayout>
      </BrowserRouter>
    </ConfigProvider>
  );
};

// eslint-disable-next-line import/no-default-export
export default App;
