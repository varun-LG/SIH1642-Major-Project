import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import ApplicationForm from './pages/ApplicationForm/ApplicationForm';
import DocumentUpload from './pages/DocumentUpload/DocumentUpload';
import Main from './pages/Main/Main';
import LoginPage from './pages/Login/Login';
import SignupPage from './pages/SignUp/SignUp';
import AboutPage from './pages/About/About';
import FAQ from './pages/FAQ/FAQ';
import Help from './pages/Help/Help';
import Mentor from './pages/Mentor/Mentor';
import OtpVerify from './pages/OtpVerify/OtpVerify';
import PrivateRoutes from './components/PrivateRoutes/PrivateRoutes';
import PublicLayout from './components/PublicRoutes/PublicRoutes';
import Chat from './components/Chat/Chat';
import { useEffect, useRef } from 'react';
import { setUser, setLoading } from './redux/authSlice';
import { useDispatch } from 'react-redux';
import MentorReg from './pages/MentorReg/MentorReg';
import GovernmentDashboard from './pages/GovernmentDashboard/GovernmentDashboard';
import axios from 'axios';

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirected = useRef(false);
  
  useEffect(() => {
    // Verify authentication on app load
    const verifyAuth = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/v1/auth/verify', {
          withCredentials: true
        });
        
        if (response.data.authenticated) {
          dispatch(setUser({ auth: true, user: response.data.user }));
          
          // Redirect government users only once and only from home/login pages
          if (!hasRedirected.current &&
              response.data.user.role === 'ADMIN' && 
              response.data.user.email === 'goverment@india.com' &&
              (location.pathname === '/' || location.pathname === '/login')) {
            hasRedirected.current = true;
            navigate('/government-dashboard', { replace: true });
          }
        } else {
          dispatch(setUser({ auth: false, user: null }));
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        dispatch(setUser({ auth: false, user: null }));
      }
    };

    verifyAuth();
  }, [dispatch, navigate, location.pathname]);

  return (
    <Routes>
      {/* Protected routes */}
      <Route element={<PrivateRoutes />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/application-form" element={<ApplicationForm />} />
        <Route path="/document-upload" element={<DocumentUpload />} />
        <Route path = "/chat" element = {<Chat />} />
        <Route path = "/mentor" element = {<Mentor />} />
        <Route path='/mentorReg' element={<MentorReg/>}/>
        <Route path='/government-dashboard' element={<GovernmentDashboard/>}/>
      </Route>

      {/* Public routes with Navbar and Footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Main />} />
        <Route path="/user" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/help-center" element={<Help />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/otpverify" element={<OtpVerify />} />
      </Route>
    </Routes>
  );
}


export default App;
