
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Search, Clock, Calendar, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

// Demo shift data (would come from Supabase in production)
const DEMO_SHIFTS = [
  {
    id: "SHIFT-001",
    staffName: "John Doe",
    startTime: "2025-04-24T08:00:00",
    endTime: "2025-04-24T16:00:00",
    status: "closed",
    startingCash: 500000,
    endingCash: 1250000,
    totalSales: 750000,
    totalTransactions: 15,
  },
  {
    id: "SHIFT-002",
    staffName: "Jane Smith",
    startTime: "2025-04-24T16:00:00",
    endTime: "2025-04-24T23:00:00",
    status: "closed",
    startingCash: 1000000,
    endingCash: 1850000,
    totalSales: 850000,
    totalTransactions: 18,
  },
  {
    id: "SHIFT-003",
    staffName: "John Doe",
    startTime: "2025-04-25T08:00:00",
    endTime: null,
    status: "active",
    startingCash: 500000,
    endingCash: null,
    totalSales: 350000,
    totalTransactions: 7,
  },
];

// Format date to locale string
const formatDate = (dateString: string | null) => {
  if (!dateString) return "Belum selesai";
  return new Date(dateString).toLocaleString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (amount: number | null): string => {
  if (amount === null) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const Shift = () => {
  const [shifts, setShifts] = useState(DEMO_SHIFTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [isStartShiftDialogOpen, setIsStartShiftDialogOpen] = useState(false);
  const [isEndShiftDialogOpen, setIsEndShiftDialogOpen] = useState(false);
  const [isViewShiftDialogOpen, setIsViewShiftDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<typeof DEMO_SHIFTS[0] | null>(null);
  const { toast } = useToast();
  
  const [startShiftData, setStartShiftData] = useState({
    staffName: "",
    startingCash: "",
    notes: ""
  });
  
  const [endShiftData, setEndShiftData] = useState({
    endingCash: "",
    notes: ""
  });

  const hasActiveShift = shifts.some(shift => shift.status === "active");

  const filteredShifts = shifts.filter(
    (shift) =>
      shift.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shift.staffName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartShift = () => {
    // Simple validation
    if (!startShiftData.staffName || !startShiftData.startingCash) {
      toast({
        title: "Validasi Gagal",
        description: "Nama staff dan kas awal harus diisi",
        variant: "destructive",
      });
      return;
    }

    // Create new shift (would connect to Supabase in production)
    const newShift = {
      id: `SHIFT-00${shifts.length + 1}`,
      staffName: startShiftData.staffName,
      startTime: new Date().toISOString(),
      endTime: null,
      status: "active",
      startingCash: parseFloat(startShiftData.startingCash),
      endingCash: null,
      totalSales: 0,
      totalTransactions: 0,
    };

    setShifts([...shifts, newShift]);
    setIsStartShiftDialogOpen(false);
    setStartShiftData({
      staffName: "",
      startingCash: "",
      notes: ""
    });
    
    toast({
      title: "Shift Dimulai",
      description: `Shift untuk ${startShiftData.staffName} berhasil dimulai.`,
    });
  };

  const handleEndShift = () => {
    // Simple validation
    if (!endShiftData.endingCash) {
      toast({
        title: "Validasi Gagal",
        description: "Kas akhir harus diisi",
        variant: "destructive",
      });
      return;
    }

    // Update active shift (would connect to Supabase in production)
    const updatedShifts = shifts.map(shift => {
      if (shift.status === "active") {
        return {
          ...shift,
          endTime: new Date().toISOString(),
          endingCash: parseFloat(endShiftData.endingCash),
          status: "closed",
          // In a real app, totalSales would be calculated from transactions
        };
      }
      return shift;
    });

    setShifts(updatedShifts);
    setIsEndShiftDialogOpen(false);
    setEndShiftData({
      endingCash: "",
      notes: ""
    });
    
    toast({
      title: "Shift Berakhir",
      description: "Shift berhasil ditutup.",
    });
  };

  const viewShiftDetails = (shift: typeof DEMO_SHIFTS[0]) => {
    setSelectedShift(shift);
    setIsViewShiftDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-semibold">Manajemen Shift</h1>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button 
              className="pos-btn flex items-center gap-2"
              onClick={() => setIsStartShiftDialogOpen(true)}
              disabled={hasActiveShift}
            >
              <Clock className="h-4 w-4" />
              Mulai Shift Baru
            </Button>
            <Button 
              className="pos-btn-secondary flex items-center gap-2"
              onClick={() => setIsEndShiftDialogOpen(true)}
              disabled={!hasActiveShift}
            >
              <FileText className="h-4 w-4" />
              Tutup Shift Aktif
            </Button>
          </div>
        </div>

        {/* Active Shift Status */}
        {hasActiveShift && (
          <Card className="bg-primary/10 border-primary">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h3 className="font-semibold text-lg flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-primary" />
                    Shift Aktif
                  </h3>
                  <p className="text-sm">
                    {shifts.find(s => s.status === "active")?.staffName} - 
                    Mulai: {formatDate(shifts.find(s => s.status === "active")?.startTime || "")}
                  </p>
                </div>
                <div className="mt-3 md:mt-0">
                  <p className="text-sm">
                    <span className="font-medium">Transaksi:</span> {shifts.find(s => s.status === "active")?.totalTransactions}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Penjualan: </span> 
                    {formatCurrency(shifts.find(s => s.status === "active")?.totalSales || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Cari shift berdasarkan ID atau staff..."
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
                  <TableHead>ID Shift</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Mulai</TableHead>
                  <TableHead>Selesai</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Kas Awal</TableHead>
                  <TableHead>Kas Akhir</TableHead>
                  <TableHead>Total Penjualan</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShifts.length > 0 ? (
                  filteredShifts.map((shift) => (
                    <TableRow key={shift.id}>
                      <TableCell className="font-medium">{shift.id}</TableCell>
                      <TableCell>{shift.staffName}</TableCell>
                      <TableCell>{formatDate(shift.startTime)}</TableCell>
                      <TableCell>{formatDate(shift.endTime)}</TableCell>
                      <TableCell>
                        <span
                          className={`rounded px-2 py-1 text-xs font-semibold ${
                            shift.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {shift.status === "active" ? "Aktif" : "Ditutup"}
                        </span>
                      </TableCell>
                      <TableCell>{formatCurrency(shift.startingCash)}</TableCell>
                      <TableCell>{formatCurrency(shift.endingCash)}</TableCell>
                      <TableCell>{formatCurrency(shift.totalSales)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8"
                          onClick={() => viewShiftDetails(shift)}
                        >
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-6 text-gray-500">
                      Tidak ada data shift yang ditemukan
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Start Shift Dialog */}
      <Dialog open={isStartShiftDialogOpen} onOpenChange={setIsStartShiftDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mulai Shift Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="staffName">Nama Staff</Label>
              <Input
                id="staffName"
                value={startShiftData.staffName}
                onChange={(e) => setStartShiftData({...startShiftData, staffName: e.target.value})}
                placeholder="Masukkan nama staff"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startingCash">Kas Awal</Label>
              <Input
                id="startingCash"
                type="number"
                value={startShiftData.startingCash}
                onChange={(e) => setStartShiftData({...startShiftData, startingCash: e.target.value})}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                value={startShiftData.notes}
                onChange={(e) => setStartShiftData({...startShiftData, notes: e.target.value})}
                placeholder="Catatan tambahan (opsional)"
              />
            </div>
          </div>
          <DialogFooter className="flex space-x-2 justify-end">
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button onClick={handleStartShift} className="bg-primary hover:bg-primary-dark text-secondary-foreground">Mulai Shift</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* End Shift Dialog */}
      <Dialog open={isEndShiftDialogOpen} onOpenChange={setIsEndShiftDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tutup Shift Aktif</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {shifts.find(s => s.status === "active") && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="font-medium">Shift: {shifts.find(s => s.status === "active")?.id}</p>
                <p className="text-sm">Staff: {shifts.find(s => s.status === "active")?.staffName}</p>
                <p className="text-sm">Mulai: {formatDate(shifts.find(s => s.status === "active")?.startTime || "")}</p>
                <p className="text-sm">Kas Awal: {formatCurrency(shifts.find(s => s.status === "active")?.startingCash || 0)}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="endingCash">Kas Akhir</Label>
              <Input
                id="endingCash"
                type="number"
                value={endShiftData.endingCash}
                onChange={(e) => setEndShiftData({...endShiftData, endingCash: e.target.value})}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endNotes">Catatan</Label>
              <Textarea
                id="endNotes"
                value={endShiftData.notes}
                onChange={(e) => setEndShiftData({...endShiftData, notes: e.target.value})}
                placeholder="Catatan tambahan (opsional)"
              />
            </div>
          </div>
          <DialogFooter className="flex space-x-2 justify-end">
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button onClick={handleEndShift} className="bg-primary hover:bg-primary-dark text-secondary-foreground">Tutup Shift</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Shift Dialog */}
      <Dialog open={isViewShiftDialogOpen} onOpenChange={setIsViewShiftDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Shift</DialogTitle>
          </DialogHeader>
          {selectedShift && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">ID Shift</p>
                  <p className="font-medium">{selectedShift.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                      selectedShift.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {selectedShift.status === "active" ? "Aktif" : "Ditutup"}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Staff</p>
                <p className="font-medium">{selectedShift.staffName}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Waktu Mulai</p>
                  <p>{formatDate(selectedShift.startTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Waktu Selesai</p>
                  <p>{formatDate(selectedShift.endTime)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Kas Awal</p>
                  <p className="font-medium">{formatCurrency(selectedShift.startingCash)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kas Akhir</p>
                  <p className="font-medium">{formatCurrency(selectedShift.endingCash)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Penjualan</p>
                  <p className="font-medium text-green-600">{formatCurrency(selectedShift.totalSales)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Transaksi</p>
                  <p className="font-medium">{selectedShift.totalTransactions}</p>
                </div>
              </div>
              
              {selectedShift.status === "closed" && (
                <div>
                  <p className="text-sm text-gray-500">Selisih Kas</p>
                  <p className={`font-medium ${
                    (selectedShift.endingCash || 0) - selectedShift.startingCash - selectedShift.totalSales === 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}>
                    {formatCurrency((selectedShift.endingCash || 0) - selectedShift.startingCash - selectedShift.totalSales)}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Shift;
