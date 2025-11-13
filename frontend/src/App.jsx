import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UserSelection from './components/UserSelection';
import UserManagement from './components/UserManagement';
import ProjectManagement from './components/ProjectManagement';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import logo from './assets/logo.png';

function App() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [logoError, setLogoError] = useState(false);

  // Easter egg: Enable/disable logo spin animation
  const ENABLE_LOGO_SPIN_EASTER_EGG = true;

  const [isSpinning, setIsSpinning] = useState(false);

  useEffect(() => {
    if (!ENABLE_LOGO_SPIN_EASTER_EGG) return;

    // Random spin every 3-10 seconds
    const scheduleNextSpin = () => {
      const randomDelay = Math.random() * 7000 + 3000; // 3-10 seconds
      return setTimeout(() => {
        setIsSpinning(true);
        setTimeout(() => {
          setIsSpinning(false);
          scheduleNextSpin();
        }, 500); // Spin duration: 500ms
      }, randomDelay);
    };

    const timeoutId = scheduleNextSpin();
    return () => clearTimeout(timeoutId);
  }, [ENABLE_LOGO_SPIN_EASTER_EGG]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-blue-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Link to="/" className="flex items-center gap-4 hover:opacity-90 transition">
                  {logo && !logoError && (
                    <img
                      src={logo}
                      alt="OBO Logo"
                      className={`h-20 w-auto object-contain transition-transform duration-500 ${
                        ENABLE_LOGO_SPIN_EASTER_EGG && isSpinning ? 'animate-spin' : ''
                      } ${ENABLE_LOGO_SPIN_EASTER_EGG ? 'hover:rotate-[360deg]' : ''}`}
                      onError={() => setLogoError(true)}
                    />
                  )}
                  <div>
                    <h1 className="text-3xl font-bold hover:text-blue-100 transition cursor-pointer">
                      OBO-Berk (โอโบ-เบิก)
                    </h1>
                    <p className="text-blue-100 mt-1">Expense Tracking & Reimbursement System</p>
                  </div>
                </Link>
              </div>
              <nav className="flex gap-4">
                <Link
                  to="/"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-700 rounded-lg transition"
                >
                  Home
                </Link>
                <Link
                  to="/projects"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-700 rounded-lg transition"
                >
                  Manage Projects
                </Link>
                <Link
                  to="/users"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-700 rounded-lg transition"
                >
                  Manage Users
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route
              path="/"
              element={
                <div>
                  <UserSelection
                    selectedUser={selectedUser}
                    setSelectedUser={setSelectedUser}
                  />
                  {selectedUser && (
                    <ProjectList
                      userId={selectedUser._id}
                      userName={selectedUser.name}
                    />
                  )}
                </div>
              }
            />
            <Route
              path="/users"
              element={<UserManagement />}
            />
            <Route
              path="/projects"
              element={<ProjectManagement />}
            />
            <Route
              path="/project/:projectId"
              element={<ProjectDetail />}
            />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white mt-12 py-6">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2025 ด้วยรัก By Tutor คนดีคนเดิม - OBO-Berk Expense Tracking System</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
