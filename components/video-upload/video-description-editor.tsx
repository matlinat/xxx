"use client"

import * as React from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Bold, Italic, List, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"
import { Theme } from "emoji-picker-react"

// Dynamically import emoji picker to avoid SSR issues
const EmojiPicker = dynamic(
  () => import("emoji-picker-react").then((mod) => mod.default),
  { ssr: false }
)

interface VideoDescriptionEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function VideoDescriptionEditor({
  value,
  onChange,
  className,
}: VideoDescriptionEditorProps) {
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false)

  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4",
      },
    },
  })

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  const insertEmoji = (emoji: string) => {
    if (editor) {
      editor.chain().focus().insertContent(emoji).run()
    }
    setShowEmojiPicker(false)
  }

  if (!editor) {
    return null
  }

  return (
    <div className={cn("w-full border rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="border-b bg-muted/50 p-2 flex items-center gap-1 flex-wrap">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            editor.isActive("bold") && "bg-accent"
          )}
        >
          <Bold className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            editor.isActive("italic") && "bg-accent"
          )}
        >
          <Italic className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            editor.isActive("bulletList") && "bg-accent"
          )}
        >
          <List className="size-4" />
        </Button>
        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={cn(showEmojiPicker && "bg-accent")}
          >
            <Smile className="size-4" />
          </Button>
          {showEmojiPicker && (
            <div className="absolute z-50 top-full left-0 mt-2">
              <EmojiPicker
                onEmojiClick={(emojiData) => insertEmoji(emojiData.emoji)}
                theme={Theme.LIGHT}
                width={350}
                height={400}
              />
            </div>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  )
}
