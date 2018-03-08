const {
  td,
  table,
  text,
  img
} = require('../lib/tags')

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
  builds: [{
      options: {
        root: '',
        name: 'bar',
        link: 'http://test.com',
        versions: [1, 2, 3]
      },
      content: table({
        style: 'background-color:pink;',
        columns: true
      }, [
        img({
          linkWrap: true
        }, 'foo'),
        td({}, [text('foo'), text('bar')])
      ])
    },
    {
      options: {
        name: 'baz'
      },
      content: table({
          style: 'background-color:pink;'
        },
        td({}, img({}, 'bar', {
          alt: 'foo bar baz'
        }))
      )
    }
  ]
}
