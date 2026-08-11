import React, { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import { Strike } from '@tiptap/extension-strike'
import { Highlight } from '@tiptap/extension-highlight'
import { TextAlign } from '@tiptap/extension-text-align'
import { Link } from '@tiptap/extension-link'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { Button } from './button'
import { cn } from '@/lib/utils'
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Highlighter, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Quote, Undo, Redo, Link as LinkIcon, Palette, Heading1, Heading2, Heading3, Table as TableIcon, Plus, Trash2, Columns, Rows } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

interface TableGridPickerProps {
  onInsertTable: (rows: number, cols: number) => void
}

function TableGridPicker({ onInsertTable }: TableGridPickerProps) {
  const { t } = useTranslation();
  const [hoveredRows, setHoveredRows] = useState(0);
  const [hoveredCols, setHoveredCols] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const maxRows = 6;
  const maxCols = 8;

  const handleSelect = (r: number, c: number) => {
    onInsertTable(r, c);
    setIsOpen(false);
    setHoveredRows(0);
    setHoveredCols(0);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 font-semibold text-xs text-slate-700 hover:bg-slate-100 px-2.5 py-1"
          title={t('Insert Table')}
        >
          <TableIcon className="h-4 w-4 text-slate-600" />
          <span>{t('Table')}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3 bg-white rounded-xl shadow-xl border border-slate-200" align="start">
        <div className="text-xs font-bold text-slate-700 mb-2 text-center">
          {hoveredRows > 0 && hoveredCols > 0 ? `${hoveredRows} × ${hoveredCols} ${t('Table')}` : t('Insert Table')}
        </div>
        <div 
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${maxCols}, minmax(0, 1fr))` }}
          onMouseLeave={() => {
            setHoveredRows(0);
            setHoveredCols(0);
          }}
        >
          {Array.from({ length: maxRows }).map((_, rIdx) => {
            const r = rIdx + 1;
            return Array.from({ length: maxCols }).map((_, cIdx) => {
              const c = cIdx + 1;
              const isSelected = r <= hoveredRows && c <= hoveredCols;
              return (
                <div
                  key={`${r}-${c}`}
                  onMouseEnter={() => {
                    setHoveredRows(r);
                    setHoveredCols(c);
                  }}
                  onClick={() => handleSelect(r, c)}
                  className={cn(
                    'w-5 h-5 border rounded-xs cursor-pointer transition-colors',
                    isSelected 
                      ? 'bg-blue-500 border-blue-600' 
                      : 'bg-slate-50 border-slate-300 hover:border-slate-400'
                  )}
                />
              );
            });
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface RichTextEditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  onKeyDown?: (e: React.KeyboardEvent) => void
}

export function RichTextEditor({
  content = '',
  onChange,
  placeholder,
  className,
  disabled = false,
  onKeyDown
}: RichTextEditorProps) {
  const { t } = useTranslation();
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        heading: {
          levels: [1, 2, 3, 4],
        },
        strike: false,
        link: false,
      }),

      Strike,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer hover:text-blue-800',
        },
      }),
      Color,
      TextStyle,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'tiptap-table border-collapse w-full table-auto my-4 border border-slate-300',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-slate-300 bg-slate-100 p-2.5 text-left font-bold',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-slate-300 p-2.5',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }: any) => {
      onChange?.(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[140px] p-3 prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:my-1 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:my-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:my-1 [&_table]:w-full [&_table]:table-auto [&_table]:border-collapse [&_table]:my-4 [&_table]:border [&_table]:border-slate-300 [&_th]:border [&_th]:border-slate-300 [&_th]:bg-slate-100 [&_th]:p-2.5 [&_th]:text-left [&_th]:font-bold [&_td]:border [&_td]:border-slate-300 [&_td]:p-2.5',
      },
    },
    editable: !disabled,
  })

  if (!editor) return null

  const getHeadingValue = () => {
    if (editor.isActive('heading', { level: 1 })) return 'h1';
    if (editor.isActive('heading', { level: 2 })) return 'h2';
    if (editor.isActive('heading', { level: 3 })) return 'h3';
    return 'p';
  };

  return (
    <div className={cn('border rounded-md', className)}>
      <div className="border-b p-2 flex flex-wrap items-center gap-1">
        {/* Heading Dropdown */}
        <Select
          value={getHeadingValue()}
          onValueChange={(val) => {
            if (val === 'h1') editor.chain().focus().setHeading({ level: 1 }).run();
            else if (val === 'h2') editor.chain().focus().setHeading({ level: 2 }).run();
            else if (val === 'h3') editor.chain().focus().setHeading({ level: 3 }).run();
            else editor.chain().focus().setParagraph().run();
          }}
        >
          <SelectTrigger className="h-8 w-[125px] text-xs">
            <SelectValue placeholder={t('Paragraph')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="p">{t('Paragraph')}</SelectItem>
            <SelectItem value="h1">{t('Heading 1')}</SelectItem>
            <SelectItem value="h2">{t('Heading 2')}</SelectItem>
            <SelectItem value="h3">{t('Heading 3')}</SelectItem>
          </SelectContent>
        </Select>

        {/* Quick Heading Buttons */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-muted font-bold' : ''}
          title={t('Heading 1')}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-muted font-bold' : ''}
          title={t('Heading 2')}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-muted font-bold' : ''}
          title={t('Heading 3')}
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />
        <TableGridPicker onInsertTable={(rows, cols) => {
          editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
        }} />
        {editor.isActive('table') && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              title={t('Add Column After')}
              className="text-xs px-2"
            >
              <Columns className="h-4 w-4 me-1 text-slate-600" />
              <span>+Col</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              title={t('Add Row After')}
              className="text-xs px-2"
            >
              <Rows className="h-4 w-4 me-1 text-slate-600" />
              <span>+Row</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().deleteTable().run()}
              title={t('Delete Table')}
              className="text-xs px-2 text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4 me-1" />
              <span>Delete</span>
            </Button>
          </>
        )}
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-muted' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-muted' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'bg-muted' : ''}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'bg-muted' : ''}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={editor.isActive('highlight') ? 'bg-muted' : ''}
        >
          <Highlighter className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={editor.isActive({ textAlign: 'justify' }) ? 'bg-muted' : ''}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-muted' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-muted' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-muted' : ''}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            const previousUrl = editor.getAttributes('link').href
            const url = window.prompt(t('URL'), previousUrl)

            if (url === null) {
              return
            }

            if (url === '') {
              editor.chain().focus().extendMarkRange('link').unsetLink().run()
              return
            }

            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
          }}
          className={editor.isActive('link') ? 'bg-muted' : ''}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <input
          type="color"
          onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
          value={editor.getAttributes('textStyle').color || '#000000'}
          className="w-8 h-8 border rounded cursor-pointer"
          title={t('Text Color')}
        />
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <div className="prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:my-1 [&_a]:text-blue-600 [&_a]:underline [&_a]:cursor-pointer hover:[&_a]:text-blue-800 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:my-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:my-1">
        <EditorContent
          editor={editor}
          placeholder={placeholder || t('Start typing...')}
        />
      </div>
    </div>
  )
}