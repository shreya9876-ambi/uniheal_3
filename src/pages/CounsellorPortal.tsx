import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Leaf, Heart, UserCheck, Mail, Lock, Calendar, Clock, Users, AlertTriangle, CheckCircle, ArrowLeft, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api, getStoredUser, clearStoredAuth, UserProfile, AppointmentItem } from "@/lib/api";

const CounsellorPortal = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const u = getStoredUser();
    return !!(u && u.role === 'counsellor');
  });
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getStoredUser());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Mock session data (replaced by real data when backend is connected)
  const [sessions] = useState([
    { id: 1, studentId: "ST001", studentName: "John Doe", date: "2024-01-16", time: "10:00 AM", status: "pending", urgency: "high", concerns: "Anxiety and stress about exams" },
    { id: 2, studentId: "ST002", studentName: "Jane Smith", date: "2024-01-16", time: "2:00 PM", status: "pending", urgency: "moderate", concerns: "Feeling overwhelmed with coursework" },
    { id: 3, studentId: "ST003", studentName: "Mike Johnson", date: "2024-01-15", time: "11:00 AM", status: "completed", urgency: "low", concerns: "General wellbeing check" },
    { id: 4, studentId: "ST004", studentName: "Sarah Wilson", date: "2024-01-17", time: "3:00 PM", status: "pending", urgency: "critical", concerns: "Depression symptoms, urgent support needed" },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const res = await api.login({
        email,
        password,
        role: 'counsellor',
      });
      if (res.user.role !== 'counsellor') {
        throw new Error('This account does not have counselor privileges.');
      }
      setCurrentUser(res.user);
      setIsLoggedIn(true);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = () => {
    clearStoredAuth();
    setCurrentUser(null);
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoggedIn) {
    const pendingSessions = sessions.filter(session => session.status === 'pending');
    const completedSessions = sessions.filter(session => session.status === 'completed');
    const criticalSessions = sessions.filter(session => session.urgency === 'critical');

    return (
      <div className="min-h-screen bg-gradient-soft">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Leaf className="h-8 w-8 text-primary" />
                  <Heart className="h-4 w-4 text-primary absolute -top-1 -right-1" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-primary">UniHeal Counsellor Portal</h1>
                  <p className="text-sm text-muted-foreground">Welcome back, {name || email}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Statistics Cards */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="bg-gradient-card shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Sessions</p>
                    <p className="text-3xl font-bold text-primary">{pendingSessions.length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                    <p className="text-3xl font-bold text-green-600">{completedSessions.length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Critical Cases</p>
                    <p className="text-3xl font-bold text-red-600">{criticalSessions.length}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                    <p className="text-3xl font-bold text-blue-600">{sessions.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Critical Sessions Alert */}
          {criticalSessions.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Critical Priority Sessions
                </CardTitle>
                <CardDescription className="text-red-700">
                  These sessions require immediate attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {criticalSessions.map((session) => (
                    <div key={session.id} className="bg-white p-4 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{session.studentName} ({session.studentId})</h4>
                          <p className="text-sm text-muted-foreground">{session.concerns}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{session.date} at {session.time}</p>
                          <Button size="sm" className="mt-2">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sessions Management */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Pending Sessions */}
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending Sessions ({pendingSessions.length})
                </CardTitle>
                <CardDescription>
                  Upcoming sessions requiring your attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingSessions.map((session) => (
                    <div key={session.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{session.studentName}</h4>
                            <Badge className={`text-xs ${getUrgencyColor(session.urgency)}`}>
                              {session.urgency}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{session.concerns}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>📅 {session.date}</span>
                            <span>🕐 {session.time}</span>
                            <span>ID: {session.studentId}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Start Session
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Completed Sessions */}
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Recent Completed Sessions
                </CardTitle>
                <CardDescription>
                  Sessions completed today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completedSessions.map((session) => (
                    <div key={session.id} className="p-4 border rounded-lg bg-green-50/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{session.studentName}</h4>
                            <Badge className={`text-xs ${getStatusColor(session.status)}`}>
                              {session.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{session.concerns}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>📅 {session.date}</span>
                            <span>🕐 {session.time}</span>
                            <span>ID: {session.studentId}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          View Notes
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>

        <Card className="shadow-hover border-border/40">
          <CardHeader className="text-center pb-4">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <UserCheck className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Counsellor Sign In</CardTitle>
            <CardDescription>
              Access your UniHeal counselor dashboard and manage student sessions
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="counsellor@university.edu"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                <p className="font-semibold text-foreground mb-1 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  Admin-Issued Credentials
                </p>
                <p>Counselor accounts are issued by the University Administrator. Contact your admin if you need access.</p>
              </div>

              <Button type="submit" className="w-full gap-2 mt-2" disabled={isLoggingIn}>
                {isLoggingIn ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
                {isLoggingIn ? "Signing in..." : "Sign In to Portal"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
};

export default CounsellorPortal;