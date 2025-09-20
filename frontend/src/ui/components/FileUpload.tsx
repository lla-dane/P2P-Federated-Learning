import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { useState } from 'react';

interface FileUploadProps {
  label: string;
  fileType: string;
  onFileSelect: (filePath: string | null) => void;
}

const FileUpload = ({ label, fileType, onFileSelect }: FileUploadProps) => {
  const [filePath, setFilePath] = useState<string | null>(null);

  const handleFileSelect = async () => {
    const selectedPath = await window.electronAPI.openFileDialog();
    if (selectedPath) {
      setFilePath(selectedPath);
      onFileSelect(selectedPath);
    }
  };

  const removeFile = () => {
    setFilePath(null);
    onFileSelect(null);
  };

  const fileName = filePath ? filePath.split(/[\\/]/).pop() : '';

  return (
    <div>
      <label className='block text-sm font-medium text-text-secondary mb-2'>
        {label}
      </label>
      {filePath ? (
        <div className='flex items-center justify-between bg-background p-3 rounded-lg border border-border'>
          <div className='flex items-center gap-3 overflow-hidden'>
            <FileIcon className='text-primary flex-shrink-0' size={20} />
            <span
              className='text-text-primary text-sm truncate'
              title={fileName}
            >
              {fileName}
            </span>
          </div>
          <button
            type='button'
            onClick={removeFile}
            className='text-text-secondary hover:text-red-500 ml-2'
          >
            <X size={20} />
          </button>
        </div>
      ) : (
        <button
          type='button'
          onClick={handleFileSelect}
          className='w-full border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center hover:border-primary transition-colors cursor-pointer focus:outline-none'
        >
          <UploadCloud className='text-text-secondary' size={32} />
          <p className='mt-2 text-sm text-text-secondary'>
            Click to browse for your {fileType}
          </p>
        </button>
      )}
    </div>
  );
};

export default FileUpload;
