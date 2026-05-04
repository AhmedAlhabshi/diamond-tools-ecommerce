"use client";

import { useEffect } from "react";
import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Underline } from "@tiptap/extension-underline";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";

const FontSize = Extension.create({
  name: "fontSize",

  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },
});

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  dir = "ltr",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  dir?: "ltr" | "rtl";
}) {
  const isRTL = dir === "rtl";

  const editor = useEditor({
    immediatelyRender: false,

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
      }),

      TextStyle,
      Color,
      Underline,
      FontSize,

      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],

    content: value || "",

    editorProps: {
      attributes: {
        dir,
        class: `rich-text-content min-h-[180px] w-full outline-none px-3 py-3 text-sm leading-relaxed ${
          isRTL ? "text-right" : "text-left"
        }`,
      },
    },

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const currentHTML = editor.getHTML();
    const newValue = value || "";

    if (!editor.isFocused && currentHTML !== newValue) {
      editor.commands.setContent(newValue, {
        emitUpdate: false,
      });
    }
  }, [value, editor]);

  if (!editor) return null;

  const buttonClass = (active = false) =>
    `px-3 py-1 border rounded text-sm ${
      active ? "bg-blue-600 text-white" : "bg-white text-slate-800"
    }`;

  return (
    <div className="border rounded overflow-hidden bg-white">
      <div className="flex gap-2 flex-wrap border-b bg-slate-50 p-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${buttonClass(editor.isActive("bold"))} font-bold`}
        >
          B
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${buttonClass(editor.isActive("italic"))} italic`}
        >
          I
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`${buttonClass(editor.isActive("underline"))} underline`}
        >
          U
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={buttonClass(editor.isActive("heading", { level: 2 }))}
        >
          H2
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={buttonClass(editor.isActive("heading", { level: 3 }))}
        >
          H3
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={buttonClass(editor.isActive("bulletList"))}
        >
          Bullet List
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={buttonClass(editor.isActive("orderedList"))}
        >
          Number List
        </button>

        <select
          className="px-2 py-1 border rounded text-sm bg-white text-slate-800"
          defaultValue=""
          onChange={(e) => {
            const size = e.target.value;

            if (!size) {
              editor.chain().focus().setMark("textStyle", { fontSize: null }).run();
              return;
            }

            editor.chain().focus().setMark("textStyle", { fontSize: size }).run();
          }}
        >
          <option value="">Font Size</option>
          <option value="13px">Small</option>
          <option value="16px">Normal</option>
          <option value="20px">Large</option>
          <option value="26px">Extra Large</option>
        </select>

        <select
          className="px-2 py-1 border rounded text-sm bg-white text-slate-800"
          defaultValue=""
          onChange={(e) => {
            const color = e.target.value;

            if (!color) {
              editor.chain().focus().unsetColor().run();
              return;
            }

            editor.chain().focus().setColor(color).run();
          }}
        >
          <option value="">Color</option>
          <option value="#0f172a">Black</option>
          <option value="#2563eb">Blue</option>
          <option value="#dc2626">Red</option>
          <option value="#16a34a">Green</option>
          <option value="#ca8a04">Gold</option>
        </select>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          className="px-3 py-1 border rounded text-sm bg-white text-slate-800"
        >
          Table
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().addRowAfter().run()}
          disabled={!editor.can().addRowAfter()}
          className="px-3 py-1 border rounded text-sm bg-white text-slate-800 disabled:opacity-40"
        >
          + Row
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          disabled={!editor.can().addColumnAfter()}
          className="px-3 py-1 border rounded text-sm bg-white text-slate-800 disabled:opacity-40"
        >
          + Col
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().deleteRow().run()}
          disabled={!editor.can().deleteRow()}
          className="px-3 py-1 border rounded text-sm bg-white text-slate-800 disabled:opacity-40"
        >
          - Row
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().deleteColumn().run()}
          disabled={!editor.can().deleteColumn()}
          className="px-3 py-1 border rounded text-sm bg-white text-slate-800 disabled:opacity-40"
        >
          - Col
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().deleteTable().run()}
          disabled={!editor.can().deleteTable()}
          className="px-3 py-1 border rounded text-sm bg-white text-red-600 disabled:opacity-40"
        >
          Delete Table
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={buttonClass(editor.isActive("paragraph"))}
        >
          Paragraph
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className="px-3 py-1 border rounded text-sm bg-white text-red-600"
        >
          Clear
        </button>
      </div>

      {placeholder && !value && (
        <div
          dir={dir}
          className={`px-3 pt-2 text-sm text-gray-400 ${
            isRTL ? "text-right" : "text-left"
          }`}
        >
          {placeholder}
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}