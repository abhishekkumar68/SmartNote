import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CollectionPage from './pages/CollectionPage';
import ResourcePage from './pages/ResourcePage';
import ResourceDetailPage from './pages/ResourceDetailPage';
import Bookmarks from './pages/Bookmarks';
import ActiveModesPage from './pages/ActiveModesPage';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const HomeRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Landing />;
};

const Layout = ({ children }) => {
  useKeyboardShortcuts();
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="content-area">
          {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={<HomeRoute><Layout><Dashboard /></Layout></HomeRoute>}
            />
            <Route
              path="/collections"
              element={<ProtectedRoute><Layout><CollectionPage /></Layout></ProtectedRoute>}
            />
            <Route
              path="/collections/:id"
              element={<ProtectedRoute><Layout><ResourcePage /></Layout></ProtectedRoute>}
            />
            <Route
              path="/resource-details/:id"
              element={<ProtectedRoute><Layout><ResourceDetailPage /></Layout></ProtectedRoute>}
            />
            <Route
              path="/bookmarks"
              element={<ProtectedRoute><Layout><Bookmarks /></Layout></ProtectedRoute>}
            />
            <Route
              path="/active-modes"
              element={<ProtectedRoute><Layout><ActiveModesPage /></Layout></ProtectedRoute>}
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
