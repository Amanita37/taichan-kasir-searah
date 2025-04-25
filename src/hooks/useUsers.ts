
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { type User, type UserFormData, getRoleName } from "@/types/user";

// Temporary user data (would come from Supabase)
const DEMO_USERS = [
  { 
    id: 1,
    name: "Andi Budi",
    email: "andi@example.com",
    role: "owner",
    lastLogin: "2025-04-23T15:20:00",
    isActive: true,
  },
  { 
    id: 2,
    name: "Siti Rahayu",
    email: "siti@example.com",
    role: "warehouse_admin",
    lastLogin: "2025-04-23T10:45:00",
    isActive: true,
  },
  { 
    id: 3,
    name: "Bambang Wijaya",
    email: "bambang@example.com",
    role: "cashier",
    lastLogin: "2025-04-24T09:15:00",
    isActive: true,
  },
  { 
    id: 4,
    name: "Diana Putri",
    email: "diana@example.com",
    role: "cashier",
    lastLogin: "2025-04-22T14:30:00",
    isActive: false,
  },
];

export const useUsers = () => {
  const [users, setUsers] = useState(DEMO_USERS);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getRoleName(user.role).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const validateForm = (formData: UserFormData) => {
    if (!formData.name || !formData.email || !formData.role || (!formData.password && !formData.id)) {
      toast({
        title: "Validasi Gagal",
        description: formData.id
          ? "Nama, email, dan role harus diisi"
          : "Semua field harus diisi",
        variant: "destructive",
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validasi Gagal",
        description: "Format email tidak valid",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const addUser = (formData: UserFormData) => {
    if (!validateForm(formData)) return false;

    const newUser = {
      id: users.length + 1,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      lastLogin: null,
      isActive: true,
    };

    setUsers((prev) => [...prev, newUser]);
    
    toast({
      title: "Pengguna Ditambahkan",
      description: `${formData.name} berhasil ditambahkan sebagai ${getRoleName(formData.role)}.`,
    });

    return true;
  };

  const updateUser = (userId: number, formData: UserFormData) => {
    if (!validateForm(formData)) return false;

    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === userId) {
          return {
            ...user,
            name: formData.name,
            email: formData.email,
            role: formData.role,
          };
        }
        return user;
      })
    );
    
    toast({
      title: "Pengguna Diperbarui",
      description: `Informasi ${formData.name} berhasil diperbarui.`,
    });

    return true;
  };

  const toggleUserStatus = (id: number) => {
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === id) {
          const newStatus = !user.isActive;
          toast({
            title: newStatus ? "Pengguna Diaktifkan" : "Pengguna Dinonaktifkan",
            description: `${user.name} telah ${newStatus ? "diaktifkan" : "dinonaktifkan"}.`,
          });
          return { ...user, isActive: newStatus };
        }
        return user;
      })
    );
  };

  return {
    users: filteredUsers,
    searchQuery,
    setSearchQuery,
    addUser,
    updateUser,
    toggleUserStatus,
  };
};
