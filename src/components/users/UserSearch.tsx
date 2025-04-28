
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface UserSearchProps {
  value: string;
  onChange: (value: string) => void;
  query?: string;
  onQueryChange?: (value: string) => void;
}

const UserSearch = ({ value, onChange, query, onQueryChange }: UserSearchProps) => {
  // Use either the new props (query/onQueryChange) or the old props (value/onChange)
  const searchValue = query !== undefined ? query : value;
  const handleChange = onQueryChange || onChange;
  
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      <Input
        placeholder="Cari nama, email, atau peran..."
        className="pl-9"
        value={searchValue}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  );
};

export default UserSearch;
