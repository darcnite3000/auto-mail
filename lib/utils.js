function mailerName(options) {
  return `${options.name}${
    options.version ? '_' + options.version : ''
  }_email.html`
}

function mailerPath(options) {
  return `${options.root}${options.rootFolder || options.name}/${mailerName(
    options
  )}`
}

function localOptionsDefault(local, optionId = '', defaultValue = '') {
  return options =>
    local != undefined ?
    local :
    options[optionId] != undefined ? options[optionId] : defaultValue
}

function escapeReducer(str, r) {
  return str.replace(r.match, r.replace)
}

const HTML_REPLACEMENTS = {
  amp: {
    match: /&/g,
    replace: '&amp;'
  },
  lt: {
    match: /</g,
    replace: '&lt;'
  },
  gt: {
    match: />/g,
    replace: '&gt;'
  },
  quot: {
    match: /"/g,
    replace: '&quot;'
  },
  squot: {
    match: /'/g,
    replace: '&#039;'
  }
}

function escapeHtml(
  unsafe,
  replacements = [
    HTML_REPLACEMENTS.amp,
    HTML_REPLACEMENTS.lt,
    HTML_REPLACEMENTS.gt,
    HTML_REPLACEMENTS.quot,
    HTML_REPLACEMENTS.squot
  ]
) {
  if (typeof unsafe !== 'string') return unsafe
  return replacements.reduce(escapeReducer, unsafe)
}

function staticContent(content) {
  return () => content
}

function emptyString() {
  return staticContent('')
}

function ifVersion(version, ifTrue = emptyString, ifFalse = emptyString) {
  return options => {
    if (options.version === version) return ifTrue(options)
    return ifFalse(options)
  }
}

function ifVersionSwitch(cases = {}, ifDefault = emptyString) {
  return options => {
    for (let version in cases) {
      if (options.version === version) return cases[version](options)
    }
    return ifDefault(options)
  }
}

module.exports = {
  mailerPath,
  mailerName,
  escapeHtml,
  HTML_REPLACEMENTS,
  localOptionsDefault,
  staticContent,
  emptyString,
  ifVersion,
  ifVersionSwitch
}
