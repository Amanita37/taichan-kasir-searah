
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type UserFormData, USER_ROLES } from "@/types/user";

interface UserFormProps {
  formData: UserFormData;
  isEdit?: boolean;
  onChange: (name: string, value: string) => void;
}

const UserForm: React.FC<UserFormProps> = ({ formData, isEdit = false, onChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nama</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Masukkan nama lengkap"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="email@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">
          {isEdit ? "Password (Kosongkan jika tidak diubah)" : "Password"}
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder={isEdit ? "Masukkan password baru" : "Masukkan password"}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="role">Peran</Label>
        <Select
          value={formData.role}
          onValueChange={(value) => onChange("role", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih peran" />
          </SelectTrigger>
          <SelectContent>
            {USER_ROLES.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default UserForm;
