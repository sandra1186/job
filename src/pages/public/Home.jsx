import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Briefcase, Users, Search, ChevronRight } from "lucide-react";

export default function Home() {
  const { currentUser, userRole } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <div className="text-center max-w-3xl mx-auto mb-16 px-4">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
          Find your dream job or <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">hire top talent</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 leading-relaxed">
          The ultimate platform connecting ambitious professionals with industry-leading companies.
          Your next big opportunity starts right here.
        </p>
        
        {!currentUser ? (
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/jobs"
              className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg shadow-sm hover:shadow-md border border-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5 text-gray-500" />
              Browse Jobs
            </Link>
            <Link
              to="/role-select"
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              Get Started <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="flex justify-center flex-col sm:flex-row gap-4">
            {userRole === "jobseeker" ? (
              <>
                <Link
                  to="/jobs"
                  className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Browse Jobs
                </Link>
                <Link
                  to="/dashboard"
                  className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg shadow-sm hover:shadow-md border border-gray-200 transition-all duration-200"
                >
                  Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/company/post-job"
                  className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Briefcase className="w-5 h-5" />
                  Post a Job
                </Link>
                <Link
                  to="/company/dashboard"
                  className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg shadow-sm hover:shadow-md border border-gray-200 transition-all duration-200"
                >
                  Company Dashboard
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      {/* Feature grid */}
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4 mt-24">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Discover Opportunities</h3>
          <p className="text-gray-500 leading-relaxed">
            Search thousands of open roles tailored to your skills and preferences. Filter by location, salary, and more.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Seamless Hiring</h3>
          <p className="text-gray-500 leading-relaxed">
            Review applicant profiles, download resumes, and shortlist the best candidates entirely within our platform.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6">
            <Briefcase className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Effortless Posting</h3>
          <p className="text-gray-500 leading-relaxed">
            Create high-quality job descriptions in minutes. Reach an audience of pre-qualified professionals easily.
          </p>
        </div>
      </div>
    </div>
  );
}
