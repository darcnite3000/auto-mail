# About Auto-Mail

Auto mail is a script to allow for the building of eDMs quickly and for multiple versions at different urls or have different links to be quickly made.

The original version of Auto-Mail would run given an input `config.json`, this had the annoyance that I often had to refer to the `buildHtml.js` or my example cheat sheet, whenever i needed to do something slightly different.

This version of Auto-Mail uses a `config.js` instead of json an uses functional components which follow the form of `() => options => other(options)` or `() => options => 'output'` allowing for the current build setup to be passed in. Being a javascript config allows me to create meta functions to wrap the available tag functions to stop heavy duplication within the build config.

# To use

1. `yarn install` to install dependacies

2. create a config file that describes the emails to build, the default file to look for is `./src/config.js` but the `yarn build` takes a `--config` option

3. `yarn start` to fire up a watch instance that rebuilds the emails on change for files in the `src` directory, and also a browser-sync server that watches for changes in the dist folder

# Other Yarn tasks
#### `yarn clean`
deletes and remakes the `dist` directory

#### `yarn build`
runs the root building script.
can take a `--config` argument to designate the location of the config file
**NB:** this assumes that the `dist` directory exists

#### `yarn server`
starts up a _browser-sync_ server looking at the html files in the `dist` directory

#### `yarn watch`
runs the `yarn clean` task then uses _watch_ to run the `yarn build` task when anything changes in the `src` directory

see the [wiki](https://github.com/darcnite3000/auto-mail/wiki) for an example and api docs
