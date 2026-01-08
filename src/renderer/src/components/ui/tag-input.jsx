import * as React from "react"
import { TagInput as EmblorTagInput } from "emblor"

export function TagInput({
  value = [],
  onChange,
  placeholder = "Add a tag...",
  className,
  ...props
}) {
  const [tags, setTags] = React.useState(
    value.map(tag => ({ id: tag, text: tag }))
  )

  const handleTagsChange = (newTags) => {
    setTags(newTags)
    onChange(newTags.map(tag => tag.text))
  }

  return (
    <EmblorTagInput
      tags={tags}
      setTags={handleTagsChange}
      placeholder={placeholder}
      className={className}
      styleClasses={{
        input: "w-full h-10",
      }}
      {...props}
    />
  )
}