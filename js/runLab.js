var FS, Module, Path, Promise, Random, VM, coffee, define, didExit, log, makeModule, printSyntaxError, sync, template;

require("isDev");

require("isNodeJS");

printSyntaxError = require("printSyntaxError");

Promise = require("Promise");

didExit = require("didExit");

Random = require("random");

coffee = require("coffee-script");

define = require("define");

Path = require("path");

sync = require("sync");

log = require("log");

FS = require("io/sync");

VM = require("vm");

template = FS.read(Path.resolve(__dirname + "/../src/template.coffee"));

module.exports = function(entry, options) {
  var absolutes, entryDir, error, id, mapRef, outDir, output, relatives, script;
  if (options == null) {
    options = {};
  }
  if (!FS.isFile(entry)) {
    throw Error("Must provide a file path: '" + entry + "'");
  }
  entryDir = Path.dirname(entry);
  outDir = Path.resolve(entryDir, "tmp");
  while (true) {
    id = Random.id(6);
    if (!FS.exists(Path.join(outDir, id + ".coffee"))) {
      break;
    }
  }
  relatives = {};
  sync.each(["coffee", "js", "map"], function(ext) {
    return relatives[ext] = id + "." + ext;
  });
  absolutes = sync.map(relatives, function(filePath) {
    return Path.join(outDir, filePath);
  });
  mapRef = log.ln + "//# sourceMappingURL=" + relatives.map + log.ln;
  script = FS.read(entry).trim().split(log.ln).join(log.ln + "    ");
  script = ["__dirname = \"" + (Path.dirname(absolutes.js)) + "\"", "__filename = \"" + absolutes.js + "\"", template.replace(/\$SCRIPT/g, script)].join(log.ln);
  log.cyan(script);
  try {
    output = coffee.compile(script, {
      bare: true,
      sourceMap: true,
      sourceRoot: ".",
      sourceFiles: [relatives.coffee],
      generatedFile: relatives.js,
      filename: absolutes.coffee
    });
  } catch (error1) {
    error = error1;
    printSyntaxError(error, entry);
    log.moat(1);
    return false;
  }
  FS.makeDir(outDir);
  FS.write(absolutes.coffee, script);
  FS.write(absolutes.js, output.js + mapRef);
  FS.write(absolutes.map, output.v3SourceMap);
  didExit(function() {
    log.moat(1);
    log.red("EXIT");
    log.moat(1);
    if (options.preservePaths !== true) {
      sync.each(absolutes, function(path) {
        return FS.remove(path);
      });
    }
  });
  log.pushIndent(2);
  log.moat(1);
  log.white("lotus-lab ");
  log.green(id);
  log.moat(0);
  log.yellow(Path.relative(lotus.path, entry));
  log.moat(1);
  log.popIndent();
  global.lotus = lotus;
  global.sync = sync;
  define(global, {
    isDev: isDev,
    isNodeJS: isNodeJS,
    process: process,
    log: log,
    Promise: Promise
  });
  global.__module = makeModule(entry, module);
  VM.runInThisContext("try { global.__module.require('" + absolutes.js + "') } catch(error) { console.log('caught error!'); process.exit(0) }");
  return true;
};

Module = require("module");

makeModule = function(modulePath, parentModule) {
  var newModule;
  newModule = new Module(modulePath, parentModule);
  newModule.filename = modulePath;
  newModule.dirname = Path.dirname(modulePath);
  return newModule;
};

//# sourceMappingURL=map/runLab.map