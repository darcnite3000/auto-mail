import fs from 'fs'
import { mailerName, mailerPath, flatTag } from './utils'

function replace(out, options) {
  const { templateEmail, title = '', blurb = '', link = '#urlLink#' } = options
  if (!templateEmail) return ''
  return templateEmail
    .replace(/#mail#/, out)
    .replace(/#title#/, title)
    .replace(/#blurb#/, blurb)
    .replace(/#urlLink#/, flatTag(link, options))
    .replace(/#onlineView#/, mailerPath(options))
}

function loadTemplate(path) {
  return fs.readFileSync(path, 'utf8')
}

export function emails({
  defaults = {
    name: '',
    root: ''
  },
  templates = [],
  builds = []
}) {
  const templateEmails = templates.map(loadTemplate)
  let emailList = []

  builds.forEach(({ content = () => '', options = {} }) => {
    const buildConfig = Object.assign({}, defaults, options, {
      rootFolder: defaults.name,
      templateEmail: templateEmails[options.template || defaults.template || 0]
    })
    if (buildConfig.versions && buildConfig.versions.length) {
      buildConfig.versions.forEach(version => {
        const config = Object.assign({}, buildConfig, {
          version
        })
        emailList.push(email(content, config))
      })
    } else {
      emailList.push(email(content, buildConfig))
    }
  })
  return emailList
}

function email(content, options) {
  let mail = flatTag(content, options)
  return {
    name: mailerName(options),
    path: mailerPath(options),
    email: replace(mail, options)
  }
}
