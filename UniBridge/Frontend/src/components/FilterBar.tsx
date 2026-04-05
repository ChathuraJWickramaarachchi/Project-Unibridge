import { Button } from "@/components/ui/button";

interface FilterBarProps {
  categories: string[];
  types: string[];
  selectedCategory: string;
  selectedType: string;
  onCategoryChange: (cat: string) => void;
  onTypeChange: (type: string) => void;
}

const FilterBar = ({
  categories,
  types,
  selectedCategory,
  selectedType,
  onCategoryChange,
  onTypeChange,
}: FilterBarProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === cat
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="sm:ml-auto flex gap-2">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => onTypeChange(type)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
              selectedType === type
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted-foreground hover:border-foreground/30"
            }`}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
