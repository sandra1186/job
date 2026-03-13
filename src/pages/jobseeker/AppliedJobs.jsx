import { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { Briefcase, MapPin, DollarSign } from "lucide-react";

export default function AppliedJobs() {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const q = query(
          collection(db, "applications"),
          where("userId", "==", currentUser.uid)
        );
        const appSnapshot = await getDocs(q);
        
        const appsData = [];
        for (const appDoc of appSnapshot.docs) {
          const appDetails = appDoc.data();
          const jobDoc = await getDoc(doc(db, "jobs", appDetails.jobId));
          
          if (jobDoc.exists()) {
            appsData.push({
              id: appDoc.id,
              ...appDetails,
              job: jobDoc.data()
            });
          } else {
            // Job might have been deleted, but we keep the application record
            appsData.push({
              id: appDoc.id,
              ...appDetails,
              job: { title: "Job no longer available", companyName: "Unknown" }
            });
          }
        }
        
        // Sort by applied date descending
        appsData.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
        setApplications(appsData);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchApplications();
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
      <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
      
      {applications.length > 0 ? (
        <div className="grid gap-6">
          {applications.map((app) => (
            <div key={app.id} className="bg-white shadow rounded-lg border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between transition-hover hover:shadow-md">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{app.job.title}</h3>
                <p className="text-lg text-blue-600 mb-3">{app.job.companyName}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4 md:mb-0">
                   {app.job.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {app.job.location}
                    </div>
                  )}
                  {app.job.salary && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {app.job.salary}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-gray-400">
                    Applied on: {new Date(app.appliedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end gap-3">
                <span className={`px-4 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-full ${
                  app.status === 'Applied' ? 'bg-yellow-100 text-yellow-800' :
                  app.status === 'Shortlisted' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {app.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-100 text-center max-w-2xl mx-auto">
          <Briefcase className="mx-auto h-16 w-16 text-gray-300 border-gray-100" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No applications yet</h3>
          <p className="mt-2 text-gray-500">You haven't applied to any jobs yet. Start browsing finding your dream role today.</p>
          <div className="mt-8">
            <Link
              to="/jobs"
              className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
