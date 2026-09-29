import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  UserCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Video, 
  Building, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Sparkles
} from "lucide-react";
import { api, CounsellorProfile } from "@/lib/api";
import counsellorPriyaImg from "@/assets/counsellor-priya.jpg";
import { format, isBefore, startOfToday } from "date-fns";

interface CounsellorBookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCounsellor: CounsellorProfile | null;
  counsellorsList: CounsellorProfile[];
  onBookingSuccess: () => void;
}

const DEFAULT_SLOTS = [
  "09:00 AM - 10:00 AM",
  "10:30 AM - 11:30 AM",
  "11:30 AM - 12:30 PM",
  "02:00 PM - 03:00 PM",
  "03:30 PM - 04:30 PM",
  "04:30 PM - 05:30 PM",
];

const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function CounsellorBookingModal({
  open,
  onOpenChange,
  selectedCounsellor,
  counsellorsList,
  onBookingSuccess,
}: CounsellorBookingModalProps) {
  const [activeCounsellor, setActiveCounsellor] = useState<CounsellorProfile | null>(selectedCounsellor);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [mode, setMode] = useState<string>("In-Person");
  const [urgency, setUrgency] = useState<"normal" | "moderate" | "high" | "critical">("normal");
  const [concerns, setConcerns] = useState<string>("");

  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [bookingCompleted, setBookingCompleted] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  // Sync active counsellor when prop changes
  useEffect(() => {
    if (selectedCounsellor) {
      setActiveCounsellor(selectedCounsellor);
    } else if (counsellorsList.length > 0 && !activeCounsellor) {
      setActiveCounsellor(counsellorsList[0]);
    }
  }, [selectedCounsellor, counsellorsList]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setBookingCompleted(false);
      setConfirmedBooking(null);
      setErrorMessage("");
      setSelectedDate(undefined);
      setSelectedTime("");
      setConcerns("");
      setMode("In-Person");
      setUrgency("normal");
    }
  }, [open]);

  // Fetch booked slots whenever active counsellor or selected date changes
  useEffect(() => {
    if (activeCounsellor && selectedDate) {
      fetchBookedSlots();
    } else {
      setBookedSlots([]);
    }
  }, [activeCounsellor, selectedDate]);

  const fetchBookedSlots = async () => {
    if (!activeCounsellor || !selectedDate) return;
    setLoadingSlots(true);
    setSelectedTime("");
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const res = await api.getCounsellorBookedSlots(activeCounsellor._id || activeCounsellor.id!, dateStr);
      setBookedSlots(res.bookedSlots || []);
    } catch (err) {
      console.warn("Could not fetch booked slots, using defaults", err);
      setBookedSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  // Check if a calendar day is disabled (past date or outside counsellor's working days)
  const isDateDisabled = (date: Date) => {
    const today = startOfToday();
    if (isBefore(date, today)) return true;

    if (activeCounsellor?.availability?.days && activeCounsellor.availability.days.length > 0) {
      const dayName = WEEKDAY_NAMES[date.getDay()];
      return !activeCounsellor.availability.days.includes(dayName);
    }

    // Default to Monday - Friday if not set
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCounsellor) {
      setErrorMessage("Please select a counsellor.");
      return;
    }
    if (!selectedDate) {
      setErrorMessage("Please choose a date on the calendar.");
      return;
    }
    if (!selectedTime) {
      setErrorMessage("Please select an available time slot.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const dateFormatted = format(selectedDate, "yyyy-MM-dd");
      const res = await api.createAppointment({
        date: dateFormatted,
        time: selectedTime,
        mode,
        urgency,
        concerns,
        counselorId: activeCounsellor._id || activeCounsellor.id,
        counselorName: activeCounsellor.name,
      });

      setConfirmedBooking(res.appointment);
      setBookingCompleted(true);
      onBookingSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to schedule appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableSlots = activeCounsellor?.availability?.timeSlots?.length
    ? activeCounsellor.availability.timeSlots
    : DEFAULT_SLOTS;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-primary font-bold">
            <CalendarIcon className="h-6 w-6 text-primary" />
            Book Counseling Session
          </DialogTitle>
          <DialogDescription>
            Schedule a confidential 1-on-1 session tailored to your selected counsellor's availability.
          </DialogDescription>
        </DialogHeader>

        {bookingCompleted && confirmedBooking ? (
          <div className="py-6 text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Session Request Submitted!</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                Your appointment with <span className="font-semibold text-primary">{confirmedBooking.counselorName}</span> has been scheduled.
              </p>
            </div>

            <div className="bg-slate-50 border rounded-xl p-5 text-left max-w-lg mx-auto space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-xs text-muted-foreground font-medium uppercase">Counsellor</span>
                <span className="text-sm font-semibold">{confirmedBooking.counselorName}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-xs text-muted-foreground font-medium uppercase">Date</span>
                <span className="text-sm font-semibold">{confirmedBooking.date}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-xs text-muted-foreground font-medium uppercase">Time Slot</span>
                <span className="text-sm font-semibold">{confirmedBooking.time}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-xs text-muted-foreground font-medium uppercase">Consultation Mode</span>
                <Badge variant="outline" className="font-medium bg-white">
                  {confirmedBooking.mode || "In-Person"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground font-medium uppercase">Status</span>
                <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
                  Pending Counsellor Confirmation
                </Badge>
              </div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <Button onClick={() => onOpenChange(false)} className="w-48">
                Done & View Sessions
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} className="space-y-6 pt-2">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Step 1: Select Counsellor */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-800 flex items-center justify-between">
                <span>1. Choose Counsellor</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {counsellorsList.length} verified counsellor{counsellorsList.length === 1 ? "" : "s"} available
                </span>
              </Label>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {counsellorsList.map((c) => {
                  const isSelected = activeCounsellor?._id === c._id;
                  return (
                    <div
                      key={c._id || c.id}
                      onClick={() => setActiveCounsellor(c)}
                      className={`cursor-pointer rounded-xl border p-3.5 transition-all text-left relative ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/70"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {(() => {
                          const isIndianLady = c.avatar || 
                            c.name.toLowerCase().includes("priya") || 
                            c.name.toLowerCase().includes("sharma") || 
                            c.name.toLowerCase().includes("ananya") || 
                            c.name.toLowerCase().includes("sneha") ||
                            c.name.toLowerCase().includes("pooja") ||
                            c.name.toLowerCase().includes("meera");
                          const photo = c.avatar || (isIndianLady ? counsellorPriyaImg : null);

                          return photo ? (
                            <img
                              src={photo}
                              alt={c.name}
                              className="w-10 h-10 rounded-full object-cover shadow-xs flex-shrink-0 border border-teal-300"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                          );
                        })()}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-sm truncate text-gray-900">{c.name}</h4>
                          <p className="text-xs text-primary font-medium truncate">
                            {c.specialization || "Mental Health Counselor"}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                            {c.department || "Wellness Services"}
                          </p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Active Counsellor Profile Summary Card */}
              {activeCounsellor && (
                <div className="bg-gradient-to-r from-teal-50/70 to-emerald-50/70 border border-teal-200/70 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    {(() => {
                      const isIndianLady = activeCounsellor.avatar || 
                        activeCounsellor.name.toLowerCase().includes("priya") || 
                        activeCounsellor.name.toLowerCase().includes("sharma") || 
                        activeCounsellor.name.toLowerCase().includes("ananya") || 
                        activeCounsellor.name.toLowerCase().includes("sneha") ||
                        activeCounsellor.name.toLowerCase().includes("pooja") ||
                        activeCounsellor.name.toLowerCase().includes("meera");
                      const photo = activeCounsellor.avatar || (isIndianLady ? counsellorPriyaImg : null);

                      return photo ? (
                        <img
                          src={photo}
                          alt={activeCounsellor.name}
                          className="w-12 h-12 rounded-xl object-cover shadow-xs border-2 border-white ring-1 ring-teal-300 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-base flex-shrink-0">
                          {activeCounsellor.name.charAt(0).toUpperCase()}
                        </div>
                      );
                    })()}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-teal-950">{activeCounsellor.name}</span>
                        <Badge variant="outline" className="bg-white/80 text-[10px] text-teal-800 border-teal-300">
                          <ShieldCheck className="h-3 w-3 mr-1 text-teal-600" />
                          Verified Counsellor
                        </Badge>
                      </div>
                      {activeCounsellor.officeLocation && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-teal-600" />
                          {activeCounsellor.officeLocation}
                        </p>
                      )}
                      {activeCounsellor.bio && (
                        <p className="text-xs text-gray-600 line-clamp-2 italic pt-0.5">
                          "{activeCounsellor.bio}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 text-[11px]">
                    <span className="text-xs text-muted-foreground mr-1 self-center">Working Days:</span>
                    {(activeCounsellor.availability?.days || ["Mon", "Tue", "Wed", "Thu", "Fri"]).map((d) => (
                      <Badge key={d} variant="secondary" className="text-[10px] px-1.5 py-0">
                        {d.slice(0, 3)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2 & 3: Calendar Date Picker & Time Slots */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Calendar Section */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  2. Select Date
                </Label>
                <div className="border rounded-xl p-2 bg-white flex justify-center shadow-xs">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => {
                      setSelectedDate(d);
                    }}
                    disabled={isDateDisabled}
                    className="rounded-md"
                  />
                </div>
                {selectedDate && (
                  <p className="text-xs text-primary font-medium text-center">
                    Selected: {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </p>
                )}
              </div>

              {/* Time Slots Section */}
              <div className="space-y-3 flex flex-col">
                <Label className="text-sm font-semibold text-gray-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" />
                    3. Select Time Slot
                  </span>
                  {selectedDate && loadingSlots && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Checking availability...
                    </span>
                  )}
                </Label>

                {!selectedDate ? (
                  <div className="flex-1 flex flex-col items-center justify-center border border-dashed rounded-xl p-6 text-center text-muted-foreground bg-gray-50/50">
                    <CalendarIcon className="h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-xs font-medium">Please select a date on the calendar first</p>
                    <p className="text-[11px] text-gray-400 mt-1">Available slots will update automatically</p>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                      {availableSlots.map((slot) => {
                        const isBooked = bookedSlots.includes(slot);
                        const isSelected = selectedTime === slot;

                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isBooked}
                            onClick={() => setSelectedTime(slot)}
                            className={`px-3.5 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition-all border ${
                              isBooked
                                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through"
                                : isSelected
                                ? "bg-primary text-white border-primary shadow-xs ring-2 ring-primary/20"
                                : "bg-white text-gray-700 border-gray-200 hover:border-primary/50 hover:bg-primary/5"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <Clock className={`h-3.5 w-3.5 ${isSelected ? "text-white" : "text-muted-foreground"}`} />
                              {slot}
                            </span>
                            {isBooked ? (
                              <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded">
                                Reserved
                              </span>
                            ) : isSelected ? (
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            ) : (
                              <span className="text-[10px] text-green-600 font-semibold">Available</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Consultation Mode */}
                    <div className="space-y-1.5 pt-2 border-t">
                      <Label className="text-xs font-semibold text-gray-700">Mode of Consultation</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {["In-Person", "Online Video Call", "Confidential Phone"].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setMode(m)}
                            className={`p-2 rounded-lg text-[11px] font-medium border text-center transition-all flex flex-col items-center gap-1 ${
                              mode === m
                                ? "bg-primary/10 border-primary text-primary font-semibold"
                                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {m === "In-Person" ? (
                              <Building className="h-3.5 w-3.5" />
                            ) : m === "Online Video Call" ? (
                              <Video className="h-3.5 w-3.5" />
                            ) : (
                              <Phone className="h-3.5 w-3.5" />
                            )}
                            <span className="truncate w-full">{m.replace("Online ", "").replace("Confidential ", "")}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Urgency & Notes */}
            <div className="grid md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700">Priority Level</Label>
                <div className="flex gap-2">
                  {[
                    { id: "normal", label: "Normal", color: "bg-green-100 text-green-800 border-green-200" },
                    { id: "moderate", label: "Moderate", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
                    { id: "high", label: "High", color: "bg-orange-100 text-orange-800 border-orange-200" },
                    { id: "critical", label: "Critical", color: "bg-red-100 text-red-800 border-red-200" },
                  ].map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setUrgency(u.id as any)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                        urgency === u.id
                          ? `${u.color} ring-2 ring-primary/30 font-bold shadow-xs`
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Topic / Concerns (Optional & Confidential)</Label>
                <Textarea
                  placeholder="e.g., Exam anxiety, sleep issues, academic stress..."
                  value={concerns}
                  onChange={(e) => setConcerns(e.target.value)}
                  className="h-16 text-xs resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-3 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!selectedDate || !selectedTime || isSubmitting}
                className="flex-1 gap-2 font-medium"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Confirming Reservation...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Confirm Appointment ({selectedTime ? selectedTime.split(" - ")[0] : "Select Time"})
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
