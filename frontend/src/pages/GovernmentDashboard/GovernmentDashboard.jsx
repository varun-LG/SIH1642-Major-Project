import { useEffect, useState } from 'react'
import axios from 'axios'
import { Bell, FileText, Users, CheckCircle, XCircle, Clock, Eye, Download, LogOut } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { clearUser } from '@/redux/authSlice'

export default function GovernmentDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [stats, setStats] = useState({});
  const [applications, setApplications] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('applications'); // applications, mentors

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, applicationsRes, mentorsRes] = await Promise.all([
        axios.get('http://localhost:3000/api/v1/government/stats', { withCredentials: true }),
        axios.get('http://localhost:3000/api/v1/government/applications', { withCredentials: true }),
        axios.get('http://localhost:3000/api/v1/government/mentors', { withCredentials: true })
      ]);

      setStats(statsRes.data.stats);
      setApplications(applicationsRes.data.applications);
      setMentors(mentorsRes.data.mentors);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response && error.response.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:3000/api/v1/government/application/${applicationId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );

      alert('Application status updated successfully! User has been notified via email.');
      fetchDashboardData();
      setSelectedApplication(null);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleMentorApproval = async (mentorId, approved) => {
    try {
      await axios.put(
        `http://localhost:3000/api/v1/government/mentor/${mentorId}/approval`,
        { approved },
        { withCredentials: true }
      );

      alert(`Mentor ${approved ? 'approved' : 'rejected'} successfully!`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating mentor approval:', error);
      alert('Failed to update mentor approval');
    }
  };

  const viewApplicationDetails = async (applicationId) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/government/application/${applicationId}`,
        { withCredentials: true }
      );
      setSelectedApplication(response.data.application);
    } catch (error) {
      console.error('Error fetching application details:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/api/v1/auth/logout', {}, {
        withCredentials: true
      });
      dispatch(clearUser());
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      dispatch(clearUser());
      navigate('/login');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'text-green-600 bg-green-50';
      case 'REJECTED': return 'text-red-600 bg-red-50';
      case 'IN_REVIEW': return 'text-blue-600 bg-blue-50';
      case 'SUBMITTED': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="w-5 h-5" />;
      case 'REJECTED': return <XCircle className="w-5 h-5" />;
      case 'IN_REVIEW': return <Clock className="w-5 h-5" />;
      case 'SUBMITTED': return <FileText className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-green-800">Government Dashboard</h1>
            <p className="text-sm text-gray-600">AYUSH Startup Portal - Administration</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalApplications || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.submittedApplications || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.approvedApplications || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Mentors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.pendingMentors || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-4">
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-4 py-2 font-medium ${activeTab === 'applications'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Applications ({applications.length})
            </button>
            <button
              onClick={() => setActiveTab('mentors')}
              className={`px-4 py-2 font-medium ${activeTab === 'mentors'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Mentors ({mentors.length})
            </button>
          </div>
        </div>

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Applications List */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>All Applications</CardTitle>
                  <CardDescription>Review and manage startup applications</CardDescription>
                </CardHeader>
                <CardContent className="max-h-[600px] overflow-y-auto">
                  {applications.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No applications found</p>
                  ) : (
                    <div className="space-y-3">
                      {applications.map((app) => (
                        <div
                          key={app.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition"
                          onClick={() => viewApplicationDetails(app.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{app.title}</h3>
                              <p className="text-sm text-gray-600">Founder: {app.founder}</p>
                              <p className="text-sm text-gray-600">Email: {app.user?.email}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Applied: {new Date(app.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${getStatusColor(app.status)}`}>
                              {getStatusIcon(app.status)}
                              <span className="text-xs font-medium">{app.status}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Application Details */}
            <div>
              {selectedApplication ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Application Details</CardTitle>
                    <CardDescription>Review and update application status</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{selectedApplication.title}</h3>
                      <div className="space-y-2 text-sm">
                        <p><strong>Founder:</strong> {selectedApplication.founder}</p>
                        <p><strong>Email:</strong> {selectedApplication.email}</p>
                        <p><strong>Startup ID:</strong> {selectedApplication.startupId}</p>
                        <p><strong>Description:</strong> {selectedApplication.description}</p>
                        <p><strong>User:</strong> {selectedApplication.user?.name} ({selectedApplication.user?.email})</p>
                        <p><strong>AYUSH Category:</strong> {selectedApplication.user?.ayushCategory}</p>
                        <p><strong>Applied:</strong> {new Date(selectedApplication.createdAt).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Documents */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">User Documents ({selectedApplication.documents?.length || 0})</h4>
                      {selectedApplication.documents && selectedApplication.documents.length > 0 ? (
                        <div className="space-y-2">
                          {selectedApplication.documents.map((doc, index) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border hover:bg-gray-100 transition">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm font-medium">{doc.type}</span>
                                </div>
                                <div className="flex gap-3 mt-1 text-xs text-gray-600">
                                  {doc.startup?.name && (
                                    <span>Startup: {doc.startup.name}</span>
                                  )}
                                  {doc.uploadedAt && (
                                    <span>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(doc.url, '_blank')}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(doc.url, '_blank')}
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 py-4 text-center bg-gray-50 rounded">
                          No documents uploaded by this user
                        </p>
                      )}
                    </div>

                    {/* Status Update */}
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Update Status</h4>
                      <div className="flex gap-2">
                        <Select
                          onValueChange={(value) => handleStatusUpdate(selectedApplication.id, value)}
                          defaultValue={selectedApplication.status}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SUBMITTED">Submitted</SelectItem>
                            <SelectItem value="IN_REVIEW">In Review</SelectItem>
                            <SelectItem value="APPROVED">Approved</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        User will receive email notification when status is updated
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-96">
                    <p className="text-gray-500">Select an application to view details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}


        {/* Mentors Tab */}
        {activeTab === 'mentors' && (
          <Card>
            <CardHeader>
              <CardTitle>Mentor Applications</CardTitle>
              <CardDescription>Review and approve mentor applications</CardDescription>
            </CardHeader>
            <CardContent>
              {mentors.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No mentor applications found</p>
              ) : (
                <div className="space-y-4">
                  {mentors.map((mentor) => (
                    <div key={mentor.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{mentor.name}</h3>
                          <p className="text-sm text-gray-600">Email: {mentor.email}</p>
                          <p className="text-sm text-gray-600">Phone: {mentor.number}</p>
                          <p className="text-sm text-gray-600 mt-2">
                            <strong>Expertise:</strong> {mentor.cataegory}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Applied: {new Date(mentor.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {mentor.approved ? (
                            <div className="px-4 py-2 rounded-full bg-green-50 text-green-600 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-xs font-medium">Approved</span>
                            </div>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleMentorApproval(mentor.id, true)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleMentorApproval(mentor.id, false)}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
