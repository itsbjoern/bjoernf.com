const { Resolver } = require('@parcel/plugin');
const path = require('path');

module.exports = new Resolver({
  async resolve({ specifier }) {
    if (
      specifier === '@remirror/extension-mention' ||
      specifier === '@remirror/extension-mention-atom'
    ) {
      return {
        filePath: path.join(__dirname, 'shim', 'mention-extension.js'),
      };
    }
    // if (specifier === './utils/createSvgIcon') {
    //   return {
    //     filePath: path.join(__dirname, 'shim', 'createSvgIcon.js'),
    //   };
    // }

    // Let the next resolver in the pipeline handle
    // this dependency.
    return null;
  },
});
