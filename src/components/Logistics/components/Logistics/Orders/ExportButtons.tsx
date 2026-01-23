// src/components/Logistics/Orders/ExportButtons.tsx
import { useState, useRef, useEffect } from 'react';

interface ExportButtonsProps {
  onExport: (format: 'pdf' | 'excel' | 'csv' | 'text') => void;
  disabled?: boolean;
}

export function ExportButtons({ onExport, disabled = false }: ExportButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleExport = (format: 'pdf' | 'excel' | 'csv' | 'text') => {
    onExport(format);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu - Usando position fixed para evitar overflow */}
      {isOpen && (
        <div 
          className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 min-w-[180px]"
          style={{
            top: dropdownRef.current 
              ? dropdownRef.current.getBoundingClientRect().bottom + 8 
              : 0,
            right: window.innerWidth - (dropdownRef.current 
              ? dropdownRef.current.getBoundingClientRect().right 
              : 0),
          }}
        >
          <button
            onClick={() => handleExport('pdf')}
            className="cursor-pointer w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2.5"
          >
            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
            </svg>
            Export as PDF
          </button>
          
          <button
            onClick={() => handleExport('excel')}
            className="cursor-pointer w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors flex items-center gap-2.5"
          >
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
              <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
            Export as Excel
          </button>
          
          <button
            onClick={() => handleExport('csv')}
            className="cursor-pointer w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center gap-2.5"
          >
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
            Export as CSV
          </button>
          
          <button
            onClick={() => handleExport('text')}
            className="cursor-pointer w-full px-4 py-2 text-left text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-2.5"
          >
            <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm6 6H7v2h6v-2z" clipRule="evenodd" />
            </svg>
            Export as Text
          </button>
        </div>
      )}
    </div>
  );
}