import React, { useRef } from 'react';
import { Plus } from 'lucide-react';
import { parseQuizFile } from '../utils/parser';
import { Quiz } from '../types';

interface FileUploaderProps {
  onQuizLoaded: (quiz: Quiz) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onQuizLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        try {
          const quiz = parseQuizFile(content, file.name);
          onQuizLoaded(quiz);
        } catch (error) {
          alert("Lỗi định dạng file. Vui lòng kiểm tra mẫu.");
          console.error(error);
        }
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <input
        type="file"
        accept=".txt"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-blue-700 active:scale-90 transition-transform z-50"
      >
        <Plus size={28} />
      </button>
    </>
  );
};