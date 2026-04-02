import { GraduationCap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-accent-foreground" />
              </div>
              <span className="font-heading font-bold text-lg">UniBridge</span>
            </div>
            <p className="text-sm text-primary-foreground/60">
              Connecting university students with meaningful internship opportunities worldwide.
            </p>
          </div>

          {[
            {
              title: "For Students",
              links: ["Browse Internships", "Career Resources", "Resume Builder", "Interview Tips"],
            },
            {
              title: "For Companies",
              links: ["Post Internship", "Talent Search", "Pricing", "Success Stories"],
            },
            {
              title: "Support",
              links: ["Help Center", "Contact Us", "Privacy Policy", "Terms of Service"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-heading font-semibold text-sm mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-primary-foreground/60 hover:text-accent transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-primary-foreground/10 mt-10 pt-6 text-center text-xs text-primary-foreground/40">
          © 2026 UniBridge. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
