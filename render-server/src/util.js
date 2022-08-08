const getArguments = () =>
  require('yargs')
    .option('p', {
      alias: 'port',
      description: "Specify the server's port",
      default: 9009,
    })
    .option('a', {
      alias: 'address',
      description: "Specify the server's address",
      default: '0.0.0.0',
    })
    .help('h')
    .alias('h', 'help')
    .strict().argv

const isDevelopment = process.env.NODE_ENV === 'development'

module.exports = {
  isDevelopment,
  getArguments,
}
