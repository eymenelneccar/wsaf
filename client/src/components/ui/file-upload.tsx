import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Upload, File, X } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  className?: string;
}

export function FileUpload({ 
  onFileSelect, 
  accept = "image/*,application/pdf",
  maxSize = 10 * 1024 * 1024, // 10MB
  className 
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.size > maxSize) {
      alert(`حجم الملف كبير جداً. الحد الأقصى ${maxSize / (1024 * 1024)}MB`);
      return;
    }
    
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-6 text-center transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-white/30",
          "hover:border-white/50 cursor-pointer"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        data-testid="file-upload-area"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
          data-testid="file-input"
        />
        
        {selectedFile ? (
          <div className="flex items-center justify-center space-x-3 space-x-reverse">
            <File className="w-8 h-8 text-green-400" />
            <div className="text-right">
              <p className="font-medium text-green-400">{selectedFile.name}</p>
              <p className="text-sm text-gray-400">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className="p-1 hover:bg-red-500/20 rounded-full transition-colors"
              data-testid="button-remove-file"
            >
              <X className="w-4 h-4 text-red-400" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">اسحب الملف هنا أو انقر للتحديد</p>
            <p className="text-sm text-gray-500">
              يُسمح بملفات الصور و PDF حتى {maxSize / (1024 * 1024)}MB
            </p>
          </>
        )}
      </div>
    </div>
  );
}
