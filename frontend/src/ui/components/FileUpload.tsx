import { UploadCloud, File, X } from 'lucide-react';
import { useState } from 'react';

interface FileUploadProps {
  label: string;
  fileType: string;
}

const FileUpload = ({ label, fileType }: FileUploadProps) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div>
      <label className='block text-sm font-medium text-text-secondary mb-2'>
        {label}
      </label>
      {file ? (
        <div className='flex items-center justify-between bg-background p-3 rounded-lg border border-border'>
          <div className='flex items-center gap-3'>
            <File className='text-primary' size={20} />
            <span className='text-text-primary text-sm'>{file.name}</span>
          </div>
          <button
            onClick={removeFile}
            className='text-text-secondary hover:text-red-500'
          >
            <X size={20} />
          </button>
        </div>
      ) : (
        <div className='relative border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center'>
          <UploadCloud className='text-text-secondary' size={32} />
          <p className='mt-2 text-sm text-text-secondary'>
            Drag & drop your {fileType} here, or{' '}
            <span className='font-semibold text-primary'>click to browse</span>
          </p>
          <input
            type='file'
            className='absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer'
            onChange={handleFileChange}
          />
        </div>
      )}
    </div>
  );
};

export default FileUpload;
