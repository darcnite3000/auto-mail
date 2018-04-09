import {
  staticContent,
  flatTag,
  flattenArray,
  mapOpt,
  attrSpread,
  mapOrWrap,
  spreadChildren
} from './utils'

function wrapTd(out) {
  if (!out.match(/^<td/gi)) out = `<td valign="top">${out}</td>`
  return out
}

function spreadTdChildren(children, options = {}) {
  const out = Array.isArray(children)
    ? children.map(mapOpt(options)).map(wrapTd)
    : wrapTd(flatTag(children, options))
  return Array.isArray(out) ? out.join('') : out
}

function ifaa(name, attr) {
  return attr ? ` ${name}="${attr}"` : ''
}

function ifs(val, output) {
  return val ? output : ''
}

export function tr({ className = '', style = '', ...attrs }, ...children) {
  return options => {
    return `<tr${ifaa('class', className)}${ifaa('style', style)}${attrSpread(
      attrs
    )}>${spreadTdChildren(children, options)}</tr>`
  }
}

function trWrap(props = {}) {
  return children => tr(props, children)
}

export function tag(id = 'div', props, ...children) {
  if (!props) props = {}
  if (typeof id !== 'string') {
    return id(props, ...children)
  }
  children = flattenArray(children)
  switch (id.toLowerCase()) {
    case 'tr':
      return tr(props, ...children)
    case 'table':
      return table(props, ...children)
    case 'columns':
      return columns(props, ...children)
    case 'dw-columns':
      return dwColumns(props, ...children)
    case 'rows':
      return rows(props, ...children)
    case 'dw-rows':
      return dwRows(props, ...children)
    case 'text':
      return text(props, ...children)
    case 'img':
      return img(props, ...children)
    case 'dw-img':
      return dwImg(props, ...children)
    case 'a':
      return a(props, ...children)
    case 'cell':
    case 'td':
      id = 'td'
      props.valign = props.valign || 'top'
      break
    case 'br':
    case 'hr':
      const { className = '', style = '', ...attrs } = props
      return options =>
        `<${id}${ifaa('class', className)}${ifaa('style', style)}${attrSpread(
          attrs
        )} />`
  }
  const { className = '', style = '', ...attrs } = props
  return options =>
    `<${id}${ifaa('class', className)}${ifaa('style', style)}${attrSpread(
      attrs
    )}>${spreadChildren(children, options)}</${id}>`
}

export function td(props, ...children) {
  return tag('td', props, ...children)
}

export function p(props, ...children) {
  return tag('p', props, ...children)
}

export function span(props, ...children) {
  return tag('span', props, ...children)
}

export function strong(props, ...children) {
  return tag('strong', props, ...children)
}

export function table(
  { className = '', style = '', columns = false, width, ...attrs },
  ...children
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
    )}${attrSpread(attrs)}>${spreadChildren(
      columns ? tr({}, ...children) : mapOrWrap(children, trWrap()),
      options
    )}</table>`
  }
}

export function rows(props = {}, ...children) {
  if (props && typeof props !== 'object') {
    return table(
      {
        columns: false
      },
      props,
      ...children
    )
  }
  props.columns = false
  return table(props, ...children)
}

export function dwRows(props = {}, ...children) {
  if (props && typeof props !== 'object') {
    return table(
      {
        className: 'deviceWidth',
        columns: false
      },
      props
    )
  }
  props.className =
    props.className != undefined ? props.className : 'deviceWidth'
  props.columns = false
  return table(props, ...children)
}

export function columns(props = {}, ...children) {
  if (props && typeof props !== 'object') {
    return table(
      {
        columns: true
      },
      props,
      ...children
    )
  }
  props.columns = true
  return table(props, ...children)
}

export function dwColumns(props = {}, ...children) {
  if (props && typeof props !== 'object') {
    return table(
      {
        className: 'deviceWidth',
        columns: true
      },
      props,
      ...children
    )
  }
  props.className =
    props.className != undefined ? props.className : 'deviceWidth'
  props.columns = true
  return table(props, ...children)
}

export function div(props, ...children) {
  return tag('div', props, ...children)
}

function divWrap(props = {}) {
  return (...children) => div(props, ...children)
}

export function replacedText(
  {
    replacements = {
      href(options) {
        return flatTag(options.link, options)
      }
    }
  },
  childText
) {
  return options => {
    let out = childText.toString()
    for (let r in replacements) {
      out = out.replace(
        new RegExp(`#${r}#`, 'g'),
        flatTag(replacements[r], options)
      )
    }
    return out
  }
}

export function text(props, ...children) {
  if (arguments.length === 1) {
    return staticContent(props)
  }
  return options => {
    const childText = spreadChildren(children, options)
    if (props.replacements) {
      const { replacements, ...divProps } = props
      return divWrap(divProps)(
        replacedText({ replacements, ...divProps }, childText)
      )(options)
    }
    return divWrap(props)(childText)(options)
  }
}

export function paddedCellText(
  {
    inner = {},
    style = '',
    top = 10,
    bottom = 0,
    sides = 20,
    left = sides,
    right = sides,
    ...attrs
  },
  ...children
) {
  style = `${style}${ifs(top, `padding-top:${top}px;`)}${ifs(
    bottom,
    `padding-bottom:${bottom}px;`
  )}${ifs(left, `padding-left:${left}px;`)}${ifs(
    right,
    `padding-right:${right}px;`
  )}`
  if (children.length) {
    return td(
      {
        style
      },
      text(inner, ...children)
    )
  }
  return td(
    {
      style
    },
    text(children[0])
  )
}

export function a({ className = '', style = '', link, ...attrs }, ...children) {
  attrs.target = attrs.target || '_blank'
  return options => {
    if (link == undefined) link = options.link
    return `<a href="${flatTag(link, options)}"${ifaa(
      'class',
      className
    )}${ifaa('style', style)}${attrSpread(attrs)}>${spreadChildren(
      children,
      options
    )}</a>`
  }
}

export function img(
  {
    className = '',
    style = '',
    alt = '',
    link,
    linkWrap,
    wrap = {},
    src = '',
    noRoot = false,
    ...attrs
  },
  image
) {
  attrs.title = attrs.title || alt
  attrs.border = attrs.border || 0
  if (image) src = image
  return options => {
    const imgSrc = noRoot
      ? src
      : `${options.root}${options.rootFolder}/images/${src}`
    const out = `<img src="${imgSrc}"${ifaa('class', className)}${ifaa(
      'style',
      style
    )}${ifaa('alt', alt)}${attrSpread(attrs)} />`
    if (linkWrap === true || (linkWrap !== false && options.linkImages)) {
      if (link) wrap.link = link
      return a(wrap, () => out)(options)
    }
    return out
  }
}

export function dwImg(props = {}, image) {
  props.className =
    props.className != undefined ? props.className : 'deviceWidth'
  return img(props, image)
}

export { td as cell }
