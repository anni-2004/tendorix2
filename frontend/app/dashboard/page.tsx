"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  LogOut, 
  Building2, 
  Filter, 
  Target, 
  FileText,
  Eye,
  Sparkles,
  Database,
  CheckCircle,
  Clock,
  ExternalLink,
  AlertCircle
} from "lucide-react";

interface Tender {
  _id: string;
  title: string;
  reference_number?: string;
  location?: string;
  business_category?: string[];
  deadline?: string;
  form_url?: string;
  matching_score?: number;
  eligible?: boolean;
  emd?: any;
  estimated_budget?: number;
  field_scores?: Record<string, number>;
  missing_fields?: Record<string, string>;
}

interface TenderSummary {
  total_tenders: number;
  filtered_tenders: number;
  filtered_list: Tender[];
}

export default function Dashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [matchLoading, setMatchLoading] = useState(false);
  const [summarizeLoading, setSummarizeLoading] = useState("");
  
  // Data states
  const [tenderSummary, setTenderSummary] = useState<TenderSummary | null>(null);
  const [matchedTenders, setMatchedTenders] = useState<Tender[]>([]);
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [tenderSummaryText, setTenderSummaryText] = useState<string>("");
  
  // UI states
  const [showFilterResults, setShowFilterResults] = useState(false);
  const [showMatchResults, setShowMatchResults] = useState(false);
  const [showTenderDetails, setShowTenderDetails] = useState(false);
  const [error, setError] = useState("");

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

  const handleFilterTenders = async () => {
    setFilterLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/tenders/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTenderSummary(data);
        setShowFilterResults(true);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to filter tenders");
      }
    } catch (error) {
      console.error("Filter failed:", error);
      setError("Network error. Please try again.");
    } finally {
      setFilterLoading(false);
    }
  };

  const handleMatchTenders = async () => {
    setMatchLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/tenders/match", {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMatchedTenders(data.matches || []);
        setShowMatchResults(true);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to match tenders");
      }
    } catch (error) {
      console.error("Match failed:", error);
      setError("Network error. Please try again.");
    } finally {
      setMatchLoading(false);
    }
  };

  const handleViewTender = (tender: Tender) => {
    setSelectedTender(tender);
    setShowTenderDetails(true);
    setTenderSummaryText(""); // Reset summary
  };

  const handleSummarizeTender = async (tenderId: string) => {
    setSummarizeLoading(tenderId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/api/tenders/${tenderId}/summarize`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTenderSummaryText(data.summary);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to summarize tender");
      }
    } catch (error) {
      console.error("Summarize failed:", error);
      setError("Network error. Please try again.");
    } finally {
      setSummarizeLoading("");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Tendorix Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{userEmail}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center space-x-2"
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
            Welcome to Your Dashboard
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage your company profile and discover relevant tender opportunities
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Company Profile Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>Company Profile</span>
              </CardTitle>
              <CardDescription>
                Complete your company information for better tender matching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push("/tender-match-pro")}
                className="w-full"
              >
                Fill Company Profile
              </Button>
            </CardContent>
          </Card>

          {/* Filter Tenders Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-green-600" />
                <span>Filter Tenders</span>
              </CardTitle>
              <CardDescription>
                View total and filtered tender counts from database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleFilterTenders}
                disabled={filterLoading}
                className="w-full"
                variant="outline"
              >
                {filterLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Filtering...</span>
                  </div>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Filter Tenders
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Match Tenders Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-purple-600" />
                <span>Match Tenders</span>
              </CardTitle>
              <CardDescription>
                Run matching pipeline to find relevant tenders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleMatchTenders}
                disabled={matchLoading}
                className="w-full"
                variant="default"
              >
                {matchLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Matching...</span>
                  </div>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Match Tenders
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Filter Results */}
        {showFilterResults && tenderSummary && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-blue-600" />
                <span>Tender Database Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{tenderSummary.total_tenders}</div>
                  <div className="text-gray-600">Total Tenders in Database</div>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">{tenderSummary.filtered_tenders}</div>
                  <div className="text-gray-600">Filtered Relevant Tenders</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Match Results */}
        {showMatchResults && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-purple-600" />
                <span>Matched Tenders ({matchedTenders.length})</span>
              </CardTitle>
              <CardDescription>
                Tenders that match your company profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              {matchedTenders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No matching tenders found. Try updating your company profile.
                </div>
              ) : (
                <div className="space-y-4">
                  {matchedTenders.map((tender) => (
                    <div key={tender._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{tender.title}</h3>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {tender.business_category?.map((category, index) => (
                              <Badge key={index} variant="secondary">{category}</Badge>
                            ))}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            {tender.reference_number && (
                              <div>Reference: {tender.reference_number}</div>
                            )}
                            {tender.location && (
                              <div>Location: {tender.location}</div>
                            )}
                            {tender.deadline && (
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>Deadline: {tender.deadline}</span>
                              </div>
                            )}
                            {tender.estimated_budget && (
                              <div>Budget: ₹{tender.estimated_budget.toLocaleString()}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant={tender.eligible ? "default" : "destructive"}>
                              {tender.eligible ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Eligible
                                </>
                              ) : (
                                "Not Eligible"
                              )}
                            </Badge>
                          </div>
                          {tender.matching_score && (
                            <div className="text-sm font-medium text-green-600 mb-2">
                              Match: {tender.matching_score.toFixed(1)}%
                            </div>
                          )}
                          <Button 
                            size="sm" 
                            onClick={() => handleViewTender(tender)}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tender Details Modal */}
        {showTenderDetails && selectedTender && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-2">{selectedTender.title}</CardTitle>
                    <CardDescription>
                      Reference: {selectedTender.reference_number}
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowTenderDetails(false)}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tender Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Tender Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Location:</strong> {selectedTender.location}</div>
                      <div><strong>Deadline:</strong> {selectedTender.deadline}</div>
                      <div><strong>Categories:</strong> {selectedTender.business_category?.join(", ")}</div>
                      {selectedTender.matching_score && (
                        <div><strong>Match Score:</strong> {selectedTender.matching_score.toFixed(1)}%</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Financial Details</h4>
                    <div className="space-y-2 text-sm">
                      {selectedTender.estimated_budget && (
                        <div><strong>Budget:</strong> ₹{selectedTender.estimated_budget.toLocaleString()}</div>
                      )}
                      {selectedTender.emd && typeof selectedTender.emd === 'object' && selectedTender.emd.amount && (
                        <div><strong>EMD Amount:</strong> ₹{selectedTender.emd.amount.toLocaleString()}</div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Badge variant={selectedTender.eligible ? "default" : "destructive"}>
                          {selectedTender.eligible ? "Eligible" : "Not Eligible"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Missing Fields */}
                {selectedTender.missing_fields && Object.keys(selectedTender.missing_fields).length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-red-600">Missing Requirements</h4>
                    <div className="space-y-1 text-sm">
                      {Object.entries(selectedTender.missing_fields).map(([field, issue]) => (
                        <div key={field} className="text-red-600">
                          <strong>{field}:</strong> {issue}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={() => handleSummarizeTender(selectedTender._id)}
                    disabled={summarizeLoading === selectedTender._id}
                    className="flex items-center space-x-2"
                  >
                    {summarizeLoading === selectedTender._id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Summarizing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Summarize</span>
                      </>
                    )}
                  </Button>
                  {selectedTender.form_url && (
                    <Button 
                      variant="outline"
                      onClick={() => window.open(selectedTender.form_url, '_blank')}
                      className="flex items-center space-x-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View Document</span>
                    </Button>
                  )}
                </div>

                {/* Summary */}
                {tenderSummaryText && (
                  <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertDescription className="mt-2">
                      <strong>AI Summary:</strong><br />
                      {tenderSummaryText}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}