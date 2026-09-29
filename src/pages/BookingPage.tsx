import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, CheckCircle, Leaf, Headphones } from "lucide-react";
import EmergencyResources from "@/components/EmergencyResources";

const BookingPage = () => {
  const navigate = useNavigate();
  const [bookingStep, setBookingStep] = useState<'selection' | 'details' | 'confirmation'>('selection');
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookingDetails, setBookingDetails] = useState({
    name: "",
    email: "",
    phone: "",
    concerns: "",
    urgency: "normal"
  });

  // Generate available dates (next 14 days, excluding weekends)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    let count = 0;
    let currentDate = new Date(today);
    
    while (count < 10) {
      currentDate.setDate(currentDate.getDate() + 1);
      const dayOfWeek = currentDate.getDay();
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push(new Date(currentDate));
        count++;
      }
    }
    
    return dates;
  };

  const availableTimes = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
  ];

  const handleDateTimeSelection = () => {
    if (selectedDate && selectedTime) {
      setBookingStep('details');
    }
  };

  const handleBookingSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit to backend
    setBookingStep('confirmation');
  };

  if (bookingStep === 'confirmation') {
    return (
      <div className="min-h-screen bg-gradient-soft">
        <header className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/student')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Portal
            </Button>
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              <span className="font-semibold text-primary">UniHeal</span>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto space-y-8">
            <Card className="bg-gradient-card shadow-soft text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-green-700">Session Booked Successfully!</CardTitle>
                <CardDescription className="text-lg">
                  Your counseling session has been scheduled
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-4">Session Details</h3>
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-green-600" />
                      <span className="text-green-700">
                        {new Date(selectedDate).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-green-600" />
                      <span className="text-green-700">{selectedTime}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Headphones className="h-5 w-5 text-green-600" />
                      <span className="text-green-700">Online Session (Link will be sent via email)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Badge variant="secondary" className="w-full justify-center py-3">
                    📧 Confirmation email sent to {bookingDetails.email}
                  </Badge>
                  <Badge variant="outline" className="w-full justify-center py-3">
                    📱 SMS reminder will be sent 24 hours before
                  </Badge>
                </div>

                <div className="text-sm text-muted-foreground space-y-2">
                  <p><strong>What's Next?</strong></p>
                  <ul className="text-left space-y-1 ml-4">
                    <li>• You'll receive a confirmation email within 5 minutes</li>
                    <li>• A counselor will contact you 24 hours before your session</li>
                    <li>• The online meeting link will be provided via email</li>
                    <li>• If you need to reschedule, reply to the confirmation email</li>
                  </ul>
                </div>

                <Button 
                  onClick={() => navigate('/student')} 
                  className="w-full"
                  size="lg"
                >
                  Return to Student Portal
                </Button>
              </CardContent>
            </Card>

            <EmergencyResources />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => bookingStep === 'selection' ? navigate('/student') : setBookingStep('selection')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {bookingStep === 'selection' ? 'Back to Portal' : 'Back to Date Selection'}
          </Button>
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-primary" />
            <span className="font-semibold text-primary">UniHeal</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className={`flex items-center gap-2 ${bookingStep === 'selection' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bookingStep === 'selection' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                1
              </div>
              <span className="text-sm font-medium">Select Date & Time</span>
            </div>
            <div className="w-12 h-0.5 bg-muted"></div>
            <div className={`flex items-center gap-2 ${bookingStep === 'details' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bookingStep === 'details' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                2
              </div>
              <span className="text-sm font-medium">Your Details</span>
            </div>
          </div>

          {bookingStep === 'selection' && (
            <Card className="bg-gradient-card shadow-soft">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Schedule Your Counseling Session</CardTitle>
                <CardDescription>
                  Choose a date and time that works best for you. All sessions are confidential and conducted online.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium mb-4 block">Available Dates</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {getAvailableDates().map((date) => {
                      const dateStr = date.toISOString().split('T')[0];
                      return (
                        <Button
                          key={dateStr}
                          variant={selectedDate === dateStr ? "default" : "outline"}
                          onClick={() => setSelectedDate(dateStr)}
                          className="flex flex-col h-auto p-3"
                        >
                          <span className="text-xs font-medium">
                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                          <span className="text-sm">
                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {selectedDate && (
                  <div>
                    <Label className="text-base font-medium mb-4 block">Available Times</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {availableTimes.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          onClick={() => setSelectedTime(time)}
                          className="gap-2"
                        >
                          <Clock className="h-4 w-4" />
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDate && selectedTime && (
                  <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                    <h4 className="font-medium text-primary mb-2">Selected Session</h4>
                    <p className="text-sm text-primary/80">
                      {new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })} at {selectedTime}
                    </p>
                  </div>
                )}

                <Button 
                  onClick={handleDateTimeSelection}
                  disabled={!selectedDate || !selectedTime}
                  className="w-full"
                  size="lg"
                >
                  Continue to Details
                </Button>
              </CardContent>
            </Card>
          )}

          {bookingStep === 'details' && (
            <Card className="bg-gradient-card shadow-soft">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Your Information</CardTitle>
                <CardDescription>
                  Please provide your contact details so we can confirm your session and send you the meeting link.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBookingSubmission} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={bookingDetails.name}
                        onChange={(e) => setBookingDetails(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={bookingDetails.email}
                        onChange={(e) => setBookingDetails(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={bookingDetails.phone}
                      onChange={(e) => setBookingDetails(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="concerns">What would you like to discuss? (Optional)</Label>
                    <Textarea
                      id="concerns"
                      placeholder="Briefly describe what you'd like to talk about. This helps your counselor prepare for the session."
                      value={bookingDetails.concerns}
                      onChange={(e) => setBookingDetails(prev => ({ ...prev, concerns: e.target.value }))}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Session Urgency</Label>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant={bookingDetails.urgency === 'normal' ? 'default' : 'outline'}
                        onClick={() => setBookingDetails(prev => ({ ...prev, urgency: 'normal' }))}
                        className="flex-1"
                      >
                        Normal
                      </Button>
                      <Button
                        type="button"
                        variant={bookingDetails.urgency === 'urgent' ? 'default' : 'outline'}
                        onClick={() => setBookingDetails(prev => ({ ...prev, urgency: 'urgent' }))}
                        className="flex-1"
                      >
                        Urgent
                      </Button>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Session Summary</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                      <p><strong>Time:</strong> {selectedTime}</p>
                      <p><strong>Duration:</strong> 50 minutes</p>
                      <p><strong>Format:</strong> Online video session</p>
                      <p><strong>Cost:</strong> Free for students</p>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    Book Session
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <EmergencyResources />
        </div>
      </main>
    </div>
  );
};

export default BookingPage;