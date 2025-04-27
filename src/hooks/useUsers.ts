
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { type User, type UserFormData, getRoleName } from "@/types/user";

export const useUsers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return profiles.map(profile => ({
        id: profile.id,
        name: profile.full_name,
        email: "",  // Email is not stored in profiles table for security
        role: profile.role,
        lastLogin: null,
        isActive: profile.active
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  };

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
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          },
        },
      });

      if (signUpError) throw signUpError;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ role: formData.role })
        .eq("id", data.user?.id);

      if (updateError) throw updateError;

      toast({
        title: "Pengguna Ditambahkan",
        description: `${formData.name} berhasil ditambahkan sebagai ${getRoleName(formData.role)}.`,
      });
      
      return true;
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        title: "Gagal Menambahkan Pengguna",
        description: error.message || "Terjadi kesalahan saat menambahkan pengguna",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userId: string, formData: UserFormData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.name,
          role: formData.role,
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Pengguna Diperbarui",
        description: `Informasi ${formData.name} berhasil diperbarui.`,
      });

      return true;
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Gagal Memperbarui Pengguna",
        description: error.message || "Terjadi kesalahan saat memperbarui pengguna",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserStatus = async (id: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { data: currentProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("active, full_name")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ active: !currentProfile.active })
        .eq("id", id);

      if (updateError) throw updateError;

      toast({
        title: currentProfile.active ? "Pengguna Dinonaktifkan" : "Pengguna Diaktifkan",
        description: `${currentProfile.full_name} telah ${currentProfile.active ? "dinonaktifkan" : "diaktifkan"}.`,
      });
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast({
        title: "Gagal Mengubah Status",
        description: error.message || "Terjadi kesalahan saat mengubah status pengguna",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchUsers,
    searchQuery,
    setSearchQuery,
    addUser,
    updateUser,
    toggleUserStatus,
    isLoading,
  };
};
