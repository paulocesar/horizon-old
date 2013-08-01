#!/usr/bin/env node

var fs = require('fs');

global['ROOT'] = '.';
global['ROOT_APP'] = ROOT+'/app';

//============COMMAND=LINE=============

if(typeof process.argv[2] != 'undefined' && typeof process.argv[3] != 'undefined') {
  var cmd = process.argv[2];
  var arg = process.argv[3];
  // console.log('feature not done... =/');
  // return;

  String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  }

  function copy(src,dst) {
    is = fs.createReadStream(src);
    os = fs.createWriteStream(dst,{flags: 'w'});
    is.pipe(os);
  }

  if(cmd == 'start') {
    if(!fs.existsSync(ROOT_APP)) {
      var wrench = require('wrench');
      wrench.copyDirSyncRecursive(__dirname+'/../app',ROOT_APP,{});
    }
    name = arg.toLowerCase();
    src = ROOT_APP+'/templates/server.js';
    dst = ROOT+'/'+name+'.js';
    copy(src,dst);
  }

  if(cmd == 'controller' || cmd == 'generate' ) {
    name = arg.capitalize();
    // console.log('generating controller ' + name + ' ...');
    src = ROOT_APP+'/templates/controller.js';
    dst = ROOT_APP+'/controllers/'+name+'Controller.js';
    copy(src,dst);
  }
  if(cmd == 'model' || cmd == 'generate') {
    name = arg.capitalize();
    // console.log('generating model ' + name + ' ...');
    src = ROOT_APP+'/templates/model.js';
    dst = ROOT_APP+'/models/'+name+'.js';
    copy(src,dst);
  }
  return;
}