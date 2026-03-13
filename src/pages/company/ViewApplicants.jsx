import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { FileText, Phone, Mail, ArrowLeft, CheckCircle, XCircle, Users } from "lucide-react";

export default function ViewApplicants() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobAndApplicants = async () => {
      try {
        // Fetch Job Details
        const jobDoc = await getDoc(doc(db, "jobs", jobId));
        if (jobDoc.exists()) {
          setJob({ id: jobDoc.id, ...jobDoc.data() });
        }

        // Fetch Applications
        const q = query(
          collection(db, "applications"),
          where("jobId", "==", jobId)
        );
        const appSnapshot = await getDocs(q);
        
        const applicantsData = [];
        for (const appDoc of appSnapshot.docs) {
          const appDetails = appDoc.data();
          
          // Fetch applicant profile
          const profileDoc = await getDoc(doc(db, "profiles", appDetails.userId));
          // Fetch user doc to get email
          const userDoc = await getDoc(doc(db, "users", appDetails.userId));
          
          if (profileDoc.exists() && userDoc.exists()) {
            applicantsData.push({
              id: appDoc.id,
              ...appDetails,
              profile: profileDoc.data(),
              email: userDoc.data().email
            });
          }
        }
        
        // Sort by applied date
        applicantsData.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
        setApplicants(applicantsData);
        
      } catch (error) {
        console.error("Error fetching applicants:", error);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobAndApplicants();
    }
  }, [jobId]);

  const updateStatus = async (appId, newStatus) => {
    try {
      await updateDoc(doc(db, "applications", appId), {
        status: newStatus
      });
      
      // Update local state
      setApplicants(applicants.map(app => 
        app.id === appId ? { ...app, status: newStatus } : app
      ));
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="mb-4">
        <Link to="/company/manage-jobs" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Jobs
        </Link>
      </div>

      <div className="bg-white px-6 py-5 border-b border-gray-200 rounded-t-xl shadow-sm border-x border-t">
        <h1 className="text-2xl font-bold text-gray-900">
          Applicants for <span className="text-blue-600">{job?.title}</span>
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {applicants.length} total applications received
        </p>
      </div>

      <div className="bg-white shadow rounded-b-xl border-x border-b border-gray-200">
        {applicants.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {applicants.map((app) => (
              <li key={app.id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xl font-bold text-gray-900">{app.profile.name}</h2>
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        app.status === 'Applied' ? 'bg-yellow-100 text-yellow-800' :
                        app.status === 'Shortlisted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Mail className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                        <a href={`mailto:${app.email}`} className="truncate hover:text-blue-600">{app.email}</a>
                      </div>
                      <div className="flex items-center">
                        <Phone className="flex-shrink-0 mr-2 h-4 w-4 text-gray-400" />
                        {app.profile.phone || "Not provided"}
                      </div>
                      <div className="flex items-center sm:col-span-2">
                        <span className="font-medium mr-2">Education:</span> {app.profile.education || "Not specified"}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {app.profile.skills && Array.isArray(app.profile.skills) ? (
                          app.profile.skills.map((skill, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">Not specified</span>
                        )}
                      </div>
                    </div>

                    {app.resumeUrl && (
                      <div className="mt-4">
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center px-4 py-2 border border-blue-600 shadow-sm text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          View Resume
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-3 min-w-[200px] bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1 text-center">Update Application Status</h4>
                    <button
                      onClick={() => updateStatus(app.id, "Shortlisted")}
                      disabled={app.status === "Shortlisted"}
                      className={`inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition ${app.status === "Shortlisted" ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" /> Shortlist
                    </button>
                    <button
                      onClick={() => updateStatus(app.id, "Rejected")}
                      disabled={app.status === "Rejected"}
                      className={`inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition ${app.status === "Rejected" ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <XCircle className="mr-2 h-4 w-4" /> Reject
                    </button>
                    <button
                      onClick={() => updateStatus(app.id, "Applied")}
                      disabled={app.status === "Applied"}
                      className={`inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition ${app.status === "Applied" ? "opacity-50 cursor-not-allowed hidden" : ""}`}
                    >
                      Reset Status
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-16">
            <Users className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No applicants yet</h3>
            <p className="mt-1 text-sm text-gray-500">Wait for candidates to discover and apply to this job.</p>
          </div>
        )}
      </div>
    </div>
  );
}
