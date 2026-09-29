import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, Heart, Wind, Music, BookOpen } from "lucide-react";

const QuickResources = () => {
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathCount, setBreatheCount] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

  const startBreathing = () => {
    setBreathingActive(true);
    setBreatheCount(0);
    setCurrentPhase('inhale');
    
    const breathingCycle = () => {
      // Inhale for 4 seconds
      setTimeout(() => setCurrentPhase('hold'), 0);
      setTimeout(() => setCurrentPhase('hold'), 4000);
      // Hold for 4 seconds  
      setTimeout(() => setCurrentPhase('exhale'), 8000);
      // Exhale for 6 seconds
      setTimeout(() => {
        setBreatheCount(prev => prev + 1);
        if (breathCount < 5) {
          setCurrentPhase('inhale');
          breathingCycle();
        } else {
          setBreathingActive(false);
        }
      }, 14000);
    };
    
    breathingCycle();
  };

  const calmingVideos = [
    {
      id: "1ZYbU82GVz4",
      title: "10 Min Meditation Music",
      description: "Relaxing music for stress relief"
    },
    {
      id: "sGkh1W5cbH4", 
      title: "Breathing Exercise Guide",
      description: "5-minute guided breathing"
    },
    {
      id: "ZToicYcHIOU",
      title: "Nature Sounds for Focus",
      description: "Rain and forest sounds"
    },
    {
      id: "lFcSrYw-ARY",
      title: "Study Music - Lo-Fi",
      description: "Calming background music"
    }
  ];

  const quickTips = [
    { icon: "🧘", title: "4-7-8 Breathing", desc: "Inhale 4s, hold 7s, exhale 8s" },
    { icon: "💧", title: "Drink Water", desc: "Dehydration increases stress" },
    { icon: "🌿", title: "Step Outside", desc: "Fresh air improves mood" },
    { icon: "📱", title: "Call a Friend", desc: "Social support reduces anxiety" }
  ];

  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Healing Resources
        </CardTitle>
        <CardDescription>
          Instant relief tools for stress and anxiety
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="breathing" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="breathing">Breathing</TabsTrigger>
            <TabsTrigger value="media">Videos</TabsTrigger>
            <TabsTrigger value="tips">Quick Tips</TabsTrigger>
          </TabsList>
          
          <TabsContent value="breathing" className="space-y-4">
            <div className="text-center p-6 bg-muted/30 rounded-lg">
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full border-4 transition-all duration-1000 flex items-center justify-center ${
                breathingActive ? 
                  currentPhase === 'inhale' ? 'border-blue-400 scale-110 bg-blue-50' :
                  currentPhase === 'hold' ? 'border-purple-400 scale-100 bg-purple-50' :
                  'border-green-400 scale-90 bg-green-50'
                : 'border-muted-foreground'
              }`}>
                <Wind className="h-8 w-8 text-muted-foreground" />
              </div>
              
              {breathingActive ? (
                <div className="space-y-2">
                  <Badge variant="secondary" className="text-sm">
                    {currentPhase === 'inhale' ? 'Breathe In...' :
                     currentPhase === 'hold' ? 'Hold...' : 'Breathe Out...'}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Round {breathCount + 1} of 6
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <h4 className="font-medium">Box Breathing Exercise</h4>
                  <p className="text-sm text-muted-foreground">
                    A simple 6-round breathing exercise to calm your mind
                  </p>
                </div>
              )}
            </div>
            
            <Button 
              onClick={startBreathing} 
              disabled={breathingActive}
              className="w-full gap-2"
            >
              {breathingActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {breathingActive ? 'Breathing...' : 'Start Breathing Exercise'}
            </Button>
          </TabsContent>
          
          <TabsContent value="media" className="space-y-3">
            <div className="grid gap-3">
              {calmingVideos.map((video) => (
                <Card key={video.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img 
                        src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                        alt={video.title}
                        className="w-16 h-12 object-cover rounded"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="h-4 w-4 text-white drop-shadow-lg" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{video.title}</h4>
                      <p className="text-xs text-muted-foreground">{video.description}</p>
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="h-auto p-0 text-xs"
                        onClick={() => window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank')}
                      >
                        Watch Now →
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="tips" className="space-y-3">
            {quickTips.map((tip, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <span className="text-2xl">{tip.icon}</span>
                <div>
                  <h4 className="text-sm font-medium">{tip.title}</h4>
                  <p className="text-xs text-muted-foreground">{tip.desc}</p>
                </div>
              </div>
            ))}
            
            <div className="pt-2">
              <Button variant="outline" className="w-full gap-2">
                <BookOpen className="h-4 w-4" />
                More Wellness Tips
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default QuickResources;