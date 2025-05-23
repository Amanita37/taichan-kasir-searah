
import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import UserForm from "./UserForm";
import { type User, type UserFormData } from "@/types/user";

interface UserDialogsProps {
  isAddDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen?: boolean;
  currentUser: User | null;
  onCloseAddDialog: () => void;
  onCloseEditDialog: () => void;
  onCloseDeleteDialog?: () => void;
  onAddUser: (formData: UserFormData) => Promise<boolean>;
  onUpdateUser: (formData: UserFormData) => Promise<boolean>;
  onDeleteUser?: (id: string) => Promise<boolean>; // Changed from number | string to string
}

const UserDialogs = ({
  isAddDialogOpen,
  isEditDialogOpen,
  isDeleteDialogOpen = false,
  currentUser,
  onCloseAddDialog,
  onCloseEditDialog,
  onCloseDeleteDialog = () => {},
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}: UserDialogsProps) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    password: "",
    role: currentUser?.role || "",
  });

  const handleFormChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddUser = async () => {
    const success = await onAddUser(formData);
    if (success) {
      onCloseAddDialog();
      setFormData({ name: "", email: "", password: "", role: "" });
    }
  };

  const handleUpdateUser = async () => {
    const success = await onUpdateUser(formData);
    if (success) {
      onCloseEditDialog();
      setFormData({ name: "", email: "", password: "", role: "" });
    }
  };

  const handleDeleteUser = async () => {
    if (onDeleteUser && currentUser) {
      const success = await onDeleteUser(currentUser.id);
      if (success && onCloseDeleteDialog) {
        onCloseDeleteDialog();
      }
    }
  };

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      if (isAddDialogOpen) handleAddUser();
      if (isEditDialogOpen) handleUpdateUser();
    }
  }, [isAddDialogOpen, isEditDialogOpen]);

  return (
    <>
      <Dialog open={isAddDialogOpen} onOpenChange={onCloseAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Pengguna Baru</DialogTitle>
            <DialogDescription>
              Tekan Ctrl+Enter untuk menyimpan
            </DialogDescription>
          </DialogHeader>
          <UserForm formData={formData} onChange={handleFormChange} />
          <DialogFooter className="flex space-x-2 justify-end">
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button onClick={handleAddUser}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={onCloseEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
            <DialogDescription>
              Tekan Ctrl+Enter untuk menyimpan
            </DialogDescription>
          </DialogHeader>
          <UserForm formData={formData} isEdit onChange={handleFormChange} />
          <DialogFooter className="flex space-x-2 justify-end">
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button onClick={handleUpdateUser}>Perbarui</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {onDeleteUser && (
        <Dialog open={!!isDeleteDialogOpen} onOpenChange={onCloseDeleteDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Konfirmasi Hapus Pengguna</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus pengguna ini?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex space-x-2 justify-end">
              <DialogClose asChild>
                <Button variant="outline">Batal</Button>
              </DialogClose>
              <Button onClick={handleDeleteUser} variant="destructive">Hapus</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default UserDialogs;
