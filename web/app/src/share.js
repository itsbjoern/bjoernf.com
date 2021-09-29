// https://github.com/nygardk/react-share/tree/master/src

const template = ({ title, url, tags, type }) => {
  let add = ''
  if (tags?.length) {
    if (tags.length === 1) {
      add = ` about ${tags[0]}`
    } else {
      const copy = [...tags]
      const last = copy.splice(tags.length - 2, 1)
      add = ' about ' + copy.join(', ') + ' and ' + last
    }
  }

  return `You should read this${add}:
${title}

${url}?utm_share=${type}`
}

const objectToGetParams = (object) => {
  const params = Object.entries(object)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )

  return params.length > 0 ? `?${params.join('&')}` : ''
}

export const linkedinLink = (input) => {
  const templated = template({ type: 'linkedin', ...input })
  return (
    'https://linkedin.com/shareArticle' +
    objectToGetParams({
      url: input.url + '?utm_share=linkedin',
      mini: 'true',
      title: input.title,
      summary: templated,
    })
  )
}

export const emailLink = (input) => {
  const templated = template({ type: 'email', ...input })
  return (
    'mailto:' + objectToGetParams({ subject: input.title, body: templated })
  )
}

export const whatsappLink = (input, mobile) => {
  const templated = template({ type: 'whatsapp', ...input })
  return (
    'https://' +
    (mobile ? 'api' : 'web') +
    '.whatsapp.com/send' +
    objectToGetParams({
      text: templated,
    })
  )
}

export const twitterLink = (input) => {
  const _body = template({ type: 'twitter', ...input })
  return (
    'https://twitter.com/share' +
    objectToGetParams({
      url: input.url + '?utm_share=twitter',
      text: input.title,
      hashtags: input.tags?.length > 0 ? input.tags.join(',') : undefined,
      related: undefined,
    })
  )
}
