import React, { useState, useEffect } from 'react'
import {
  BoldExtension,
  UnderlineExtension,
  ItalicExtension,
  StrikeExtension,
  HeadingExtension,
  ListItemExtension,
  BulletListExtension,
  OrderedListExtension,
  LinkExtension,
  NodeFormattingExtension,
  CodeExtension,
  CodeBlockExtension,
} from 'remirror/extensions'
// import { FileExtension } from '@remirror/extension-file'

import { VideoExtension } from './extensions/video'
import { ImageExtension } from './extensions/fixed-image'
import FloatingLinkToolbar from './FloatingLinkToolbar'

import {
  Remirror,
  useRemirror,
  ThemeProvider,
  useKeymap,
} from '@remirror/react'

import { getTextSelection } from '@remirror/core'
import { findNodeAtSelection } from '@remirror/core-utils'

import { Column } from 'app/components/Flex'

import EditorView from './view'
import EditorMenu from './menu'

const createUploadHandler = (upload) => (uploads) => {
  let completed = 0
  const futureUploads = uploads.map(
    ({ file, progress }) =>
      () =>
        new Promise((resolve) => {
          return upload(file, progress).success((result) => {
            completed += 1
            progress(completed / uploads.length)
            resolve(result)
          })
        })
  )
  return futureUploads
}

// const createFileUploadHandler = (upload) => {
//   let f

//   return {
//     insert: (file) => {
//       f = file
//       return { fileName: file.name, fileSize: file.size, fileType: file.type }
//     },
//     upload: () => createUploadHandler(upload)([f])[0],
//     abort: () => {},
//   }
// }

// Hooks can be added to the context without the need for creating custom components
const hooks = [
  () => {
    const onTab = (props) => {
      const { tr, dispatch, state } = props
      const selection = state.selection
      const node = findNodeAtSelection(selection)
      if (node && node.node.type.name === 'codeBlock') {
        const { from, to } = getTextSelection(selection ?? tr.selection, tr.doc)

        dispatch(tr.insertText('  ', from, to))
        return true
      }
      return false
    }
    useKeymap('Tab', onTab)
  },
]

const Editor = ({ content, onChange, upload, editable = true }) => {
  const [didRender, setDidRender] = useState(false)
  const [internalContent, setInternalContent] = useState(content)
  const [extensions] = useState(() => [
    new BoldExtension(),
    new UnderlineExtension(),
    new ItalicExtension(),
    new StrikeExtension(),
    new ListItemExtension(),
    new BulletListExtension(),
    new OrderedListExtension(),
    new ImageExtension({
      uploadHandler: createUploadHandler(upload),
      enableResizing: true,
    }),
    new VideoExtension({ uploadHandler: createUploadHandler(upload) }),
    // new FileExtension({ uploadFileHandler: createFileUploadHandler(upload) }),
    new HeadingExtension(),
    new LinkExtension({ autoLink: true }),
    new CodeBlockExtension(),
    new CodeExtension(),
    new NodeFormattingExtension(),
  ])

  const remirror = useRemirror({
    extensions,
    content,
    stringHandler: 'html',
  })
  const { manager, state, setState, getContext } = remirror

  useEffect(() => {
    if (didRender && internalContent !== content) {
      const context = getContext()
      context.setContent(content)
    }
  }, [content])

  return (
    <ThemeProvider>
      <Remirror
        hooks={hooks}
        editable={editable}
        manager={manager}
        initialContent={state}
        placeholder="Start your post..."
        onChange={(parameter) => {
          const { state, tr } = parameter
          setState(state)

          if (parameter.firstRender && !didRender) {
            setDidRender(true)
          }

          if (parameter.internalUpdate) return
          if (!tr?.steps?.length) return
          if (!editable) return

          const html = parameter.helpers.getHTML()
          setInternalContent(html)
          onChange &&
            onChange({
              html,
              text: parameter.helpers.getText(),
            })
        }}
      >
        <Column gap={20}>
          {editable ? <EditorMenu /> : null}
          {editable ? <FloatingLinkToolbar /> : null}
          <EditorView />
        </Column>
      </Remirror>
    </ThemeProvider>
  )
}

export default React.memo(Editor)
