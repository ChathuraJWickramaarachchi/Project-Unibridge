import { Briefcase, Building2, Users, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Briefcase,
    title: "Curated Opportunities",
    description: "Handpicked internships from verified companies, tailored for university students.",
  },
  {
    icon: Building2,
    title: "Top Companies",
    description: "Connect with leading organizations across multiple industries and sectors.",
  },
  {
    icon: Users,
    title: "Mentor Matching",
    description: "Get paired with industry mentors to guide your internship journey.",
  },
  {
    icon: TrendingUp,
    title: "Career Growth",
    description: "Track applications, build your profile, and accelerate your professional growth.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-16 bg-secondary/50" id="about">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-3">
            Why Choose <span className="text-accent">InternHub</span>?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Everything you need to kickstart your career, all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="bg-card rounded-xl p-6 border border-border hover:border-accent/30 hover:shadow-lg transition-all duration-300 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
