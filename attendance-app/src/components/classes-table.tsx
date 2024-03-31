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

import { MultiSelect } from './multi-select';
import { Student } from './students-table';

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

export type Class = {
  id: string;
  name: string;
  abbreviation: string;
  teacher: string;
  totalHours: number;
  students: string[];
};

export const columns: ColumnDef<Class>[] = [
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
      return (
        <div className="flex items-center space-x-2">
          <div>{row.getValue('name')}</div>
        </div>
      );
    },
    filterFn: (row, _, value) => {
      const { name, abbreviation } = row.original;
      const concat = `${name} - ${abbreviation}`.toLowerCase();
      return concat.includes(value.toLowerCase());
    },
  },
  {
    accessorKey: 'abbreviation',
    header: 'Código',
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-2">
          <div>{row.getValue('abbreviation')}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'teacher',
    header: 'Professor',
    cell: ({ row }) => {
      const teacher = row.getValue('teacher') as string;

      return (
        <div className="flex items-center space-x-2">
          <p>{teacher}</p>
        </div>
      );
    },
  },
  {
    accessorKey: 'totalHours',
    header: 'Total de Horas',
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-2">
          <div>{row.getValue('totalHours')}</div>
        </div>
      );
    },
  },
];

type ClassesTableProps = {
  classes: Class[];
  students: Student[];
};

export function ClassesTable({ classes, students }: ClassesTableProps) {
  const router = useRouter();

  const [isAddingClass, setIsAddingClass] = React.useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

  const [newClass, setNewClass] = React.useState<{
    name: string;
    abbreviation: string;
    teacher: string;
    totalHours: string;
    students: string[];
  }>({
    name: '',
    abbreviation: '',
    teacher: '',
    totalHours: '80',
    students: [],
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

    const sendBody = {
      name: newClass.name,
      abbreviation: newClass.abbreviation,
      teacher: newClass.teacher,
      totalHours: Number(newClass.totalHours),
      students: newClass.students,
    };

    try {
      await api.post('/classes', sendBody, {
        headers: {
          'content-type': 'application/json',
        },
      });

      toast.success('Matéria adicionada com sucesso');

      setNewClass({
        name: '',
        abbreviation: '',
        teacher: '',
        totalHours: '80',
        students: [],
      });

      setIsCreateDialogOpen(false);

      router.refresh();
    } catch {
      toast.error('Erro ao adicionar matéria');
    } finally {
      setIsAddingClass(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Buscar matérias..."
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />

        <Dialog onOpenChange={setIsCreateDialogOpen} open={isCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="ml-auto">
              <Plus className="h-6 w-6 mr-2" />
              Adicionar matéria
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar matéria</DialogTitle>
              <DialogDescription>
                Preencha os campos abaixo para adicionar uma nova matéria.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="name"
                  placeholder="Cálculo 5"
                  className="col-span-3"
                  value={newClass?.name}
                  onChange={(event) =>
                    setNewClass((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
                <Label htmlFor="abbreviation" className="text-right">
                  Abreviação
                </Label>
                <Input
                  id="abbreviation"
                  placeholder="CALC5"
                  className="col-span-3"
                  value={newClass?.abbreviation}
                  onChange={(event) =>
                    setNewClass((prev) => ({ ...prev, abbreviation: event.target.value }))
                  }
                />
                <Label htmlFor="professor" className="text-right">
                  Professor
                </Label>
                <Input
                  id="professor"
                  placeholder="Abrantes"
                  className="col-span-3"
                  value={newClass?.teacher}
                  onChange={(event) =>
                    setNewClass((prev) => ({ ...prev, teacher: event.target.value }))
                  }
                />

                <Label htmlFor="totalHours" className="text-right">
                  Total de Horas
                </Label>
                <Input
                  id="totalHours"
                  placeholder="80"
                  className="col-span-3"
                  type="number"
                  value={newClass?.totalHours}
                  onChange={(event) =>
                    setNewClass((prev) => ({ ...prev, totalHours: event.target.value }))
                  }
                />

                <Label htmlFor="students" className="text-right">
                  Estudantes
                </Label>
                <MultiSelect
                  value={newClass.students}
                  options={students.map((student) => ({
                    label: `${student.name} (${student.registration})`,
                    value: student.id,
                  }))}
                  placeholder="Selecione os estudantes..."
                  onChange={(newStudents) => {
                    setNewClass((prev) => ({ ...prev, students: newStudents }));
                  }}
                />
              </div>
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
