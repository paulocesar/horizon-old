var fs = require('fs');

//============COMMAND=LINE=============

if(typeof process.argv[2] != 'undefined' && typeof process.argv[3] != 'undefined') {
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

  if(process.argv[2] == 'controller' || process.argv[2] == 'generate' ) {
    name = process.argv[3].capitalize();
    // console.log('generating controller ' + name + ' ...');
    src = __dirname+'/../app/templates/controller.js';
    dst = __dirname+'/../app/controllers/'+name+'Controller.js';
    copy(src,dst);
  }
  if(process.argv[2] == 'model' || process.argv[2] == 'generate') {
    name = process.argv[3].capitalize();
    // console.log('generating model ' + name + ' ...');
    src = __dirname+'/../app/templates/model.js';
    dst = __dirname+'/../app/models/'+name+'.js';
    copy(src,dst);
  }
  return;
}