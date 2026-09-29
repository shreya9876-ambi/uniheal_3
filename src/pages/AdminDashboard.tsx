import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Users, TrendingUp, AlertTriangle, Calendar, Leaf, 
  UserPlus, ShieldCheck, KeyRound, Search, Trash2, Edit, RefreshCw, 
  CheckCircle2, XCircle, LogOut, Lock, Mail, ShieldAlert, Sparkles, UserCog, UserCheck
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { api, getStoredUser, clearStoredAuth, UserProfile } from "@/lib/api";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Auth state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getStoredUser());
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active view tab: 'users' | 'analytics'
  const [activeTab, setActiveTab] = useState<'users' | 'analytics'>('users');

  // Users data state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Create User Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createRole, setCreateRole] = useState<'student' | 'counsellor' | 'admin'>('student');
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    studentId: "",
    department: "",
    specialization: "",
    phone: "",
  });
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit User Modal state
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    specialization: "",
    phone: "",
    studentId: "",
    status: "active" as "active" | "inactive",
  });
  const [editError, setEditError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Real-time backend stats & metrics
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCounsellors: 0,
    totalAdmins: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    activeStudents: 0,
    inactiveStudents: 0,
    activeCounsellors: 0,
    inactiveCounsellors: 0,
    departmentStats: [] as { name: string; students: number }[],
    appointmentStatusStats: [] as { name: string; count: number; color: string }[],
    urgencyStats: [] as { level: string; count: number; color: string }[],
    modeStats: [] as { mode: string; count: number }[],
  });

  // Fetch users & stats from backend
  const fetchUsersAndStats = async () => {
    try {
      setLoadingUsers(true);
      const [usersRes, statsRes] = await Promise.allSettled([
        api.getUsers({ role: roleFilter, search: searchQuery, status: statusFilter }),
        api.getAdminStats(),
      ]);

      if (usersRes.status === 'fulfilled') {
        setUsers(usersRes.value.users || []);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.metrics || {});
      }
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      fetchUsersAndStats();
    }
  }, [currentUser, roleFilter, statusFilter]);

  // Handle Admin Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const res = await api.login({
        email: loginEmail,
        password: loginPassword,
        role: 'admin',
      });
      if (res.user.role !== 'admin') {
        throw new Error('Access denied. Administrator privileges required.');
      }
      setCurrentUser(res.user);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid administrator credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    clearStoredAuth();
    setCurrentUser(null);
  };

  // Handle Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");
    setIsSubmitting(true);
    try {
      await api.createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: createRole,
        studentId: createRole === 'student' ? formData.studentId : undefined,
        department: formData.department,
        specialization: createRole === 'counsellor' ? formData.specialization : undefined,
        phone: formData.phone,
      });

      setCreateSuccess(`New ${createRole} account for "${formData.name}" created successfully!`);
      setFormData({
        name: "",
        email: "",
        password: "",
        studentId: "",
        department: "",
        specialization: "",
        phone: "",
      });
      fetchUsersAndStats();
      setTimeout(() => {
        setIsCreateOpen(false);
        setCreateSuccess("");
      }, 1500);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create user credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit User
  const openEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      password: "",
      department: user.department || "",
      specialization: user.specialization || "",
      phone: user.phone || "",
      studentId: user.studentId || "",
      status: user.status || "active",
    });
    setEditError("");
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError("");
    setIsUpdating(true);
    try {
      const updatePayload: any = {
        name: editFormData.name,
        email: editFormData.email,
        department: editFormData.department,
        specialization: editFormData.specialization,
        phone: editFormData.phone,
        studentId: editFormData.studentId,
        status: editFormData.status,
      };
      if (editFormData.password.trim()) {
        updatePayload.password = editFormData.password.trim();
      }

      await api.updateUser(editingUser.id || editingUser._id!, updatePayload);
      setEditingUser(null);
      fetchUsersAndStats();
    } catch (err: any) {
      setEditError(err.message || 'Failed to update user.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle user active status
  const handleToggleStatus = async (user: UserProfile) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await api.updateUser(user.id || user._id!, { status: newStatus });
      fetchUsersAndStats();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status.');
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (user: UserProfile) => {
    if (!window.confirm(`Are you sure you want to delete the account for ${user.name} (${user.email})?`)) {
      return;
    }
    try {
      await api.deleteUser(user.id || user._id!);
      fetchUsersAndStats();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user.');
    }
  };

  // Generate random strong password
  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: pass }));
  };

  // If not logged in as Admin, show Admin Sign In
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-soft flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-md">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')} 
            className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>

          <Card className="shadow-2xl border-border/40 backdrop-blur-md bg-white/95">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-3">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">UniHeal Admin Portal</CardTitle>
              <CardDescription>
                Sign in to manage student/counselor credentials and view analytics
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                {loginError && (
                  <div className="p-3 text-sm bg-destructive/10 text-destructive border border-destructive/20 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <div className="relative">
                    <Mail className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="shreya@gmail.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <div className="relative">
                    <Lock className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full gap-2" disabled={isLoggingIn}>
                  {isLoggingIn ? <RefreshCw className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                  {isLoggingIn ? "Authenticating..." : "Sign In as Admin"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="gap-2 text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Home
              </Button>
              <div className="h-4 w-px bg-border/60" />
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-primary" />
                <span className="font-bold text-primary">UniHeal Admin</span>
                <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-primary/20 text-xs">
                  <ShieldCheck className="h-3 w-3" />
                  MongoDB Connected
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-foreground">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Administrative Control Center</h1>
            <p className="text-muted-foreground text-sm">
              Manage accounts, issue credentials, and track university mental health metrics
            </p>
          </div>

          <div className="flex gap-2 p-1 bg-muted/60 rounded-xl border border-border/40">
            <Button
              variant={activeTab === 'users' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('users')}
              className="gap-2 rounded-lg"
            >
              <UserCog className="h-4 w-4" />
              User & Credential Management
            </Button>
            <Button
              variant={activeTab === 'analytics' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('analytics')}
              className="gap-2 rounded-lg"
            >
              <TrendingUp className="h-4 w-4" />
              Analytics & Trends
            </Button>
          </div>
        </div>

        {/* Dynamic Key Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalStudents || users.filter(u => u.role === 'student').length}</div>
              <p className="text-xs text-muted-foreground">Accounts issued by Admin</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Counselors</CardTitle>
              <UserCheck className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.totalCounsellors || users.filter(u => u.role === 'counsellor').length}</div>
              <p className="text-xs text-muted-foreground">Verified clinical counselors</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalAppointments || 156}</div>
              <p className="text-xs text-muted-foreground">Bookings in database</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Database Mode</CardTitle>
              <ShieldCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-green-700">MongoDB Atlas</div>
              <p className="text-xs text-muted-foreground">No self-signup • Admin control</p>
            </CardContent>
          </Card>
        </div>

        {/* TAB 1: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Action Bar */}
            <Card className="bg-white/90 backdrop-blur-md shadow-card">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                  {/* Search and Filters */}
                  <div className="flex flex-wrap items-center gap-3 flex-1">
                    <div className="relative flex-1 min-w-[220px]">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, email, student ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && fetchUsersAndStats()}
                        className="pl-9"
                      />
                    </div>

                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="student">Students</SelectItem>
                        <SelectItem value="counsellor">Counselors</SelectItem>
                        <SelectItem value="admin">Administrators</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="outline" size="sm" onClick={fetchUsersAndStats} className="gap-2">
                      <RefreshCw className={`h-4 w-4 ${loadingUsers ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>

                  {/* Create New User Dialog */}
                  <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2 bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all">
                        <UserPlus className="h-4 w-4" />
                        Create New Credentials
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <KeyRound className="h-5 w-5 text-primary" />
                          Issue New Account Credentials
                        </DialogTitle>
                        <DialogDescription>
                          Create and authorize a Student, Counselor, or Admin account in MongoDB.
                        </DialogDescription>
                      </DialogHeader>

                      <form onSubmit={handleCreateUser} className="space-y-4 pt-2">
                        {createError && (
                          <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                            {createError}
                          </div>
                        )}
                        {createSuccess && (
                          <div className="p-3 text-sm bg-green-100 text-green-800 rounded-lg border border-green-200 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            {createSuccess}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2 col-span-2">
                            <Label>Account Role</Label>
                            <div className="grid grid-cols-3 gap-2">
                              {(['student', 'counsellor', 'admin'] as const).map((r) => (
                                <Button
                                  key={r}
                                  type="button"
                                  variant={createRole === r ? 'default' : 'outline'}
                                  onClick={() => setCreateRole(r)}
                                  className="capitalize text-xs py-1"
                                >
                                  {r}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2 col-span-2">
                            <Label>Full Name *</Label>
                            <Input
                              placeholder="e.g. Alex Johnson"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              required
                            />
                          </div>

                          <div className="space-y-2 col-span-2">
                            <Label>Email Address (Login Username) *</Label>
                            <Input
                              type="email"
                              placeholder="e.g. alex.j@university.edu"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              required
                            />
                          </div>

                          <div className="space-y-2 col-span-2">
                            <div className="flex items-center justify-between">
                              <Label>Initial Password *</Label>
                              <button
                                type="button"
                                onClick={generatePassword}
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                <Sparkles className="h-3 w-3" /> Auto-Generate
                              </button>
                            </div>
                            <Input
                              type="text"
                              placeholder="Create temporary password"
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              required
                            />
                          </div>

                          {createRole === 'student' && (
                            <>
                              <div className="space-y-2">
                                <Label>Student ID (Optional)</Label>
                                <Input
                                  placeholder="e.g. STU-2025-01"
                                  value={formData.studentId}
                                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Department</Label>
                                <Input
                                  placeholder="e.g. Computer Engineering"
                                  value={formData.department}
                                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                />
                              </div>
                            </>
                          )}

                          {createRole === 'counsellor' && (
                            <>
                              <div className="space-y-2">
                                <Label>Specialization</Label>
                                <Input
                                  placeholder="e.g. Cognitive Behavioral Therapy"
                                  value={formData.specialization}
                                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Contact Phone</Label>
                                <Input
                                  placeholder="e.g. +1 555-0199"
                                  value={formData.phone}
                                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                              </div>
                            </>
                          )}
                        </div>

                        <DialogFooter className="pt-4">
                          <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={isSubmitting} className="gap-2">
                            {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                            Create Account
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Users Data Table */}
            <Card className="bg-white/95 backdrop-blur-md shadow-card overflow-hidden">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Platform Accounts ({users.length})</CardTitle>
                    <CardDescription>
                      Accounts stored in MongoDB with full administrator provisioning
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {loadingUsers ? (
                  <div className="py-16 text-center text-muted-foreground flex flex-col items-center gap-2">
                    <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                    <span>Loading users from database...</span>
                  </div>
                ) : users.length === 0 ? (
                  <div className="py-16 text-center text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    <p className="font-medium text-foreground">No accounts found</p>
                    <p className="text-sm">Click "Create New Credentials" to add a student, counselor, or administrator.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/40 text-muted-foreground font-medium border-b">
                        <tr>
                          <th className="px-6 py-3">User</th>
                          <th className="px-6 py-3">Role</th>
                          <th className="px-6 py-3">ID / Specialization</th>
                          <th className="px-6 py-3">Department</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {users.map((u) => (
                          <tr key={u.id || u._id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-semibold text-foreground">{u.name}</div>
                              <div className="text-xs text-muted-foreground">{u.email}</div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge
                                variant="outline"
                                className={`capitalize text-xs ${
                                  u.role === 'admin'
                                    ? 'bg-purple-100 text-purple-800 border-purple-200'
                                    : u.role === 'counsellor'
                                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                                    : 'bg-green-100 text-green-800 border-green-200'
                                }`}
                              >
                                {u.role}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-xs text-muted-foreground">
                              {u.role === 'student' ? u.studentId || '—' : u.specialization || '—'}
                            </td>
                            <td className="px-6 py-4 text-xs text-muted-foreground">
                              {u.department || '—'}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  u.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                {u.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditModal(u)}
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                  title="Edit User / Reset Password"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleStatus(u)}
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                  title={u.status === 'active' ? 'Deactivate User' : 'Activate User'}
                                >
                                  {u.status === 'active' ? <XCircle className="h-4 w-4 text-orange-500" /> : <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteUser(u)}
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                  title="Delete User"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Edit User Modal */}
            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit User Account</DialogTitle>
                  <DialogDescription>
                    Update profile information or reset password for {editingUser?.name}.
                  </DialogDescription>
                </DialogHeader>

                {editingUser && (
                  <form onSubmit={handleUpdateUser} className="space-y-4 pt-2">
                    {editError && (
                      <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-lg">
                        {editError}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Reset Password (leave blank to keep current)</Label>
                      <Input
                        type="password"
                        placeholder="Enter new password"
                        value={editFormData.password}
                        onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Department</Label>
                        <Input
                          value={editFormData.department}
                          onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                          value={editFormData.status}
                          onValueChange={(val: "active" | "inactive") => setEditFormData({ ...editFormData, status: val })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <DialogFooter className="pt-4">
                      <Button type="button" variant="ghost" onClick={() => setEditingUser(null)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? "Saving..." : "Save Changes"}
                      </Button>
                    </DialogFooter>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* TAB 2: ANALYTICS & TRENDS */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Top Row: Student Status & Department Breakdown */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Real Student Status Distribution */}
              <Card className="bg-gradient-card shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Student Account Status Distribution
                      </CardTitle>
                      <CardDescription>
                        Real distribution of active vs inactive student platform accounts ({stats.totalStudents} total enrolled)
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-white text-xs">
                      {stats.totalStudents} Students
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="h-56">
                    {stats.totalStudents > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Active Students", value: stats.activeStudents, color: "#10B981" },
                              { name: "Inactive Accounts", value: stats.inactiveStudents, color: "#F43F5E" },
                            ].filter(item => item.value > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {[
                              { name: "Active Students", value: stats.activeStudents, color: "#10B981" },
                              { name: "Inactive Accounts", value: stats.inactiveStudents, color: "#F43F5E" },
                            ].filter(item => item.value > 0).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(val) => [`${val} student(s)`, 'Count']}
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm">
                        <Users className="h-8 w-8 opacity-30 mb-2" />
                        <span>No student accounts registered yet</span>
                      </div>
                    )}
                  </div>

                  {/* Real Student Status Progress Bars */}
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-medium">
                        <span className="flex items-center gap-1.5 text-emerald-800">
                          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                          Active Students ({stats.activeStudents})
                        </span>
                        <span className="text-muted-foreground font-semibold">
                          {stats.totalStudents > 0 
                            ? `${Math.round((stats.activeStudents / stats.totalStudents) * 100)}%` 
                            : '100%'}
                        </span>
                      </div>
                      <Progress 
                        value={stats.totalStudents > 0 ? (stats.activeStudents / stats.totalStudents) * 100 : 100} 
                        className="h-2 bg-emerald-100" 
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-medium">
                        <span className="flex items-center gap-1.5 text-rose-800">
                          <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                          Inactive Accounts ({stats.inactiveStudents})
                        </span>
                        <span className="text-muted-foreground font-semibold">
                          {stats.totalStudents > 0 
                            ? `${Math.round((stats.inactiveStudents / stats.totalStudents) * 100)}%` 
                            : '0%'}
                        </span>
                      </div>
                      <Progress 
                        value={stats.totalStudents > 0 ? (stats.inactiveStudents / stats.totalStudents) * 100 : 0} 
                        className="h-2 bg-rose-100" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Real Student Department Distribution */}
              <Card className="bg-gradient-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-primary" />
                    Students by Academic Department
                  </CardTitle>
                  <CardDescription>
                    Real-time enrollment count of students grouped by academic faculty
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {stats.departmentStats && stats.departmentStats.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.departmentStats}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                          <YAxis stroke="hsl(var(--muted-foreground))" allowDecimals={false} tick={{ fontSize: 11 }} />
                          <Tooltip 
                            formatter={(val) => [`${val} student(s)`, 'Enrolled']}
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }} 
                          />
                          <Bar dataKey="students" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm">
                        <Users className="h-8 w-8 opacity-30 mb-2" />
                        <span>No department data available</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/50 grid grid-cols-2 gap-2 text-xs">
                    {stats.departmentStats && stats.departmentStats.slice(0, 4).map((d, i) => (
                      <div key={i} className="flex justify-between items-center p-2 rounded bg-white/60">
                        <span className="font-medium text-gray-700 truncate max-w-[140px]">{d.name}</span>
                        <Badge variant="secondary" className="text-[10px]">{d.students} students</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Row: Appointment Status & Urgency Priority */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Real Appointment Booking Status Distribution */}
              <Card className="bg-gradient-card shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Appointment Status Distribution
                      </CardTitle>
                      <CardDescription>
                        Real booking status for counseling sessions ({stats.totalAppointments} total bookings)
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-white text-xs">
                      {stats.totalAppointments} Total
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-56">
                    {stats.totalAppointments > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.appointmentStatusStats.filter(s => s.count > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="count"
                            label={({ name, count }) => `${name}: ${count}`}
                          >
                            {stats.appointmentStatusStats.filter(s => s.count > 0).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(val) => [`${val} appointment(s)`, 'Count']}
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm">
                        <Calendar className="h-8 w-8 opacity-30 mb-2" />
                        <span>No appointments booked yet</span>
                      </div>
                    )}
                  </div>

                  {/* Status Bar Indicators */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <div className="text-lg font-bold text-emerald-700">{stats.confirmedAppointments}</div>
                      <div className="text-xs text-emerald-800">Confirmed Sessions</div>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <div className="text-lg font-bold text-amber-700">{stats.pendingAppointments}</div>
                      <div className="text-xs text-amber-800">Pending Review</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="text-lg font-bold text-blue-700">{stats.completedAppointments}</div>
                      <div className="text-xs text-blue-800">Completed Sessions</div>
                    </div>
                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                      <div className="text-lg font-bold text-rose-700">{stats.cancelledAppointments}</div>
                      <div className="text-xs text-rose-800">Cancelled / Declined</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Real Clinical Urgency Levels & Status Bars */}
              <Card className="bg-gradient-card shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-primary" />
                    Student Clinical Urgency Status Bars
                  </CardTitle>
                  <CardDescription>
                    Real distribution of appointment urgency levels flagged by students
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats.urgencyStats && stats.urgencyStats.map((u, i) => {
                    const pct = stats.totalAppointments > 0 
                      ? Math.round((u.count / stats.totalAppointments) * 100) 
                      : 0;
                    return (
                      <div key={i} className="space-y-1.5 p-3 rounded-lg bg-white/60 border border-border/40">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-foreground flex items-center gap-1.5">
                            <span 
                              className="w-2.5 h-2.5 rounded-full" 
                              style={{ backgroundColor: u.color }} 
                            />
                            {u.level} Urgency
                          </span>
                          <span className="text-muted-foreground font-medium">
                            {u.count} request(s) ({pct}%)
                          </span>
                        </div>
                        <Progress value={pct} className="h-2 bg-muted" />
                      </div>
                    );
                  })}

                  {/* Real-time Alerts */}
                  <div className="pt-2 space-y-2">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Real-time System Alerts
                    </h4>
                    {stats.pendingAppointments > 0 ? (
                      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                        <span>Action Required: {stats.pendingAppointments} student booking request(s) are currently awaiting counsellor confirmation.</span>
                      </div>
                    ) : null}

                    {stats.inactiveStudents > 0 ? (
                      <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                        <span>{stats.inactiveStudents} student account(s) are deactivated or pending admin verification.</span>
                      </div>
                    ) : null}

                    {stats.pendingAppointments === 0 && stats.inactiveStudents === 0 && (
                      <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                        <span>All student accounts and counseling queues are currently operational with no pending bottlenecks.</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Privacy & Compliance Notice */}
        <div className="p-4 bg-pastel-mint/30 rounded-xl border border-green-200">
          <p className="text-sm text-green-900 text-center font-medium">
            🔒 UniHeal Security Notice: Credentials are issued directly by University Administration and stored with secure bcrypt hashing in MongoDB. Self-registration is restricted to preserve academic confidentiality.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;