
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";

interface ProductSearchProps {
  searchQuery: string;
  category: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

const ProductSearch = ({
  searchQuery,
  category,
  onSearchChange,
  onCategoryChange,
  categories,
}: ProductSearchProps) => {
  return (
    <div className="space-y-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          placeholder="Cari produk..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <Tabs defaultValue={category} className="w-full">
        <TabsList className="w-full overflow-x-auto flex flex-nowrap justify-start">
          {categories.map((cat) => (
            <TabsTrigger
              key={cat}
              value={cat}
              onClick={() => onCategoryChange(cat)}
              className="whitespace-nowrap"
            >
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default ProductSearch;
