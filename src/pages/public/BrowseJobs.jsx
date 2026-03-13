import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, query, orderBy, getDocs, addDoc, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { Briefcase, MapPin, DollarSign, Search, CheckCircle } from "lucide-react";

export default function BrowseJobs() {
  const { currentUser, userRole } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null); // jobId of job currently being applied to
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  useEffect(() => {
    const fetchJobsAndApplications = async () => {
      try {
        // Fetch all jobs
        const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const jobsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setJobs(jobsData);

        // If user is a jobseeker, fetch their applications to disable apply buttons
        if (currentUser && userRole === "jobseeker") {
          const appSnapshot = await getDocs(collection(db, "applications"));
          const userApps = new Set(
            appSnapshot.docs
              .map(doc => doc.data())
              .filter(app => app.userId === currentUser.uid)
              .map(app => app.jobId)
          );
          setAppliedJobs(userApps);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobsAndApplications();
  }, [currentUser, userRole]);

  const handleApply = async (jobId) => {
    if (!currentUser) {
      alert("Please log in to apply for jobs.");
      return;
    }
    if (userRole !== "jobseeker") {
      alert("Only job seekers can apply. Please log in with a job seeker account.");
      return;
    }
    
    setApplying(jobId);
    try {
      // Fetch the user's profile to attach their resume URL
      const profileDoc = await getDoc(doc(db, "profiles", currentUser.uid));
      const resumeUrl = profileDoc.exists() ? profileDoc.data().resumeUrl : null;

      await addDoc(collection(db, "applications"), {
        jobId,
        userId: currentUser.uid,
        resumeUrl,
        status: "Applied",
        appliedAt: new Date().toISOString()
      });
      
      // Update local state to show as applied immediately
      setAppliedJobs(prev => new Set(prev).add(jobId));
    } catch (error) {
      console.error("Error applying for job:", error);
      if (error.code === "permission-denied") {
        alert("Permission denied. Please update your Firestore security rules to allow writes to the 'applications' collection.");
      } else {
        alert("Failed to apply: " + error.message);
      }
    } finally {
      setApplying(null);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = locationFilter === "" || job.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesLocation;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Browse Open Jobs</h1>
        <p className="mt-4 text-xl text-gray-500">Find your next great opportunity</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by title, company, or keywords..."
            className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="md:w-1/3 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Location..."
            className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Job List */}
      <div className="space-y-6">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h2>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg font-medium text-blue-600">{job.companyName}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-md">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </div>
                    {job.salary && (
                      <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-md">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        {job.salary}
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.skills && Array.isArray(job.skills) ? (
                        job.skills.map((skill, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-50 text-blue-700">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">Not specified</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-gray-600 text-sm line-clamp-3">
                    {job.description}
                  </div>
                </div>

                <div className="flex flex-col justify-end min-w-[140px] border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                  {/* Action Buttons based on state */}
                  {!currentUser ? (
                     <Link
                      to="/login"
                      className="w-full text-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition"
                    >
                      Login to Apply
                    </Link>
                  ) : userRole === "company" ? (
                    <div className="text-center text-sm text-gray-500 bg-gray-50 p-3 rounded-md border border-gray-100">
                      Companies cannot apply to jobs
                    </div>
                  ) : appliedJobs.has(job.id) ? (
                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-green-50 transition"
                    >
                      <CheckCircle className="h-5 w-5" />
                      Applied
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApply(job.id)}
                      disabled={applying === job.id}
                      className={`w-full px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition ${applying === job.id ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {applying === job.id ? 'Applying...' : 'Apply Now'}
                    </button>
                  )}
                  <p className="text-xs text-gray-400 mt-4 text-center">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center bg-white p-12 rounded-xl border border-gray-200">
            <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or filters to find what you're looking for.</p>
            <button 
              onClick={() => { setSearchTerm(""); setLocationFilter(""); }}
              className="mt-6 text-blue-600 font-medium hover:text-blue-500"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
