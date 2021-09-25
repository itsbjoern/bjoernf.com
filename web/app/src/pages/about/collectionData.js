export default [
  {
    name: 'Browser details',
    description: 'The name and version number of your current browser.',
    example: 'Firefox 91',
  },
  {
    name: 'Time',
    description: 'Current time and day plus how much time you spent on a page.',
    example: '2021-09-25T13:27:48.561Z',
  },
  {
    name: 'Operating system',
    description: 'Current operating system.',
    example: 'Windows',
  },
  {
    name: 'Path',
    description: 'Which specifc page of the this website you visited.',
    example: '/blog',
  },
  {
    name: 'Device platform',
    description: 'Which kind of device you are using.',
    example: 'desktop',
  },
  {
    name: 'Referrer',
    description:
      'When you visit this website via a link from another website a referrer is added. This way I know where my traffic is coming from.',
    example: 'https://www.google.com',
  },
  {
    name: 'Screen details',
    description: 'The size and screen orientation.',
    example: '1920px 1080px landscape',
  },
  {
    name: 'Timezone and country',
    description:
      'By checking your browsers reported timezone I can identify the country you are currently in.',
    example: 'Europe/London UK',
  },
  {
    name: 'User agent',
    description: 'The browsers reported user agent',
    example:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.54',
  },
  {
    name: 'Sources',
    description:
      'URL query parameters with a prefix that I can manually add to shared links to see how my links are shared.',
    example: 'share=whatsapp',
  },
]
