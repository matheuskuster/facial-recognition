'use client';

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';

import { FileDropzone } from './file-dropzone';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { api } from '@/services/api';

export type Attendance = {
  id: string;
  classId: string;
  date: Date;
  photoUrl: string;
};

export const columns: ColumnDef<Attendance>[] = [
  {
    accessorKey: 'classId',
    header: 'ID Turma',
    cell: ({ row }) => <p className="capitalize font-bold ">{row.getValue('classId')}</p>,
  },
  {
    accessorKey: 'date',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Data
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.original.date;

      return (
        <div className="flex items-center space-x-2">
          <Avatar className="w-10 h-10">
            <AvatarImage src={row.original.photoUrl} alt="Foto" className="object-cover" />
            <AvatarFallback>{String(date)}</AvatarFallback>
          </Avatar>
          <div>{row.getValue('name')}</div>
        </div>
      );
    },
    filterFn: (row, _, value) => {
      const { date, classId } = row.original;
      const concat = `${date}${classId}`.toLowerCase();
      return concat.includes(value.toLowerCase());
    },
  },
];

type AttendancesTableProps = {
  attendances: Attendance[];
};

export function AttendancesTable({ attendances }: AttendancesTableProps) {
  const router = useRouter();
  const [isAddingAttendance, setIsAddingAttendance] = React.useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

  const [newAttendance, setNewAttendance] = React.useState<{
    classId: string;
    date: string;
    photo: File | null;
  }>({
    classId: '',
    date: '',
    photo: null,
  });

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: attendances,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const createAttendance = async () => {
    if (!newAttendance.classId || !newAttendance.date || !newAttendance.photo) {
      toast.warning('Preencha todos os campos');
      return;
    }

    setIsAddingAttendance(true);

    const formData = new FormData();
    formData.append('classId', newAttendance.classId);
    formData.append('date', newAttendance?.date);
    formData.append('photo', newAttendance.photo);

    try {
      await api.post('/attendances', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Presença adicionada com sucesso');

      setNewAttendance({
        classId: '',
        date: '',
        photo: null,
      });

      setIsCreateDialogOpen(false);

      router.refresh();
    } catch {
      toast.error('Erro ao adicionar Presença');
    } finally {
      setIsAddingAttendance(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Buscar Presenças..."
          value={(table.getColumn('classId')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('classId')?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />

        <Dialog onOpenChange={setIsCreateDialogOpen} open={isCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="ml-auto">
              <Plus className="h-6 w-6 mr-2" />
              Adicionar Presença
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar Presença</DialogTitle>
              <DialogDescription>
                Preencha os campos abaixo para adicionar uma nova Presença.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  ID Turma
                </Label>
                <Input
                  id="classId"
                  placeholder="0a0a0a-0a0a0a0a-0a0a0a0a-0a0a0a0"
                  className="col-span-3"
                  value={newAttendance?.classId}
                  onChange={(event) =>
                    setNewAttendance((prev) => ({ ...prev, classId: event.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="registration" className="text-right">
                  Data
                </Label>
                <Input
                  id="date"
                  placeholder="2024-03-21"
                  className="col-span-3"
                  value={newAttendance?.date}
                  onChange={(event) =>
                    setNewAttendance((prev) => ({ ...prev, date: event.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="photo" className="text-right">
                  Imagem
                </Label>
                <div className="col-span-3">
                  {newAttendance.photo ? (
                    <div className="flex items-center">
                      <img
                        src={URL.createObjectURL(newAttendance.photo)}
                        alt="Foto da Turma"
                        className="w-24 h-24 rounded-full"
                      />

                      <Button
                        variant="outline"
                        onClick={() => setNewAttendance((prev) => ({ ...prev, photo: null }))}
                        className="ml-4"
                      >
                        Alterar
                      </Button>
                    </div>
                  ) : (
                    <FileDropzone
                      onDrop={(files) => {
                        setNewAttendance((prev) => ({ ...prev, photo: files[0] }));
                      }}
                      multiple={false}
                    />
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button disabled={isAddingAttendance} onClick={createAttendance} type="submit">
                Adicionar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Sem resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
