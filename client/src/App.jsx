// client/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import UsersPage from './pages/admin/UsersPage';
import AdvanceRequestsPage from './pages/admin/AdvanceRequestsPage';
import PayrollPage from './pages/admin/PayrollPage';
import StaffProfilePage from './pages/StaffProfilePage';
import UserSalarySelectPage from './pages/admin/UserSalarySelectionPage';
import UserDetailedHistoryPage from './pages/admin/UserDetailedHistoryPage';
import SalaryHistoryPage from './pages/admin/SalaryHistoryPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<LoginPage />} />

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="requests" element={<AdvanceRequestsPage />} />
              <Route path="payroll" element={<PayrollPage />} />
               <Route path="montly" element={<SalaryHistoryPage/>} />
              
              <Route path="history" element={<UserSalarySelectPage />} />
              {/* THIS IS THE FIX: The path now includes ':userId' to capture the ID from the URL */}
              <Route path="history/:userId" element={<UserDetailedHistoryPage />} />
            </Route>
          </Route>

          {/* Staff Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/staff/profile" element={<StaffProfilePage />} />
          </Route>

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
