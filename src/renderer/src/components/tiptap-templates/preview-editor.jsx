import { useEffect, forwardRef, useImperativeHandle } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import { PaginationPlus } from "tiptap-pagination-plus"

import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

export const PreviewEditor = forwardRef(function PreviewEditor({ content }, ref) {
  const editor = useEditor({
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "preview-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      PaginationPlus.configure({
        pageHeight: 800,
        pageWidth: 789,
        pageGap: 50,
        pageGapBorderSize: 1,
        pageGapBorderColor: "#e5e5e5",
        pageBreakBackground: "#ffffff",
        pageHeaderHeight: 30,
        pageFooterHeight: 30,
        headerLeft: "",
        headerRight: "Page {page}",
        footerLeft: "",
        footerRight: "",
        marginTop: 20,
        marginBottom: 20,
        marginLeft: 50,
        marginRight: 50,
        contentMarginTop: 10,
        contentMarginBottom: 10,
      }),
    ],
    textDirection: "auto",
    content: content || { type: 'doc', content: [] },
  })

  useImperativeHandle(ref, () => ({
    getEditor: () => editor,
  }), [editor])

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content)
    }
  }, [editor, content])

  if (!editor) {
    return null
  }
  return (
    <div className="preview-editor-wrapper w-full h-full overflow-auto bg-gray-100 flex justify-center items-start p-8">
      <EditorContent editor={editor} className="preview-editor-content" />
    </div>
  )
})