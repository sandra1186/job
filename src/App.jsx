import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth Pages
import Login from "./pages/auth/Login";
import RoleSelect from "./pages/auth/RoleSelect";
import SignupSeeker from "./pages/auth/SignupSeeker";
import SignupCompany from "./pages/auth/SignupCompany";

// Public Pages
import Home from "./pages/public/Home";
import BrowseJobs from "./pages/public/BrowseJobs";

// Job Seeker Pages
import SeekerDashboard from "./pages/jobseeker/SeekerDashboard";
import Profile from "./pages/jobseeker/Profile";
import AppliedJobs from "./pages/jobseeker/AppliedJobs";

// Company Pages
import CompanyDashboard from "./pages/company/CompanyDashboard";
import PostJob from "./pages/company/PostJob";
import ManageJobs from "./pages/company/ManageJobs";
import ViewApplicants from "./pages/company/ViewApplicants";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<BrowseJobs />} />
            <Route path="/login" element={<Login />} />
            <Route path="/role-select" element={<RoleSelect />} />
            <Route path="/signup/seeker" element={<SignupSeeker />} />
            <Route path="/signup/company" element={<SignupCompany />} />

            {/* Job Seeker Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRole="jobseeker"><SeekerDashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute allowedRole="jobseeker"><Profile /></ProtectedRoute>} />
            <Route path="/applications" element={<ProtectedRoute allowedRole="jobseeker"><AppliedJobs /></ProtectedRoute>} />

            {/* Company Protected Routes */}
            <Route path="/company/dashboard" element={<ProtectedRoute allowedRole="company"><CompanyDashboard /></ProtectedRoute>} />
            <Route path="/company/post-job" element={<ProtectedRoute allowedRole="company"><PostJob /></ProtectedRoute>} />
            <Route path="/company/manage-jobs" element={<ProtectedRoute allowedRole="company"><ManageJobs /></ProtectedRoute>} />
            <Route path="/company/applicants/:jobId" element={<ProtectedRoute allowedRole="company"><ViewApplicants /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
