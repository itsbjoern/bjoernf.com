export const template = ({ title, url, tags }) => {
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

${url}
`
}
