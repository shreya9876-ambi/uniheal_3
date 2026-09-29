import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Users, Shield, BarChart3, Heart, Leaf, Headphones, Menu, Star, Quote, ArrowRight, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import EmergencyResources from "@/components/EmergencyResources";
import mascotImage from "@/assets/sprout-mascot.png";
import wellnessHeroBg from "@/assets/wellness-hero-bg.jpg";
import studentsSupport from "@/assets/students-support.jpg";
import counselorOffice from "@/assets/counselor-office.jpg";
import { useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const testimonials = [
    {
      name: "Sarah Thompson",
      role: "Psychology Student",
      avatar: "👩🏻‍🎓",
      quote: "After my sessions with the counsellor, I felt a calm I hadn't experienced in years. The guidance brought me back to myself — gently and powerfully."
    },
    {
      name: "Michael Johnson", 
      role: "Engineering Student",
      avatar: "👨🏾‍💻",
      quote: "The atmosphere, the energy, the support — everything felt aligned. It's rare to find someone who creates such a safe and open space."
    },
    {
      name: "David Rodriguez",
      role: "Medical Student", 
      avatar: "👨🏽‍⚕️",
      quote: "I came in feeling drained and left feeling energized and clear. It's more than wellness — it's a reset for the soul."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Glass Morphism Navbar */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Leaf className="h-8 w-8 text-primary" />
                <Headphones className="h-4 w-4 text-primary absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">UniHeal</h1>
                <p className="text-xs text-muted-foreground">Mental Health Support Platform</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('hero')} className="text-foreground hover:text-primary transition-colors">Home</button>
              <button onClick={() => scrollToSection('features')} className="text-foreground hover:text-primary transition-colors">Features</button>
              <button onClick={() => scrollToSection('testimonials')} className="text-foreground hover:text-primary transition-colors">Reviews</button>
              <button onClick={() => scrollToSection('mission')} className="text-foreground hover:text-primary transition-colors">Mission</button>
              <button onClick={() => scrollToSection('emergency')} className="text-foreground hover:text-primary transition-colors">Emergency</button>
              <Badge variant="secondary" className="gap-1">
                <Heart className="h-3 w-3" />
                Safe Space
              </Badge>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6 text-foreground" />
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 p-4 bg-white/20 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="flex flex-col gap-4">
                <button onClick={() => scrollToSection('hero')} className="text-left text-foreground hover:text-primary transition-colors">Home</button>
                <button onClick={() => scrollToSection('features')} className="text-left text-foreground hover:text-primary transition-colors">Features</button>
                <button onClick={() => scrollToSection('testimonials')} className="text-left text-foreground hover:text-primary transition-colors">Reviews</button>
                <button onClick={() => scrollToSection('mission')} className="text-left text-foreground hover:text-primary transition-colors">Mission</button>
                <button onClick={() => scrollToSection('emergency')} className="text-left text-foreground hover:text-primary transition-colors">Emergency</button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="container mx-auto px-4 pb-12 pt-24">
        {/* Hero Section */}
        <section id="hero" className="relative text-center py-16 mb-16 overflow-hidden rounded-3xl">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
            style={{ backgroundImage: `url(${wellnessHeroBg})` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-green-500/10"></div>
          
          <div className="relative z-10">
            <div className="flex justify-center mb-8">
              <img 
                src={mascotImage} 
                alt="Sprout - UniHeal Mascot" 
                className="w-32 h-32 drop-shadow-lg"
              />
            </div>
            
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Your Mental Health
              <span className="block bg-gradient-hero bg-clip-text text-transparent">
                Matters Here
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              UniHeal provides a safe, supportive environment where students can access mental health resources, 
              connect with counselors, and find the support they deserve.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                onClick={() => navigate('/student')}
                className="gap-2 shadow-hover hover:shadow-hover transition-all"
              >
                <Users className="h-5 w-5" />
                Login as Student
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate('/counsellor')}
                className="gap-2"
              >
                <Heart className="h-5 w-5" />
                Login as Counselor
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate('/admin')}
                className="gap-2"
              >
                <BarChart3 className="h-5 w-5" />
                Login as Admin
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="bg-gradient-card shadow-card hover:shadow-hover transition-all overflow-hidden">
            <div className="relative h-32 bg-gradient-to-br from-green-100 to-green-200">
              <img 
                src={studentsSupport} 
                alt="Students supporting each other" 
                className="w-full h-full object-cover opacity-60"
              />
            </div>
            <CardHeader>
              <div className="w-12 h-12 bg-pastel-mint rounded-lg flex items-center justify-center mb-3">
                <Users className="h-6 w-6 text-green-700" />
              </div>
              <CardTitle>Anonymous Support</CardTitle>
              <CardDescription>
                Get help without judgment. Your privacy and confidentiality are our top priorities.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-card shadow-card hover:shadow-hover transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-pastel-lavender rounded-lg flex items-center justify-center mb-3">
                <Heart className="h-6 w-6 text-purple-700" />
              </div>
              <CardTitle>24/7 Resources</CardTitle>
              <CardDescription>
                Access mental health tools, resources, and emergency support whenever you need it.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-card shadow-card hover:shadow-hover transition-all overflow-hidden">
            <div className="relative h-32 bg-gradient-to-br from-blue-100 to-purple-200">
              <img 
                src={counselorOffice} 
                alt="Professional counseling office" 
                className="w-full h-full object-cover opacity-60"
              />
            </div>
            <CardHeader>
              <div className="w-12 h-12 bg-pastel-pink rounded-lg flex items-center justify-center mb-3">
                <Shield className="h-6 w-6 text-pink-700" />
              </div>
              <CardTitle>Professional Care</CardTitle>
              <CardDescription>
                Connect with licensed counselors who understand the unique challenges of student life.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 mb-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-primary">More than 10,000</h2>
              <h3 className="text-2xl font-semibold mb-6 text-foreground">5-star reviews</h3>
              <p className="text-muted-foreground">Read why people love using UniHeal.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-gradient-card shadow-card hover:shadow-hover transition-all animate-float" style={{ animationDelay: `${index * 0.2}s` }}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <Quote className="h-8 w-8 text-muted-foreground/30 mb-4" />
                    <p className="text-foreground mb-6 leading-relaxed">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{testimonial.avatar}</div>
                      <div>
                        <div className="font-semibold text-foreground">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Statement */}
        <section id="mission" className="text-center py-12 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-primary">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Every student deserves access to mental health support. UniHeal breaks down barriers by providing 
              accessible, confidential, and comprehensive mental health resources tailored specifically for 
              university students navigating academic, social, and personal challenges.
            </p>
            <div className="flex justify-center gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">10k+</div>
                <div className="text-sm text-muted-foreground">Students Helped</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Support Available</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Confidential</div>
              </div>
            </div>
          </div>
        </section>

        {/* Emergency Resources */}
        <section id="emergency" className="max-w-2xl mx-auto">
          <EmergencyResources />
        </section>
      </main>

      {/* Healing Journey Footer */}
      <footer className="relative bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5 border-t border-border/50 mt-16">
        <div className="absolute inset-0 opacity-30">
          <div className="h-full w-full bg-[radial-gradient(circle,theme(colors.primary.DEFAULT/0.1)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
        </div>
        <div className="relative">
          {/* Call to Action Section */}
          <div className="container mx-auto px-4 py-16 text-center">
            <div className="max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-primary mb-4">Start Your Healing Journey Today</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Let's take the first step together toward clarity, calm, and personal growth.
              </p>
              <div className="flex justify-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/student')}
                  className="gap-2 shadow-hover hover:shadow-hover transition-all px-8 py-3"
                >
                  Begin Your Journey
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="border-t border-border/30 bg-white/30 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-12">
              <div className="grid md:grid-cols-4 gap-8">
                {/* Newsletter */}
                <div className="md:col-span-1">
                  <h3 className="font-semibold text-foreground mb-4">Join our newsletter</h3>
                  <div className="flex gap-2">
                    <input 
                      type="email" 
                      placeholder="Email@example.com"
                      className="flex-1 px-3 py-2 text-sm bg-white/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <Button size="sm" className="px-4">Sign up</Button>
                  </div>
                </div>

                {/* Company */}
                <div>
                  <h3 className="font-semibold text-foreground mb-4">Company</h3>
                  <div className="space-y-2 text-sm">
                    <div><button onClick={() => scrollToSection('hero')} className="text-muted-foreground hover:text-primary transition-colors">Home</button></div>
                    <div><button onClick={() => scrollToSection('mission')} className="text-muted-foreground hover:text-primary transition-colors">About</button></div>
                    <div><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Blog</a></div>
                    <div><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</a></div>
                  </div>
                </div>

                {/* Social Media */}
                <div>
                  <h3 className="font-semibold text-foreground mb-4">Social media</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Instagram className="h-4 w-4" />
                      <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Instagram</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Facebook className="h-4 w-4" />
                      <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Facebook</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Twitter className="h-4 w-4" />
                      <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Twitter</a>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <h3 className="font-semibold text-foreground mb-4">Support</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-muted-foreground">support@uniheal.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span className="text-muted-foreground">24/7 Crisis Hotline</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="text-muted-foreground">Campus Wellness Center</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-border/30">
              <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-primary">UniHeal</span>
                    <span className="text-sm text-muted-foreground">
                      Supporting student mental health, one conversation at a time.
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    © 2025 UniHeal. All rights reserved. | <a href="#" className="hover:text-primary">Privacy Policy</a> | <a href="#" className="hover:text-primary">Terms of Service</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;