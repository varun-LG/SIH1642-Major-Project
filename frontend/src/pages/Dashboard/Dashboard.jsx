import { useEffect, useState } from 'react'
import axios from 'axios'
import { Bell, FileText, HelpCircle, Home, LogOut, Upload, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { json, Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { clearUser } from '@/redux/authSlice'

export default function Dashboard() {
  const [progress, setProgress] = useState(65)
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [application, setApplication] = useState([]);
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    // Fetch applications
    axios.post('http://localhost:3000/api/v1/get-application',{},{withCredentials: true})
    .then((response) => {
      setApplication(response.data)
    })
    .catch((error) => {
      console.error(error)
      // If unauthorized, logout
      if (error.response && error.response.status === 401) {
        handleLogout();
      }
    })

    // Fetch mentors
    axios.get('http://localhost:3000/api/v1/mentor/all', {withCredentials: true})
    .then((response) => {
      setMentors(response.data.mentors || [])
    })
    .catch((error) => {
      console.error('Error fetching mentors:', error)
    })
  }
  ,[]);

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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h2 className="text-2xl font-bold text-primary">AYUSH Portal</h2>
        </div>
        <nav className="mt-6">
          {[
            { icon: Home, label: 'Dashboard', to: "/dashboard" },
            { icon: FileText, label: 'Applications', to: "/application-form" },
            { icon: Upload, label: 'Documents', to: "/document-upload" },
            { icon: Bell, label: 'Notifications', to: "#" },
            { icon: HelpCircle, label: 'FAQ', to: "/faq" },
            { icon: HelpCircle, label: 'Help Center', to: "/help-center" },
            { icon: HelpCircle, label: 'Chat', to: "/chat" },
          ].map((item, index) => (
            <Link
              key={index}
              to={item.to}
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200"
            >
              <item.icon className="w-5 h-5 mr-2" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <div className="flex items-center">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 grid gap-6 md:grid-cols-2">
          {/* Application Status */}
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
              <CardDescription>Track your registration progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='max-h-full overflow-auto'>
              {application.map((item, index) => {
                return (
                  <div key={index} className="flex items-center justify-between mt-4 w-full">
                    <div className='w-full'>
                      <p className="text-sm text-gray-600">{item.title}</p>
                      <p className="font-semibold">{item.status}</p>
                      <p className="text-sm text-gray-600">{item.founder}</p>
                      {item.status === "Pending" ? (
                        <Progress value={0} className="w-full mt-2" />
                      ) : item.status === "Approved" ? (
                        <Progress value={100} className="w-full mt-2" />
                      ) : (
                        <Progress value={50} className="w-full mt-2" />
                      )}
                    </div>
                  </div>
                )
              })}
              </div>
              

            </CardContent>
          </Card>

          {/* Document Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Document Upload</CardTitle>
              <CardDescription>Submit required documents</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/document-upload")} className="w-full">
                <Upload className="w-4 h-4 mr-2" />
                Upload Documents
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {[
                  'Your application has been received',
                  'Please upload the missing document',
                  'Registration process update',
                ].map((notification, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <Bell className="w-4 h-4 mr-2 text-primary" />
                    {notification}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Help Center */}
          <Card>
            <CardHeader>
              <CardTitle>Help Center</CardTitle>
              <CardDescription>Get assistance and find answers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/faq')}>
                <HelpCircle className="w-4 h-4 mr-2" />
                FAQs
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                User Guides
              </Button>
              <Separator />
              <p className="text-sm text-gray-600">Need more help? Contact support:</p>
              <p className="text-sm font-medium">support@ayushportal.com</p>
            </CardContent>
          </Card>

          {/* Mentors Section */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Available Mentors</CardTitle>
              <CardDescription>Connect with experienced AYUSH mentors</CardDescription>
            </CardHeader>
            <CardContent>
              {mentors.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No mentors available at the moment</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mentors.slice(0, 6).map((mentor, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition">
                      <h4 className="font-semibold text-sm">{mentor.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">{mentor.cataegory}</p>
                      <p className="text-xs text-gray-500 mt-1">{mentor.email}</p>
                      <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded inline-block mt-2">Verified Mentor</span>
                    </div>
                  ))}
                </div>
              )}
              <Button className="w-full mt-4" onClick={() => navigate('/mentorReg')}>
                Apply to Become a Mentor
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}