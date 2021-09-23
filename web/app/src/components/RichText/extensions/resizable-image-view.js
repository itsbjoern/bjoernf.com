/* eslint-disable */

import {
  ResizableNodeView,
  ResizableRatioType,
} from 'prosemirror-resizable-view'
import { setStyle } from '@remirror/core'
import { EditorView, NodeView, ProsemirrorNode } from '@remirror/pm'

/**
 * ResizableImageView is a NodeView for image. You can resize the image by
 * dragging the handle over the image.
 */
export class ResizableImageView extends ResizableNodeView {
  constructor(node, view, getPos) {
    super({ node, view, getPos, aspectRatio: ResizableRatioType.Fixed })
  }

  createElement({ node }) {
    const inner = document.createElement('video')

    inner.setAttribute('src', node.attrs.src)

    setStyle(inner, {
      width: '100%',
      minWidth: '50px',
      minHeight: '30px',
      objectFit: 'contain', // maintain image's aspect ratio
    })

    return inner
  }
}
/* eslint-enable */
