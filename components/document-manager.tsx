"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, ImageIcon, Download, Eye, Share2, Calendar, User, Paperclip } from "lucide-react"

interface DocumentManagerProps {
  patientId: string
}

export function DocumentManager({ patientId }: DocumentManagerProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadData, setUploadData] = useState({
    title: "",
    category: "lab-results",
    description: "",
  })

  const documents = [
    {
      id: 1,
      title: "Blood Test Results - January 2024",
      category: "lab-results",
      type: "pdf",
      size: "2.4 MB",
      uploadedBy: "Dr. Smith",
      uploadDate: "2024-01-15",
      description: "Complete blood panel including glucose, cholesterol, and kidney function",
      shared: true,
    },
    {
      id: 2,
      title: "Chest X-Ray",
      category: "imaging",
      type: "image",
      size: "8.1 MB",
      uploadedBy: "Dr. Johnson",
      uploadDate: "2024-01-10",
      description: "Routine chest X-ray for annual check-up",
      shared: false,
    },
    {
      id: 3,
      title: "Prescription - Lisinopril",
      category: "prescription",
      type: "pdf",
      size: "156 KB",
      uploadedBy: "Dr. Smith",
      uploadDate: "2024-01-08",
      description: "Updated prescription for blood pressure medication",
      shared: true,
    },
    {
      id: 4,
      title: "Cardiology Consultation Report",
      category: "reports",
      type: "pdf",
      size: "1.8 MB",
      uploadedBy: "Dr. Wilson",
      uploadDate: "2024-01-05",
      description: "Specialist consultation for cardiac evaluation",
      shared: true,
    },
    {
      id: 5,
      title: "ECG Reading",
      category: "imaging",
      type: "image",
      size: "3.2 MB",
      uploadedBy: "Dr. Smith",
      uploadDate: "2024-01-03",
      description: "12-lead electrocardiogram results",
      shared: false,
    },
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "lab-results":
        return "bg-blue-100 text-blue-800"
      case "imaging":
        return "bg-purple-100 text-purple-800"
      case "prescription":
        return "bg-green-100 text-green-800"
      case "reports":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />
      case "image":
        return <ImageIcon className="h-5 w-5 text-blue-500" />
      default:
        return <Paperclip className="h-5 w-5 text-gray-500" />
    }
  }

  const handleUpload = () => {
    // In real app, upload to Firebase Storage
    console.log("Uploading document:", uploadData)
    setIsUploading(false)
    setUploadData({
      title: "",
      category: "lab-results",
      description: "",
    })
  }

  return (
    <div className="space-y-6">
      {/* Document Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="medical-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="medical-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Images</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="medical-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Share2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Shared</p>
                <p className="text-2xl font-bold text-gray-900">16</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="medical-card">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document List */}
      <Card className="medical-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Patient Documents
              </CardTitle>
              <CardDescription>Manage medical records, reports, and shared documents</CardDescription>
            </div>
            <Dialog open={isUploading} onOpenChange={setIsUploading}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload New Document</DialogTitle>
                  <DialogDescription>Add a new medical document or report for this patient.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file">Select File</Label>
                    <Input id="file" type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="cursor-pointer" />
                  </div>
                  <div>
                    <Label htmlFor="title">Document Title</Label>
                    <Input
                      id="title"
                      value={uploadData.title}
                      onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                      placeholder="e.g., Blood Test Results - January 2024"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={uploadData.category}
                      onValueChange={(value) => setUploadData({ ...uploadData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lab-results">Lab Results</SelectItem>
                        <SelectItem value="imaging">Medical Imaging</SelectItem>
                        <SelectItem value="prescription">Prescriptions</SelectItem>
                        <SelectItem value="reports">Medical Reports</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      value={uploadData.description}
                      onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                      placeholder="Brief description of the document"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsUploading(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpload}>Upload Document</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getFileIcon(doc.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{doc.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(doc.category)}`}
                        >
                          {doc.category.replace("-", " ")}
                        </span>
                        <div className="flex items-center text-xs text-gray-500">
                          <User className="h-3 w-3 mr-1" />
                          {doc.uploadedBy}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {doc.uploadDate}
                        </div>
                        <span className="text-xs text-gray-500">{doc.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {doc.shared && (
                      <Badge variant="secondary" className="text-xs">
                        <Share2 className="h-3 w-3 mr-1" />
                        Shared
                      </Badge>
                    )}
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
