/* eslint-disable no-unused-vars */
import {
  ApplySchemaAttributes,
  command,
  CommandFunction,
  DelayedPromiseCreator,
  EditorView,
  ErrorConstant,
  extension,
  ExtensionTag,
  getTextSelection,
  invariant,
  isElementDomNode,
  NodeExtension,
  NodeExtensionSpec,
  NodeSpecOverride,
  NodeViewMethod,
  omitExtraAttributes,
  PrimitiveSelection,
  ProsemirrorAttributes,
  ProsemirrorNode,
} from '@remirror/core'
import { PasteRule } from '@remirror/pm/paste-rules'
import { insertPoint } from '@remirror/pm/transform'
import { ExtensionImageTheme } from '@remirror/theme'

import { ResizableImageView } from '@remirror/extension-image'

export class VideoExtension extends NodeExtension {
  constructor(options) {
    super(options)

    this._dynamicKeys = [
      'createPlaceholder',
      'updatePlaceholder',
      'destroyPlaceholder',
      ...this._dynamicKeys,
    ]

    this.setOptions({
      createPlaceholder,
      updatePlaceholder: () => {},
      destroyPlaceholder: () => {},
      ...options,
    })
  }
  get name() {
    return 'video'
  }

  createTags() {
    return [ExtensionTag.InlineNode, ExtensionTag.Media]
  }

  createNodeSpec(extra, override) {
    return {
      inline: true,
      draggable: true,
      selectable: false,
      ...override,
      attrs: {
        ...extra.defaults(),
        alt: { default: '' },
        crop: { default: null },
        height: { default: null },
        width: { default: null },
        rotate: { default: null },
        src: { default: null },
        title: { default: '' },
        fileName: { default: null },
        controls: { default: true },

        resizable: { default: false },
      },
      parseDOM: [
        {
          tag: 'video[src]',
          getAttrs: (element) =>
            isElementDomNode(element)
              ? getVideoAttributes({ element, parse: extra.parse })
              : {},
        },
        ...(override.parseDOM ?? []),
      ],
      toDOM: (node) => {
        const attrs = omitExtraAttributes(node.attrs, extra)
        return ['video', { ...extra.dom(node), ...attrs }]
      },
    }
  }

  createCommands() {
    return {
      insertVideo: (attributes, selection) => {
        return ({ tr, dispatch }) => {
          const { from, to } = getTextSelection(
            selection ?? tr.selection,
            tr.doc
          )
          const node = this.type.create(attributes)

          dispatch?.(tr.replaceRangeWith(from, to, node))

          return true
        }
      },
      uploadVideo: (value, onElement) => {
        const { updatePlaceholder, destroyPlaceholder, createPlaceholder } =
          this.options
        const { commands } = this.store

        return (props) => {
          const { tr } = props
          // This is update in the validate hook
          let pos = tr.selection.from

          return this.store
            .createPlaceholderCommand({
              promise: value,
              placeholder: {
                type: 'widget',
                get pos() {
                  return pos
                },
                createElement: (view, pos) => {
                  const element = createPlaceholder(view, pos)
                  onElement?.(element)
                  return element
                },
                onUpdate: (view, pos, element, data) => {
                  updatePlaceholder(view, pos, element, data)
                },
                onDestroy: (view, element) => {
                  destroyPlaceholder(view, element)
                },
              },
              onSuccess: (value, range, commandProps) => {
                return commands.insertVideo(value, range)(commandProps)
              },
            })
            .validate(({ tr, dispatch }) => {
              const insertPos = insertPoint(tr.doc, pos, this.type)

              if (insertPos == null) {
                return false
              }

              pos = insertPos

              if (!tr.selection.empty) {
                dispatch?.(tr.deleteSelection())
              }

              return true
            }, 'unshift')

            .generateCommand()(props)
        }
      },
    }
  }

  fileUploadFileHandler(files) {
    const { commands, chain } = this.store
    const filesWithProgress = files.map((file, index) => ({
      file,
      progress: (progress) => {
        commands.updatePlaceholder(uploads[index], progress)
      },
    }))

    const uploads = this.options.uploadHandler(filesWithProgress)

    for (const upload of uploads) {
      chain.uploadVideo(upload)
    }

    chain.run()

    return true
  }

  createPasteRules() {
    return [
      {
        type: 'file',
        regexp: /video/i,
        fileHandler: ({ files }) => this.fileUploadFileHandler(files),
      },
    ]
  }

  createNodeViews() {
    if (this.options.enableResizing) {
      return (node, view, getPos) => {
        return new ResizableImageView(node, view, getPos)
      }
    }

    return {}
  }
}

/**
 * The set of valid image files.
 */
const VIDEO_FILE_TYPES = new Set([])

/**
 * True when the provided file is an image file.
 */
export function isVideoFileType(file) {
  return VIDEO_FILE_TYPES.has(file.type)
}

/**
 * Get the width and the height of the image.
 */
function getDimensions(element) {
  let { width, height } = element.style
  width = element.getAttribute('width') ?? width ?? ''
  height = element.getAttribute('height') ?? height ?? ''

  return { width, height }
}

/**
 * Retrieve attributes from the dom for the image extension.
 */
function getVideoAttributes({ element, parse }) {
  const { width, height } = getDimensions(element)

  return {
    ...parse(element),
    alt: element.getAttribute('alt') ?? '',
    height: Number.parseInt(height || '0', 10) || null,
    src: element.getAttribute('src') ?? null,
    title: element.getAttribute('title') ?? '',
    width: Number.parseInt(width || '0', 10) || null,
    fileName: element.getAttribute('data-file-name') ?? null,
    controls: element.getAttribute('controls') ?? true,
  }
}

function createPlaceholder(_, __) {
  const element = document.createElement('div')
  element.classList.add(ExtensionImageTheme.IMAGE_LOADER)

  return element
}

/**
 * The default handler converts the files into their `base64` representations
 * and adds the attributes before inserting them into the editor.
 */
function uploadHandler(files) {
  invariant(files.length > 0, {
    code: ErrorConstant.EXTENSION,
    message:
      'The upload handler was applied for the image extension without any valid files',
  })

  let completed = 0
  const promises = []

  for (const { file, progress } of files) {
    promises.push(
      () =>
        new Promise((resolve) => {
          const reader = new FileReader()

          reader.addEventListener(
            'load',
            (readerEvent) => {
              completed += 1
              progress(completed / files.length)
              resolve({ src: readerEvent.target?.result, fileName: file.name })
            },
            { once: true }
          )

          reader.readAsDataURL(file)
        })
    )
  }

  return promises
}
