import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Leaf, 
  Heart, 
  UserCheck, 
  Mail, 
  Lock, 
  Calendar, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  ArrowLeft, 
  LogOut, 
  RefreshCw, 
  ShieldCheck,
  Building,
  Video,
  Phone,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Settings,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api, getStoredUser, clearStoredAuth, UserProfile, AppointmentItem } from "@/lib/api";

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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

  // Active view tab
  const [activeTab, setActiveTab] = useState<"appointments" | "schedule">("appointments");

  // Real Appointments from MongoDB
  const [sessions, setSessions] = useState<AppointmentItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Note dialog for completing an appointment
  const [completingSession, setCompletingSession] = useState<AppointmentItem | null>(null);
  const [sessionNotes, setSessionNotes] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Schedule & Availability form state
  const [scheduleDays, setScheduleDays] = useState<string[]>([
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"
  ]);
  const [timeSlots, setTimeSlots] = useState<string[]>([
    "09:00 AM - 10:00 AM",
    "10:30 AM - 11:30 AM",
    "02:00 PM - 03:00 PM",
    "03:30 PM - 04:30 PM"
  ]);
  const [newSlotInput, setNewSlotInput] = useState("");
  const [officeLocation, setOfficeLocation] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState("");
  const [scheduleError, setScheduleError] = useState("");

  // Fetch appointments and initialize schedule when logged in
  useEffect(() => {
    if (isLoggedIn && currentUser) {
      fetchSessions();
      initScheduleFromUser(currentUser);
    }
  }, [isLoggedIn, currentUser]);

  const initScheduleFromUser = (user: any) => {
    if (user.availability?.days?.length) setScheduleDays(user.availability.days);
    if (user.availability?.timeSlots?.length) setTimeSlots(user.availability.timeSlots);
    if (user.officeLocation) setOfficeLocation(user.officeLocation);
    if (user.specialization) setSpecialization(user.specialization);
    if (user.bio) setBio(user.bio);
    if (user.phone) setPhone(user.phone);
  };

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await api.getAppointments();
      setSessions(res.appointments || []);
    } catch (err) {
      console.warn("Could not fetch sessions", err);
    } finally {
      setLoadingSessions(false);
    }
  };

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
      initScheduleFromUser(res.user);
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
    setSessions([]);
  };

  const handleStatusChange = async (id: string, newStatus: string, notes?: string) => {
    setIsUpdatingStatus(true);
    try {
      await api.updateAppointmentStatus(id, { status: newStatus, notes });
      setCompletingSession(null);
      setSessionNotes("");
      fetchSessions();
    } catch (err: any) {
      alert(err.message || "Failed to update appointment status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const toggleDay = (day: string) => {
    if (scheduleDays.includes(day)) {
      setScheduleDays(scheduleDays.filter((d) => d !== day));
    } else {
      setScheduleDays([...scheduleDays, day]);
    }
  };

  const handleAddSlot = () => {
    if (!newSlotInput.trim()) return;
    if (!timeSlots.includes(newSlotInput.trim())) {
      setTimeSlots([...timeSlots, newSlotInput.trim()]);
    }
    setNewSlotInput("");
  };

  const handleRemoveSlot = (slot: string) => {
    setTimeSlots(timeSlots.filter((s) => s !== slot));
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSchedule(true);
    setScheduleSuccess("");
    setScheduleError("");
    try {
      await api.updateCounsellorSchedule({
        days: scheduleDays,
        timeSlots,
        officeLocation,
        specialization,
        bio,
        phone,
      });
      setScheduleSuccess("Your working schedule and profile were saved successfully! Changes are immediately visible to students.");
      setTimeout(() => setScheduleSuccess(""), 4000);
    } catch (err: any) {
      setScheduleError(err.message || "Failed to save schedule.");
    } finally {
      setSavingSchedule(false);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return <Badge className="bg-red-500 hover:bg-red-600 text-white font-semibold">Critical Priority</Badge>;
      case 'high':
        return <Badge className="bg-orange-500 hover:bg-orange-600 text-white">High Urgency</Badge>;
      case 'moderate':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Moderate</Badge>;
      default:
        return <Badge variant="secondary" className="text-gray-600">Normal</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-emerald-600 text-white">Confirmed 🟢</Badge>;
      case 'completed':
        return <Badge className="bg-gray-600 text-white">Completed ✅</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled ❌</Badge>;
      default:
        return <Badge className="bg-amber-500 text-white">Pending Review ⏳</Badge>;
    }
  };

  if (isLoggedIn) {
    const pendingSessions = sessions.filter(session => session.status === 'pending');
    const confirmedSessions = sessions.filter(session => session.status === 'confirmed');
    const completedSessions = sessions.filter(session => session.status === 'completed');
    const criticalSessions = sessions.filter(session => session.urgency === 'critical' && session.status !== 'completed');

    return (
      <div className="min-h-screen bg-gradient-soft">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-md shadow-xs border-b sticky top-0 z-40">
          <div className="container mx-auto px-4 py-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  <UserCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900 leading-tight">UniHeal Counsellor Portal</h1>
                  <p className="text-xs text-muted-foreground">
                    Logged in as <span className="font-semibold text-primary">{currentUser?.name || currentUser?.email}</span>
                  </p>
                </div>
              </div>

              {/* View Switching & Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant={activeTab === "appointments" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("appointments")}
                  className="gap-1.5 text-xs h-9"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Student Appointments ({sessions.length})
                </Button>
                <Button
                  variant={activeTab === "schedule" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("schedule")}
                  className="gap-1.5 text-xs h-9"
                >
                  <Settings className="h-3.5 w-3.5" />
                  My Schedule & Availability
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSignOut}
                  className="gap-1.5 text-xs text-muted-foreground hover:text-red-600 h-9 ml-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Top Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white shadow-xs border-l-4 border-l-amber-500">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Pending Requests</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{pendingSessions.length}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500/20" />
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xs border-l-4 border-l-emerald-500">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Confirmed Sessions</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{confirmedSessions.length}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-emerald-500/20" />
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xs border-l-4 border-l-blue-500">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Completed</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{completedSessions.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-500/20" />
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xs border-l-4 border-l-red-500">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Critical Alerts</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{criticalSessions.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500/20" />
              </CardContent>
            </Card>
          </div>

          {/* TAB 1: Appointments Management */}
          {activeTab === "appointments" && (
            <div className="space-y-6">
              {/* Critical Alerts Banner */}
              {criticalSessions.length > 0 && (
                <Card className="border-red-300 bg-red-50/70 shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-red-900 text-base flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      Critical Priority Student Sessions ({criticalSessions.length})
                    </CardTitle>
                    <CardDescription className="text-red-700 text-xs">
                      These students have flagged high psychological distress and require prompt response.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {criticalSessions.map((session) => (
                      <div key={session._id} className="p-3 bg-white rounded-lg border border-red-200 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{session.studentName} ({session.studentEmail})</p>
                          <p className="text-xs text-red-700 font-medium">Concerns: {session.concerns || "No notes provided"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-600">{session.date} at {session.time}</span>
                          {session.status === "pending" && (
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusChange(session._id, "confirmed")}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                            >
                              Confirm
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Sessions List Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Student Appointment Requests</h3>
                  <p className="text-xs text-muted-foreground">Manage and confirm bookings scheduled through your calendar availability.</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchSessions} className="gap-1.5 text-xs">
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingSessions ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>

              {loadingSessions ? (
                <div className="p-12 text-center text-muted-foreground">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-sm">Loading appointments from database...</p>
                </div>
              ) : sessions.length === 0 ? (
                <Card className="border-dashed p-12 text-center bg-white">
                  <Calendar className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-800">No student appointments booked yet</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    When students select your profile in the Student Portal and pick a date/time from your calendar, their requests will appear here.
                  </p>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {sessions.map((session) => (
                    <Card key={session._id} className="bg-white shadow-xs border hover:shadow-sm transition-all flex flex-col justify-between">
                      <CardContent className="p-5 space-y-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-base text-gray-900">{session.studentName}</h4>
                            <p className="text-xs text-muted-foreground">{session.studentEmail} {session.studentId ? `• ID: ${session.studentId}` : ""}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {getStatusBadge(session.status)}
                            {getUrgencyBadge(session.urgency)}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border">
                          <div className="flex items-center gap-1.5 text-gray-700">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            <span className="font-semibold">{session.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-700">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            <span className="font-semibold">{session.time}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600 col-span-2">
                            {session.mode?.includes("Video") ? (
                              <Video className="h-3.5 w-3.5 text-teal-600" />
                            ) : (
                              <Building className="h-3.5 w-3.5 text-teal-600" />
                            )}
                            <span>Mode: {session.mode || "In-Person"}</span>
                          </div>
                        </div>

                        {session.concerns && (
                          <div className="text-xs text-gray-700">
                            <span className="font-semibold text-gray-900">Student Note: </span>
                            <span className="italic">"{session.concerns}"</span>
                          </div>
                        )}

                        {session.notes && (
                          <div className="text-xs bg-teal-50 border border-teal-200 p-2 rounded text-teal-900">
                            <span className="font-semibold">Counsellor Session Notes: </span>
                            {session.notes}
                          </div>
                        )}
                      </CardContent>

                      {/* Action buttons */}
                      <div className="p-4 pt-0 border-t bg-gray-50/50 flex items-center justify-between gap-2">
                        {session.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(session._id, "cancelled")}
                              disabled={isUpdatingStatus}
                              className="text-xs text-red-600 hover:bg-red-50 border-red-200"
                            >
                              Decline
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(session._id, "confirmed")}
                              disabled={isUpdatingStatus}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Confirm Booking
                            </Button>
                          </>
                        )}

                        {session.status === "confirmed" && (
                          <div className="w-full flex justify-between gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(session._id, "cancelled")}
                              disabled={isUpdatingStatus}
                              className="text-xs text-muted-foreground"
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                setCompletingSession(session);
                                setSessionNotes(session.notes || "");
                              }}
                              className="bg-primary hover:bg-primary/90 text-white text-xs gap-1"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              Mark Completed & Add Notes
                            </Button>
                          </div>
                        )}

                        {session.status === "completed" && (
                          <div className="w-full text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setCompletingSession(session);
                                setSessionNotes(session.notes || "");
                              }}
                              className="text-xs"
                            >
                              Edit Session Notes
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: My Schedule & Availability Settings */}
          {activeTab === "schedule" && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  My Working Schedule & Calendar Settings
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure which days and time slots you are available for appointments. Students will see these exact options when booking with you.
                </p>
              </div>

              {scheduleSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>{scheduleSuccess}</span>
                </div>
              )}

              {scheduleError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span>{scheduleError}</span>
                </div>
              )}

              <form onSubmit={handleSaveSchedule} className="space-y-6">
                {/* 1. Working Days of the Week */}
                <Card className="bg-white shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">1. Available Days of the Week</CardTitle>
                    <CardDescription className="text-xs">
                      Select which days of the week your calendar should be open for bookings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {ALL_DAYS.map((day) => {
                        const isSelected = scheduleDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
                              isSelected
                                ? "bg-primary text-white border-primary shadow-xs"
                                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            {day} {isSelected ? "✓" : ""}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* 2. Daily Time Slots */}
                <Card className="bg-white shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">2. Daily Consultation Time Slots</CardTitle>
                    <CardDescription className="text-xs">
                      Define the appointment slots available on your working days.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {timeSlots.map((slot) => (
                        <div
                          key={slot}
                          className="flex items-center justify-between p-2.5 bg-slate-50 border rounded-lg text-xs font-medium"
                        >
                          <span className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            {slot}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(slot)}
                            className="text-gray-400 hover:text-red-600 p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Slot */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Input
                        placeholder="e.g. 10:00 AM - 11:00 AM"
                        value={newSlotInput}
                        onChange={(e) => setNewSlotInput(e.target.value)}
                        className="text-xs h-9"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddSlot}
                        className="gap-1 text-xs h-9 whitespace-nowrap"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Slot
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* 3. Office & Profile Details */}
                <Card className="bg-white shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">3. Consultation Profile & Office Details</CardTitle>
                    <CardDescription className="text-xs">
                      Displayed on your public card in the student directory.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Specialization</Label>
                        <Input
                          placeholder="e.g., Anxiety, CBT, Academic Stress"
                          value={specialization}
                          onChange={(e) => setSpecialization(e.target.value)}
                          className="text-xs h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Contact Phone</Label>
                        <Input
                          placeholder="e.g., +1 (555) 019-2831"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="text-xs h-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">Office / Room Location</Label>
                      <Input
                        placeholder="e.g., Wellness Center, Block B, Suite 204"
                        value={officeLocation}
                        onChange={(e) => setOfficeLocation(e.target.value)}
                        className="text-xs h-9"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium">About / Bio</Label>
                      <Textarea
                        placeholder="Short summary of your counseling background and approach for students..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="text-xs resize-none h-20"
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={savingSchedule}
                    className="gap-2 bg-primary hover:bg-primary/95 text-white font-medium"
                  >
                    {savingSchedule ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Save Schedule & Profile
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </main>

        {/* Completion Notes Dialog */}
        <Dialog open={!!completingSession} onOpenChange={(open) => !open && setCompletingSession(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                Session Documentation & Notes
              </DialogTitle>
              <DialogDescription className="text-xs">
                Student: {completingSession?.studentName} ({completingSession?.date} at {completingSession?.time})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <Label className="text-xs font-medium">Confidential Session Notes</Label>
              <Textarea
                placeholder="Key takeaways, recommendations, next follow-up steps..."
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="h-28 text-xs resize-none"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" onClick={() => setCompletingSession(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => completingSession && handleStatusChange(completingSession._id, "completed", sessionNotes)}
                disabled={isUpdatingStatus}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs"
              >
                {isUpdatingStatus ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                Save & Complete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Login view
  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
              Access your UniHeal counselor dashboard, manage student appointments, and customize your availability schedule
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
                    placeholder="counsellor@uniheal.edu"
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
                <p>Counselor accounts are registered by University Administrators in the Admin Dashboard.</p>
              </div>

              <Button type="submit" className="w-full gap-2 mt-2" disabled={isLoggingIn}>
                {isLoggingIn ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
                {isLoggingIn ? "Signing in..." : "Sign In to Portal"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CounsellorPortal;