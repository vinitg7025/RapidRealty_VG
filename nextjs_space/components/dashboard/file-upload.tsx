'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { uploadFileToS3 } from '@/lib/upload-helper';

interface FileUploadProps {
  label: string;
  accept?: string;
  multiple?: boolean;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  hint?: string;
  projectId?: string;
}

export default function FileUpload({ label, accept, multiple, value, onChange, hint, projectId }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentFiles = multiple ? (Array.isArray(value) ? value : []) : (value ? [value as string] : []);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map((file: File) => uploadFileToS3(file, true, projectId));
      const paths = await Promise.all(uploadPromises);

      if (multiple) {
        onChange([...currentFiles, ...paths]);
      } else {
        onChange(paths[0] ?? '');
      }
      toast.success(`${paths.length} file(s) uploaded`);
    } catch (err: any) {
      console.error('File upload error:', err);
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    if (multiple) {
      const updated = [...currentFiles];
      updated.splice(index, 1);
      onChange(updated);
    } else {
      onChange('');
    }
  };

  const isImage = (path: string) => {
    const ext = (path ?? '').split('.').pop()?.toLowerCase() ?? '';
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-white/80 mb-1.5">{label}</label>
      {hint && <p className="text-xs text-white/40 mb-2">{hint}</p>}

      {currentFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {currentFiles.map((path: string, i: number) => (
            <div key={i} className="relative group bg-white/5 border border-white/10 rounded-lg p-2 flex items-center gap-2">
              {isImage(path) ? <ImageIcon className="w-4 h-4 text-[#c8a45e]" /> : <FileText className="w-4 h-4 text-white/50" />}
              <span className="text-xs text-white/60 max-w-[120px] truncate">{path.split('/').pop()}</span>
              <button onClick={() => removeFile(i)} className="text-white/40 hover:text-red-400">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
          uploading ? 'border-[#c8a45e]/40 bg-[#c8a45e]/5' : 'border-white/15 hover:border-[#c8a45e]/40 hover:bg-white/5'
        }`}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-[#c8a45e]">
            <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-white/40">
            <Upload className="w-4 h-4" />
            <span className="text-sm">Click to upload {multiple ? 'files' : 'a file'}</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
    </div>
  );
}
