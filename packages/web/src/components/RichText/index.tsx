import { getTextSelection } from '@remirror/core';
import { findNodeAtSelection } from '@remirror/core-utils';
import {
  Remirror,
  useRemirror,
  ThemeProvider,
  useKeymap,
} from '@remirror/react';
import { FunctionalComponent } from 'preact';
import React, { useState } from 'react';
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
} from 'remirror/extensions';

import { APIResponse } from 'src/api';

// import { FileExtension } from '@remirror/extension-file'
// import { VideoExtension } from './extensions/video'

import { ImageExtension } from './extensions/fixed-image';
import FloatingLinkToolbar from './FloatingLinkToolbar';
import EditorMenu from './menu';
import EditorView from './view';

const createUploadHandler =
  (
    upload: (
      file: File,
      options?: {
        ext?: string;
        max_size?: number;
        quality?: number;
      }
    ) => APIResponse<any>
  ) =>
  (uploads: { file: File; progress: (p: number) => void }[]) => {
    let completed = 0;
    const futureUploads = uploads.map(
      ({ file, progress }) =>
        () =>
          new Promise((resolve) => {
            return upload(file).success((result) => {
              completed += 1;
              progress(completed / uploads.length);
              resolve(result);
            });
          })
    );
    return futureUploads;
  };

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
      const { tr, dispatch, state } = props;
      const selection = state.selection;
      const node = findNodeAtSelection(selection);
      if (node && node.node.type.name === 'codeBlock') {
        const { from, to } = getTextSelection(
          selection ?? tr.selection,
          tr.doc
        );

        dispatch(tr.insertText('  ', from, to));
        return true;
      }
      return false;
    };
    useKeymap('Tab', onTab);
  },
];

type EditorProps = {
  content: string;
  onChange: (change: { text: string; html: string }) => void;
  upload: (
    file: File,
    options?: {
      ext?: string;
      max_size?: number;
      quality?: number;
    }
  ) => APIResponse<any>;
  editable?: boolean;
};

const Editor: FunctionalComponent<EditorProps> = ({
  content,
  onChange,
  upload,
  editable = true,
}) => {
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
    // new VideoExtension({ uploadHandler: createUploadHandler(upload) }),
    // new FileExtension({ uploadFileHandler: createFileUploadHandler(upload) }),
    new HeadingExtension(),
    new LinkExtension({ autoLink: false }),
    new CodeBlockExtension(),
    new CodeExtension(),
    new NodeFormattingExtension(),
  ]);

  const remirror = useRemirror({
    extensions,
    content,
    stringHandler: 'html',
  });
  const { manager, state, setState } = remirror;
  return (
    <ThemeProvider>
      <Remirror
        hooks={hooks}
        editable={editable}
        manager={manager}
        initialContent={state}
        placeholder="Start your post..."
        onChange={(parameter) => {
          const { state, tr } = parameter;
          setState(state);

          if (parameter.internalUpdate) return;
          if (!tr?.steps?.length) return;
          if (!editable) return;

          const html = parameter.helpers.getHTML();

          onChange &&
            onChange({
              html,
              text: parameter.helpers.getText(),
            });
        }}
      >
        <div className="flex flex-col gap-5">
          {editable ? <EditorMenu /> : null}
          {editable ? <FloatingLinkToolbar /> : null}
          <EditorView />
        </div>
      </Remirror>
    </ThemeProvider>
  );
};

export default React.memo(Editor);
