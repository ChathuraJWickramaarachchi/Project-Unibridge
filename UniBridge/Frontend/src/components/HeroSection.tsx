import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const HeroSection = ({ searchQuery, onSearchChange }: HeroSectionProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Image carousel data
  const images = [
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
  ];
  
  const texts = [
    "Internship",
    "Career",
    "Future",
  ];
  
  const currentTextArray = texts[textIndex].split("");
  
  // Image carousel effect
  useEffect(() => {
    const imageTimer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    
    return () => clearInterval(imageTimer);
  }, [images.length]);
  
  // Text typing effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (currentText.length < currentTextArray.length) {
          setCurrentText(prev => prev + currentTextArray[prev.length]);
        } else {
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        if (currentText.length > 0) {
          setCurrentText(prev => prev.slice(0, -1));
        } else {
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? 100 : 150);
    
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, textIndex, currentTextArray, texts.length]);
  
  return (
    <section className="relative overflow-hidden">
      {/* Background image carousel with overlay */}
      <div className="absolute inset-0">
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-primary/85" />
      </div>

      <div className="relative container mx-auto px-4 py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-medium mb-6 animate-fade-in">
            🎓 Trusted by 5,000+ University Students
          </span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground mb-6 animate-fade-in-up leading-tight">
            Find Your Perfect{" "}
            <span className="text-accent">{currentText}</span>
            <span className="ml-1 inline-block w-1 h-12 bg-accent animate-pulse"></span>
            {" "}Opportunity
          </h1>
          <p className="text-primary-foreground/70 text-lg md:text-xl mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Connect with top companies offering opportunities tailored for university students. Launch your career today.
          </p>

          {/* Search bar */}
          <div className="relative max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex flex-col sm:flex-row gap-3 bg-card rounded-xl p-2 shadow-2xl">
              <div className="flex-1 flex items-center gap-3 px-4">
                <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Search by job title, company, or keyword..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full py-3 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>
              <Button size="lg" className="shrink-0 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-8">
                Search
              </Button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            {[
              { value: "2,500+", label: "Internships" },
              { value: "800+", label: "Companies" },
              { value: "95%", label: "Placement Rate" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-heading font-bold text-accent">{stat.value}</div>
                <div className="text-sm text-primary-foreground/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
