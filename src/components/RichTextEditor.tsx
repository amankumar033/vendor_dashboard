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
  const [showColorDropdown, setShowColorDropdown] = useState(false);

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
      <div className="border-b border-gray-200 bg-gray-50 rounded-t-lg">
        {/* Row 1: Basic Formatting */}
        <div className="flex items-center gap-1 p-2 border-b border-gray-200">
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
        </div>

        {/* Row 2: Font Size and Color Controls */}
        <div className="flex items-center gap-1 p-2">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-600 mr-1">Size:</span>
            <button
              type="button"
              onClick={() => execCommand('fontSize', '2')}
              title="Small Text"
              className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-600"
            >
              <span className="text-xs">S</span>
            </button>
            <button
              type="button"
              onClick={() => execCommand('fontSize', '3')}
              title="Normal Text"
              className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-600"
            >
              <span className="text-sm">N</span>
            </button>
            <button
              type="button"
              onClick={() => execCommand('fontSize', '4')}
              title="Large Text"
              className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-600"
            >
              <span className="text-base">L</span>
            </button>
            <button
              type="button"
              onClick={() => execCommand('fontSize', '5')}
              title="X-Large Text"
              className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-600"
            >
              <span className="text-lg">XL</span>
            </button>
          </div>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-600 mr-1">Color:</span>
            <div className="relative">
              <div className="flex items-center gap-1">
                <input
                  type="color"
                  title="Text Color"
                  className="w-8 h-8 p-0 border border-gray-300 rounded cursor-pointer"
                  onChange={e => execCommand('foreColor', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowColorDropdown(!showColorDropdown)}
                  title="Basic Colors"
                  className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-600"
                >
                  <span className="text-xs">▼</span>
                </button>
              </div>
              {/* Basic Colors Dropdown */}
              {showColorDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2 z-10 min-w-[120px]">
                  <div className="grid grid-cols-4 gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        execCommand('foreColor', '#000000');
                        setShowColorDropdown(false);
                      }}
                      title="Black"
                      className="w-6 h-6 rounded border border-gray-300 bg-black hover:scale-110 transition-transform"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        execCommand('foreColor', '#dc2626');
                        setShowColorDropdown(false);
                      }}
                      title="Red"
                      className="w-6 h-6 rounded border border-gray-300 bg-red-600 hover:scale-110 transition-transform"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        execCommand('foreColor', '#2563eb');
                        setShowColorDropdown(false);
                      }}
                      title="Blue"
                      className="w-6 h-6 rounded border border-gray-300 bg-blue-600 hover:scale-110 transition-transform"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        execCommand('foreColor', '#16a34a');
                        setShowColorDropdown(false);
                      }}
                      title="Green"
                      className="w-6 h-6 rounded border border-gray-300 bg-green-600 hover:scale-110 transition-transform"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        execCommand('foreColor', '#ca8a04');
                        setShowColorDropdown(false);
                      }}
                      title="Yellow"
                      className="w-6 h-6 rounded border border-gray-300 bg-yellow-500 hover:scale-110 transition-transform"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        execCommand('foreColor', '#9333ea');
                        setShowColorDropdown(false);
                      }}
                      title="Purple"
                      className="w-6 h-6 rounded border border-gray-300 bg-purple-600 hover:scale-110 transition-transform"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        execCommand('foreColor', '#ea580c');
                        setShowColorDropdown(false);
                      }}
                      title="Orange"
                      className="w-6 h-6 rounded border border-gray-300 bg-orange-600 hover:scale-110 transition-transform"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        execCommand('foreColor', '#0891b2');
                        setShowColorDropdown(false);
                      }}
                      title="Cyan"
                      className="w-6 h-6 rounded border border-gray-300 bg-cyan-600 hover:scale-110 transition-transform"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          <div className="flex items-center ">
            <span className="text-xs text-gray-600 mr-1">Font:</span>
            <button
              type="button"
              onClick={() => execCommand('fontSize', '2')}
              title="Decrease Font Size"
              className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-600"
            >
              <span className="text-xs">A-</span>
            </button>
            <button
              type="button"
              onClick={() => execCommand('fontSize', '4')}
              title="Increase Font Size"
              className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-600"
            >
              <span className="text-xs">A+</span>
            </button>
          </div>
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