import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, TrendingUp, AlertTriangle, Calendar, Leaf } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Sample data for demonstration
  const stressLevelData = [
    { year: "1st Year", low: 45, moderate: 35, high: 20 },
    { year: "2nd Year", low: 30, moderate: 40, high: 30 },
    { year: "3rd Year", low: 25, moderate: 45, high: 30 },
    { year: "4th Year", low: 20, moderate: 35, high: 45 },
  ];

  const issueDistribution = [
    { name: "Exam Anxiety", value: 35, color: "#8B5CF6" },
    { name: "Academic Pressure", value: 25, color: "#06B6D4" },
    { name: "Social Issues", value: 15, color: "#10B981" },
    { name: "Financial Stress", value: 15, color: "#F59E0B" },
    { name: "Other", value: 10, color: "#EF4444" },
  ];

  const monthlyEngagement = [
    { month: "Jan", sessions: 120, screenings: 89 },
    { month: "Feb", sessions: 145, screenings: 112 },
    { month: "Mar", sessions: 180, screenings: 156 },
    { month: "Apr", sessions: 220, screenings: 189 },
    { month: "May", sessions: 195, screenings: 167 },
    { month: "Jun", sessions: 160, screenings: 134 },
  ];

  const riskAlerts = [
    { id: 1, message: "15% increase in high-stress reports this week", level: "warning" },
    { id: 2, message: "Peak anxiety levels detected in Engineering students", level: "high" },
    { id: 3, message: "3 students flagged for immediate counselor outreach", level: "critical" },
  ];

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
            <span className="font-semibold text-primary">UniHeal Admin</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-12">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Mental Health Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Aggregated, anonymous insights to support student wellbeing initiatives
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Active Students</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">2,847</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Counseling Sessions</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">156</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risk Assessments</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">423</div>
              <p className="text-xs text-muted-foreground">Completed this week</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risk Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">12</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Stress Levels by Academic Year */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle>Stress Levels by Academic Year</CardTitle>
              <CardDescription>Distribution of stress levels across different academic years</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stressLevelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="low" stackId="a" fill="hsl(var(--pastel-mint))" name="Low Stress" />
                  <Bar dataKey="moderate" stackId="a" fill="hsl(var(--primary))" name="Moderate Stress" />
                  <Bar dataKey="high" stackId="a" fill="hsl(var(--destructive))" name="High Stress" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Issue Distribution */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle>Mental Health Issue Distribution</CardTitle>
              <CardDescription>Most common concerns reported by students</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={issueDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {issueDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Engagement Trends */}
        <Card className="bg-gradient-card shadow-card mb-8">
          <CardHeader>
            <CardTitle>Monthly Engagement Trends</CardTitle>
            <CardDescription>Platform usage and engagement metrics over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={monthlyEngagement}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sessions" fill="hsl(var(--primary))" name="Counseling Sessions" />
                <Bar dataKey="screenings" fill="hsl(var(--pastel-lavender))" name="Risk Screenings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Alerts */}
        <Card className="bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Active Risk Alerts
            </CardTitle>
            <CardDescription>
              Automated alerts based on aggregated data patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-background"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        alert.level === 'critical' ? 'destructive' :
                        alert.level === 'high' ? 'destructive' : 'secondary'
                      }
                    >
                      {alert.level.toUpperCase()}
                    </Badge>
                    <span className="text-sm">{alert.message}</span>
                  </div>
                  <Button size="sm" variant="outline">
                    Review
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <div className="mt-8 p-4 bg-pastel-mint/30 rounded-lg border border-green-200">
          <p className="text-sm text-green-800 text-center">
            🔒 All data shown is aggregated and anonymized. Individual student privacy is protected at all times.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;