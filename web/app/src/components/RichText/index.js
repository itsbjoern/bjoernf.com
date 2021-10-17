import React, { useState } from 'react'
import {
  BoldExtension,
  UnderlineExtension,
  ItalicExtension,
  StrikeExtension,
  HeadingExtension,
  ImageExtension,
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
import FloatingLinkToolbar from './FloatingLinkToolbar'

import { Remirror, useRemirror, ThemeProvider } from '@remirror/react'

import { Column } from 'app/components/Flex'

import EditorView from './view'
import EditorMenu from './menu'

const createUploadHandler = (upload) => (uploads) => {
  let completed = 0
  const futureUploads = uploads.map(
    ({ file, progress }) =>
      () =>
        new Promise((resolve) => {
          return upload(file, progress).then((result) => {
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

const Editor = ({ content, onChange, upload, editable = true }) => {
  const [extensions] = useState(() => [
    new BoldExtension(),
    new UnderlineExtension(),
    new ItalicExtension(),
    new StrikeExtension(),
    new ListItemExtension(),
    new BulletListExtension(),
    new OrderedListExtension(),
    new ImageExtension({ uploadHandler: createUploadHandler(upload) }),
    new VideoExtension({ uploadHandler: createUploadHandler(upload) }),
    // new FileExtension({ uploadFileHandler: createFileUploadHandler(upload) }),
    new HeadingExtension(),
    new LinkExtension({ autoLink: true }),
    new CodeBlockExtension(),
    new CodeExtension(),
    new NodeFormattingExtension(),
  ])

  const { manager, state, setState } = useRemirror({
    extensions,
    content,
    stringHandler: 'html',
  })

  return (
    <ThemeProvider>
      <Remirror
        editable={editable}
        manager={manager}
        initialContent={state}
        placeholder="Start your post..."
        onChange={(parameter) => {
          const { state, tr } = parameter
          setState(state)

          if (parameter.internalUpdate) return
          if (!tr?.steps?.length) return
          if (!editable) return

          onChange &&
            onChange({
              html: parameter.helpers.getHTML(),
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

export default Editor
