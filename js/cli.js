// Generated by CoffeeScript 1.12.4
var Path, fs, spawn;

spawn = require("child_process").spawn;

Path = require("path");

fs = require("fsx");

module.exports = function(options) {
  var dir, filename, parentDir, path, runLab;
  dir = options._.shift() || ".";
  filename = options._.shift() || "index";
  if (!Path.isAbsolute(dir)) {
    parentDir = dir[0] === "." ? process.cwd() : lotus.path;
    dir = Path.resolve(parentDir, dir);
  }
  path = dir;
  if (fs.isDir(dir)) {
    path += "/lab/" + filename + ".coffee";
  }
  if (!fs.isFile(path)) {
    log.moat(1);
    log.red("Invalid file: ");
    log.white(path);
    log.moat(1);
    return;
  }
  runLab = require("./runLab");
  return runLab(path, options);
};
