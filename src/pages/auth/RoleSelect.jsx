import { Link } from "react-router-dom";
import { User, Building2 } from "lucide-react";

export default function RoleSelect() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">How are you joining?</h1>
        <p className="mt-4 text-lg text-gray-500">
          We need to know this to tailor your experience.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
        {/* Job Seeker Card */}
        <Link
          to="/signup/seeker"
          className="group relative rounded-2xl border-2 border-gray-200 bg-white p-8 hover:border-blue-600 hover:shadow-xl transition-all duration-300 text-center flex flex-col items-center"
        >
          <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <User className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Looking for a Job</h2>
          <p className="text-gray-500">
            Create a profile, browse jobs, and apply to your dream role.
          </p>
        </Link>

        {/* Company Card */}
        <Link
          to="/signup/company"
          className="group relative rounded-2xl border-2 border-gray-200 bg-white p-8 hover:border-blue-600 hover:shadow-xl transition-all duration-300 text-center flex flex-col items-center"
        >
          <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Building2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Hiring Talent</h2>
          <p className="text-gray-500">
            Post job listings, manage applications, and find the perfect candidate.
          </p>
        </Link>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
