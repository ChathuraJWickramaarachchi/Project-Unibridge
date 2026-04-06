import { motion } from "framer-motion";
import { 
  GraduationCap, 
  Users, 
  Award, 
  Target, 
  Heart, 
  Lightbulb, 
  Globe, 
  Shield,
  Zap,
  TrendingUp,
  Quote
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  const stats = [
    { icon: Users, value: "10K+", label: "Students Connected", color: "bg-blue-500/10 text-blue-600" },
    { icon: Award, value: "500+", label: "Partner Companies", color: "bg-green-500/10 text-green-600" },
    { icon: Target, value: "25+", label: "Universities", color: "bg-purple-500/10 text-purple-600" },
    { icon: GraduationCap, value: "95%", label: "Success Rate", color: "bg-orange-500/10 text-orange-600" },
  ];

  const values = [
    {
      icon: Heart,
      title: "Student First",
      description: "Every decision we make prioritizes the success and growth of students.",
      color: "bg-rose-500/10 text-rose-600",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We continuously evolve our platform with cutting-edge technology.",
      color: "bg-amber-500/10 text-amber-600",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Breaking down geographical barriers to create worldwide opportunities.",
      color: "bg-cyan-500/10 text-cyan-600",
    },
    {
      icon: Shield,
      title: "Trust & Safety",
      description: "Maintaining the highest standards of security and verified opportunities.",
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      icon: Zap,
      title: "Efficiency",
      description: "Streamlined processes that save time for both students and employers.",
      color: "bg-yellow-500/10 text-yellow-600",
    },
    {
      icon: TrendingUp,
      title: "Growth Mindset",
      description: "Committed to continuous improvement and learning from feedback.",
      color: "bg-indigo-500/10 text-indigo-600",
    },
  ];

  const team = [
    {
      name: "Wickramarachchi W.A.C.J",
      role: "Team Lead",
      bio: "Passionate about connecting students with opportunities and driving innovation.",
      initials: "WW",
      color: "bg-gradient-to-br from-blue-400 to-blue-600",
      photo: "/team/wickramarachchi.jpg",
    },
    {
      name: "Charuka R.D.K",
      role: "Developer",
      bio: "Skilled in building scalable solutions with a focus on user experience.",
      initials: "CR",
      color: "bg-gradient-to-br from-purple-400 to-purple-600",
      photo: "/team/charuka.jpg",
    },
    {
      name: "Rashini N.G.H",
      role: "Developer",
      bio: "Dedicated to creating impactful features that help students succeed.",
      initials: "RN",
      color: "bg-gradient-to-br from-green-400 to-green-600",
      photo: "/team/rashini.png",
    },
    {
      name: "Wijesekara W.A.D.M.T",
      role: "Developer",
      bio: "Committed to building robust systems that power the platform.",
      initials: "WW",
      color: "bg-gradient-to-br from-pink-400 to-pink-600",
      photo: "/team/wijesekara.jpg",
    },
  ];

  const milestones = [
    { year: "2020", title: "Founded", description: "UniBridge was born with a vision to connect students globally." },
    { year: "2021", title: "First 1,000 Students", description: "Reached our first major milestone of helping 1,000 students." },
    { year: "2022", title: "Global Expansion", description: "Expanded operations to 25+ countries worldwide." },
    { year: "2023", title: "Platform 2.0", description: "Launched redesigned platform with AI-powered matching." },
    { year: "2024", title: "100+ Partners", description: "Partnered with over 100 leading companies globally." },
  ];

  const fadeUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
  };

  const fadeLeft = {
    initial: { opacity: 0, x: -40 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true, amount: 0.2 },
  };

  const fadeRight = {
    initial: { opacity: 0, x: 40 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true, amount: 0.2 },
  };

  return (
    <div className="min-h-screen overflow-hidden">

      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10" />
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.8, 0.5, 0.8] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Heart className="w-4 h-4" />
              <span>Our Story</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-5xl md:text-7xl font-heading font-bold text-foreground mb-6"
            >
              Bridging Dreams to <span className="text-primary">Reality</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8"
            >
              UniBridge is more than a platform—it's a movement to democratize access to
              career-building opportunities for students worldwide.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Button size="lg" onClick={() => navigate("/auth")}>Join Our Community</Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/contact")}>Contact Us</Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow duration-300 border-border/50">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center mx-auto mb-4`}
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <stat.icon className="w-7 h-7" />
                    </motion.div>
                    <h3 className="text-3xl font-bold text-foreground mb-1">{stat.value}</h3>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              {...fadeLeft}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-heading font-bold text-foreground mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                We believe that talent is universal, but opportunity is not. Our mission is to bridge
                this gap by connecting ambitious students with meaningful internship opportunities
                that shape their future careers.
              </p>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Founded in 2020 and headquartered at SLIIT Malabe Campus in Sri Lanka, we've helped thousands of students
                from diverse backgrounds find their dream opportunities and assisted companies in discovering
                top talent from universities across the nation.
              </p>
              <motion.div
                className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Quote className="w-10 h-10 text-primary/40 shrink-0" />
                <p className="text-foreground italic">"Every student deserves a chance to prove their potential."</p>
              </motion.div>
            </motion.div>

            <motion.div
              {...fadeRight}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6 mt-12">
                  {[
                    { src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop", alt: "Students collaborating", h: "h-52" },
                    { src: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=200&fit=crop", alt: "University campus", h: "h-36" },
                  ].map((img, i) => (
                    <motion.div
                      key={i}
                      className={`${img.h} rounded-2xl overflow-hidden shadow-lg`}
                      whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
                      transition={{ duration: 0.3 }}
                    >
                      <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                    </motion.div>
                  ))}
                </div>
                <div className="space-y-6">
                  {[
                    { src: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=200&fit=crop", alt: "Team meeting", h: "h-36" },
                    { src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=300&fit=crop", alt: "Students learning", h: "h-52" },
                  ].map((img, i) => (
                    <motion.div
                      key={i}
                      className={`${img.h} rounded-2xl overflow-hidden shadow-lg`}
                      whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
                      transition={{ duration: 0.3 }}
                    >
                      <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-heading font-bold text-foreground mb-4">Our Core Values</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide every decision we make
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow duration-300 border-border/50">
                  <CardContent className="p-6">
                    <motion.div
                      className={`w-12 h-12 rounded-xl ${value.color} flex items-center justify-center mb-4`}
                      whileHover={{ rotate: 15, scale: 1.15 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <value.icon className="w-6 h-6" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-heading font-bold text-foreground mb-4">Our Journey</h2>
            <p className="text-xl text-muted-foreground">Milestones that mark our growth</p>
          </motion.div>

          <div className="relative">
            <motion.div
              className="absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-border"
              initial={{ height: 0 }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative flex items-center mb-8 ${
                  index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                }`}
              >
                <div className={`w-1/2 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"}`}>
                  <motion.div whileHover={{ scale: 1.04 }} transition={{ duration: 0.2 }}>
                    <Card className="inline-block border-border/50 hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <span className="text-primary font-bold text-lg">{milestone.year}</span>
                        <h3 className="font-semibold text-foreground">{milestone.title}</h3>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
                <motion.div
                  className="absolute left-1/2 transform -translate-x-1/2 w-5 h-5 bg-primary rounded-full border-4 border-background z-10"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 + 0.3, type: "spring", stiffness: 300 }}
                  whileHover={{ scale: 1.5 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-heading font-bold text-foreground mb-4">Meet Our Team</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The passionate people behind UniBridge
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                className="text-center group"
              >
                <motion.div
                  className={`w-28 h-28 rounded-full ${member.color} mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden`}
                  whileHover={{ scale: 1.12, boxShadow: "0 12px 32px rgba(0,0,0,0.2)" }}
                  transition={{ type: "spring", stiffness: 250 }}
                >
                  {member.photo ? (
                    <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    member.initials
                  )}
                </motion.div>
                <h3 className="text-xl font-semibold text-foreground">{member.name}</h3>
                <p className="text-primary font-medium mb-2">{member.role}</p>
                <p className="text-muted-foreground text-sm">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-accent p-12 text-center"
            whileHover={{ scale: 1.01 }}
          >
            <motion.div
              className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"
              animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
              transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
            />
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Join thousands of students and companies already using UniBridge to connect
                and create meaningful opportunities.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" variant="secondary" onClick={() => navigate("/auth")}>Get Started Free</Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" onClick={() => navigate("/contact")}>Talk to Us</Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;