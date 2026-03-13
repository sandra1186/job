import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { Briefcase, Users, PlusCircle } from "lucide-react";

export default function CompanyDashboard() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ activeJobs: 0, totalApplicants: 0 });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch company profile
        const profileDoc = await getDoc(doc(db, "profiles", currentUser.uid));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data());
        }

        // Fetch company's jobs
        const jobsQuery = query(
          collection(db, "jobs"),
          where("companyId", "==", currentUser.uid)
        );
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobsData = jobsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Sort by newest first
        jobsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentJobs(jobsData.slice(0, 3)); // Top 3 most recent

        // Count applicants for these jobs
        let totalApps = 0;
        const jobIds = jobsData.map(j => j.id);
        
        if (jobIds.length > 0) {
          // Note: Firestore 'in' query supports max 10 values, batching if needed
          // For simplicity in this demo, we'll fetch all apps or chunk it
          const chunks = [];
          for (let i = 0; i < jobIds.length; i += 10) {
            chunks.push(jobIds.slice(i, i + 10));
          }
          
          for (const chunk of chunks) {
            const appsQuery = query(
              collection(db, "applications"),
              where("jobId", "in", chunk)
            );
            const appsSnapshot = await getDocs(appsQuery);
            totalApps += appsSnapshot.size;
          }
        }

        setStats({
          activeJobs: jobsData.length,
          totalApplicants: totalApps
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Company Dashboard</h1>
        <Link
          to="/company/post-job"
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Post New Job
        </Link>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Jobs Posted</dt>
                <dd className="text-2xl font-semibold text-gray-900">{stats.activeJobs}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Applicants</dt>
                <dd className="text-2xl font-semibold text-gray-900">{stats.totalApplicants}</dd>
              </dl>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 p-5 flex flex-col justify-center">
           <h3 className="text-sm font-medium text-gray-500 mb-1">Company Profile</h3>
           <p className="text-lg font-medium text-gray-900 truncate">{profile?.companyName}</p>
           <p className="text-sm text-blue-600 truncate">{profile?.website}</p>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="bg-white shadow rounded-lg border border-gray-100 mt-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Job Listings</h3>
          <Link to="/company/manage-jobs" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
            View all
          </Link>
        </div>
        
        {recentJobs.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {recentJobs.map((job) => (
              <li key={job.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="truncate">
                    <Link to={`/company/applicants/${job.id}`} className="text-lg text-blue-600 font-medium hover:underline truncate">
                      {job.title}
                    </Link>
                    <p className="mt-1 flex items-center text-sm text-gray-500">
                      Posted on {new Date(job.createdAt).toLocaleDateString()} &middot; {job.location}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <Link
                      to={`/company/applicants/${job.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      View Applicants
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>You haven't posted any jobs yet.</p>
            <Link to="/company/post-job" className="mt-4 inline-block text-blue-600 hover:underline">
              Post your first job
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
