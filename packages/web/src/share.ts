// https://github.com/nygardk/react-share/tree/master/src

type TemplateProps = {
  title: string;
  url: string;
  tags: string[];
};

const template = ({
  title,
  url,
  tags,
  type,
}: TemplateProps & {
  type: string;
}) => {
  let add = '';
  if (tags?.length) {
    if (tags.length === 1) {
      add = ` about ${tags[0]}`;
    } else {
      const copy = [...tags];
      const last = copy.splice(tags.length - 2, 1);
      add = ' about ' + copy.join(', ') + ' and ' + last;
    }
  }

  return `You should read this${add}:
${title}

${url}?source=${type}`;
};

const objectToGetParams = (object: Record<string, string | undefined>) => {
  const params = Object.entries(object)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    );

  return params.length > 0 ? `?${params.join('&')}` : '';
};

export const linkedinLink = (input: TemplateProps) => {
  const templated = template({ type: 'linkedin', ...input });
  return (
    'https://linkedin.com/shareArticle' +
    objectToGetParams({
      url: input.url + '?source=linkedin',
      mini: 'true',
      title: input.title,
      summary: templated,
    })
  );
};

export const emailLink = (input: TemplateProps) => {
  const templated = template({ type: 'email', ...input });
  return (
    'mailto:' + objectToGetParams({ subject: input.title, body: templated })
  );
};

export const whatsappLink = (input: TemplateProps, mobile: boolean) => {
  const templated = template({ type: 'whatsapp', ...input });
  return (
    'https://' +
    (mobile ? 'api' : 'web') +
    '.whatsapp.com/send' +
    objectToGetParams({
      text: templated,
    })
  );
};

export const twitterLink = (input: TemplateProps) => {
  // const _body = template({ type: 'twitter', ...input });
  return (
    'https://twitter.com/share' +
    objectToGetParams({
      url: input.url + '?source=twitter',
      text: input.title,
      hashtags: input.tags?.length > 0 ? input.tags.join(',') : undefined,
      related: undefined,
    })
  );
};
