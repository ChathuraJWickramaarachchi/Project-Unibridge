export interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "Remote" | "On-site" | "Hybrid";
  category: string;
  duration: string;
  stipend: string;
  posted: string;
  logo: string;
  description: string;
  skills: string[];
}

export const internships: Internship[] = [
  {
    id: "1",
    title: "Frontend Developer Intern",
    company: "TechVista Solutions",
    location: "San Francisco, CA",
    type: "Remote",
    category: "Software Engineering",
    duration: "3 months",
    stipend: "$1,500/mo",
    posted: "2 days ago",
    logo: "TV",
    description: "Join our frontend team to build beautiful, responsive web applications using React and TypeScript.",
    skills: ["React", "TypeScript", "CSS"],
  },
  {
    id: "2",
    title: "Data Science Intern",
    company: "DataFlow Analytics",
    location: "New York, NY",
    type: "Hybrid",
    category: "Data Science",
    duration: "6 months",
    stipend: "$2,000/mo",
    posted: "1 day ago",
    logo: "DA",
    description: "Analyze large datasets and build machine learning models to derive business insights.",
    skills: ["Python", "SQL", "Machine Learning"],
  },
  {
    id: "3",
    title: "Marketing Intern",
    company: "BrandSpark Agency",
    location: "Chicago, IL",
    type: "On-site",
    category: "Marketing",
    duration: "4 months",
    stipend: "$1,200/mo",
    posted: "3 days ago",
    logo: "BS",
    description: "Help create compelling marketing campaigns and manage social media content strategies.",
    skills: ["Social Media", "Content Writing", "Analytics"],
  },
  {
    id: "4",
    title: "UX/UI Design Intern",
    company: "PixelCraft Studios",
    location: "Austin, TX",
    type: "Remote",
    category: "Design",
    duration: "3 months",
    stipend: "$1,400/mo",
    posted: "5 days ago",
    logo: "PC",
    description: "Design intuitive user interfaces and conduct user research for mobile and web products.",
    skills: ["Figma", "User Research", "Prototyping"],
  },
  {
    id: "5",
    title: "Backend Engineer Intern",
    company: "CloudNine Systems",
    location: "Seattle, WA",
    type: "Hybrid",
    category: "Software Engineering",
    duration: "6 months",
    stipend: "$2,200/mo",
    posted: "1 week ago",
    logo: "CN",
    description: "Build scalable APIs and microservices using Node.js and cloud infrastructure.",
    skills: ["Node.js", "AWS", "PostgreSQL"],
  },
  {
    id: "6",
    title: "Finance Intern",
    company: "CapitalEdge Partners",
    location: "Boston, MA",
    type: "On-site",
    category: "Finance",
    duration: "3 months",
    stipend: "$1,800/mo",
    posted: "4 days ago",
    logo: "CE",
    description: "Assist in financial modeling, market research, and investment analysis for portfolio management.",
    skills: ["Excel", "Financial Modeling", "Research"],
  },
];

export const categories = [
  "All",
  "Software Engineering",
  "Data Science",
  "Marketing",
  "Design",
  "Finance",
];

export const types = ["All", "Remote", "On-site", "Hybrid"];
