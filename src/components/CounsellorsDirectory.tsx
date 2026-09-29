import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  UserCheck, 
  Search, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Video, 
  Building, 
  Sparkles, 
  RefreshCw,
  Users
} from "lucide-react";
import { api, CounsellorProfile } from "@/lib/api";

interface CounsellorsDirectoryProps {
  onBookWithCounsellor: (counsellor: CounsellorProfile) => void;
  counsellors: CounsellorProfile[];
  loading: boolean;
  onRefresh: () => void;
}

export default function CounsellorsDirectory({
  onBookWithCounsellor,
  counsellors,
  loading,
  onRefresh,
}: CounsellorsDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("all");

  // Extract unique specializations for filter pills
  const specializations = [
    "all",
    ...Array.from(
      new Set(
        counsellors
          .map((c) => c.specialization)
          .filter((s): s is string => !!s && s.trim() !== "")
      )
    ),
  ];

  const filteredCounsellors = counsellors.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.specialization && c.specialization.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.department && c.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.bio && c.bio.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSpec =
      selectedSpecialization === "all" || c.specialization === selectedSpecialization;

    return matchesSearch && matchesSpec;
  });

  return (
    <section id="counsellors-section" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
            Registered University Therapists & Counsellors
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <UserCheck className="h-8 w-8 text-primary" />
            Our Campus Counsellors
          </h2>
          <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
            Book 1-on-1 confidential counseling sessions with registered university therapists. 
            All counsellors are certified and added by the university administration.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="gap-2 self-start md:self-auto border-gray-200 hover:bg-teal-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Directory
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by counsellor name, specialization, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white shadow-xs"
          />
        </div>

        {/* Specialization Filter Pills */}
        {specializations.length > 2 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 items-center">
            {specializations.map((spec) => (
              <Button
                key={spec}
                size="sm"
                variant={selectedSpecialization === spec ? "default" : "outline"}
                onClick={() => setSelectedSpecialization(spec)}
                className="text-xs h-9 capitalize whitespace-nowrap"
              >
                {spec === "all" ? "All Specialties" : spec}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Counsellors Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse bg-white border border-gray-200">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gray-200" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-16 bg-gray-100 rounded" />
                <div className="h-9 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCounsellors.length === 0 ? (
        <Card className="bg-white border-dashed border-2 p-10 text-center">
          <CardContent className="space-y-3">
            <Users className="h-12 w-12 text-muted-foreground/40 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-800">No counsellors found</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {searchTerm || selectedSpecialization !== "all"
                ? "No counsellors matched your search query. Try resetting filters."
                : "No counsellors have been registered yet by the Administrator. Once registered in the Admin Dashboard, they will immediately appear here for all students."}
            </p>
            {(searchTerm || selectedSpecialization !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSpecialization("all");
                }}
              >
                Clear Search Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCounsellors.map((counsellor) => {
            const availableDays = counsellor.availability?.days || [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
            ];
            const timeSlots = counsellor.availability?.timeSlots || [
              "09:00 AM - 10:00 AM",
              "11:00 AM - 12:00 PM",
              "02:00 PM - 03:00 PM",
            ];

            return (
              <Card
                key={counsellor._id || counsellor.id}
                className="bg-white border border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Card Header / Gradient Banner */}
                  <div className="bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50/50 p-5 border-b border-gray-100 relative">
                    <div className="flex items-start gap-3.5">
                      {/* Initials Avatar */}
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white flex items-center justify-center font-bold text-xl shadow-md flex-shrink-0">
                        {counsellor.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-base text-gray-900 truncate">
                            {counsellor.name}
                          </h3>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-teal-100/80 text-teal-800 text-[11px] font-medium mt-1 truncate max-w-full"
                        >
                          <ShieldCheck className="h-3 w-3 mr-1 text-teal-600 inline" />
                          {counsellor.specialization || "Mental Health Specialist"}
                        </Badge>
                        {counsellor.department && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {counsellor.department}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <CardContent className="p-5 space-y-4">
                    {/* Bio */}
                    {counsellor.bio ? (
                      <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed italic bg-gray-50/70 p-2.5 rounded-lg border border-gray-100">
                        "{counsellor.bio}"
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic bg-gray-50/50 p-2.5 rounded-lg">
                        Available for confidential 1-on-1 counseling, stress management, and emotional guidance.
                      </p>
                    )}

                    {/* Location & Contact Info */}
                    <div className="space-y-1.5 text-xs text-gray-600">
                      {counsellor.officeLocation && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 text-teal-600 flex-shrink-0" />
                          <span className="truncate">{counsellor.officeLocation}</span>
                        </div>
                      )}
                      {counsellor.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 text-teal-600 flex-shrink-0" />
                          <span>{counsellor.phone}</span>
                        </div>
                      )}
                      {counsellor.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3.5 w-3.5 text-teal-600 flex-shrink-0" />
                          <span className="truncate">{counsellor.email}</span>
                        </div>
                      )}
                    </div>

                    {/* Availability Schedule Preview */}
                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-700 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          Available Days:
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {availableDays.map((day) => (
                          <span
                            key={day}
                            className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200"
                          >
                            {day.slice(0, 3)}
                          </span>
                        ))}
                      </div>

                      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1">
                        <Clock className="h-3 w-3 text-primary flex-shrink-0" />
                        <span>{timeSlots.length} daily appointment slot{timeSlots.length === 1 ? "" : "s"}</span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0">
                  <Button
                    onClick={() => onBookWithCounsellor(counsellor)}
                    className="w-full gap-2 shadow-xs bg-primary hover:bg-primary/95 text-white font-medium"
                  >
                    <Calendar className="h-4 w-4" />
                    Book with {counsellor.name.split(" ")[0]}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
