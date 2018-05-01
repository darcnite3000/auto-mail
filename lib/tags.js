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

function TR({ className = '', style = '', ...attrs }, ...children) {
  const tag = options => {
    return `<tr${ifaa('class', className)}${ifaa('style', style)}${attrSpread(
      attrs
    )}>${spreadTdChildren(children, options)}</tr>`
  }
  tag.id = 'tr'
  tag.props = { className, style, ...attrs }
  tag.children = children
  return tag
}

function trWrap(props = {}) {
  return children => TR(props, children)
}

export function Tag(id = 'div', props, ...children) {
  if (!props) props = {}
  if (typeof id !== 'string') {
    return id(props, ...children)
  }
  children = flattenArray(children)
  id = id.toLocaleLowerCase()
  switch (id) {
    case 'columns':
      return Columns(props, ...children)
    case 'dw-columns':
      return DWColumns(props, ...children)
    case 'rows':
      return Rows(props, ...children)
    case 'dw-rows':
      return DWRows(props, ...children)
    case 'text':
      return Text(props, ...children)
    case 'img':
      return Img(props, ...children)
    case 'dw-img':
      return DWImg(props, ...children)
    case 'a':
      return A(props, ...children)
    case 'cell':
      id = 'td'
      props.valign = props.valign || 'top'
      break
    case 'wbr':
    case 'br':
    case 'hr':
    case 'area':
    case 'col':
    case 'input':
    case 'link':
    case 'source':
    case 'track':
    case 'meta':
    case 'embed':
      const { className = '', style = '', ...attrs } = props
      const singleton = options =>
        `<${id}${ifaa('class', className)}${ifaa('style', style)}${attrSpread(
          attrs
        )} />`
      singleton.tag = id
      singleton.props = props
      return singleton
  }
  const { className = '', style = '', ...attrs } = props
  const tag = options =>
    `<${id}${ifaa('class', className)}${ifaa('style', style)}${attrSpread(
      attrs
    )}>${spreadChildren(children, options)}</${id}>`
  tag.tag = id
  tag.props = props
  tag.children = children
  return tag
}

export function Cell(props, ...children) {
  return Tag('td', props, ...children)
}

export function P(props, ...children) {
  return Tag('p', props, ...children)
}

export function Span(props, ...children) {
  return Tag('span', props, ...children)
}

export function Strong(props, ...children) {
  return Tag('strong', props, ...children)
}

function Table(
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
  const tag = options => {
    return `<table${ifaa('class', className)}${ifaa(
      'style',
      style
    )}${attrSpread(attrs)}>${spreadChildren(
      columns ? TR({}, ...children) : mapOrWrap(children, trWrap()),
      options
    )}</table>`
  }
  tag.tag = 'table'
  tag.props = {
    className,
    style,
    columns,
    width,
    ...attrs
  }
  tag.children = children
  return tag
}

export function Rows(props = {}, ...children) {
  if (props && typeof props !== 'object') {
    return Table(
      {
        columns: false
      },
      props,
      ...children
    )
  }
  props.columns = false
  return Table(props, ...children)
}

export function DWRows(props = {}, ...children) {
  if (props && typeof props !== 'object') {
    return Table(
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
  return Table(props, ...children)
}

export function Columns(props = {}, ...children) {
  if (props && typeof props !== 'object') {
    return Table(
      {
        columns: true
      },
      props,
      ...children
    )
  }
  props.columns = true
  return Table(props, ...children)
}

export function DWColumns(props = {}, ...children) {
  if (props && typeof props !== 'object') {
    return Table(
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
  return Table(props, ...children)
}

export function Div(props, ...children) {
  return Tag('div', props, ...children)
}

function divWrap(props = {}) {
  return (...children) => Div(props, ...children)
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
  const tag = options => {
    let out = childText.toString()
    for (let r in replacements) {
      out = out.replace(
        new RegExp(`#${r}#`, 'g'),
        flatTag(replacements[r], options)
      )
    }
    return out
  }
  tag.tag = 'replaceText'
  tag.props = {
    replacements
  }
  tag.children = [childText]
  return tag
}

export function Text(props, ...children) {
  if (arguments.length === 1) {
    return staticContent(props)
  }
  const tag = options => {
    const childText = spreadChildren(children, options)
    if (props.replacements) {
      const { replacements, ...divProps } = props
      return divWrap(divProps)(
        replacedText(
          {
            replacements,
            ...divProps
          },
          childText
        )
      )(options)
    }
    return divWrap(props)(childText)(options)
  }
  tag.tag = 'text'
  tag.props = props
  tag.children = children
  return tag
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
    return Cell(
      {
        style
      },
      Text(inner, ...children)
    )
  }
  return Cell(
    {
      style
    },
    Text(children[0])
  )
}

export function A({ className = '', style = '', link, ...attrs }, ...children) {
  attrs.target = attrs.target || '_blank'
  const tag = options => {
    if (link == undefined) link = options.link
    return `<a href="${flatTag(link, options)}"${ifaa(
      'class',
      className
    )}${ifaa('style', style)}${attrSpread(attrs)}>${spreadChildren(
      children,
      options
    )}</a>`
  }
  tag.tag = 'a'
  tag.props = {
    className,
    style,
    link,
    ...attrs
  }
  tag.children = children
  return tag
}

export function Img(
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
  const tag = options => {
    const imgSrc = noRoot
      ? src
      : `${options.root}${options.rootFolder}/images/${src}`
    const out = `<img src="${imgSrc}"${ifaa('class', className)}${ifaa(
      'style',
      style
    )}${ifaa('alt', alt)}${attrSpread(attrs)} />`
    if (linkWrap === true || (linkWrap !== false && options.linkImages)) {
      if (link) wrap.link = link
      return A(wrap, () => out)(options)
    }
    return out
  }
  tag.tag = 'img'
  tag.props = {
    className,
    style,
    alt,
    link,
    linkWrap,
    wrap,
    src,
    noRoot,
    ...attrs
  }
  return tag
}

export function DWImg(props = {}, image) {
  props.className =
    props.className != undefined ? props.className : 'deviceWidth'
  return Img(props, image)
}
