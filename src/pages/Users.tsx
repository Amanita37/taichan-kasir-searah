
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import UserTable from "@/components/users/UserTable";
import UserSearch from "@/components/users/UserSearch";
import UserDialogs from "@/components/users/UserDialogs";
import { useUsers } from "@/hooks/useUsers";
import { type User } from "@/types/user";

const Users = () => {
  const { users, searchQuery, setSearchQuery, addUser, updateUser, toggleUserStatus } = useUsers();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setIsEditDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold">Manajemen Pengguna</h1>
          <Button 
            className="flex items-center gap-2"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <UserPlus className="h-4 w-4" />
            Tambah Pengguna
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <UserSearch value={searchQuery} onChange={setSearchQuery} />
        </div>

        <UserTable 
          users={users}
          onEditUser={handleEditUser}
          onToggleStatus={toggleUserStatus}
        />
      </div>

      <UserDialogs
        isAddDialogOpen={isAddDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        currentUser={currentUser}
        onCloseAddDialog={() => setIsAddDialogOpen(false)}
        onCloseEditDialog={() => setIsEditDialogOpen(false)}
        onAddUser={addUser}
        onUpdateUser={(formData) => {
          if (currentUser) {
            updateUser(currentUser.id, formData);
          }
        }}
      />
    </DashboardLayout>
  );
};

export default Users;
