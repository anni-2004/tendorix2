"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  LogOut, 
  ArrowLeft,
  Upload, 
  FileText, 
  Download, 
  Edit, 
  AlertCircle, 
  CheckCircle, 
  Loader,
  Eye
} from 'lucide-react';

interface TemplateSchema {
  templateId: string;
  name: string;
  fields: Array<{
    id: string;
    label: string;
    type: string;
    generative?: boolean;
  }>;
  templateString: string;
}

interface TenderData {
  [key: string]: any;
}

export default function TenderDraftPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Step management
  const [step, setStep] = useState<'upload' | 'configure' | 'edit' | 'generate'>('upload');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Template upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [templateSchema, setTemplateSchema] = useState<TemplateSchema | null>(null);
  
  // Tender data state
  const [tenderId, setTenderId] = useState('');
  const [tenderData, setTenderData] = useState<TenderData | null>(null);
  const [mappedData, setMappedData] = useState<{ [key: string]: string }>({});
  
  // Editor state
  const [editorContent, setEditorContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const user = await response.json();
          setUserEmail(user.email);
        } else {
          localStorage.removeItem("token");
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.docx')) {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('Please select a valid .docx file');
    }
  };

  const handleUploadTemplate = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch("http://localhost:8000/api/docgen/upload-template/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setTemplateSchema({
          templateId: data.templateId,
          name: data.schema.name || 'Untitled Template',
          fields: data.schema.fields || [],
          templateString: data.schema.templateString || '',
        });
        setSuccess('Template uploaded successfully!');
        setStep('configure');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to upload template');
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchTenderData = async () => {
    if (!tenderId.trim()) {
      setError('Please enter a Tender ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/api/docgen/tender/${tenderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTenderData(data);
        
        // Initialize mapped data with empty values
        const initialMappedData: { [key: string]: string } = {};
        templateSchema?.fields.forEach(field => {
          initialMappedData[field.id] = '';
        });
        setMappedData(initialMappedData);
        
        setSuccess('Tender data fetched successfully!');
        generatePreview(initialMappedData);
        setStep('edit');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to fetch tender data');
      }
    } catch (error) {
      console.error("Fetch failed:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = (data: { [key: string]: string }) => {
    if (!templateSchema) return;
    
    let preview = templateSchema.templateString;
    
    // Replace placeholders with mapped data
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      preview = preview.replace(new RegExp(placeholder, 'g'), value || `[${key}]`);
    });
    
    setEditorContent(preview);
  };

  const handleFieldUpdate = (fieldId: string, value: string) => {
    const updatedMappedData = { ...mappedData, [fieldId]: value };
    setMappedData(updatedMappedData);
    generatePreview(updatedMappedData);
  };

  const handleGenerateDocument = async () => {
    if (!templateSchema) {
      setError('No template available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append('templateId', templateSchema.templateId);
      formData.append('mappedData', JSON.stringify(mappedData));

      const response = await fetch("http://localhost:8000/api/docgen/generate-document/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      if (response.ok) {
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${templateSchema.name}_Generated.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        setSuccess('Document generated and downloaded successfully!');
        setStep('generate');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to generate document');
      }
    } catch (error) {
      console.error("Generate failed:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetProcess = () => {
    setStep('upload');
    setSelectedFile(null);
    setTemplateSchema(null);
    setTenderId('');
    setTenderData(null);
    setMappedData({});
    setEditorContent('');
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const progressValue = (['upload', 'configure', 'edit', 'generate'].indexOf(step) + 1) / 4 * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToDashboard}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">TD</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">TenderDraft</h1>
                  <p className="text-sm text-gray-500">AI-Powered Document Generator</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{userEmail}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Document Generator
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create professional tender documents with AI-powered template processing
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {['upload', 'configure', 'edit', 'generate'].indexOf(step) + 1} of 4: {
                step === 'upload' ? 'Upload Template' :
                step === 'configure' ? 'Configure Data' :
                step === 'edit' ? 'Edit & Review' :
                'Generate Document'
              }
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progressValue)}% Complete
            </span>
          </div>
          <Progress value={progressValue} className="w-full h-3 bg-gray-200" />
        </div>

        {/* Alert Messages */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 'upload' && (
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-3">
                    <Upload className="w-6 h-6" />
                    <span>Upload Template</span>
                  </CardTitle>
                  <CardDescription className="text-green-100">
                    Select a .docx template file to get started
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-2">
                        Template File (.docx)
                      </Label>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept=".docx"
                        onChange={handleFileSelect}
                        className="cursor-pointer"
                      />
                      {selectedFile && (
                        <p className="mt-2 text-sm text-gray-600">
                          Selected: {selectedFile.name}
                        </p>
                      )}
                    </div>
                    
                    <Button
                      onClick={handleUploadTemplate}
                      disabled={!selectedFile || loading}
                      className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md"
                      size="lg"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <Loader className="h-4 w-4 animate-spin" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          <span>Upload & Parse Template</span>
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 'configure' && templateSchema && (
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-3">
                    <FileText className="w-6 h-6" />
                    <span>Configure Data Source</span>
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Enter the Tender ID to fetch relevant data
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-2">
                        Tender ID
                      </Label>
                      <Input
                        type="text"
                        value={tenderId}
                        onChange={(e) => setTenderId(e.target.value)}
                        placeholder="e.g., LEGACY11784"
                      />
                    </div>
                    
                    <Button
                      onClick={handleFetchTenderData}
                      disabled={!tenderId.trim() || loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                      size="lg"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <Loader className="h-4 w-4 animate-spin" />
                          <span>Fetching Data...</span>
                        </div>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          <span>Fetch Tender Data</span>
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 'edit' && templateSchema && (
              <div className="space-y-6">
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center space-x-3">
                      <Edit className="w-6 h-6" />
                      <span>Edit Document</span>
                    </CardTitle>
                    <CardDescription className="text-purple-100">
                      Review and edit the generated content
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="bg-gray-50 border rounded-lg p-4 mb-6 max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800">
                        {editorContent}
                      </pre>
                    </div>
                    
                    <div className="flex space-x-4">
                      <Button
                        onClick={handleGenerateDocument}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white shadow-md"
                      >
                        {loading ? (
                          <>
                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                            <span>Generating...</span>
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            <span>Generate Document</span>
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={resetProcess}
                        variant="outline"
                      >
                        Start Over
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {step === 'generate' && (
              <Card className="shadow-lg border-0 text-center">
                <CardContent className="py-12">
                  <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Generated!</h2>
                  <p className="text-gray-600 mb-6">Your document has been successfully generated and downloaded.</p>
                  <Button
                    onClick={resetProcess}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Generate Another Document
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {templateSchema && (
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Template Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Name:</span>
                    <p className="text-gray-900">{templateSchema.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Fields:</span>
                    <p className="text-gray-900">{templateSchema.fields.length} detected</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === 'edit' && templateSchema && (
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Field Mapping</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {templateSchema.fields.map((field) => (
                    <div key={field.id}>
                      <Label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                      </Label>
                      <Input
                        type="text"
                        value={mappedData[field.id] || ''}
                        onChange={(e) => handleFieldUpdate(field.id, e.target.value)}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className="text-sm"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {tenderData && (
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Tender Data</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600">
                  <p>Tender ID: <span className="font-medium text-gray-900">{tenderId}</span></p>
                  <p>Fields Available: <span className="font-medium text-gray-900">{Object.keys(tenderData).length}</span></p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}