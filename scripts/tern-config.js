#!env node

const
  _ = require('lodash'),
  fs = require('fs'),
  debug = require('debug')('tern');

debug.enabled = true;

debug('Loading "package.json" file');
const pkg = JSON.parse(fs.readFileSync('./package.json'));

var deps = _.uniq(_.concat(
  _.keys(pkg.devDependencies),
  _.keys(pkg.dependencies)));

debug('Reading "node_modules" content');
var modules = fs.readdirSync('./node_modules');
_.pullAll(modules, deps);
modules = _.map(modules, (m) => { return `node_modules/${m}/**`; });

if (fs.existsSync('./.tern-project')) {
  debug('Generating ".tern-project" file');
  const cfg = JSON.parse(fs.readFileSync('./.tern-project'));
  cfg.dontLoad = modules;

  fs.writeFileSync('./.tern-project', JSON.stringify(cfg, null, 2));
}
else {
  debug('Creating new ".tern-project" file');
  var cfg = {
    ecmaVersion: '6',
    libs: [ 'underscore' ],
    loadEagerly: [],
    dontLoad: modules,
    plugins: {
      doc_comment: true,
      node: { dontLoad: "", load: "",  modules: "" },
      node_resolve: {},
      es_modules: {},
      modules: { dontLoad: "", load: "", modules: "" }
    }
  };
  fs.writeFileSync('./.tern-project', JSON.stringify(cfg, null, 2));
}
