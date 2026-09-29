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
                Assessment Test
              </Button>
              <Button
                variant="ghost"
                onClick={() => scrollToSection('counsellors-section')}
                size="sm"
                className="gap-2 font-medium text-primary hover:bg-primary/10"
              >
                <UserCheck className="h-4 w-4 text-primary" />
                Book Counsellor
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
              <Button
                variant="ghost"
                onClick={() => scrollToSection('emergency-section')}
                size="sm"
                className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 font-medium"
              >
                <Shield className="h-4 w-4" />
                Emergency
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
      {/* ═══════════════ CHAT SECTION ═══════════════ */}
        <section id="chat-section" className="animate-fade-in">
          <ChatBot />
        </section>

        <hr className="section-divider" />

        {/* ═══════════════ ASSESSMENT SECTION ═══════════════ */}
        <section id="assessment-section" className="animate-slide-up">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 animate-breathe">
              <Sparkles className="h-3.5 w-3.5" />
              Confidential Self-Assessment
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-3">
              Mental Health Check-In
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm">
              Take a quick, private assessment to understand your emotional well-being and receive tailored recommendations
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="premium-card glass-card gradient-border rounded-2xl animate-fade-in">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/15 to-cyan-500/15 flex items-center justify-center mb-2">
                  <Brain className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle className="text-base">Anxiety Assessment</CardTitle>
                <CardDescription className="text-xs">
                  Evaluate your anxiety levels, triggers, and coping patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowAssessment(true)}
                  className="w-full gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-md"
                >
                  <Activity className="h-4 w-4" />
                  Start Test · 5 min
                </Button>
              </CardContent>
            </Card>

            <Card className="premium-card glass-card gradient-border rounded-2xl animate-fade-in delay-100">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 flex items-center justify-center mb-2">
                  <Heart className="h-6 w-6 text-emerald-500" />
                </div>
                <CardTitle className="text-base">Depression Screening</CardTitle>
                <CardDescription className="text-xs">
                  Check your mood patterns, motivation, and emotional balance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowAssessment(true)}
                  className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0 shadow-md"
                >
                  <Activity className="h-4 w-4" />
                  Start Test · 7 min
                </Button>
              </CardContent>
            </Card>

            <Card className="premium-card glass-card gradient-border rounded-2xl animate-fade-in delay-200">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/15 to-violet-500/15 flex items-center justify-center mb-2">
                  <Shield className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle className="text-base">Stress Evaluation</CardTitle>
                <CardDescription className="text-xs">
                  Assess academic and personal stress patterns and resilience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowAssessment(true)}
                  className="w-full gap-2 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white border-0 shadow-md"
                >
                  <Activity className="h-4 w-4" />
                  Start Test · 4 min
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <hr className="section-divider" />

        {/* ═══════════════ COUNSELLORS DIRECTORY ═══════════════ */}
        <CounsellorsDirectory
          counsellors={counsellors}
          loading={loadingCounsellors}
          onBookWithCounsellor={handleBookWithCounsellor}
          onRefresh={fetchCounsellors}
        />

        <hr className="section-divider" />

        {/* ═══════════════ COMBINED: MY SESSIONS + WELLNESS PROGRESS ═══════════════ */}
        <section id="calendar-section" className="space-y-4 animate-slide-up">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-1">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
                <Trophy className="h-3.5 w-3.5" />
                Sessions & Progress
              </div>
              <h2 className="text-2xl font-bold gradient-text">
                Sessions & Wellness Overview
              </h2>
            </div>
            {/* Compact session pill counts */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground font-medium">
                Total: <strong className="text-foreground">{sessions.length}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium">
                Confirmed: <strong>{sessions.filter(s => s.status === 'confirmed').length}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 font-medium">
                Pending: <strong>{sessions.filter(s => s.status === 'pending').length}</strong>
              </span>
            </div>
          </div>

          {/* Compact 2-Column Grid */}
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Left: Sessions List (2/3 width) */}
            <Card className="lg:col-span-2 glass-card rounded-2xl premium-card">
              <CardHeader className="py-3.5 px-5 border-b border-border/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">Booked Sessions</CardTitle>
                      <CardDescription className="text-xs">Upcoming and past counseling appointments</CardDescription>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => scrollToSection('counsellors-section')}
                    className="text-xs h-8 gap-1.5 rounded-full hover:bg-primary/5 hover:text-primary"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Book Session
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                  {loadingSessions ? (
                    <div className="py-10 text-center text-muted-foreground flex flex-col items-center gap-2">
                      <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-xs">Loading sessions...</span>
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="py-8 text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">No Sessions Booked</p>
                      <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
                        Book your first counseling session with our certified professionals above.
                      </p>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => scrollToSection('counsellors-section')}
                        className="mt-3 gap-1.5 text-xs rounded-full h-8"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        Browse Counsellors
                      </Button>
                    </div>
                  ) : (
                    sessions.map((session) => (
                      <div 
                        key={session._id} 
                        className={`p-3.5 rounded-xl border transition-all ${
                          session.status === 'confirmed' 
                            ? 'bg-emerald-50/60 border-emerald-200/70' 
                            : session.status === 'completed'
                            ? 'bg-muted/40 border-border/60'
                            : session.status === 'cancelled'
                            ? 'bg-rose-50/60 border-rose-200/70'
                            : 'bg-amber-50/60 border-amber-200/70'
                        } hover:shadow-xs`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-sm text-foreground truncate">
                                {session.counselorName || 'Assigned Counsellor'}
                              </p>
                              <Badge variant="outline" className="text-[10px] bg-background/80 py-0">
                                {session.mode || 'In-Person'}
                              </Badge>
                              {session.urgency && session.urgency !== 'normal' && (
                                <Badge className="text-[10px] bg-amber-100 text-amber-800 border-amber-200 capitalize py-0">
                                  {session.urgency}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1 font-medium text-foreground/80">
                                <Calendar className="h-3 w-3 text-primary" />
                                {session.date}
                              </span>
                              <span className="flex items-center gap-1 font-medium text-foreground/80">
                                <Clock className="h-3 w-3 text-primary" />
                                {session.time}
                              </span>
                            </div>
                            {session.concerns && (
                              <p className="text-xs text-muted-foreground italic truncate pt-0.5">
                                "{session.concerns}"
                              </p>
                            )}
                            {session.notes && (
                              <p className="text-xs text-teal-800 bg-teal-50 p-2 rounded mt-1 border border-teal-200/60">
                                <strong>Note:</strong> {session.notes}
                              </p>
                            )}
                          </div>
                          <Badge 
                            className={`text-[10px] shrink-0 ${
                              session.status === 'confirmed' 
                                ? 'bg-emerald-600 text-white' 
                                : session.status === 'completed' 
                                ? 'bg-gray-600 text-white'
                                : session.status === 'cancelled'
                                ? 'bg-rose-600 text-white'
                                : 'bg-amber-500 text-white'
                            }`}
                          >
                            {session.status === 'pending' ? 'Pending' : session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Right: Wellness Progress & Assessment (1/3 width) */}
            <div className="space-y-4">
              {/* Assessment Summary Card */}
              <Card className="glass-card rounded-2xl premium-card">
                <CardHeader className="py-3.5 px-5 border-b border-border/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                        <Brain className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold">Assessment</CardTitle>
                        <CardDescription className="text-xs">Confidential mental health check</CardDescription>
                      </div>
                    </div>
                    {assessmentResult && (
                      <Badge 
                        className={`text-[10px] ${
                          assessmentResult.riskLevel === 'Low'
                            ? 'bg-emerald-600 text-white'
                            : assessmentResult.riskLevel === 'Moderate'
                            ? 'bg-amber-500 text-white'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        {assessmentResult.riskLevel} Risk
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {assessmentResult ? (
                    <div className="space-y-2.5">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Academic Stress</span>
                          <span className="font-semibold text-foreground">{assessmentResult.academicStress}/10</span>
                        </div>
                        <Progress value={assessmentResult.academicStress * 10} className="h-1.5 bg-blue-100" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Mood & Motivation</span>
                          <span className="font-semibold text-foreground">{assessmentResult.moodMotivation}/10</span>
                        </div>
                        <Progress value={assessmentResult.moodMotivation * 10} className="h-1.5 bg-emerald-100" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Safety & Coping</span>
                          <span className="font-semibold text-foreground">{assessmentResult.suicidalRisk}/10</span>
                        </div>
                        <Progress value={assessmentResult.suicidalRisk * 10} className="h-1.5 bg-purple-100" />
                      </div>
                      <div className="pt-2 flex items-center justify-between border-t border-border/40 text-[11px] text-muted-foreground">
                        <span>Taken {assessmentResult.dateTaken}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAssessment(true)}
                          className="h-6 px-2 text-[11px] text-primary hover:text-primary"
                        >
                          Retake
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Take a 2-minute confidential assessment to unlock personalized insights.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAssessment(true)}
                        className="text-xs gap-1.5 h-8 rounded-full"
                      >
                        <Activity className="h-3.5 w-3.5 text-primary" />
                        Take Assessment
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Attendance / Session Progress */}
              <Card className="glass-card rounded-2xl premium-card">
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                        <Target className="h-3.5 w-3.5" />
                      </div>
                      <span className="font-semibold text-xs text-foreground">Session Completion</span>
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      {sessions.length > 0 
                        ? `${Math.round((sessions.filter(s => s.status === 'completed').length / sessions.length) * 100)}%`
                        : '0%'}
                    </span>
                  </div>
                  <Progress 
                    value={sessions.length > 0 
                      ? Math.round((sessions.filter(s => s.status === 'completed').length / sessions.length) * 100)
                      : 0
                    } 
                    className="h-2 bg-muted" 
                  />
                  <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                    <span>{sessions.filter(s => s.status === 'completed').length} completed</span>
                    <span>{sessions.filter(s => s.status === 'confirmed').length} upcoming</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <hr className="section-divider" />

        {/* ═══════════════ HEALING RESOURCES ═══════════════ */}
        <section id="resources-section" className="animate-slide-up">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <Heart className="h-3.5 w-3.5" />
              Self-Care Toolkit
            </div>
            <h2 className="text-3xl font-bold gradient-text mb-3">
              Healing Resources
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm">
              Instant relief tools, guided exercises, and emotional wellness strategies
            </p>
          </div>
          <QuickResources />
        </section>

        <hr className="section-divider" />

        {/* ═══════════════ EMERGENCY (ABSOLUTE LAST) ═══════════════ */}
        <section id="emergency-section" className="space-y-5 pb-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-destructive/10 text-destructive text-xs font-semibold mb-4 pulse-glow">
              <AlertTriangle className="h-3.5 w-3.5" />
              Crisis Support Available 24/7
            </div>
            <h2 className="text-2xl font-bold text-destructive mb-2">
              Emergency & Crisis Contacts
            </h2>
            <p className="text-muted-foreground text-xs max-w-xl mx-auto">
              If you or someone you know is in immediate danger, please reach out to these verified resources immediately.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <EmergencyResources />
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