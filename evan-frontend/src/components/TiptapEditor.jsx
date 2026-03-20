import { useEffect } from "react";
import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBold,
  faItalic,
  faListUl,
  faListOl,
  faHighlighter,
  faCode
} from "@fortawesome/free-solid-svg-icons";

export default function TiptapEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
      Highlight,
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content]);

  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isBold: editor?.isActive("bold"),
      isItalic: editor?.isActive("italic"),
      isH1: editor?.isActive("heading", { level: 1 }),
      isH2: editor?.isActive("heading", { level: 2 }),
      isBullet: editor?.isActive("bulletList"),
      isOrdered: editor?.isActive("orderedList"),
      isHighlight: editor?.isActive("highlight"),
      isCode: editor?.isActive("codeBlock"),
    }),
  });

  if (!editor) return null;

  return (
    <>
      {/* Vertical Toolbar */}
      <div
        style={{
          position: "fixed",
          right: "20px",
          top: "120px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          background: "var(--card)",
          padding: "0",
          borderRadius: "12px",
          border: "1px solid var(--border)",
        }}
      >
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editorState.isBold ? "active" : ""}
        >
          <FontAwesomeIcon icon={faBold} />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editorState.isItalic ? "active" : ""}
        >
          <FontAwesomeIcon icon={faItalic} />
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          H1
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          H2
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleBulletList().run()
          }
          className={editorState.isBullet ? "active" : ""}
        >
          <FontAwesomeIcon icon={faListUl} />
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
          className={editorState.isOrdered ? "active" : ""}
        >
          <FontAwesomeIcon icon={faListOl} />
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleHighlight().run()
          }
          className={editorState.isHighlight ? "active" : ""}
        >
          <FontAwesomeIcon icon={faHighlighter} />
        </button>

        <button
          onClick={() =>
            editor.chain().focus().toggleCodeBlock().run()
          }
          className={editorState.isCode ? "active" : ""}
        >
          <FontAwesomeIcon icon={faCode} />
        </button>
      </div>

      {/* Editor */}
      <div
        style={{
          minHeight: "70vh",
          fontSize: "18px",
          lineHeight: "1.6",
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </>
  );
}