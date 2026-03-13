import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { Briefcase, FileText, User } from "lucide-react";

export default function SeekerDashboard() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch profile
        const profileDoc = await getDoc(doc(db, "profiles", currentUser.uid));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data());
        }

        // Fetch recent applications
        const q = query(
          collection(db, "applications"),
          where("userId", "==", currentUser.uid),
          limit(3)
        );
        const appSnapshot = await getDocs(q);
        
        const appsData = [];
        for (const appDoc of appSnapshot.docs) {
          const appDetails = appDoc.data();
          // Fetch job details for each application
          const jobDoc = await getDoc(doc(db, "jobs", appDetails.jobId));
          if (jobDoc.exists()) {
            appsData.push({
              id: appDoc.id,
              ...appDetails,
              job: jobDoc.data()
            });
          }
        }
        
        // Sort by appliedAt locally since we only fetched up to 3
        appsData.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
        setRecentApps(appsData);
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
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="p-5 flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Profile Status</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {profile?.name ? "Completed" : "Incomplete"}
                </dd>
              </dl>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link to="/profile" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Update profile
            </Link>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="p-5 flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Resume</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {profile?.resumeUrl ? "Uploaded" : "No Resume"}
                </dd>
              </dl>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link to="/profile" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Manage resume
            </Link>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="p-5 flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
              <Briefcase className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Applications</dt>
                <dd className="text-lg font-medium text-gray-900">
                  View All
                </dd>
              </dl>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <Link to="/applications" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Go to applications
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">Recent Applications</h2>
      {recentApps.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-100">
          <ul className="divide-y divide-gray-200">
            {recentApps.map((app) => (
              <li key={app.id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div className="truncate">
                      <div className="flex text-sm">
                        <p className="font-medium text-blue-600 truncate">{app.job?.title}</p>
                        <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                          at {app.job?.companyName}
                        </p>
                      </div>
                      <div className="mt-2 flex">
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="truncate">Applied on {new Date(app.appliedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                      <div className="flex overflow-hidden">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          app.status === 'Applied' ? 'bg-yellow-100 text-yellow-800' :
                          app.status === 'Shortlisted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No applications</h3>
          <p className="mt-1 text-sm text-gray-500">You haven't applied to any jobs yet.</p>
          <div className="mt-6">
            <Link
              to="/jobs"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
