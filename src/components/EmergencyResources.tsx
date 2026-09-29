import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Shield, AlertTriangle } from "lucide-react";

const EmergencyResources = () => {
  const emergencyContacts = [
    { name: "National Suicide Prevention Lifeline", number: "988", available: "24/7" },
    { name: "Crisis Text Line", number: "Text HOME to 741741", available: "24/7" },
    { name: "Student Support Services", number: "(555) 123-4567", available: "Mon-Fri 9AM-5PM" },
  ];

  return (
    <Card className="border-destructive/20 bg-gradient-card shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-destructive" />
          <CardTitle className="text-destructive text-lg">Emergency Resources</CardTitle>
        </div>
        <CardDescription>
          If you're in crisis or need immediate help, these resources are available 24/7
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {emergencyContacts.map((contact, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg">
            <div>
              <p className="font-medium text-sm">{contact.name}</p>
              <p className="text-xs text-muted-foreground">{contact.available}</p>
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              className="gap-2"
              onClick={() => window.open(`tel:${contact.number.replace(/\D/g, '')}`)}
            >
              <Phone className="h-4 w-4" />
              Call
            </Button>
          </div>
        ))}
        <div className="flex items-start gap-2 p-3 bg-pastel-peach rounded-lg mt-4">
          <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-orange-800">
            If you're experiencing thoughts of self-harm or suicide, please reach out immediately. You matter, and help is available.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencyResources;