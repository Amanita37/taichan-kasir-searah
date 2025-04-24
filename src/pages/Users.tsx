import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Search, UserPlus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import UserTable from "@/components/users/UserTable";
import UserForm from "@/components/users/UserForm";
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

const Users = () => {
  const [users, setUsers] = useState(DEMO_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getRoleName(user.role).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "",
    });
  };

  const handleFormChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.role || (!currentUser && !formData.password)) {
      toast({
        title: "Validasi Gagal",
        description: currentUser
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

  const handleAddUser = () => {
    if (!validateForm()) return;

    const newUser = {
      id: users.length + 1,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      lastLogin: null,
      isActive: true,
    };

    setUsers((prev) => [...prev, newUser]);
    setIsAddDialogOpen(false);
    resetForm();
    
    toast({
      title: "Pengguna Ditambahkan",
      description: `${formData.name} berhasil ditambahkan sebagai ${getRoleName(formData.role)}.`,
    });
  };

  const handleEditUser = () => {
    if (!currentUser || !validateForm()) return;

    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === currentUser.id) {
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

    setIsEditDialogOpen(false);
    resetForm();
    
    toast({
      title: "Pengguna Diperbarui",
      description: `Informasi ${formData.name} berhasil diperbarui.`,
    });
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

  const openEditDialog = (user: User) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold">Manajemen Pengguna</h1>
          <Button 
            className="flex items-center gap-2"
            onClick={() => {
              resetForm();
              setIsAddDialogOpen(true);
            }}
          >
            <UserPlus className="h-4 w-4" />
            Tambah Pengguna
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Cari nama, email, atau peran..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <UserTable 
          users={filteredUsers}
          onEditUser={openEditDialog}
          onToggleStatus={toggleUserStatus}
        />
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Pengguna Baru</DialogTitle>
          </DialogHeader>
          <UserForm 
            formData={formData}
            onChange={handleFormChange}
          />
          <DialogFooter className="flex space-x-2 justify-end">
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button onClick={handleAddUser}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
          </DialogHeader>
          <UserForm 
            formData={formData}
            isEdit
            onChange={handleFormChange}
          />
          <DialogFooter className="flex space-x-2 justify-end">
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button onClick={handleEditUser}>Perbarui</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Users;
