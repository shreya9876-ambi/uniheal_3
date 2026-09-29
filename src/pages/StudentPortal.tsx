import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogIn, Leaf, Headphones, Shield, Brain, Heart, Activity, Calendar, Clock, CheckCircle, Plus, Trophy, Target, Award, Zap, Star, Crown, Sparkles, AlertTriangle, RefreshCw, UserCheck, MapPin, Video, Building } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import ChatBot from "@/components/ChatBot";
import EmergencyResources from "@/components/EmergencyResources";
import QuickResources from "@/components/QuickResources";
import CounsellorsDirectory from "@/components/CounsellorsDirectory";
import CounsellorBookingModal from "@/components/CounsellorBookingModal";
import { Progress } from "@/components/ui/progress";
import AssessmentModal from "@/components/AssessmentModal";
import { api, getStoredUser, clearStoredAuth, UserProfile, CounsellorProfile, AppointmentItem } from "@/lib/api";

const StudentPortal = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getStoredUser());
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const u = getStoredUser();
    return !!(u && u.role === 'student');
  });

  // Login form
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [showAssessment, setShowAssessment] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [counsellors, setCounsellors] = useState<CounsellorProfile[]>([]);
  const [loadingCounsellors, setLoadingCounsellors] = useState(false);
  const [selectedCounsellorForBooking, setSelectedCounsellorForBooking] = useState<CounsellorProfile | null>(null);

  const [sessions, setSessions] = useState<AppointmentItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Persistent confidential assessment status
  const [assessmentResult, setAssessmentResult] = useState<{
    academicStress: number;
    moodMotivation: number;
    suicidalRisk: number;
    totalScore: number;
    riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
    dateTaken: string;
  } | null>(() => {
    const u = getStoredUser();
    const key = `uniheal_assessment_${u?.id || u?._id || 'guest'}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  // Load counsellors on component mount
  useEffect(() => {
    fetchCounsellors();
  }, []);

  // Load appointments from backend on login
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      fetchSessions();
      fetchCounsellors();
    }
  }, [isLoggedIn, currentUser]);

  const fetchCounsellors = async () => {
    setLoadingCounsellors(true);
    try {
      const res = await api.getCounsellors();
      setCounsellors(res.counsellors || []);
    } catch (err) {
      console.warn("Could not fetch counsellors", err);
    } finally {
      setLoadingCounsellors(false);
    }
  };

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await api.getAppointments();
      setSessions(res.appointments || []);
    } catch (err) {
      // Backend not connected - show empty state gracefully
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const res = await api.login({
        identifier: loginIdentifier,
        password: loginPassword,
        role: 'student',
      });
      if (res.user.role !== 'student') {
        throw new Error('This account is not a student account. Please use the correct portal.');
      }
      setCurrentUser(res.user);
      setIsLoggedIn(true);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid credentials. Please check your Student ID/Email and password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = () => {
    clearStoredAuth();
    setCurrentUser(null);
    setIsLoggedIn(false);
    setLoginIdentifier("");
    setLoginPassword("");
    setSessions([]);
  };

  const handleBookWithCounsellor = (counsellor: CounsellorProfile) => {
    setSelectedCounsellorForBooking(counsellor);
    setShowBookingModal(true);
  };

  const handleOpenGeneralBooking = () => {
    setSelectedCounsellorForBooking(counsellors.length > 0 ? counsellors[0] : null);
    setShowBookingModal(true);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-soft">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              <span className="font-semibold text-primary">UniHeal</span>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto space-y-8">
            {/* Login/SignUp Card */}
            <Card className="bg-gradient-card shadow-soft">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Student Portal</CardTitle>
                <CardDescription>
                  Sign in with your Student ID or Email to access your personal mental health dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  {loginError && (
                    <div className="p-3 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded-lg flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student ID or Email</Label>
                    <Input
                      id="studentId"
                      type="text"
                      placeholder="e.g. STU-2025-01 or your@university.edu"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={isLoggingIn}>
                    {isLoggingIn ? <RefreshCw className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                    {isLoggingIn ? "Signing in..." : "Sign In Securely"}
                  </Button>
                </form>

                <div className="mt-6">
                  <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground mb-1">🔒 Admin-Issued Credentials</p>
                    <p>Your account is created by the University Administration. Contact your institution if you don't have credentials.</p>
                  </div>
                  <div className="mt-3 flex justify-center">
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" />
                      Secure & Confidential
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Notice */}
            <Card className="bg-pastel-mint/50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-green-800 mb-1">Your Privacy Matters</h4>
                    <p className="text-sm text-green-700">
                      All conversations and assessments are completely confidential. 
                      Your data is encrypted and never shared without your consent.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Resources */}
            <EmergencyResources />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Glass Morphism Navigation Bar */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/30 border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Leaf className="h-6 w-6 text-primary" />
                <Headphones className="h-3 w-3 text-primary absolute -top-0.5 -right-0.5" />
              </div>
              <div>
                <h1 className="font-semibold text-primary">UniHeal Dashboard</h1>
                <p className="text-xs text-muted-foreground">{currentUser?.name || 'Student Portal'}</p>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                onClick={() => scrollToSection('chat-section')}
                size="sm"
                className="gap-2"
              >
                <Headphones className="h-4 w-4" />
                Chat
              </Button>
              <Button
                variant="ghost"
                onClick={() => scrollToSection('assessment-section')}
                size="sm"
                className="gap-2"
              >
                <Brain className="h-4 w-4" />
                Assessment
              </Button>
              <Button
                variant="ghost"
                onClick={() => scrollToSection('resources-section')}
                size="sm"
                className="gap-2"
              >
                <Heart className="h-4 w-4" />
                Resources
              </Button>
              <Button
                variant="ghost"
                onClick={() => scrollToSection('counsellors-section')}
                size="sm"
                className="gap-2 font-medium text-teal-800 hover:text-teal-950 hover:bg-teal-50"
              >
                <UserCheck className="h-4 w-4 text-teal-600" />
                Counsellors
              </Button>
              <Button
                variant="ghost"
                onClick={() => scrollToSection('calendar-section')}
                size="sm"
                className="gap-2"
              >
                <Activity className="h-4 w-4" />
                My Sessions
              </Button>
            </div>

            <Button 
              variant="outline" 
              onClick={handleSignOut}
              size="sm"
              className="bg-white/20 border-white/30 hover:bg-white/30"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Chat Section with Welcome Card on Right */}
        <section id="chat-section" className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 relative">
            <ChatBot />
          </div>
          
          {/* Welcome Card - Right Side */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-card shadow-card h-fit sticky top-20 animate-float">
              <CardHeader>
                <CardTitle className="text-lg">Welcome to Your Safe Space</CardTitle>
                <CardDescription>
                  Take a moment to check in with yourself. Sprout is here to listen and support you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge variant="secondary" className="w-full justify-center py-2">
                    ✨ Confidential & Anonymous
                  </Badge>
                  <Badge variant="outline" className="w-full justify-center py-2">
                    🌱 Judgment-Free Zone
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Mental Health Assessment Section */}
        <section id="assessment-section">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold flex items-center justify-center gap-3 mb-4">
              <Brain className="h-8 w-8 text-primary" />
              Mental Health Assessment
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Take a confidential assessment to understand your mental health and get personalized recommendations
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gradient-card shadow-card hover-scale animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-500" />
                  Anxiety Assessment
                </CardTitle>
                <CardDescription>
                  Evaluate your anxiety levels and triggers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowAssessment(true)}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Activity className="h-4 w-4" />
                  Start Test (5 min)
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card hover-scale animate-fade-in delay-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-green-500" />
                  Depression Screening
                </CardTitle>
                <CardDescription>
                  Check your mood and emotional wellbeing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowAssessment(true)}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Activity className="h-4 w-4" />
                  Start Test (7 min)
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card hover-scale animate-fade-in delay-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  Stress Evaluation
                </CardTitle>
                <CardDescription>
                  Assess your stress patterns and coping
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowAssessment(true)}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Activity className="h-4 w-4" />
                  Start Test (4 min)
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Resources Section */}
        <section id="resources-section">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold flex items-center justify-center gap-3 mb-4">
              <Heart className="h-8 w-8 text-primary" />
              Healing Resources
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Instant relief tools and techniques for stress, anxiety, and emotional support
            </p>
          </div>
          
          <QuickResources />
        </section>

        {/* Registered Counsellors Directory Section */}
        <CounsellorsDirectory
          counsellors={counsellors}
          loading={loadingCounsellors}
          onBookWithCounsellor={handleBookWithCounsellor}
          onRefresh={fetchCounsellors}
        />

        {/* My Sessions & Status Overview Section */}
        <section id="calendar-section" className="grid lg:grid-cols-2 gap-6">
          {/* Calendar / Sessions List */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    My Sessions
                  </CardTitle>
                  <CardDescription>
                    Your booked, confirmed, and past counseling appointments
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                  {sessions.length} {sessions.length === 1 ? 'Booking' : 'Bookings'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loadingSessions ? (
                  <div className="py-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                    <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm">Loading sessions...</span>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">No Sessions Scheduled</p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                      You haven't scheduled any sessions yet. Browse the registered counsellors directory above to book an appointment with a counselor of your choice.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => scrollToSection('counsellors-section')}
                      className="mt-4 gap-2 text-xs"
                    >
                      <UserCheck className="h-3.5 w-3.5 text-primary" />
                      Browse Counsellors
                    </Button>
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div 
                      key={session._id} 
                      className={`p-4 rounded-xl border transition-all ${
                        session.status === 'confirmed' 
                          ? 'bg-emerald-50/70 border-emerald-200' 
                          : session.status === 'completed'
                          ? 'bg-gray-50 border-gray-200'
                          : session.status === 'cancelled'
                          ? 'bg-rose-50/60 border-rose-200'
                          : 'bg-blue-50/70 border-blue-200'
                      } hover:shadow-sm`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm text-gray-900">
                              {session.counselorName || 'Assigned Counsellor'}
                            </p>
                            <Badge variant="outline" className="text-[10px] bg-white">
                              {session.mode || 'In-Person'}
                            </Badge>
                            {session.urgency && session.urgency !== 'normal' && (
                              <Badge className="text-[10px] bg-amber-100 text-amber-800 border-amber-200 capitalize">
                                {session.urgency} Priority
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1 font-medium text-gray-700">
                              <Calendar className="h-3 w-3 text-primary" />
                              {session.date}
                            </span>
                            <span className="flex items-center gap-1 font-medium text-gray-700">
                              <Clock className="h-3 w-3 text-primary" />
                              {session.time}
                            </span>
                          </div>
                          {session.concerns && (
                            <p className="text-xs text-gray-600 italic line-clamp-1 pt-0.5">
                              "{session.concerns}"
                            </p>
                          )}
                          {session.notes && (
                            <p className="text-xs text-teal-800 bg-teal-100/50 p-2 rounded mt-1.5 border border-teal-200/50">
                              <strong>Counsellor Note:</strong> {session.notes}
                            </p>
                          )}
                        </div>
                        <Badge 
                          className={
                            session.status === 'confirmed' 
                              ? 'bg-emerald-600 text-white' 
                              : session.status === 'completed' 
                              ? 'bg-gray-600 text-white'
                              : session.status === 'cancelled'
                              ? 'bg-rose-600 text-white'
                              : 'bg-amber-500 text-white'
                          }
                        >
                          {session.status === 'pending' ? 'Pending Approval' : session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Real Session Status & Progress Overview */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Session Status & Journey
              </CardTitle>
              <CardDescription>
                Live overview of your appointment statuses and counseling engagement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Real Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white/70 rounded-xl border border-border/50 text-center">
                  <div className="text-2xl font-bold text-foreground">{sessions.length}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Total Booked</div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                  <div className="text-2xl font-bold text-emerald-700">
                    {sessions.filter(s => s.status === 'confirmed').length}
                  </div>
                  <div className="text-xs text-emerald-800 mt-0.5">Confirmed</div>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
                  <div className="text-2xl font-bold text-amber-700">
                    {sessions.filter(s => s.status === 'pending').length}
                  </div>
                  <div className="text-xs text-amber-800 mt-0.5">Pending</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center">
                  <div className="text-2xl font-bold text-blue-700">
                    {sessions.filter(s => s.status === 'completed').length}
                  </div>
                  <div className="text-xs text-blue-800 mt-0.5">Completed</div>
                </div>
              </div>

              {/* Real Session Completion Progress Bar */}
              <div className="p-4 bg-white/80 rounded-xl border border-border/60 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground">Session Completion Rate</span>
                  <span className="text-muted-foreground font-medium">
                    {sessions.length > 0 
                      ? `${Math.round((sessions.filter(s => s.status === 'completed').length / sessions.length) * 100)}%`
                      : '0% (No completed sessions)'}
                  </span>
                </div>
                <Progress 
                  value={sessions.length > 0 
                    ? Math.round((sessions.filter(s => s.status === 'completed').length / sessions.length) * 100)
                    : 0
                  } 
                  className="h-2.5 bg-muted" 
                />
                <p className="text-[11px] text-muted-foreground">
                  {sessions.filter(s => s.status === 'completed').length} of {sessions.length} sessions completed with counselors.
                </p>
              </div>

              {/* Status Notice / Next Steps */}
              <div className="p-4 rounded-xl border bg-muted/30 space-y-2">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-primary" />
                  Counseling Guideline
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Appointments are confirmed by the assigned counselor. For urgent crises, please call <strong>+91 9152987821</strong> or use the 24/7 emergency hotline below.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Real Progress & Assessment Status Section */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <EmergencyResources />
          </div>
          
          <div className="md:col-span-2">
            <Card className="bg-gradient-card shadow-card h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Trophy className="h-5 w-5 text-primary" />
                      Wellness Progress & Status Tracker
                    </CardTitle>
                    <CardDescription>
                      Real status indicators driven by your confidential assessments and counseling activity
                    </CardDescription>
                  </div>
                  {assessmentResult && (
                    <Badge 
                      className={`text-xs ${
                        assessmentResult.riskLevel === 'Low'
                          ? 'bg-emerald-600 text-white'
                          : assessmentResult.riskLevel === 'Moderate'
                          ? 'bg-amber-500 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {assessmentResult.riskLevel} Risk Profile
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Real Assessment Progress Bars */}
                  <div className="p-5 bg-white/80 rounded-xl border border-border/60 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                          <Brain className="h-4 w-4 text-primary" />
                          Confidential Assessment Scores
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {assessmentResult 
                            ? `Last evaluated on ${assessmentResult.dateTaken}`
                            : 'No assessment completed yet'}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAssessment(true)}
                        className="text-xs gap-1.5 h-8"
                      >
                        {assessmentResult ? <RefreshCw className="h-3.5 w-3.5 text-primary" /> : <Activity className="h-3.5 w-3.5 text-primary" />}
                        {assessmentResult ? 'Retake Test' : 'Take Test (5 min)'}
                      </Button>
                    </div>

                    {assessmentResult ? (
                      <div className="space-y-3 pt-1">
                        {/* Academic Stress */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-medium text-gray-700">Academic Stress</span>
                            <span className="text-muted-foreground font-semibold">{assessmentResult.academicStress} / 10</span>
                          </div>
                          <Progress value={assessmentResult.academicStress * 10} className="h-2 bg-blue-100" />
                        </div>

                        {/* Mood & Motivation */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-medium text-gray-700">Mood & Motivation</span>
                            <span className="text-muted-foreground font-semibold">{assessmentResult.moodMotivation} / 10</span>
                          </div>
                          <Progress value={assessmentResult.moodMotivation * 10} className="h-2 bg-emerald-100" />
                        </div>

                        {/* Safety & Emotional Balance */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-medium text-gray-700">Safety & Coping Level</span>
                            <span className="text-muted-foreground font-semibold">{assessmentResult.suicidalRisk} / 10</span>
                          </div>
                          <Progress value={assessmentResult.suicidalRisk * 10} className="h-2 bg-purple-100" />
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 text-center space-y-2">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>Assessment Status</span>
                            <span>0% Complete</span>
                          </div>
                          <Progress value={0} className="h-2 bg-muted" />
                        </div>
                        <p className="text-xs text-muted-foreground pt-1">
                          Complete the confidential assessment above to unlock your real stress and mood progress scores.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Real Session Status & Activity Charts */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Session Status Pie Chart */}
                    <div className="p-4 bg-white/70 rounded-xl border border-border/50">
                      <h4 className="font-semibold text-xs text-foreground mb-2 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        Appointments Status Breakdown
                      </h4>
                      {sessions.length > 0 ? (
                        <div className="h-44">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Confirmed', value: sessions.filter(s => s.status === 'confirmed').length, color: '#10b981' },
                                  { name: 'Pending', value: sessions.filter(s => s.status === 'pending').length, color: '#f59e0b' },
                                  { name: 'Completed', value: sessions.filter(s => s.status === 'completed').length, color: '#3b82f6' },
                                  { name: 'Cancelled', value: sessions.filter(s => s.status === 'cancelled').length, color: '#ef4444' },
                                ].filter(item => item.value > 0)}
                                cx="50%"
                                cy="50%"
                                innerRadius={35}
                                outerRadius={65}
                                paddingAngle={4}
                                dataKey="value"
                              >
                                {[
                                  { name: 'Confirmed', value: sessions.filter(s => s.status === 'confirmed').length, color: '#10b981' },
                                  { name: 'Pending', value: sessions.filter(s => s.status === 'pending').length, color: '#f59e0b' },
                                  { name: 'Completed', value: sessions.filter(s => s.status === 'completed').length, color: '#3b82f6' },
                                  { name: 'Cancelled', value: sessions.filter(s => s.status === 'cancelled').length, color: '#ef4444' },
                                ].filter(item => item.value > 0).map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip 
                                formatter={(val) => [`${val} session(s)`, 'Count']}
                                contentStyle={{ 
                                  backgroundColor: 'hsl(var(--card))', 
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px'
                                }} 
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-44 flex flex-col items-center justify-center text-xs text-muted-foreground">
                          <Calendar className="h-6 w-6 opacity-30 mb-1" />
                          <span>No session status data to display</span>
                        </div>
                      )}
                      <div className="flex justify-center flex-wrap gap-3 text-[11px] mt-1">
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                          Confirmed ({sessions.filter(s => s.status === 'confirmed').length})
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                          Pending ({sessions.filter(s => s.status === 'pending').length})
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                          Completed ({sessions.filter(s => s.status === 'completed').length})
                        </span>
                      </div>
                    </div>

                    {/* Real Student Activity Bar Chart */}
                    <div className="p-4 bg-white/70 rounded-xl border border-border/50">
                      <h4 className="font-semibold text-xs text-foreground mb-2 flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5 text-primary" />
                        Activity Summary
                      </h4>
                      <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { activity: 'Booked', count: sessions.length },
                            { activity: 'Confirmed', count: sessions.filter(s => s.status === 'confirmed').length },
                            { activity: 'Completed', count: sessions.filter(s => s.status === 'completed').length },
                            { activity: 'Assessments', count: assessmentResult ? 1 : 0 },
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                            <XAxis dataKey="activity" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                            <YAxis stroke="hsl(var(--muted-foreground))" allowDecimals={false} tick={{ fontSize: 11 }} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))', 
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }} 
                            />
                            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  
                  {/* Real Verified Account Milestones */}
                  <div>
                    <h4 className="font-semibold text-xs text-foreground mb-2.5">Verified Milestones</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1 text-xs py-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Verified Student Account
                      </Badge>
                      <Badge 
                        variant={assessmentResult ? "secondary" : "outline"} 
                        className={`flex items-center gap-1 text-xs py-1 ${assessmentResult ? 'text-emerald-800 bg-emerald-50 border-emerald-200' : 'opacity-60'}`}
                      >
                        <Brain className="w-3.5 h-3.5 text-blue-600" />
                        {assessmentResult ? 'Assessment Completed' : 'Assessment Pending'}
                      </Badge>
                      <Badge 
                        variant={sessions.length > 0 ? "secondary" : "outline"} 
                        className={`flex items-center gap-1 text-xs py-1 ${sessions.length > 0 ? 'text-primary bg-primary/10' : 'opacity-60'}`}
                      >
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {sessions.length > 0 ? `${sessions.length} Session(s) Registered` : 'No Bookings Yet'}
                      </Badge>
                      {sessions.some(s => s.status === 'completed') && (
                        <Badge variant="secondary" className="flex items-center gap-1 text-xs py-1 text-purple-800 bg-purple-50 border-purple-200">
                          <Trophy className="w-3.5 h-3.5 text-purple-600" />
                          Session Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      
      {/* Counsellor Booking Modal with Real Calendar & Slot Availability */}
      <CounsellorBookingModal
        open={showBookingModal}
        onOpenChange={setShowBookingModal}
        selectedCounsellor={selectedCounsellorForBooking}
        counsellorsList={counsellors}
        onBookingSuccess={() => {
          fetchSessions();
        }}
      />
      
      <AssessmentModal 
        open={showAssessment}
        onOpenChange={setShowAssessment}
        onComplete={(result) => {
          const dataToSave = {
            ...result,
            dateTaken: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          };
          const key = `uniheal_assessment_${currentUser?.id || currentUser?._id || 'guest'}`;
          localStorage.setItem(key, JSON.stringify(dataToSave));
          setAssessmentResult(dataToSave);
        }}
      />
    </div>
  );
};

export default StudentPortal;