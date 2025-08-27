import { useState, type CSSProperties } from "react"

type ExampleProps = {
  title?: string
  content?: string
  editable?: boolean
  contentStyle?: CSSProperties
  contentId?: string
}

export function Example({ title = "An overly long but truncated title", content = "Any length content", editable, contentStyle, contentId }: ExampleProps) {
  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        backgroundColor: "#f1f1f1",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        padding: 24,
        borderRadius: 16,
        fontSize: "1.15em"
      }}
    >
      <div style={{ display: "flex" }}>
        <div
          style={{
            width: 0,
            flexGrow: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            padding: 4,
          }}
        >
          {title}
        </div>
      </div>
      <div
        id={contentId}
        style={{
          padding: 4,
          outline: editable ? "2px solid #2255bb" : "none",
          borderRadius: 8,
          transition: "width 1s ease",
          ...(contentStyle || {}),
        }}
        contentEditable={editable}
      >
        {content}
      </div>
    </div>
  )
}
