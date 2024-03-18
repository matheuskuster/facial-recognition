'use client';

import { File } from 'lucide-react';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

import { cn } from '@/lib/utils';

type FileDropzoneProps = {
  onDrop: (acceptedFiles: File[]) => void;
  multiple?: boolean;
};

export function FileDropzone({ onDrop, multiple }: FileDropzoneProps) {
  const memoizedOnDrop = useCallback(
    (acceptedFiles: File[]) => {
      onDrop(acceptedFiles);
    },
    [onDrop],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: memoizedOnDrop,
    multiple,
  });

  return (
    <div
      className={cn(
        'p-6 border-2 border-dashed rounded-lg w-full flex items-center justify-center text-center cursor-pointer transition-all',
        isDragActive ? 'border-blue-500' : 'border-gray-200',
      )}
      {...getRootProps()}
    >
      <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center">
        <File className="w-6 h-6 ml-0.5" />
      </div>

      <span
        className={cn('rounded-md p-3 text-sm transition-all', isDragActive ? 'opacity-60' : '')}
      >
        <span className="font-medium">Arraste e solte</span> o arquivo{' '}
        <input {...getInputProps()} />
      </span>
    </div>
  );
}
