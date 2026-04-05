import { Search, Building2, MapPin, Users, Calendar, Star } from "lucide-react";
import { useState } from "react";

const Companies = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const companies = [
    {
      id: 1,
      name: "Google",
      logo: "🏢",
      industry: "Technology",
      location: "Mountain View, CA",
      employees: "10,000+",
      internships: 15,
      rating: 4.8,
      description: "Leading technology company offering innovative internship programs"
    },
    {
      id: 2,
      name: "Microsoft",
      logo: "🏢",
      industry: "Technology",
      location: "Redmond, WA",
      employees: "8,000+",
      internships: 12,
      rating: 4.7,
      description: "Global software giant with comprehensive internship opportunities"
    },
    {
      id: 3,
      name: "Amazon",
      logo: "🏢",
      industry: "E-commerce",
      location: "Seattle, WA",
      employees: "15,000+",
      internships: 18,
      rating: 4.6,
      description: "World's largest online retailer offering diverse internship programs"
    },
    {
      id: 4,
      name: "Meta",
      logo: "🏢",
      industry: "Technology",
      location: "Menlo Park, CA",
      employees: "5,000+",
      internships: 8,
      rating: 4.5,
      description: "Building the future of social media and virtual reality"
    },
    {
      id: 5,
      name: "Apple",
      logo: "🏢",
      industry: "Technology",
      location: "Cupertino, CA",
      employees: "7,000+",
      internships: 10,
      rating: 4.7,
      description: "Innovative technology company creating revolutionary products"
    },
    {
      id: 6,
      name: "Netflix",
      logo: "🏢",
      industry: "Entertainment",
      location: "Los Gatos, CA",
      employees: "3,000+",
      internships: 6,
      rating: 4.4,
      description: "Streaming entertainment leader with creative internship programs"
    }
  ];

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
            Partner Companies
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Discover amazing companies offering opportunities for talented students
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search companies by name, industry, or location..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <h3 className="text-2xl font-bold text-foreground">500+</h3>
              <p className="text-muted-foreground">Partner Companies</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">50+</h3>
              <p className="text-muted-foreground">Industries</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">100+</h3>
              <p className="text-muted-foreground">Countries</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">15K+</h3>
              <p className="text-muted-foreground">Internships</p>
            </div>
          </div>
        </div>
      </section>

      {/* Companies Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-foreground">
              {searchQuery ? `Search Results (${filteredCompanies.length})` : "Featured Companies"}
            </h2>
            <p className="text-muted-foreground">
              {searchQuery 
                ? `Showing companies matching "${searchQuery}"`
                : "Discover companies offering great internship opportunities"
              }
            </p>
          </div>

          {filteredCompanies.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No companies found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search query or browse all companies
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company) => (
                <div 
                  key={company.id} 
                  className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
                      {company.logo}
                    </div>
                    <div className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                      <Star className="w-4 h-4 mr-1" />
                      {company.rating}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-2">{company.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{company.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Building2 className="w-4 h-4 mr-2" />
                      {company.industry}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      {company.location}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-2" />
                      {company.employees} employees
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      {company.internships} active internships
                    </div>
                  </div>
                  
                  <button className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    View Internships
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">
            Are you a company looking to hire interns?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join our platform to connect with talented students from universities worldwide
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary-foreground text-primary px-8 py-3 rounded-lg font-medium hover:bg-primary-foreground/90 transition-colors">
              Post Internships
            </button>
            <button className="border border-primary-foreground text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary-foreground/10 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Companies;