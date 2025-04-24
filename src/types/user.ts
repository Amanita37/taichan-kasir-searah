
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  lastLogin: string | null;
  isActive: boolean;
}

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: string;
}

export const USER_ROLES = [
  { id: "owner", name: "Pemilik Toko" },
  { id: "warehouse_admin", name: "Admin Gudang" },
  { id: "cashier", name: "Kasir" },
];

export const getRoleName = (roleId: string) => {
  const role = USER_ROLES.find(r => r.id === roleId);
  return role ? role.name : roleId;
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
