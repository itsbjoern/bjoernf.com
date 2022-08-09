import { ImageExtension as BrokenImageExtension } from 'remirror/extensions';
import { isElementDomNode, omitExtraAttributes } from '@remirror/core';

/**
 * Get the width and the height of the image.
 */
function getDimensions(element) {
  let { width, height } = element.style;
  width = element.getAttribute('width') ?? width ?? '';
  height = element.getAttribute('height') ?? height ?? '';

  return { width, height };
}

/**
 * Retrieve attributes from the dom for the image extension.
 */
function getImageAttributes({ element, parse }) {
  const { width, height } = getDimensions(element);

  return {
    ...parse(element),
    alt: element.getAttribute('alt') ?? '',
    height: Number.parseInt(height || '0', 10) || null,
    src: element.getAttribute('src') ?? null,
    title: element.getAttribute('title') ?? '',
    width: Number.parseInt(width || '0', 10) || null,
    fileName: element.getAttribute('data-file-name') ?? null,
  };
}

export class ImageExtension extends BrokenImageExtension {
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

        resizable: { default: false },
      },
      parseDOM: [
        {
          tag: 'img[src]',
          getAttrs: (element) =>
            isElementDomNode(element)
              ? getImageAttributes({ element, parse: extra.parse })
              : {},
        },
        ...(override.parseDOM ?? []),
      ],
      toDOM: (node) => {
        const attrs = omitExtraAttributes(node.attrs, extra);
        return ['img', { ...extra.dom(node), ...attrs }];
      },
    };
  }
}
