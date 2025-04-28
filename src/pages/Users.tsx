
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import UserTable from "@/components/users/UserTable";
import UserSearch from "@/components/users/UserSearch";
import UserDialogs from "@/components/users/UserDialogs";
import { UserFormData } from "@/types/user";
import { useUsers } from "@/hooks/useUsers";

const Users = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    fetchUsers,
    searchQuery,
    setSearchQuery,
    addUser,
    updateUser,
    toggleUserStatus
  } = useUsers();
  
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const users = await fetchUsers();
      setUsersList(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (formData: UserFormData) => {
    try {
      const result = await addUser(formData);
      if (result) {
        setIsAddDialogOpen(false);
        toast({
          title: "Success",
          description: "User added successfully",
        });
        loadUsers();
      }
      return result;
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add user",
      });
      return false;
    }
  };

  const handleEditUser = async (formData: UserFormData) => {
    if (!currentUser) return false;
    
    try {
      const result = await updateUser(currentUser.id, formData);
      if (result) {
        setIsEditDialogOpen(false);
        toast({
          title: "Success",
          description: "User updated successfully",
        });
        loadUsers();
      }
      return result;
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update user",
      });
      return false;
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await toggleUserStatus(id);
      setIsDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
      loadUsers();
      return true;
    } catch (error) {
      console.error("Error updating user status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update user status",
      });
      return false;
    }
  };

  const editUser = (user: any) => {
    setCurrentUser(user);
    setIsEditDialogOpen(true);
  };

  const confirmDelete = (user: any) => {
    setCurrentUser(user);
    setIsDeleteDialogOpen(true);
  };

  // Filter users based on search query
  const filteredUsers = usersList.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <h1 className="text-2xl font-bold">User Management</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>Add User</Button>
        </div>

        <UserSearch 
          query={searchQuery}
          onQueryChange={setSearchQuery}
        />

        <UserTable 
          users={filteredUsers}
          isLoading={isLoading}
          onEditUser={editUser}
          onDeleteUser={confirmDelete}
        />

        <UserDialogs
          isAddDialogOpen={isAddDialogOpen}
          setIsAddDialogOpen={setIsAddDialogOpen}
          isEditDialogOpen={isEditDialogOpen}
          setIsEditDialogOpen={setIsEditDialogOpen}
          isDeleteDialogOpen={isDeleteDialogOpen}
          setIsDeleteDialogOpen={setIsDeleteDialogOpen}
          currentUser={currentUser}
          onAddUser={handleAddUser}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
        />
      </div>
    </DashboardLayout>
  );
};

export default Users;
