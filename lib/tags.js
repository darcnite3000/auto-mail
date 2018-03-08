const {
  escapeHtml
} = require('./utils')

function attrSpread(attrs = {}) {
  let attra = []
  for (const attr in attrs) {
    if (attrs.hasOwnProperty(attr)) {
      attra.push(`${attr}="${escapeHtml(attrs[attr])}"`)
    }
  }
  return attra.length ? ' ' + attra.join(' ') : ''
}

function flatTag(el, options) {
  return typeof el !== 'string' ? el(options) : el
}

function mapOpt(options) {
  return el => flatTag(el, options)
}

function mapOrWrap(content, wrapper) {
  return options =>
    Array.isArray(content) ?
    content.map(wrapper).map(mapOpt(options)) :
    wrapper(content)(options)
}

function contentSpread(content, options = {}) {
  const out = Array.isArray(content) ?
    content.map(mapOpt(options)) :
    flatTag(content, options)
  return Array.isArray(out) ? out.join('') : out
}

function wrapTd(out) {
  if (!out.match(/<td/gi)) out = `<td valign="top">${out}</td>`
  return out
}

function tdSpread(content, options = {}) {
  const out = Array.isArray(content) ?
    content.map(mapOpt(options)).map(wrapTd) :
    wrapTd(flatTag(content, options))
  return Array.isArray(out) ? out.join('') : out
}

function ifaa(name, attr) {
  return attr ? ` ${name}="${escapeHtml(attr)}"` : ''
}

function ifs(val, output) {
  return val ? output : ''
}

function noOp() {
  return () => ''
}

function ifVersion(version, ifTrue = noOp, ifFalse = noOp) {
  return options => {
    if (options.version === version) return ifTrue(options)
    return ifFalse(options)
  }
}

function ifVersionSwitch(cases = {}, ifDefault = noOp) {
  return options => {
    for (let version in cases) {
      if (options.version === version) return cases[version](options)
    }
    return ifDefault(options)
  }
}

function tr({
  className = '',
  style = ''
}, content, attrs = {}) {
  return options => {
    return `<tr${ifaa('class', className)}${ifaa('style', style)}${attrSpread(
      attrs
    )}>${tdSpread(content, options)}</tr>`
  }
}

function trWrap(props = {}, attrs = {}) {
  return content => tr(props, content, attrs)
}

function tag(id = 'div', props = {}, content = [], attrs = {}) {
  const {
    className = '', style = ''
  } = props
  switch (id.toLowerCase()) {
    case 'tr':
      return tr(props, content, attrs)
    case 'table':
      return table(props, content, attrs)
    case 'columns':
      return columns(props, content, attrs)
    case 'rows':
      return rows(props, content, attrs)
    case 'cell':
      return td(props, content, attrs)
    case 'text':
      return divText(props, content, attrs)
    case 'img':
      return img(props, content, attrs)
    case 'a':
      return a(props, content, attrs)
    default:
      return options =>
        `<${id}${ifaa('class', className)}${ifaa('style', style)}${attrSpread(
          attrs
        )}>${contentSpread(content, options)}</${id}>`
  }
}

function td(props, content, attrs = {}) {
  attrs.valign = attrs.valign || 'top'
  return tag('td', props, content, attrs)
}

function p(props, content, attrs = {}) {
  return tag('p', props, content, attrs)
}

function span(props, content, attrs = {}) {
  return tag('span', props, content, attrs)
}

function strong(props, content, attrs = {}) {
  return tag('strong', props, content, attrs)
}

function table({
    className = '',
    style = '',
    columns = false,
    width
  },
  content = [],
  attrs = {}
) {
  if (width) {
    attrs.width = width
    if (width.toString().match(/%/) == null) width = `${width}px`
    style = `${style}width:${width};`
  }
  attrs.border = attrs.border || 0
  attrs.cellpadding = attrs.cellpadding || 0
  attrs.cellspacing = attrs.cellspacing || 0
  return options => {
    return `<table${ifaa('class', className)}${ifaa(
      'style',
      style
    )}${attrSpread(attrs)}>${contentSpread(
      columns ? tr({}, content) : mapOrWrap(content, trWrap()),
      options
    )}</table>`
  }
}

