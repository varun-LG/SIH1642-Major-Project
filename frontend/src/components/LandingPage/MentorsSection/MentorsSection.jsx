import { useEffect, useState } from 'react'
import axios from 'axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from 'react-router-dom'
import { Users, Mail } from 'lucide-react'

export default function MentorsSection() {
  const [mentors, setMentors] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('http://localhost:3000/api/v1/mentor/all')
      .then((response) => {
        setMentors(response.data.mentors || [])
      })
      .catch((error) => {
        console.error('Error fetching mentors:', error)
      })
  }, [])

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Meet Our Expert Mentors
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with experienced professionals in the AYUSH sector to guide your startup journey
          </p>
        </div>

        {mentors.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No mentors available at the moment</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {mentors.slice(0, 8).map((mentor, index) => (
                <Card key={index} className="hover:shadow-lg transition">
                  <CardHeader>
                    <CardTitle className="text-lg">{mentor.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {mentor.cataegory}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{mentor.email}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.location.href = `mailto:${mentor.email}`}
                    >
                      Contact Mentor
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button 
                size="lg"
                onClick={() => navigate('/mentor')}
                className="bg-green-600 hover:bg-green-700"
              >
                Apply to Become a Mentor
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
