import { MapPin, Clock, DollarSign, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Internship } from "@/data/internships";

interface InternshipCardProps {
  internship: Internship;
}

const typeColors: Record<string, string> = {
  Remote: "bg-success/10 text-success border-success/20",
  "On-site": "bg-info/10 text-info border-info/20",
  Hybrid: "bg-accent/10 text-accent border-accent/20",
};

const InternshipCard = ({ internship }: InternshipCardProps) => {
  return (
    <div className="group bg-card rounded-xl border border-border p-6 hover:shadow-lg hover:border-accent/30 transition-all duration-300 cursor-pointer">
      <div className="flex items-start gap-4">
        {/* Company logo */}
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-sm font-heading font-bold text-primary">{internship.logo}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-heading font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-1">
                {internship.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">{internship.company}</p>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${typeColors[internship.type]}`}>
              {internship.type}
            </span>
          </div>

          <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{internship.description}</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {internship.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {internship.duration}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              {internship.stipend}
            </span>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex flex-wrap gap-1.5">
              {internship.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs font-normal">
                  {skill}
                </Badge>
              ))}
            </div>
            <span className="text-xs text-muted-foreground shrink-0 ml-2">{internship.posted}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipCard;