function rows(props = {}, content, attrs) {
  if (arguments.length === 1) {
    return table({
        columns: false
      },
      props
    )
  }
  props.columns = false
  return table(props, content, attrs)
}

function dwRows(props = {}, content, attrs) {
  if (arguments.length === 1) {
    return table({
        className: 'deviceWidth',
        columns: false
      },
      props
    )
  }
  props.className = props.className != undefined ? props.className : 'deviceWidth'
  props.columns = false
  return table(props, content, attrs)
}

function columns(props = {}, content, attrs) {
  if (arguments.length === 1) {
    return table({
        columns: true
      },
      props
    )
  }
  props.columns = true
  return table(props, content, attrs)
}

function dwColumns(props = {}, content, attrs) {
  if (arguments.length === 1) {
    return table({
        className: 'deviceWidth',
        columns: true
      },
      props
    )
  }
  props.className = props.className != undefined ? props.className : 'deviceWidth'
  props.columns = true
  return table(props, content, attrs)
}

function div(props, content, attrs) {
  return tag('div', props, content, attrs)
}

function divWrap(props = {}, attrs = {}) {
  return content => div(props, content, attrs)
}

function text(content) {
  return () => content
}

function optionLink(options) {
  return flatTag(options.link, options)
}

function replacedText({
    replacements = {
      href: optionLink
    }
  },
  content
) {
  return options => {
    let out = content
    for (let r in replacements) {
      out = out.replace(
        new RegExp(`#${r}#`, 'g'),
        flatTag(replacements[r], options)
      )
    }
    return out
  }
}

function divText(props, content, attrs) {
  if (arguments.length === 1) {
    return text(props)
  }
  if (props.replacements) {
    return divWrap(props, attrs)(replacedText(props, content))
  }
  return divWrap(props, attrs)(text(content))
}

function paddedCellText({
    innerProps,
    innerAttrs,
    style = '',
    top = 10,
    bottom = 0,
    sides = 20,
    left = sides,
    right = sides
  },
  content,
  attrs = {}
) {
  style = `${style}${ifs(top, `padding-top:${top}px;`)}${ifs(
    bottom,
    `padding-bottom:${bottom}px;`
  )}${ifs(left, `padding-left:${left}px;`)}${ifs(
    right,
    `padding-right:${right}px;`
  )}`
  if (innerProps || innerAttrs)
    return td({
        style
      },
      divText(innerProps, content, innerAttrs),
      attrs
    )
  return td({
      style
    },
    text(content),
    attrs
  )
}

function a({
  className = '',
  style = '',
  link
}, content, attrs = {}) {
  attrs.target = attrs.target || '_blank'
  return options => {
    if (link == undefined) link = options.link
    return `<a href="${flatTag(link, options)}"${ifaa(
      'class',
      className
    )}${ifaa('style', style)}${attrSpread(attrs)}>${contentSpread(
      content,
      options
    )}</a>`
  }
}

function img({
    className = '',
    style = '',
    alt = '',
    link,
    linkWrap,
    wrapProps = {},
    wrapAttrs = {}
  },
  content,
  attrs = {}
) {
  attrs.title = attrs.title || alt
  attrs.border = attrs.border || 0
  return options => {
    const out = `<img src="${options.root}${
      options.rootFolder
    }/images/${content}"${ifaa('class', className)}${ifaa(
      'style',
      style
    )}${ifaa('alt', alt)}${attrSpread(attrs)} />`
    if (linkWrap === true || (linkWrap !== false && options.linkImages)) {
      if (link) wrapProps.link = link
      return a(wrapProps, () => out, wrapAttrs)(options)
    }
    return out
  }
}

function dwImg(props = {}, content, attrs) {
  props.className = props.className != undefined ? props.className : 'deviceWidth'
  return img(props, content, attrs)
}

module.exports = {
  table,
  rows,
  dwRows,
  columns,
  dwColumns,
  td,
  cell: td,
  text: divText,
  replacedText,
  paddedCellText,
  a,
  img,
  dwImg,
  tag,
  p,
  div,
  span,
  strong,
  noOp,
  ifVersion,
  ifVersionSwitch
}
