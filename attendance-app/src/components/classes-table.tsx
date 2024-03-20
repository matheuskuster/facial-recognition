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

export type Class={
  id: string;
  name: string;
  students: string[];
}

export const columns: ColumnDef<Class>[] = [
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
      const name = row.original.name

    //   const initials = !lastName
    //     ? `${firstName[0]}${firstName[1]}`
    //     : `${firstName[0]}${lastName[0]}`;

      return (
        <div className="flex items-center space-x-2">
          <p className="w-10 h-10">
            {name}
          </p>
          <div>{row.getValue('name')}</div>
        </div>
      );
    },
    filterFn: (row, _, value) => {
      const { name } = row.original;
      const concat = `${name}`.toLowerCase();
      return concat.includes(value.toLowerCase());
    },
  },
  {
    accessorKey: 'students',
    header: 'Alunos',
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
];

type ClassesTableProps = {
  classes: Class[];
};

export function ClassesTable({ classes }: ClassesTableProps) {
  const router = useRouter();
  const [isAddingClass, setIsAddingClass] = React.useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

  const [newClass, setNewClass] = React.useState<{
    name: string;
  }>({
    name: '',
  });

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: classes,
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

  const createClass = async () => {
    if (!newClass.name) {
      toast.warning('Preencha todos os campos');
      return;
    }

    setIsAddingClass(true);

    const formData = new FormData();
    formData.append('name', newClass.name);

    try {
      await api.post('/classes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Turma adicionada com sucesso');

      setNewClass({
        name: '',
      });

      setIsCreateDialogOpen(false);

      router.refresh();
    } catch {
      toast.error('Erro ao adicionar turma');
    } finally {
      setIsAddingClass(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Buscar turmas..."
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />

        <Dialog onOpenChange={setIsCreateDialogOpen} open={isCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="ml-auto">
              <Plus className="h-6 w-6 mr-2" />
              Adicionar turma
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar turma</DialogTitle>
              <DialogDescription>
                Preencha os campos abaixo para adicionar uma nova turma.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="name"
                  placeholder="CC6M"
                  className="col-span-3"
                  value={newClass?.name}
                  onChange={(event) =>
                    setNewClass((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
              </div>
              {/* <div className="grid grid-cols-4 items-center gap-4">
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
              </div> */}

              {/* <div className="grid grid-cols-4 items-center gap-4">
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
              </div> */}
            </div>
            <DialogFooter>
              <Button disabled={isAddingClass} onClick={createClass} type="submit">
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