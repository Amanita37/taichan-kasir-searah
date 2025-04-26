
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import UserTable from "@/components/users/UserTable";
import UserSearch from "@/components/users/UserSearch";
import UserDialogs from "@/components/users/UserDialogs";
import { useUsers } from "@/hooks/useUsers";
import { type User } from "@/types/user";
import ErrorBoundary from "@/components/ErrorBoundary";

const Users = () => {
  const { 
    users, 
    searchQuery, 
    setSearchQuery, 
    addUser, 
    updateUser, 
    toggleUserStatus,
    isLoading,
    deleteUser
  } = useUsers();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Remove Diana Putri on component mount
  useEffect(() => {
    const removeDianaUser = async () => {
      if (users) {
        const diana = users.find(user => user.name === "Diana Putri");
        if (diana) {
          try {
            await deleteUser(diana.id);
            console.log("Diana Putri removed");
          } catch (error) {
            console.error("Error removing Diana Putri:", error);
          }
        }
      }
    };
    
    removeDianaUser();
  }, [users, deleteUser]);

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setIsEditDialogOpen(true);
  };

  // Add keyboard shortcut for opening add user dialog
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "n" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsAddDialogOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <ErrorBoundary>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-semibold">Manajemen Pengguna</h1>
            <Button 
              className="flex items-center gap-2"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
              Tambah Pengguna (Ctrl+N)
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <UserSearch value={searchQuery} onChange={setSearchQuery} />
          </div>

          <UserTable 
            users={users}
            onEditUser={handleEditUser}
            onToggleStatus={toggleUserStatus}
            onDeleteUser={deleteUser}
            isLoading={isLoading}
          />
        </div>

        <UserDialogs
          isAddDialogOpen={isAddDialogOpen}
          isEditDialogOpen={isEditDialogOpen}
          currentUser={currentUser}
          onCloseAddDialog={() => setIsAddDialogOpen(false)}
          onCloseEditDialog={() => setIsEditDialogOpen(false)}
          onAddUser={addUser}
          onUpdateUser={(formData) => updateUser(currentUser?.id || 0, formData)}
        />
      </DashboardLayout>
    </ErrorBoundary>
  );
};

export default Users;
