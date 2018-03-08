import {
  tag,
  text
} from '../lib/tags'

const Test = (props, ...children) => (options) => props.test

export const config = {
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
    content: (
      <columns style="background-color:pink;">
        <img linkWrap={true} src="foo" alt="bar" />
        <cell>{text('foo')}bar</cell>
        <Test test="foobarbaz" />
      </columns>
    )
  }]
}
