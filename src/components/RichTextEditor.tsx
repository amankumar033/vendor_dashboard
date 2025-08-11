import React, { useState, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import JoditEditor to avoid SSR issues
const JoditEditor = dynamic(() => import('jodit-react'), {
  ssr: false,
  loading: () => <div className="border border-gray-300 rounded-lg p-4 h-32 bg-gray-50 animate-pulse">Loading editor...</div>
});

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter detailed description...',
  height = 300,
  className = ''
}) => {
  const editor = useRef(null);

  const config = useMemo(() => ({
    readonly: false,
    placeholder: placeholder,
    height: height,
    theme: 'default',
    toolbar: true,
    spellcheck: false,
    language: 'en',
    colorPickerDefaultTab: 'background' as const,
    imageDefaultWidth: 300,
    removeButtons: ['source', 'about', 'fullsize'],
    showCharsCounter: true,
    showWordsCounter: true,
    showXPathInStatusbar: false,
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    enter: 'p' as const,
    fullscreen: false,
    buttons: [
      'bold', 'strikethrough', 'underline', 'italic', '|',
      'ul', 'ol', '|',
      'outdent', 'indent', '|',
      'font', 'fontsize', 'brush', 'paragraph', '|',
      'image', 'link', '|',
      'align', 'undo', 'redo', '|',
      'hr', 'eraser', 'copyformat'
    ],
    events: {
      afterInit: function(editor: any) {
        console.log('Jodit editor initialized successfully');
        
        // Handle list style dropdown functionality
        editor.events.on('click', function(event: any) {
          const target = event.target;
          
          // Check if clicked on list style dropdown items
          if (target && target.classList.contains('jodit-ui-list__item')) {
            const listStyle = target.getAttribute('data-value');
            const selection = editor.selection;
            const range = selection.range;
            
            if (range && !range.collapsed) {
              // Text is selected, apply list style
              const selectedText = selection.getHTML();
              let listHTML = '';
              
              if (listStyle === 'default' || listStyle === 'disc') {
                listHTML = `<ul style="list-style-type: disc"><li>${selectedText}</li></ul>`;
              } else if (listStyle === 'circle') {
                listHTML = `<ul style="list-style-type: circle"><li>${selectedText}</li></ul>`;
              } else if (listStyle === 'dot') {
                listHTML = `<ul style="list-style-type: disc"><li>${selectedText}</li></ul>`;
              } else if (listStyle === 'square') {
                listHTML = `<ul style="list-style-type: square"><li>${selectedText}</li></ul>`;
              }
              
              if (listHTML) {
                editor.execCommand('insertHTML', listHTML);
              }
            }
          }
          
          // Handle heading dropdown functionality
          if (target && target.classList.contains('jodit-ui-paragraph__item')) {
            const headingType = target.getAttribute('data-value');
            const selection = editor.selection;
            const range = selection.range;
            
            if (range && !range.collapsed) {
              // Text is selected, apply heading
              const selectedText = selection.getHTML();
              let headingHTML = '';
              
              if (headingType === 'h1') {
                headingHTML = `<h1>${selectedText}</h1>`;
              } else if (headingType === 'h2') {
                headingHTML = `<h2>${selectedText}</h2>`;
              } else if (headingType === 'h3') {
                headingHTML = `<h3>${selectedText}</h3>`;
              } else if (headingType === 'h4') {
                headingHTML = `<h4>${selectedText}</h4>`;
              } else if (headingType === 'h5') {
                headingHTML = `<h5>${selectedText}</h5>`;
              } else if (headingType === 'h6') {
                headingHTML = `<h6>${selectedText}</h6>`;
              } else if (headingType === 'p') {
                headingHTML = `<p>${selectedText}</p>`;
              }
              
              if (headingHTML) {
                editor.execCommand('insertHTML', headingHTML);
              }
            } else {
              // No text selected, create empty heading
              let headingHTML = '';
              
              if (headingType === 'h1') {
                headingHTML = '<h1><br></h1>';
              } else if (headingType === 'h2') {
                headingHTML = '<h2><br></h2>';
              } else if (headingType === 'h3') {
                headingHTML = '<h3><br></h3>';
              } else if (headingType === 'h4') {
                headingHTML = '<h4><br></h4>';
              } else if (headingType === 'h5') {
                headingHTML = '<h5><br></h5>';
              } else if (headingType === 'h6') {
                headingHTML = '<h6><br></h6>';
              } else if (headingType === 'p') {
                headingHTML = '<p><br></p>';
              }
              
              if (headingHTML) {
                editor.execCommand('insertHTML', headingHTML);
              }
            }
          }
        });

        // Handle Enter key for list continuation
        editor.events.on('keydown', function(event: any) {
          if (event.key === 'Enter') {
            const selection = editor.selection;
            const currentElement = selection.current();
            
            // Check if we're inside a list item
            if (currentElement) {
              const parentElement = currentElement.parentElement;
              if (parentElement && (parentElement.tagName === 'LI' || parentElement.tagName === 'UL' || parentElement.tagName === 'OL')) {
                // Continue list on new line
                setTimeout(() => {
                  editor.execCommand('insertHTML', '<br>');
                }, 10);
              }
            }
          }
        });
      }
    }
  }), [placeholder, height]);

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-300 ${className}`}>
      <JoditEditor
        ref={editor}
        value={value}
        config={config}
        tabIndex={1}
        onBlur={(newContent) => onChange(newContent)}
        onChange={(newContent) => {}}
      />
    </div>
  );
};

export default RichTextEditor; 