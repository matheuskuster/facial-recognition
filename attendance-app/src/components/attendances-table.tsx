'use client';

import {
  ColumnDef,
  ColumnFiltersState,
  RowSelection,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, Plus } from 'lucide-react';
import { DateTime } from 'luxon';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import AsyncSelect from 'react-select/async';
import { toast } from 'sonner';

import { FileDropzone } from './file-dropzone';

import { Class as ClassType } from '@/components/classes-table';
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
  date: DateTime;
  photoUrl: string;
};

async function Classes(): Promise<ClassType[]> {
  try {
    const response = await api.get('/classes');
    return response.data.classes as ClassType[];
  } catch (error) {
    console.error('Failed to fetch classes', error);
    return [];
  }
}

const getClasses = async () => {
  const data = await Classes()
    .then((response) => 
    response.map((e) => ({ value: e.id, label: e.name })));
  return data;
};

const matchName = async (classId: any) => {
  const a = await getClasses()
  const name = a.map((object) => {
    if (object.value == classId) {
      return object.label;
    }});
  const index = name.filter((object) => object != undefined);
  return index[0] as string;
};

export const columns: ColumnDef<Attendance>[] = [
  {
    accessorKey: 'classId',
    header: 'Turma',
    cell: ({ row }) => {
      const className = matchName(row.original.classId).then((object) => {
        return object as string;
      });
      return <p className="capitalize font-bold ">{String(className)}</p>;
    },
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
      const stringDate = row.original.date as DateTime;
      const formattedDateTime = stringDate.toFormat('yyyy LLL dd');

      return (
        <div>
          <p className="flex items-center space-x-2">{formattedDateTime}</p>
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
    date: DateTime;
    photo: File | null;
  }>({
    classId: '',
    date: DateTime.now(),
    photo: null,
  });

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isClearable, setIsClearable] = React.useState(true);

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
    if (!newAttendance.classId || !newAttendance.photo) {
      toast.warning('Preencha todos os campos');
      return;
    }

    setIsAddingAttendance(true);

    const formData = new FormData();
    formData.append('classId', newAttendance.classId);
    formData.append('date', String(newAttendance?.date));
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
        date: DateTime.now(),
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
              <DialogTitle>Adicionar Chamada</DialogTitle>
              <DialogDescription>
                Preencha os campos abaixo para adicionar uma nova chamada.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Turma
                </Label>
                <AsyncSelect
                  className="col-span-3"
                  cacheOptions
                  isClearable={isClearable}
                  loadOptions={getClasses}
                  onInputChange={(data) => {
                    console.log(data);
                  }}
                  onChange={(event: any) =>
                    setNewAttendance((prev) => ({ ...prev, classId: event.value }))
                  }
                  defaultOptions
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
