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
import { ArrowUpDown, Plus, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';

import { FileDropzone } from './file-dropzone';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

import { Badge } from '@/components/ui/badge';
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

export type Student = {
  id: string;
  name: string;
  registration: string;
  photoUrl: string;
  classes: string[];
};

export const columns: ColumnDef<Student>[] = [
  {
    accessorKey: 'registration',
    header: 'Matrícula',
    cell: ({ row }) => <p className="capitalize font-bold ">{row.getValue('registration')}</p>,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="p-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const [firstName, lastName] = row.original.name.split(' ');

      const initials = !lastName
        ? `${firstName[0]}${firstName[1]}`
        : `${firstName[0]}${lastName[0]}`;

      return (
        <div className="flex items-center space-x-2">
          <Avatar className="w-10 h-10">
            <AvatarImage src={row.original.photoUrl} alt="Foto" className="object-cover" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>{row.getValue('name')}</div>
        </div>
      );
    },
    filterFn: (row, _, value) => {
      const { name, registration } = row.original;
      const concat = `${name}${registration}`.toLowerCase();
      return concat.includes(value.toLowerCase());
    },
  },
  {
    accessorKey: 'classes',
    header: 'Matérias',
    cell: ({ row }) => {
      const classes = row.getValue('classes') as string[];
      const diff = classes.length - 3;

      return (
        <div className="flex space-x-1">
          {classes.slice(0, 3).map((abbreviation) => (
            <Badge variant="secondary" key={abbreviation}>
              {abbreviation}
            </Badge>
          ))}
          {diff > 0 && <Badge variant="secondary">+{diff}</Badge>}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Ações',
    cell: ({ row }) => {
      const deleteStudent = async () => {
        try {
          await api.delete(`/students/${row.original.id}`);
          toast.success('Aluno deletado com sucesso');
        } catch {
          toast.error('Erro ao deletar aluno');
        }
      };

      return (
        <Button size="sm" variant="destructive" onClick={deleteStudent}>
          Deletar <Trash className="h-4 w-4 ml-2" />
        </Button>
      );
    },
  },
];

type StudentsTableProps = {
  students: Student[];
};

export function StudentsTable({ students }: StudentsTableProps) {
  const router = useRouter();
  const [isAddingStudent, setIsAddingStudent] = React.useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

  const [newStudent, setNewStudent] = React.useState<{
    name: string;
    registration: string;
    photo: File | null;
  }>({
    name: '',
    registration: '',
    photo: null,
  });

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: students,
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

  const createStudent = async () => {
    if (!newStudent.name || !newStudent.registration || !newStudent.photo) {
      toast.warning('Preencha todos os campos');
      return;
    }

    setIsAddingStudent(true);

    const formData = new FormData();
    formData.append('name', newStudent.name);
    formData.append('registration', newStudent.registration);
    formData.append('photo', newStudent.photo);

    try {
      await api.post('/students', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Aluno adicionado com sucesso');

      setNewStudent({
        name: '',
        registration: '',
        photo: null,
      });

      setIsCreateDialogOpen(false);

      router.refresh();
    } catch {
      toast.error('Erro ao adicionar aluno');
    } finally {
      setIsAddingStudent(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Buscar alunos..."
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />

        <Dialog onOpenChange={setIsCreateDialogOpen} open={isCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="ml-auto">
              <Plus className="h-6 w-6 mr-2" />
              Adicionar aluno
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar aluno</DialogTitle>
              <DialogDescription>
                Preencha os campos abaixo para adicionar um novo aluno.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="name"
                  placeholder="Pedro Duarte"
                  className="col-span-3"
                  value={newStudent?.name}
                  onChange={(event) =>
                    setNewStudent((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="registration" className="text-right">
                  Matrícula
                </Label>
                <Input
                  id="registration"
                  placeholder="202197440"
                  className="col-span-3"
                  value={newStudent?.registration}
                  onChange={(event) =>
                    setNewStudent((prev) => ({ ...prev, registration: event.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="registration" className="text-right">
                  Imagem
                </Label>
                <div className="col-span-3">
                  {newStudent.photo ? (
                    <div className="flex items-center">
                      <img
                        src={URL.createObjectURL(newStudent.photo)}
                        alt="Foto do aluno"
                        className="w-24 h-24 rounded-full"
                      />

                      <Button
                        variant="outline"
                        onClick={() => setNewStudent((prev) => ({ ...prev, photo: null }))}
                        className="ml-4"
                      >
                        Alterar
                      </Button>
                    </div>
                  ) : (
                    <FileDropzone
                      onDrop={(files) => {
                        setNewStudent((prev) => ({ ...prev, photo: files[0] }));
                      }}
                      multiple={false}
                    />
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button disabled={isAddingStudent} onClick={createStudent} type="submit">
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
