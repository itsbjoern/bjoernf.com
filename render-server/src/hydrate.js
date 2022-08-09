const metaTemplate = ({ url, title, description, img }) => `
<meta name="image" content="${img}">
<!-- Schema.org for Google -->
<meta itemprop="name" content="${title}">
<meta itemprop="description" content="${description}">
<meta itemprop="image" content="${img}">

<!-- Open Graph general (Facebook, Pinterest & Google+) -->
<meta prefix="og: http://ogp.me/ns#" name="og:type" content="website">
<meta prefix="og: http://ogp.me/ns#" name="og:title" content="${title}">
<meta prefix="og: http://ogp.me/ns#" name="og:description" content="${description}">
<meta prefix="og: http://ogp.me/ns#" name="og:image" content="${img}">
<meta prefix="og: http://ogp.me/ns#" name="og:url" content="${url}">
<meta prefix="og: http://ogp.me/ns#" name="og:site_name" content="${title}">
`;

const staticMetaImg =
  'https://s3.eu-west-2.amazonaws.com/bjornf.dev-public/public/images/og_img.png';

const hydrateIndex = (rawIndex, request, renderedApp, resolvedData) => {
  let index = rawIndex;
  index = index.replace(
    '<div id="root"></div>',
    `<div id="root">${renderedApp}</div>`
  );

  const scriptInjection = `window.__RESOLVED_DATA = ${JSON.stringify(
    resolvedData
  )};`;
  index = index.replace(
    '<script id="ssr-scripts"></script>',
    `<script type="text/javascript" id="ssr-scripts">${scriptInjection}</script>`
  );

  const pathName = request.path === '/' ? 'Home' : request.split('/')[1];
  const metaData = {
    url: 'https://bjornf.dev/' + request.path,
    title: 'Björn Friedrichs',
    description: 'Personal website and blog by Björn Friedrichs',
    img: staticMetaImg,
  };
  const postData = resolvedData?.post;
  if (postData?.published) {
    metaData.title = postData.published.title;
    metaData.description =
      postData.published.text.split(' ').slice(0, 20).join(' ') + ' ...';
  }

  index = index.replace('<meta id="tags"></meta>', metaTemplate(metaData));

  index = index.replace('<title></title>', `<title>${metaData.title}</title>`);

  return index;
};

module.exports = { hydrateIndex };
