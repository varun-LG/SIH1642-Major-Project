import { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Loader2, Eye, ExternalLink } from 'lucide-react'
import UploadWidget from '@/components/UploadWidget/UploadWidget'

export default function DocumentUpload() {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [savedFiles, setSavedFiles] = useState([])

  // Fetch saved documents on component mount
  useEffect(() => {
    fetchSavedDocuments()
  }, [])

  const fetchSavedDocuments = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/v1/documents', {
        withCredentials: true
      })
      if (response.data.status === 'success') {
        setSavedFiles(response.data.documents)
        // Convert saved documents to display format
        const formattedFiles = response.data.documents.map(doc => ({
          name: doc.url.split('/').pop(),
          status: 'success',
          url: doc.url
        }))
        setUploadedFiles(formattedFiles)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    }
  }

  const handleCompleteUpload = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one document')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(
        'http://localhost:3000/api/v1/documents',
        {
          documents: uploadedFiles.map(file => ({
            url: file.url,
            type: 'REGISTRATION'
          }))
        },
        { withCredentials: true }
      )

      if (response.data.status === 'success') {
        alert('Documents saved successfully!')
        fetchSavedDocuments() // Refresh the list
      }
    } catch (error) {
      console.error('Error saving documents:', error)
      alert('Failed to save documents. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleViewDocument = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Document Upload</CardTitle>
          <CardDescription>Upload all required documents for your AYUSH startup registration.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <UploadWidget setUploadedFiles={setUploadedFiles} />
         
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Uploaded Documents</h3>
            {uploadedFiles.length === 0 ? (
              <p className="text-sm text-gray-500">No documents uploaded yet.</p>
            ) : (
              uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center flex-1 min-w-0">
                    {file.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                    )}
                    <span className="truncate max-w-md">{file.name}</span>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDocument(file.url)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveFile(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleCompleteUpload}
            disabled={loading || uploadedFiles.length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Complete Upload'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}