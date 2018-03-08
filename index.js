require('babel-register')
const {
  emails
} = require('./lib/emails')
const fs = require('fs')
const {
  argv
} = require('yargs')

const {
  config
} = require(argv.config || './src/config')
console.log('email files created')
emails(config).forEach(({
  name,
  path,
  email
}) => {
  console.log(path)
  fs.writeFile(`dist/${name}`, email, 'utf8', err => {
    if (err) return console.log(err)
    console.log(`'${name}' written to '/dist'`)
  })
})
