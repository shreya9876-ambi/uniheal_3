import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogIn, Leaf, Headphones, Shield, Brain, Heart, Activity, Calendar, Clock, CheckCircle, Plus, Trophy, Target, Award, Zap, Star, Crown, Sparkles } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import sproutCharacter from "@/assets/sprout-character.png";
import ChatBot from "@/components/ChatBot";
import EmergencyResources from "@/components/EmergencyResources";
import QuickResources from "@/components/QuickResources";
import { Progress } from "@/components/ui/progress";
import AssessmentModal from "@/components/AssessmentModal";

const StudentPortal = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [credentials, setCredentials] = useState({ studentId: "", password: "" });
  const [signUpData, setSignUpData] = useState({ 
    studentId: "", 
    email: "", 
    password: "", 
    confirmPassword: "", 
    fullName: "",
    phoneNumber: ""
  });
  const [showAssessment, setShowAssessment] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookingDetails, setBookingDetails] = useState({
    name: "",
    email: "",
    phone: "",
    concerns: "",
    urgency: "normal"
  });
  const [sessions, setSessions] = useState([
    { id: 1, date: "2024-01-15", time: "10:00 AM", status: "pending", counselor: "Dr. Smith" },
    { id: 2, date: "2024-01-08", time: "02:00 PM", status: "completed", counselor: "Dr. Johnson" },
  ]);

  // Check for session persistence on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('uniheal-session');
    if (savedSession) {
      const { studentId, timestamp } = JSON.parse(savedSession);
      // Session valid for 24 hours
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        setCredentials({ studentId, password: "****" });
        setIsLoggedIn(true);
      } else {
        localStorage.removeItem('uniheal-session');
      }
    }
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock authentication - in real app, validate against backend
    if (credentials.studentId && credentials.password) {
      setIsLoggedIn(true);
      // Save session for persistence
      localStorage.setItem('uniheal-session', JSON.stringify({
        studentId: credentials.studentId,
        timestamp: Date.now()
      }));
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation
    if (signUpData.password !== signUpData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    if (signUpData.studentId && signUpData.email && signUpData.password && signUpData.fullName) {
      // Mock sign up - in real app, create account in backend
      setCredentials({ studentId: signUpData.studentId, password: signUpData.password });
      setIsLoggedIn(true);
      // Save session for persistence
      localStorage.setItem('uniheal-session', JSON.stringify({
        studentId: signUpData.studentId,
        timestamp: Date.now()
      }));
    }
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('uniheal-session');
    setCredentials({ studentId: "", password: "" });
  };

  // Helper functions
  const getQuickDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 6; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      if (date.getDay() !== 0 && date.getDay() !== 6) { // Skip weekends
        dates.push({
          value: date.toISOString().split('T')[0],
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });
      }
      
      if (dates.length === 3) break;
    }
    
    return dates;
  };

  const getQuickTimes = () => {
    return ["10:00 AM", "2:00 PM", "4:00 PM", "6:00 PM"];
  };

  const handleQuickBooking = () => {
    const newSession = {
      id: sessions.length + 1,
      date: selectedDate,
      time: selectedTime,
      status: "pending" as const,
      counselor: "Dr. Wilson"
    };
    
    setSessions([...sessions, newSession]);
    setShowBookingModal(false);
    setSelectedDate("");
    setSelectedTime("");
    
    // Show success message or navigate
    alert("Session booked successfully!");
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
                  {isSignUp ? "Create your account to get started" : "Sign in to access your personal mental health dashboard"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isSignUp ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="studentId">Student ID</Label>
                      <Input
                        id="studentId"
                        type="text"
                        placeholder="Enter your student ID"
                        value={credentials.studentId}
                        onChange={(e) => setCredentials(prev => ({ ...prev, studentId: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={credentials.password}
                        onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full gap-2">
                      <LogIn className="h-4 w-4" />
                      Sign In Securely
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={signUpData.fullName}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, fullName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="studentIdSignUp">Student ID</Label>
                      <Input
                        id="studentIdSignUp"
                        type="text"
                        placeholder="Enter your student ID"
                        value={signUpData.studentId}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, studentId: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your university email"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={signUpData.phoneNumber}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passwordSignUp">Password</Label>
                      <Input
                        id="passwordSignUp"
                        type="password"
                        placeholder="Create a secure password"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={signUpData.confirmPassword}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full gap-2">
                      <Shield className="h-4 w-4" />
                      Create Account
                    </Button>
                  </form>
                )}

                <div className="mt-6 text-center space-y-2">
                  <Button 
                    variant="link" 
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-primary p-0 h-auto"
                  >
                    {isSignUp ? "Already have an account? Sign in here" : "New student? Create account here"}
                  </Button>
                  {!isSignUp && (
                    <p className="text-sm text-muted-foreground">
                      Forgot your password?{" "}
                      <Button variant="link" className="p-0 h-auto text-primary">
                        Reset here
                      </Button>
                    </p>
                  )}
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Secure & Confidential
                  </Badge>
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
                <p className="text-xs text-muted-foreground">Student #{credentials.studentId}</p>
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
                onClick={() => scrollToSection('calendar-section')}
                size="sm"
                className="gap-2"
              >
                <Activity className="h-4 w-4" />
                Calendar
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowBookingModal(true)}
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Quick Book
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

        {/* My Sessions & Quick Actions Section */}
        <section id="calendar-section" className="grid lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                My Sessions
              </CardTitle>
              <CardDescription>
                Track your upcoming and past counseling sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div 
                    key={session.id} 
                    className={`p-4 rounded-lg border ${
                      session.status === 'pending' 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-green-50 border-green-200'
                    } hover-scale animate-fade-in`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {new Date(session.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">{session.time} - {session.counselor}</p>
                      </div>
                      <Badge 
                        variant={session.status === 'pending' ? 'secondary' : 'default'}
                        className={session.status === 'completed' ? 'bg-green-500' : ''}
                      >
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                <div className="text-center pt-4">
                  <Button 
                    onClick={() => setShowBookingModal(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Book New Session
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Character Growth & Achievement Badges */}
          <Card className="bg-gradient-card shadow-card overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                Growing Your Sprout
              </CardTitle>
              <CardDescription>
                Build your mental wellness character through daily actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Character Level Progress */}
                <div className="text-center relative">
                  <div className="relative inline-block">
                    <img 
                      src={sproutCharacter} 
                      alt="Your growing sprout character" 
                      className="w-20 h-20 mx-auto mb-2 rounded-full bg-gradient-to-br from-green-100 to-green-200 p-2"
                    />
                    <Badge className="absolute -top-1 -right-1 bg-yellow-500 text-white px-2 py-1 text-xs">
                      <Crown className="w-3 h-3 mr-1" />
                      Lvl 4
                    </Badge>
                  </div>
                  <div className="mb-2">
                    <span className="text-sm font-medium">Mental Health Journey</span>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">60 / 100 XP</span>
                    </div>
                  </div>
                  <Progress value={60} className="h-3 bg-green-100" />
                </div>

                {/* Achievement Widgets Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Journaling Streak */}
                  <div 
                    className="bg-gradient-to-br from-purple-400 to-purple-600 p-4 rounded-xl text-white hover-scale cursor-pointer relative overflow-hidden"
                    onClick={() => scrollToSection('resources-section')}
                  >
                    <div className="absolute top-2 right-2">
                      <Zap className="h-4 w-4 text-yellow-300" />
                    </div>
                    <div className="text-lg font-bold">7 days</div>
                    <div className="text-xs opacity-90">Journaling</div>
                    <div className="text-xs opacity-75 mt-1">Don't stop!</div>
                    <Badge className="absolute bottom-2 right-2 bg-white/20 text-white text-xs px-2">
                      <Trophy className="w-3 h-3 mr-1" />
                      Streak
                    </Badge>
                  </div>

                  {/* Meditation Master */}
                  <div 
                    className="bg-gradient-to-br from-blue-400 to-blue-600 p-4 rounded-xl text-white hover-scale cursor-pointer relative overflow-hidden"
                    onClick={() => setShowBookingModal(true)}
                  >
                    <div className="absolute top-2 right-2">
                      <Star className="h-4 w-4 text-yellow-300" />
                    </div>
                    <div className="text-lg font-bold">5 days</div>
                    <div className="text-xs opacity-90">Meditation</div>
                    <div className="text-xs opacity-75 mt-1">Mindful warrior</div>
                    <Badge className="absolute bottom-2 right-2 bg-white/20 text-white text-xs px-2">
                      <Heart className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>

                  {/* Session Champion */}
                  <div 
                    className="bg-gradient-to-br from-green-400 to-green-600 p-4 rounded-xl text-white hover-scale cursor-pointer relative overflow-hidden"
                    onClick={() => setShowAssessment(true)}
                  >
                    <div className="absolute top-2 right-2">
                      <Crown className="h-4 w-4 text-yellow-300" />
                    </div>
                    <div className="text-lg font-bold">3 sessions</div>
                    <div className="text-xs opacity-90">Attended</div>
                    <div className="text-xs opacity-75 mt-1">Champion</div>
                    <Badge className="absolute bottom-2 right-2 bg-white/20 text-white text-xs px-2">
                      <Calendar className="w-3 h-3 mr-1" />
                      Booked
                    </Badge>
                  </div>

                  {/* Wellness Explorer */}
                  <div 
                    className="bg-gradient-to-br from-orange-400 to-orange-600 p-4 rounded-xl text-white hover-scale cursor-pointer relative overflow-hidden"
                    onClick={() => scrollToSection('chat-section')}
                  >
                    <div className="absolute top-2 right-2">
                      <Sparkles className="h-4 w-4 text-yellow-300" />
                    </div>
                    <div className="text-lg font-bold">Explorer</div>
                    <div className="text-xs opacity-90">Wellness</div>
                    <div className="text-xs opacity-75 mt-1">Keep going!</div>
                    <Badge className="absolute bottom-2 right-2 bg-white/20 text-white text-xs px-2">
                      <Headphones className="w-3 h-3 mr-1" />
                      Chat
                    </Badge>
                  </div>
                </div>
                
                {/* Crisis Support */}
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-center">
                  <Shield className="h-6 w-6 text-red-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-red-800 mb-1">Crisis Support Available</p>
                  <p className="text-xs text-red-600">24/7 emergency mental health assistance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Progress & Achievements Section */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <EmergencyResources />
          </div>
          
          <div className="md:col-span-2">
            <Card className="bg-gradient-card shadow-card h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Progress & Achievements
                </CardTitle>
                <CardDescription>
                  Visual progress on mental health assessments with interactive charts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Mental Health Progress Charts */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Weekly Progress Line Chart */}
                    <div>
                      <h4 className="font-medium mb-3">Weekly Wellness Score</h4>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={[
                            { day: 'Mon', score: 65 },
                            { day: 'Tue', score: 72 },
                            { day: 'Wed', score: 68 },
                            { day: 'Thu', score: 78 },
                            { day: 'Fri', score: 85 },
                            { day: 'Sat', score: 82 },
                            { day: 'Sun', score: 88 }
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                            <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                            <YAxis stroke="hsl(var(--muted-foreground))" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))', 
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }} 
                            />
                            <Line 
                              type="monotone" 
                              dataKey="score" 
                              stroke="hsl(var(--primary))" 
                              strokeWidth={3}
                              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Assessment Progress Pie Chart */}
                    <div>
                      <h4 className="font-medium mb-3">Assessment Coverage</h4>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Anxiety', value: 85, color: '#3b82f6' },
                                { name: 'Depression', value: 70, color: '#10b981' },
                                { name: 'Stress', value: 92, color: '#8b5cf6' }
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              <Cell fill="#3b82f6" />
                              <Cell fill="#10b981" />
                              <Cell fill="#8b5cf6" />
                            </Pie>
                            <Tooltip 
                              formatter={(value) => [`${value}%`, 'Progress']}
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))', 
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }} 
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-center gap-4 text-xs mt-2">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span>Anxiety (85%)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Depression (70%)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span>Stress (92%)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activity Stats Bar Chart */}
                  <div>
                    <h4 className="font-medium mb-3">Monthly Activity Overview</h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { activity: 'Sessions', count: 8 },
                          { activity: 'Assessments', count: 3 },
                          { activity: 'Journal', count: 15 },
                          { activity: 'Meditation', count: 12 },
                          { activity: 'Resources', count: 20 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                          <XAxis dataKey="activity" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
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
                  
                  {/* Achievement Badges */}
                  <div>
                    <h4 className="font-medium mb-3">Recent Achievements</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        7-day journal streak
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        Wellness milestone
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Session regular
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        Meditation master
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Self-care champion
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Level 4 achieved
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      
      {/* Quick Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Quick Book Session
            </DialogTitle>
            <DialogDescription>
              Schedule your counseling session quickly and easily
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Quick Date Selection */}
            <div>
              <Label className="text-base font-medium mb-3 block">Available This Week</Label>
              <div className="grid grid-cols-3 gap-3">
                {getQuickDates().map((date) => (
                  <Button
                    key={date.value}
                    variant={selectedDate === date.value ? "default" : "outline"}
                    onClick={() => setSelectedDate(date.value)}
                    className="h-auto p-3 flex flex-col"
                  >
                    <span className="text-xs font-medium">{date.day}</span>
                    <span className="text-sm">{date.date}</span>
                  </Button>
                ))}
              </div>
            </div>

            {selectedDate && (
              <div>
                <Label className="text-base font-medium mb-3 block">Available Times</Label>
                <div className="grid grid-cols-4 gap-2">
                  {getQuickTimes().map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      onClick={() => setSelectedTime(time)}
                      size="sm"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {selectedDate && selectedTime && (
              <div className="bg-primary/10 p-4 rounded-lg">
                <h4 className="font-medium text-primary mb-2">Session Confirmed</h4>
                <p className="text-sm text-primary/80">
                  {selectedDate} at {selectedTime}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowBookingModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleQuickBooking}
                disabled={!selectedDate || !selectedTime}
                className="flex-1"
              >
                Book Session
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <AssessmentModal 
        open={showAssessment}
        onOpenChange={setShowAssessment}
        onComplete={(result) => {
          console.log('Assessment completed:', result);
        }}
      />
    </div>
  );
};

export default StudentPortal;