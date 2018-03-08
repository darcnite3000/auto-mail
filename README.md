# About Auto-Mail

Auto mail is a script to allow for the building of eDMs quickly and for multiple versions at different urls or have different links to be quickly made.

The original version of Auto-Mail would run given an input `config.json`, this had the annoyance that I often had to refer to the `buildHtml.js` or my example cheat sheet, whenever i needed to do something slightly different.

This version of Auto-Mail uses a `config.js` instead of json an uses functional components which follow the form of `() => options => other(options)` or `() => options => 'output'` allowing for the current build setup to be passed in. Being a javascript config allows me to create meta functions to wrap the available tag functions to stop heavy duplication within the build config.

# To use

1. `yarn install` to install dependacies

2. create a config file that describes the emails to build, the default file to look for is `./src/config.js` but the `yarn build` takes a `--config` option

3. `yarn start` to fire up a watch instance that rebuilds the emails on change for files in the `src` directory, and also a browser-sync server that watches for changes in the dist folder

## example config:

```javascript
const { td, table, text, a, img } = require('../tags')

module.exports = {
  templates: ['src/template.html'],
  defaults: {
    root: 'http://whatever.com/',
    name: 'food',
    title: 'This is a test',
    blurb: 'check out the latest from here',
    link: options => '',
    versions: [],
    template: 0
  },
  builds: [
    {
      options: {
        root: '',
        name: 'bar',
        link: 'http://other.com',
        versions: [1, 2, 3]
      },
      content: table({ style: 'background-color:pink;', columns: true }, [
        img({ linkWrap: true }, 'foo'),
        td({}, [text('foo'), text('bar')])
      ])
    },
    {
      options: { name: 'baz' },
      content: table(
        { style: 'background-color:pink;' },
        td({}, img({}, 'bar', { alt: 'foo bar baz' }))
      )
    }
  ]
}
```

more are available in the examples folder

## `index.js` Root entry file

builds the emails from the `[]EmailObject` and saves them to the `dist` folder given the `name`
it either uses command line args to grab the `--config` or looks for `./src/config.js` for the `ConfigObject`

## `server.js` Simple BrowserSync Server

runs a BrowserSync server watching the `dist/*.html` files

## `lib/emails.js` The email building script

#### `emails(ConfigObject): []EmailObject` [root export]

builds a list of email outputs using both the `build`s and the `versions` to be saved however is needed, giving the name, and path to the mailer.
`rootFolder` `version` and `templateEmail` are all added in the email build process.
the `options` for each build are merged with the default values from the `ConfigObject`s `default`

## `lib/utils.js` Useful helper functions

#### `mailerPath(BuildOption): string`

builds mailer path from the given options

#### `mailerName(BuildOption): string`

builds mailer name from the given options

#### `escapeHtml(string, []Replacement): string`

escapes the given text for html default replacements for `&<>"'`

#### `HTML_REPLACEMENTS`

contains the replacements for `amp`, `lt`, `gt`, `quot`, `squot`

#### `localOptionsDefault(any, string, any): (BuildOption) => any`

first checks if the local value is not defined, then the value in the BuildOption then uses the default value

## `lib/tags.js` The functions that build the content

#### `table(Props, ExpContent, Attrs): Tag`

pulls `className: string`, `style: string`, `width: string | int` and `columns: bool` from the `Props` and based on the columns setting builds a list of columns or rows out of the given content

#### `rows(Props, ExpContent, Attrs): Tag` or `rows(ExpContent, Attrs): Tag`

simple wrapper around `table` defaulting to rows with the ability to skip the `Props`

#### `columns(Props, ExpContent, Attrs): Tag` or `columns(ExpContent, Attrs): Tag`

simple wrapper around `table` defaulting to columns with the ability to skip the `Props`

#### `tag(string, Props, ExpContent, Attrs): Tag`

given a tag name essentially wraps the output or passes it on to the specific tag function

#### `div(Props, Content, Attrs): Tag`

wrapper around `tag`

#### `td(Props, ExpContent, Attrs): Tag` [aka `cell`]

wrapper around `tag`

#### `p(Props, ExpContent, Attrs): Tag`

wrapper around `tag`

#### `span(Props, ExpContent, Attrs): Tag`

wrapper around `tag`

#### `strong(Props, ExpContent, Attrs): Tag`

wrapper around `tag`

#### `text(Props, Content, Attrs): Tag` or `text(Content): Tag`

If just the `Content` is sent, it returns that `Content` assuming it a string.
If `Props` or `Attrs` are given it wraps the text in a `div` to which it passes the `Props` and `Attrs`
If `Props` contains `replacements` it passes this to a `replacedText` call

#### `replacedText({replacements: { [string]: Content }}, Content): Tag`

uses the `replacements` to string.replace every matched `#string#` with the string or replacement function given the `BuildOption` for the `Content`

#### `paddedCellText(Props, Content, Attrs): Tag`

a combination of a `td` and `text` passing `innerProps` and `innerAttrs` from the `Props` to the `text` and using `top`,`left`,`bottom`,`right` and `sides` to set the padding for the `td`

#### `a(Props, ExpContent, Attrs): Tag`

using either the `BuildOption`s `link` or the `Props` `link` it builds an anchor tag around the content

#### `img(Props, string, Attrs): Tag`

builds an image tag given the `alt` from the `Props` and the given string
If there is a `link` set on the `Props` or if the `BuildOption` has the `linkImages` being true and the `Props` does not turn this off by setting `linkWrap` false, it will wrap the image with an `a` passing `wrapProps` and `wrapAttrs` to it

#### `noOp(): () => string`

function that will eventually give back an empty string

#### `ifVersion(Version, Tag, Tag): Tag`

if the current `BuildOption`s `version` matches do the first function else the second

#### `ifVersionSwitch({[Version]: Tag}, Tag): Tag`

using an object use the keys to match the `BuildOption`s version and do the matching function else the given default

## Types

#### ConfigObject

```
{
  template: []string,
  default: BuildOption,
  builds: []Build
}
```

#### Build

```
{
  options: BuildOption,
  content: Tag
}
```

#### BuildOption

```
{
  root: string,
  rootFolder: string,
  name: string,
  title: string,
  blurb: string,
  link: string | Tag,
  linkImages: bool,
  versions: []Version,
  version: Version
  template: int,
  templateEmail: string,
  [any]: any
}
```

all values bar `root` and `name` are optional

#### Tag

```
(BuildOption) => string
```

#### Replacement

```
{
  match: regex | string,
  replace: string
}
```

#### Props and Attrs

```
{
  [any]: any
}
```

#### Content

```
string | Tag
```

### ExpContent

```
Content | []Content
```

#### Version

```
any
```
