import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "../../components/Navbar/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import axios from 'axios';
import { toast } from 'react-hot-toast'
function Mentor() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    number: '',
    expertise: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/v1/register-mentor/', formData);
      toast.success('Application submitted successfully! Waiting for government approval.');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error.response?.data?.error || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center">Apply to Become a Mentor</CardTitle>
              <CardDescription className="text-center text-lg">
                Share your expertise and help guide AYUSH startups to success
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="number">Alternate Contact</Label>
                  <Input
                    id="number"
                    name="number"
                    value={formData.number}
                    onChange={handleChange}
                    placeholder="Alternate phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expertise">Area of Expertise *</Label>
                  <Textarea
                    id="expertise"
                    name="expertise"
                    value={formData.expertise}
                    onChange={handleChange}
                    placeholder="Describe your expertise and how you can help startups (e.g., Ayurveda, Yoga, Marketing, Finance)"
                    rows={5}
                    required
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Your application will be reviewed by the government team.
                    Once approved, you'll be listed as a mentor on the portal.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export default Mentor;
