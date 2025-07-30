'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  BoldIcon, 
  ItalicIcon, 
  UnderlineIcon
} from '@heroicons/react/24/outline';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, className = '' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateValue();
  };

  const updateValue = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    updateValue();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      document.execCommand('insertLineBreak', false);
      updateValue();
    }
  };

  const isActive = (command: string) => {
    return document.queryCommandState(command);
  };

  return (
    <div className={`border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-colors ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => execCommand('bold')}
            title="Bold"
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              isActive('bold') ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'
            }`}
          >
            <span className="text-xs font-bold">B</span>
          </button>
          <button
            type="button"
            onClick={() => execCommand('italic')}
            title="Italic"
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              isActive('italic') ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'
            }`}
          >
            <span className="text-xs italic">I</span>
          </button>
          <button
            type="button"
            onClick={() => execCommand('underline')}
            title="Underline"
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              isActive('underline') ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'
            }`}
          >
            <span className="text-xs underline">U</span>
          </button>
        </div>
        
        <div className="w-px h-6 bg-gray-300 mx-2"></div>
        
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => execCommand('insertUnorderedList')}
            title="Bullet List"
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              isActive('insertUnorderedList') ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'
            }`}
          >
            <span className="text-xs">•</span>
          </button>
          <button
            type="button"
            onClick={() => execCommand('insertOrderedList')}
            title="Numbered List"
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              isActive('insertOrderedList') ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'
            }`}
          >
            <span className="text-xs">1.</span>
          </button>
        </div>
        
        <div className="w-px h-6 bg-gray-300 mx-2"></div>
        
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => execCommand('justifyLeft')}
            title="Align Left"
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              isActive('justifyLeft') ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'
            }`}
          >
            <span className="text-xs font-bold">L</span>
          </button>
          <button
            type="button"
            onClick={() => execCommand('justifyCenter')}
            title="Align Center"
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              isActive('justifyCenter') ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'
            }`}
          >
            <span className="text-xs font-bold">C</span>
          </button>
          <button
            type="button"
            onClick={() => execCommand('justifyRight')}
            title="Align Right"
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              isActive('justifyRight') ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'
            }`}
          >
            <span className="text-xs font-bold">R</span>
          </button>
        </div>
        
        <div className="w-px h-6 bg-gray-300 mx-2"></div>
        
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => execCommand('formatBlock', 'blockquote')}
            title="Quote"
            className={`p-2 rounded hover:bg-gray-100 transition-colors ${
              isActive('formatBlock') ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'
            }`}
          >
            <span className="text-xs">"</span>
          </button>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={updateValue}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`min-h-[120px] p-4 outline-none ${
          isFocused ? 'bg-white' : 'bg-white'
        }`}
        style={{ 
          fontFamily: 'inherit',
          fontSize: '14px',
          lineHeight: '1.5'
        }}
        data-placeholder={placeholder}
      />
      
      {/* Placeholder */}
      {!value && (
        <div className="absolute top-[60px] left-4 text-gray-400 pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  );
} 