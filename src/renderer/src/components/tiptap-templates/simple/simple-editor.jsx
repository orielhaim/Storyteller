import { useRef, useState, useEffect} from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"

import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Selection, CharacterCount } from "@tiptap/extensions"

import { Button } from "@/components/tiptap-ui-primitive/button"
import { Spacer } from "@/components/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button"
import { ColorHighlightPopover } from "@/components/tiptap-ui/color-highlight-popover"
import { LinkPopover } from "@/components/tiptap-ui/link-popover"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"

// --- UI Components ---
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { useCursorVisibility } from "@/hooks/use-cursor-visibility"
import { useDebouncedCallback } from "use-debounce"

import { useSettingsStore } from "@/stores/settingsStore"

import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"

import "@/components/tiptap-templates/simple/simple-editor.scss"

import content from "@/components/tiptap-templates/simple/data/content.json"

const MainToolbarContent = () => {
  return (
    <>
      <Spacer />
      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} />
        <ListDropdownMenu types={["bulletList", "orderedList", "taskList"]} />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        <ColorHighlightPopover />
        <LinkPopover />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>
      <Spacer />
    </>
  );
}

export function SimpleEditor({ initialContent, onContentChange }) {
  const toolbarRef = useRef(null)
  const { getSetting } = useSettingsStore()
  const wordCountEnabled = getSetting('editor.wordCountEnabled')

  const [counts, setCounts] = useState({ words: 0, characters: 0 })

  const debouncedSave = useDebouncedCallback((json) => {
    if (onContentChange) {
      onContentChange(json)
    }
  }, 1000)

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "simple-editor",
      },
    },
    textDirection: "auto",
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
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
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
      CharacterCount,
    ],
    content: initialContent || content,
    onUpdate: ({ editor }) => {
      setCounts({
        words: editor.storage.characterCount.words(),
        characters: editor.storage.characterCount.characters(),
      })

      debouncedSave(editor.getJSON())
    },
  })

  // Initialize word count with initial content
  useEffect(() => {
    if (editor) {
      setCounts({
        words: editor.storage.characterCount.words(),
        characters: editor.storage.characterCount.characters(),
      })
    }
  }, [editor])

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  return (
    <div className="simple-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        <Toolbar ref={toolbarRef}>
          <MainToolbarContent />
        </Toolbar>

        <EditorContent editor={editor} role="presentation" className="simple-editor-content" />

        {wordCountEnabled && editor && (
          <div className="fixed bottom-4 right-4">
            <Popover>
              <PopoverTrigger asChild>
                <button className="bg-background/80 backdrop-blur-sm border rounded-md px-3 py-1 text-sm text-muted-foreground shadow-sm hover:bg-background/90 transition-colors cursor-pointer">
                  {counts.words} words
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" side="top" align="end">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Word Count</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Words</div>
                      <div className="font-mono font-medium">{counts.words}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Characters</div>
                      <div className="font-mono font-medium">{counts.characters}</div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </EditorContext.Provider>
    </div>
  );
}