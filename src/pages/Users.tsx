
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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

const USER_ROLES = [
  { id: "owner", name: "Pemilik Toko" },
  { id: "warehouse_admin", name: "Admin Gudang" },
  { id: "cashier", name: "Kasir" },
];

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: string;
}

// Format date to locale string
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getRoleName = (roleId: string) => {
  const role = USER_ROLES.find(r => r.id === roleId);
  return role ? role.name : roleId;
};

const Users = () => {
  const [users, setUsers] = useState(DEMO_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<typeof DEMO_USERS[0] | null>(null);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddUser = () => {
    // Simple validation
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      toast({
        title: "Validasi Gagal",
        description: "Semua field harus diisi",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validasi Gagal",
        description: "Format email tidak valid",
        variant: "destructive",
      });
      return;
    }

    // Add new user (would connect to Supabase in production)
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
    if (!currentUser) return;

    // Simple validation
    if (!formData.name || !formData.email || !formData.role) {
      toast({
        title: "Validasi Gagal",
        description: "Nama, email, dan role harus diisi",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validasi Gagal",
        description: "Format email tidak valid",
        variant: "destructive",
      });
      return;
    }

    // Update user (would connect to Supabase in production)
    setUsers((prev) =>
      prev.map((user) => {
        if (user.id === currentUser.id) {
          return {
            ...user,
            name: formData.name,
            email: formData.email,
            role: formData.role,
            // Only update password if provided
            ...(formData.password ? { password: formData.password } : {}),
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
    // Toggle user active status (would connect to Supabase in production)
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

  const openEditDialog = (user: typeof DEMO_USERS[0]) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // Don't show existing password
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
            className="pos-btn flex items-center gap-2"
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

        <div className="rounded-md border shadow">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Peran</TableHead>
                  <TableHead>Login Terakhir</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleName(user.role)}</TableCell>
                      <TableCell>{user.lastLogin ? formatDate(user.lastLogin) : "Belum login"}</TableCell>
                      <TableCell>
                        <span
                          className={`rounded px-2 py-1 text-xs font-semibold ${
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(user)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant={user.isActive ? "destructive" : "outline"}
                            onClick={() => toggleUserStatus(user.id)}
                          >
                            {user.isActive ? "Nonaktifkan" : "Aktifkan"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      Tidak ada data pengguna yang ditemukan
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Pengguna Baru</DialogTitle>
          </DialogHeader>
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Masukkan password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Peran</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleSelectChange("role", value)}
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
          <DialogFooter className="flex space-x-2 justify-end">
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button onClick={handleAddUser} className="bg-primary hover:bg-primary-dark text-secondary-foreground">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Masukkan nama lengkap"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Password (Kosongkan jika tidak diubah)</Label>
              <Input
                id="edit-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Masukkan password baru"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Peran</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleSelectChange("role", value)}
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
          <DialogFooter className="flex space-x-2 justify-end">
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button onClick={handleEditUser} className="bg-primary hover:bg-primary-dark text-secondary-foreground">Perbarui</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Users;
