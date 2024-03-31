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
import { ArrowDown, ArrowUp, Check, Plus } from 'lucide-react';
import { DateTime } from 'luxon';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';

import { Class } from './classes-table';
import { FileDropzone } from './file-dropzone';
import { Spinner } from './spinner';
import { Student } from './students-table';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Switch } from './ui/switch';

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
  date: string;
  photoUrl: string;
  status: 'processed' | 'pending';
  studentAttendances: {
    id: string;
    present: boolean;
    studentId: string;
  }[];
  class: {
    name: string;
  };
};

export const columns: ColumnDef<Attendance>[] = [
  {
    accessorKey: 'photo',
    header: 'Imagem',
    cell: ({ row }) => {
      return (
        <img src={row.original.photoUrl} alt="Foto da Chamada" className="w-12 h-12 rounded-full" />
      );
    },
  },
  {
    accessorKey: 'class',
    header: 'Turma',
    cell: ({ row }) => {
      return <p className="capitalize font-bold ">{row.original.class.name}</p>;
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
          {column.getIsSorted() === 'asc' && <ArrowUp className="ml-2 h-4 w-4" />}
          {column.getIsSorted() === 'desc' && <ArrowDown className="ml-2 h-4 w-4" />}
        </Button>
      );
    },
    cell: ({ row }) => {
      const stringDate = DateTime.fromISO(row.original.date);
      const formattedDateTime = stringDate.toFormat('dd/MM/yyyy HH:mm');

      return (
        <div>
          <p className="flex items-center space-x-2">{formattedDateTime}</p>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;

      return status === 'pending' ? (
        <div className="flex items-center space-x-2">
          <Spinner className="h-5 w-5" />
          <span>Processando</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <Check className="h-5 w-5 text-green-500" />
          <span>Finalizado</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'attendance',
    header: 'Comparecimento',
    cell: ({ row }) => {
      const status = row.original.status;

      const attendances = row.original.studentAttendances;
      const present = attendances.filter((attendance) => attendance.present).length;

      return status === 'processed' ? (
        <p className="font-medium">
          {present}/{attendances.length}
        </p>
      ) : (
        <p className="font-medium">-</p>
      );
    },
  },
  {
    accessorKey: 'actions',
    header: '',
    cell: ({ row, table }) => {
      // @ts-ignore
      const { students } = table.options.meta;

      const onDelete = async () => {
        try {
          await api.delete(`/attendances/${row.original.id}`);
          toast.success('Chamada excluída com sucesso');
        } catch {
          toast.error('Erro ao excluir chamada');
        }
      };

      return (
        <div className="flex items-center space-x-2">
          <EditAttendance
            studentAttendances={row.original.studentAttendances}
            students={students}
          />
          <Button variant="destructive" size="sm" onClick={onDelete}>
            Excluir
          </Button>
        </div>
      );
    },
  },
];

type StudentAttendance = {
  id: string;
  present: boolean;
  studentId: string;
};

type EditAttendanceProps = {
  studentAttendances: StudentAttendance[];
  students: Student[];
};

function EditAttendance({ studentAttendances, students }: EditAttendanceProps) {
  const [attendances, setAttendances] = React.useState(
    studentAttendances.map((attendance) => {
      const studentData = students.find((s) => s.id === attendance.studentId);

      return {
        ...studentData,
        present: attendance.present,
        attendanceId: attendance.id,
      };
    }),
  );

  const updateStudentAttendance = async (attendanceId: string, present: boolean) => {
    try {
      await api.put(`/student-attendances/${attendanceId}`, {
        present,
      });

      toast.success('Presença atualizada com sucesso');
    } catch {
      toast.error('Erro ao atualizar presença');
    }
  };

  const onTogglePresent = (attendanceId: string, checked: boolean) => {
    setAttendances((prev) =>
      prev.map((attendance) =>
        attendance.attendanceId === attendanceId ? { ...attendance, present: checked } : attendance,
      ),
    );

    updateStudentAttendance(attendanceId, checked);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar chamada</DialogTitle>
          <DialogDescription>Altere o comparecimento dos alunos abaixo.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {attendances.map((student) => (
            <div className="flex items-center w-full" key={student.attendanceId}>
              <img src={student.photoUrl} alt="Foto do Aluno" className="w-8 h-8 rounded-full" />
              <p className="ml-2 font-medium">{student.name}</p>

              <Switch
                onCheckedChange={(checked) => onTogglePresent(student.attendanceId, checked)}
                className="ml-auto"
                checked={student.present}
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

type AttendancesTableProps = {
  attendances: Attendance[];
  classes: Class[];
  students: Student[];
};

export function AttendancesTable({ attendances, classes, students }: AttendancesTableProps) {
  const router = useRouter();
  const [isAddingAttendance, setIsAddingAttendance] = React.useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

  const [newAttendance, setNewAttendance] = React.useState<{
    classId: string;
    photo: File | null;
  }>({
    classId: '',
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
    meta: {
      students,
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
    formData.append('date', String(DateTime.now().toISO()));
    formData.append('photo', newAttendance.photo);

    try {
      await api.post('/attendances', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Chamada adicionada com sucesso');

      setNewAttendance({
        classId: '',
        photo: null,
      });

      setIsCreateDialogOpen(false);

      router.refresh();
    } catch {
      toast.error('Erro ao adicionar chamada');
    } finally {
      setIsAddingAttendance(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Buscar chamadas..."
          value={(table.getColumn('class')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('class')?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />

        <Dialog onOpenChange={setIsCreateDialogOpen} open={isCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="ml-auto">
              <Plus className="h-6 w-6 mr-2" />
              Adicionar chamada
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar chamada</DialogTitle>
              <DialogDescription>
                Preencha os campos abaixo para adicionar uma nova chamada.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Turma
                </Label>

                <Select
                  value={newAttendance.classId}
                  onValueChange={(value) =>
                    setNewAttendance((prev) => ({ ...prev, classId: value }))
                  }
                >
                  <SelectTrigger className="col-span-3 w-full">
                    <SelectValue placeholder="Selecione uma turma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Turmas</SelectLabel>
                      {classes.map((classItem) => (
                        <SelectItem key={classItem.id} value={classItem.id}>
                          {classItem.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
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
