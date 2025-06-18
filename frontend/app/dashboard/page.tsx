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
  AlertCircle,
  Edit,
  UserCheck,
  TrendingUp,
  Calendar,
  MapPin,
  DollarSign
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

interface CompanyProfile {
  _id: string;
  companyDetails: {
    companyName: string;
    companyType: string;
    city: string;
    state: string;
  };
  created_at: string;
  updated_at: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [matchLoading, setMatchLoading] = useState(false);
  const [summarizeLoading, setSummarizeLoading] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  
  // Profile state
  const [hasProfile, setHasProfile] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  
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

  const checkProfile = async () => {
    setProfileLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const profile = await response.json();
        setCompanyProfile(profile);
        setHasProfile(true);
      } else if (response.status === 404) {
        setHasProfile(false);
        setCompanyProfile(null);
      } else {
        throw new Error("Failed to check profile");
      }
    } catch (error) {
      console.error("Profile check failed:", error);
      setHasProfile(false);
      setCompanyProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

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
          await checkProfile();
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

  const handleProfileAction = () => {
    router.push("/tender-match-pro");
  };

  const handleFilterTenders = async () => {
    if (!hasProfile) {
      setError("Please complete your company profile first to filter tenders.");
      return;
    }

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
    if (!hasProfile) {
      setError("Please complete your company profile first to match tenders.");
      return;
    }

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
    setTenderSummaryText("");
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tendorix Dashboard</h1>
                <p className="text-sm text-gray-500">AI-Powered Tender Matching</p>
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
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Your Dashboard
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover relevant tender opportunities with AI-powered matching and intelligent insights
          </p>
        </div>

        {/* Profile Status Banner */}
        {profileLoading ? (
          <div className="mb-8">
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-600">Checking profile status...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="mb-8">
            {hasProfile && companyProfile ? (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-green-800">
                          Profile Complete - {companyProfile.companyDetails.companyName}
                        </h3>
                        <p className="text-green-600">
                          {companyProfile.companyDetails.companyType} • {companyProfile.companyDetails.city}, {companyProfile.companyDetails.state}
                        </p>
                        <p className="text-sm text-green-500 mt-1">
                          Last updated: {new Date(companyProfile.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleProfileAction}
                      variant="outline"
                      className="border-green-300 text-green-700 hover:bg-green-100"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-amber-800">
                          Complete Your Company Profile
                        </h3>
                        <p className="text-amber-600">
                          Fill out your company details to start receiving personalized tender matches
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={handleProfileAction}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      Fill Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Filter Tenders Card */}
          <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-blue-800">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Filter className="w-5 h-5 text-white" />
                </div>
                <span>Filter Tenders</span>
              </CardTitle>
              <CardDescription className="text-blue-600">
                View total and filtered tender counts from our comprehensive database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleFilterTenders}
                disabled={filterLoading || !hasProfile}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                size="lg"
              >
                {filterLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Filtering...</span>
                  </div>
                ) : (
                  <>
                    <Database className="w-5 h-5 mr-2" />
                    Filter Tenders
                  </>
                )}
              </Button>
              {!hasProfile && (
                <p className="text-xs text-blue-500 mt-2 text-center">
                  Complete your profile to enable this feature
                </p>
              )}
            </CardContent>
          </Card>

          {/* Match Tenders Card */}
          <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-purple-800">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <span>Match Tenders</span>
              </CardTitle>
              <CardDescription className="text-purple-600">
                Run AI-powered matching to find the most relevant tender opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleMatchTenders}
                disabled={matchLoading || !hasProfile}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-md"
                size="lg"
              >
                {matchLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Matching...</span>
                  </div>
                ) : (
                  <>
                    <Target className="w-5 h-5 mr-2" />
                    Match Tenders
                  </>
                )}
              </Button>
              {!hasProfile && (
                <p className="text-xs text-purple-500 mt-2 text-center">
                  Complete your profile to enable this feature
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filter Results */}
        {showFilterResults && tenderSummary && (
          <Card className="mb-8 shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-3">
                <Database className="w-6 h-6" />
                <span>Tender Database Statistics</span>
              </CardTitle>
              <CardDescription className="text-blue-100">
                Overview of available tenders matching your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{tenderSummary.total_tenders}</div>
                  <div className="text-blue-700 font-medium">Total Tenders in Database</div>
                  <div className="text-sm text-blue-500 mt-1">Comprehensive tender collection</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="text-4xl font-bold text-green-600 mb-2">{tenderSummary.filtered_tenders}</div>
                  <div className="text-green-700 font-medium">Relevant for Your Business</div>
                  <div className="text-sm text-green-500 mt-1">Filtered based on your profile</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Match Results */}
        {showMatchResults && (
          <Card className="mb-8 shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-3">
                <Target className="w-6 h-6" />
                <span>Matched Tenders ({matchedTenders.length})</span>
              </CardTitle>
              <CardDescription className="text-purple-100">
                AI-powered tender matches based on your company profile
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {matchedTenders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Matching Tenders Found</h3>
                  <p className="text-gray-500">Try updating your company profile to find more relevant opportunities.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matchedTenders.map((tender) => (
                    <div key={tender._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-white">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-3 text-gray-900 line-clamp-2">{tender.title}</h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {tender.business_category?.map((category, index) => (
                              <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                                {category}
                              </Badge>
                            ))}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                            {tender.reference_number && (
                              <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <span><strong>Ref:</strong> {tender.reference_number}</span>
                              </div>
                            )}
                            {tender.location && (
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span><strong>Location:</strong> {tender.location}</span>
                              </div>
                            )}
                            {tender.deadline && (
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span><strong>Deadline:</strong> {tender.deadline}</span>
                              </div>
                            )}
                            {tender.estimated_budget && (
                              <div className="flex items-center space-x-2">
                                <DollarSign className="w-4 h-4 text-gray-400" />
                                <span><strong>Budget:</strong> ₹{tender.estimated_budget.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-6 flex flex-col items-end space-y-3">
                          <div className="flex items-center space-x-2">
                            <Badge variant={tender.eligible ? "default" : "destructive"} className="text-sm">
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
                            <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                              <TrendingUp className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-bold text-green-700">
                                {tender.matching_score.toFixed(1)}% Match
                              </span>
                            </div>
                          )}
                          <Button 
                            size="sm" 
                            onClick={() => handleViewTender(tender)}
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
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

        {/* Enhanced Tender Details Modal */}
        {showTenderDetails && selectedTender && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl border-0">
              <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-t-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-3 pr-8">{selectedTender.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-gray-300">
                      <span className="flex items-center space-x-1">
                        <FileText className="w-4 h-4" />
                        <span>{selectedTender.reference_number}</span>
                      </span>
                      {selectedTender.matching_score && (
                        <Badge className="bg-green-600 text-white">
                          {selectedTender.matching_score.toFixed(1)}% Match
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowTenderDetails(false)}
                    className="text-white hover:bg-gray-700"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Tender Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-gray-800 border-b pb-2">Tender Information</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div>
                          <strong className="text-gray-700">Location:</strong>
                          <p className="text-gray-600">{selectedTender.location}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Clock className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div>
                          <strong className="text-gray-700">Deadline:</strong>
                          <p className="text-gray-600">{selectedTender.deadline}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Badge className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div>
                          <strong className="text-gray-700">Categories:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedTender.business_category?.map((cat, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">{cat}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg text-gray-800 border-b pb-2">Financial Details</h4>
                    <div className="space-y-3 text-sm">
                      {selectedTender.estimated_budget && (
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <div>
                            <strong className="text-gray-700">Budget:</strong>
                            <span className="text-green-600 font-semibold ml-2">
                              ₹{selectedTender.estimated_budget.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                      {selectedTender.emd && typeof selectedTender.emd === 'object' && selectedTender.emd.amount && (
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <div>
                            <strong className="text-gray-700">EMD Amount:</strong>
                            <span className="text-blue-600 font-semibold ml-2">
                              ₹{selectedTender.emd.amount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <Badge variant={selectedTender.eligible ? "default" : "destructive"}>
                          {selectedTender.eligible ? "Eligible" : "Not Eligible"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Missing Fields */}
                {selectedTender.missing_fields && Object.keys(selectedTender.missing_fields).length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 text-red-800 flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5" />
                      <span>Missing Requirements</span>
                    </h4>
                    <div className="space-y-2 text-sm">
                      {Object.entries(selectedTender.missing_fields).map(([field, issue]) => (
                        <div key={field} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                          <div>
                            <strong className="text-red-700 capitalize">{field}:</strong>
                            <span className="text-red-600 ml-1">{issue}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  <Button 
                    onClick={() => handleSummarizeTender(selectedTender._id)}
                    disabled={summarizeLoading === selectedTender._id}
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-md"
                  >
                    {summarizeLoading === selectedTender._id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        <span>Summarizing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        <span>AI Summary</span>
                      </>
                    )}
                  </Button>
                  {selectedTender.form_url && (
                    <Button 
                      variant="outline"
                      onClick={() => window.open(selectedTender.form_url, '_blank')}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      <span>View Document</span>
                    </Button>
                  )}
                </div>

                {/* AI Summary */}
                {tenderSummaryText && (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mt-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      <strong className="text-purple-800">AI-Generated Summary</strong>
                    </div>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {tenderSummaryText}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}