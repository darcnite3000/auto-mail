export function attrSpread(attrs = {}) {
  let attra = []
  for (const attr in attrs) {
    if (attrs.hasOwnProperty(attr)) {
      attra.push(`${attr}="${attrs[attr]}"`)
    }
  }
  return attra.length ? ' ' + attra.join(' ') : ''
}

export function mapOrWrap(children, wrapper) {
  return options =>
    Array.isArray(children)
      ? children.map(wrapper).map(mapOpt(options))
      : wrapper(children)(options)
}

export function spreadChildren(children, options = {}) {
  const out = Array.isArray(children)
    ? children.map(mapOpt(options))
    : flatTag(children, options)
  return Array.isArray(out) ? out.join('') : out
}

export function flatTag(el, options) {
  return typeof el === 'function' ? el(options) : el.toString()
}

export function mapOpt(options) {
  return el => flatTag(el, options)
}

export function mailerName(options) {
  return `${options.name}${
    options.version ? '_' + options.version : ''
  }_email.html`
}

export function mailerPath(options) {
  return `${options.root}${options.rootFolder || options.name}/${mailerName(
    options
  )}`
}

export function localOptionsDefault(local, optionId = '', defaultValue = '') {
  return options =>
    local != undefined
      ? local
      : options[optionId] != undefined ? options[optionId] : defaultValue
}

function escapeReducer(str, r) {
  return str.replace(r.match, r.replace)
}

export const HTML_REPLACEMENTS = {
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

export function escapeHtml(
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

export function staticContent(content) {
  return () => content.toString()
}

export function flattenArray(array = []) {
  function flatten(el) {
    if (!Array.isArray(el)) {
      return el
    }
    return el.reduce((array, el) => {
      return array.concat(flatten(el))
    }, [])
  }
  return flatten(array)
}

export function emptyString() {
  return staticContent('')
}

export function ifVersion(
  version,
  ifTrue = emptyString,
  ifFalse = emptyString
) {
  return options => {
    if (options.version === version) return ifTrue(options)
    return ifFalse(options)
  }
}

export function ifVersionSwitch(cases = {}, ifDefault = emptyString) {
  return options => {
    for (let version in cases) {
      if (options.version === version) return cases[version](options)
    }
    return ifDefault(options)
  }
}
