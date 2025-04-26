import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { type User, type UserFormData, getRoleName } from "@/types/user";
import { Key } from "lucide-react";

// Updated initial users data with Mario Rezo
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
    id: 5,
    name: "Mario Rezo",
    email: "riyo.rezo@gmail.com",
    role: "owner",
    lastLogin: "2025-04-26T10:00:00",
    isActive: true,
  }
];

export const useUsers = () => {
  const [users, setUsers] = useState(DEMO_USERS);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getRoleName(user.role).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const validateForm = (formData: UserFormData): boolean => {
    if (!formData.name || !formData.email || !formData.role) {
      toast({
        title: "Validasi Gagal",
        description: "Nama, email, dan role harus diisi",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.password && !formData) {
      toast({
        title: "Validasi Gagal",
        description: "Password harus diisi untuk pengguna baru",
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

  const addUser = async (formData: UserFormData): Promise<boolean> => {
    if (!validateForm(formData)) return false;
    
    setIsLoading(true);
    try {
      const newUser = {
        id: users.length + 1,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        lastLogin: null,
        isActive: true,
      };

      // Optimistic update
      setUsers((prev) => [...prev, newUser]);
      
      toast({
        title: "Pengguna Ditambahkan",
        description: `${formData.name} berhasil ditambahkan sebagai ${getRoleName(formData.role)}.`,
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Gagal Menambahkan Pengguna",
        description: "Terjadi kesalahan saat menambahkan pengguna",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userId: number, formData: UserFormData): Promise<boolean> => {
    if (!validateForm(formData)) return false;

    setIsLoading(true);
    try {
      // Optimistic update
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
    } catch (error) {
      toast({
        title: "Gagal Memperbarui Pengguna",
        description: "Terjadi kesalahan saat memperbarui pengguna",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (id: number): Promise<void> => {
    setIsLoading(true);
    try {
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
    } catch (error) {
      toast({
        title: "Gagal Mengubah Status",
        description: "Terjadi kesalahan saat mengubah status pengguna",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id: number): Promise<void> => {
    setIsLoading(true);
    try {
      setUsers((prev) => prev.filter((user) => user.id !== id));
      toast({
        title: "Pengguna Dihapus",
        description: "Pengguna berhasil dihapus.",
        duration: 1000,
      });
    } catch (error) {
      toast({
        title: "Gagal Menghapus Pengguna",
        description: "Terjadi kesalahan saat menghapus pengguna",
        variant: "destructive",
        duration: 1000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    users: filteredUsers,
    searchQuery,
    setSearchQuery,
    addUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    isLoading,
  };
};
