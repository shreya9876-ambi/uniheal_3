import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Calendar, Brain } from "lucide-react";
import mascotImage from "@/assets/sprout-mascot.png";
import AssessmentModal from "./AssessmentModal";

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

interface AssessmentResult {
  academicStress: number;
  moodMotivation: number;
  suicidalRisk: number;
  totalScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  recommendations: string[];
}

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi there! I'm Sprout, your mental health companion. I'm here to listen and support you. What's on your mind today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [conversationCount, setConversationCount] = useState(0);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationPrompts = [
    "That sounds challenging. Can you tell me more about what's been going on?",
    "I hear you. It's completely normal to feel this way sometimes. What's been the most difficult part?",
    "Thank you for sharing that with me. How long have you been feeling this way?",
    "I appreciate your openness. What usually helps you when you're going through tough times?",
    "It sounds like you're dealing with a lot right now. Have you been able to talk to anyone else about this?"
  ];

  // Auto-scroll to bottom when messages change - contained within chat area only
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
    }
  }, [messages]);

  const addMessage = (text: string, sender: 'bot' | 'user') => {
    const newMessage: Message = {
      id: messages.length + 1,
      text,
      sender,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    addMessage(inputText, 'user');
    setInputText("");
    setConversationCount(prev => prev + 1);
    
    // Continue conversation for several exchanges before offering assessment
    setTimeout(() => {
      if (conversationCount < 4) {
        // Continue conversation
        const randomPrompt = conversationPrompts[Math.floor(Math.random() * conversationPrompts.length)];
        addMessage(randomPrompt, 'bot');
      } else if (conversationCount === 4) {
        // Offer assessment after meaningful conversation
        addMessage("You've been really open with me, and I appreciate that. To better understand how you're doing and provide more personalized support, would you be interested in taking a quick mental health assessment? It covers areas like academic stress, mood, and overall wellbeing.", 'bot');
        setTimeout(() => {
          addMessage("The assessment is completely private and will help me give you better tips and resources.", 'bot');
        }, 2000);
      } else {
        // Provide supportive responses
        const supportiveResponses = [
          "I'm here to listen. How are you feeling right now about everything we've discussed?",
          "It sounds like you're being really thoughtful about your mental health. That's a positive step.",
          "Remember, it's okay to have difficult days. What matters is that you're reaching out and being aware of how you feel."
        ];
        const randomResponse = supportiveResponses[Math.floor(Math.random() * supportiveResponses.length)];
        addMessage(randomResponse, 'bot');
      }
    }, 1000);
  };

  const handleAssessmentComplete = (result: AssessmentResult) => {
    setAssessmentResult(result);
    setShowAssessment(false);
    
    setTimeout(() => {
      let responseMessage = "";
      
      if (result.riskLevel === 'Critical') {
        responseMessage = "I'm very concerned about what the assessment shows. Your safety is the most important thing right now. Please know that you're not alone and there are people who want to help you.";
        addMessage(`Assessment complete! Risk level: ${result.riskLevel}. ${responseMessage}`, 'bot');
        // Show counseling buttons immediately for Critical risk
        setTimeout(() => {
          addMessage("Would you like me to help you book a counseling session? It's completely confidential and might be helpful.", 'bot');
          setShowBooking(true);
        }, 500);
      } else if (result.riskLevel === 'High') {
        responseMessage = "The assessment shows you're experiencing significant stress. Thank you for being honest - that takes courage.";
        addMessage(`Assessment complete! Risk level: ${result.riskLevel}. ${responseMessage}`, 'bot');
        // Show counseling buttons immediately for High risk
        setTimeout(() => {
          addMessage("Would you like me to help you book a counseling session? It's completely confidential and might be helpful.", 'bot');
          setShowBooking(true);
        }, 500);
      } else if (result.riskLevel === 'Moderate') {
        responseMessage = "The assessment shows some areas where you might benefit from additional support. This is very common among students.";
        addMessage(`Assessment complete! Risk level: ${result.riskLevel}. ${responseMessage}`, 'bot');
        setTimeout(() => {
          addMessage("Here are some strategies that might help: practice stress management techniques, maintain regular sleep, and consider talking to someone you trust. Would you like to explore counseling options?", 'bot');
          setShowBooking(true);
        }, 1500);
      } else {
        responseMessage = "Great news! The assessment shows you're managing well overall. It's wonderful that you're being proactive about your mental health.";
        addMessage(`Assessment complete! Risk level: ${result.riskLevel}. ${responseMessage}`, 'bot');
        setTimeout(() => {
          addMessage("Keep up the good self-care habits you have in place. Continue to check in with yourself regularly and maintain your support networks.", 'bot');
        }, 1500);
      }
      
      // Add specific tips based on scores
      setTimeout(() => {
        const tips = result.recommendations.slice(0, 2);
        addMessage(`Here are some specific tips for you: ${tips.join(', ')}.`, 'bot');
      }, 3000);
    }, 500);
  };

  const handleTakeAssessment = () => {
    addMessage("I'd like to take the assessment", 'user');
    setTimeout(() => {
      addMessage("Perfect! I'm opening our comprehensive mental health assessment for you. It will cover academic stress, mood & motivation, and safety questions. Take your time with each section.", 'bot');
      setShowAssessment(true);
    }, 1000);
  };

  const handleBooking = () => {
    addMessage("Yes, I'd like to book a session", 'user');
    setTimeout(() => {
      addMessage("Great! I'll redirect you to our booking system where you can choose your preferred date and time.", 'bot');
      setShowBooking(false);
      // Redirect to booking page
      setTimeout(() => {
        window.location.href = '/booking';
      }, 1500);
    }, 1000);
  };

  return (
    <Card className="h-[500px] flex flex-col bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg border-2 border-blue-200 overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={mascotImage} 
              alt="Sprout - UniHeal Mascot" 
              className="w-16 h-16 rounded-full bg-white/20 p-1 animate-pulse" 
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-300 rounded-full animate-ping"></div>
          </div>
          <div>
            <CardTitle className="text-white font-semibold">Chat with Sprout 🌱</CardTitle>
            <CardDescription className="text-white/90 text-sm">Your caring mental health companion</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-3 p-4 overflow-hidden">
        <div className="flex-1 bg-gradient-to-b from-white/50 to-white/30 rounded-xl border border-blue-300 overflow-hidden">
          <ScrollArea className="h-full p-3">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : 'bg-white border-2 border-blue-200 text-gray-800'
                    }`}
                  >
                    {message.sender === 'bot' && (
                      <div className="flex items-center gap-2 mb-2">
                        <img src={mascotImage} alt="Sprout" className="w-4 h-4 rounded-full" />
                        <Badge className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200">
                          Sprout
                        </Badge>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {conversationCount >= 4 && !assessmentResult && (
          <div className="space-y-2">
            <Button 
              onClick={handleTakeAssessment} 
              className="w-full gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover-scale"
            >
              <Brain className="h-4 w-4" />
              Take Mental Health Assessment ✨
            </Button>
          </div>
        )}

        {(showBooking || (assessmentResult && ['Moderate', 'High', 'Critical'].includes(assessmentResult.riskLevel))) && (
          <div className="space-y-2">
            <Button 
              onClick={handleBooking} 
              className="w-full gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover-scale"
            >
              <Calendar className="h-4 w-4" />
              Book a counselling session now 📅
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowBooking(false)} 
              className="w-full border-2 border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              Not right now
            </Button>
          </div>
        )}

        <div className="flex gap-2">
          <Input
            placeholder="Share what's on your mind... 💭"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 rounded-xl border-2 border-blue-200 focus:border-blue-400 bg-white/70 backdrop-blur-sm"
          />
          <Button 
            onClick={handleSendMessage} 
            size="sm" 
            disabled={!inputText.trim()}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl px-4 shadow-lg hover-scale"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <AssessmentModal 
          open={showAssessment}
          onOpenChange={setShowAssessment}
          onComplete={handleAssessmentComplete}
        />
      </CardContent>
    </Card>
  );
};

export default ChatBot;