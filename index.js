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
    src = __dirname+'/app/templates/controller.js';
    dst = __dirname+'/app/controllers/'+name+'Controller.js';
    copy(src,dst);
  }
  if(process.argv[2] == 'model' || process.argv[2] == 'generate') {
    name = process.argv[3].capitalize();
    // console.log('generating model ' + name + ' ...');
    src = __dirname+'/app/templates/model.js';
    dst = __dirname+'/app/models/'+name+'.js';
    copy(src,dst);
  }
  return;
}

//=========HELPERS=============


function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}


//============HORIZON=FRAMEWORK=================


var mongoose = require('mongoose');
global['Schema'] = mongoose.Schema;
global['ObjectId'] = mongoose.Schema.Types.ObjectId;

global['Utils'] = require(__dirname+'/app/utils.js');

var express = require('express');
var app = express();

module.exports = function (configuration) {

  function set_conf(deft,param) {
    if (typeof param !== 'undefined')
      return param;
    return deft;
  }

  config = set_conf(null,configuration.configure);
  language = set_conf('en',configuration.language);
  database = set_conf('horizon',configuration.database);


  global['mongoose'] = require('mongoose');
  mongoose.connect('mongodb://localhost/'+database);
  mongoose.connection.on('error',function(err){
    console.log('cant connect!');
    process.exit();
  });

  Horizon.set_language(language);
  Horizon.bootstrap(app,config);

  bootstrap = set_conf(function(){},configuration.bootstrap);
  bootstrap();

  return app;
}

var Horizon = {
  ROOT : __dirname+'/app/',
  h_models : [],
  h_policies : {},
  h_policies_rules : require(__dirname+'/app/policy.js'),
  h_routes : require(__dirname+'/app/route.js'),
  h_controllers : {},
  h_i18n : null,
  h_controller_template : {
    index : function (req, res) {
      model_name = Horizon.convert_path_to_model(req.url.split('/')[1]);
      
      if(typeof global[model_name] === 'undefined') {
        res.send('undefined');
        return;
      }
      
      query = {};
      if(!isEmpty(req.query))
        query = req.query;
      else if(!isEmpty(req.body))
        query = req.body;
      
      global[model_name].find(query).exec(function(err,model){
        if(err)
          res.json(err);
        else
          res.json(model);
      });
    },

    view : function (req, res) {
      model_name = Horizon.convert_path_to_model(req.url.split('/')[1]);
      
      if(typeof global[model_name] === 'undefined') {
        res.send('undefined');
        return;
      }
      
      query = {};
      if(!isEmpty(req.query))
        query = req.query;
      else if(!isEmpty(req.body))
        query = req.body;
      
      global[model_name].findOne(query).exec(function(err,model){
        if(err)
          res.json(err);
        else
          res.json(model);
      });
    },

    create : function (req, res) {
      model_name = Horizon.convert_path_to_model(req.url.split('/')[1]);
      
      if(typeof global[model_name] === 'undefined') {
        res.send('undefined');
        return;
      }
      
      query = {};
      if(!isEmpty(req.query))
        query = req.query;
      else if(!isEmpty(req.body))
        query = req.body;
      
      global[model_name](query).save(function (err){
        if(err)
          res.json(err);
        else
          global[model_name].find(query).exec(function (err2, model){
            if(err2)
              res.json(err2);
            else
              res.json(model);
          });
      });

    },

    delete : function (req, res) {
      model_name = Horizon.convert_path_to_model(req.url.split('/')[1]);
      if(typeof global[model_name] === 'undefined') {
        res.send('undefined');
        return;
      }
      query = {};
      if(!isEmpty(req.query))
        query = req.query;
      else if(!isEmpty(req.body))
        query = req.body;

      global[model_name].find(query).exec(function (err, model){
        if(err)
          res.json(err);
        else
          global[model_name].remove(query).exec(function (err2){
            if(err2)
              res.json(err2)
            else
              res.json(model);
          });
      });
    },

    edit : function (req, res) {
      model_name = Horizon.convert_path_to_model(req.url.split('/')[1]);
      
      if(typeof global[model_name] === 'undefined') {
        res.send('undefined');
        return;
      }
      
      data = {};
      if(!isEmpty(req.query))
        data = req.query;

      query = {};
      if(!isEmpty(req.body))
        query = req.body;

      global[model_name].update(query,{$set:data},{multi:true},function(err,numAffected){
        if(err)
          res.json(err);
        else
          global[model_name].find(query).exec(function(err2,models){
            if(err2)
              res.json(err2);
            else
              res.json(models);
          });
      });

    }


  },

  set_language : function (lang) {
    Horizon.h_i18n = require(__dirname+'/app/locales/'+lang+'.js');
  },
  
  bootstrap : function (app,configure) {

    app.configure(function(){

      app.set('views',__dirname + '/app/views');
      app.set('view engine', 'jade');
      app.use(express.static(__dirname + '/app/public'));
      app.use(express.favicon(__dirname + '/app/public/images/favicon.ico')); 
      app.set('view options', {layout: false});
      app.use(express.bodyParser());
      app.use(express.cookieParser());
      app.use(express.methodOverride());
      app.use(express.session({secret:'AIsdjsa0ah304tah48t84hao4Aa482sauf9353aijga42t6'}));
      
      app.use(Horizon.method_check);
      app.use(Horizon.multilang);
      app.use(Horizon.session_user);
      app.use(Horizon.flash);

      if(typeof configure == 'function')
        app.use(configure);
      if(configure instanceof Array)
        for(var i in configure)
          app.use(configure[i]);

      app.use(app.router);
    });

    app.configure('development', function(){
      app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    });
     
    app.configure('production', function(){
      app.use(express.errorHandler());
    });


    Horizon.create_models();
    Horizon.create_policies();
    Horizon.create_controllers(app);
    Horizon.create_routes();
    Horizon.create_page_not_found();
  },

  create_models : function () {
    models = fs.readdirSync(Horizon.ROOT+'models');
    for(i in models) {
      if(models[i].match(/(.*)[.]js/)) {
        name = models[i].match(/(.*)[.]js/)[1];
        Horizon.h_models.push(name);
        model = require(Horizon.ROOT+'models/'+name+'.js');
        global[name] = mongoose.model(name, model.schema);
        for(var key in model.methods) {
          global[name][key] = model.methods[key];
          // console.log(global[name]) 
        }
      }
    }
  },

  create_policies : function () {
    policies = fs.readdirSync(Horizon.ROOT+'policies');
    for(var i in policies) {
      if(policies[i].match(/(.*).js/)) {
        name = policies[i].match(/(.*).js/)[1].toLowerCase();
        Horizon.h_policies[name] = require(Horizon.ROOT+'policies/'+policies[i]);
      }
    }
  },

  create_controllers : function (app) {
    controllers = fs.readdirSync(Horizon.ROOT+'controllers');
    for(var i in controllers) {
      if(controllers[i].match(/(.*)Controller.js/)) {
        
        name = Horizon.convert_controller_to_path( controllers[i].match(/(.*)Controller.js/)[1] );//.toLowerCase();

        nameController = controllers[i].match(/(.*).js/)[1];
        Horizon.h_controllers[name] = require(Horizon.ROOT+'controllers/'+controllers[i]);

        for(var method in Horizon.h_controllers[name]) {
          Horizon.create_controller_route(
            name,
            method,
            nameController,
            Horizon.h_controllers[name][method]
          );
        }
        
        for(var method in Horizon.h_controller_template) {
          if(typeof Horizon.h_controllers[name][method] === 'undefined')
            Horizon.create_controller_route(
              name,
              method,
              nameController,
              Horizon.h_controller_template[method]
            );
        }
      }

    }

  },

  create_controller_route : function (controller, method, nameController, callback) {
    if(typeof Horizon.h_policies_rules[nameController] !== 'undefined') {
      policy_name = Horizon.h_policies_rules[nameController][method];
    // console.log(policy_name);
      if(typeof policy_name !== 'undefined') {
        app.get('/'+controller+'/'+method, Horizon.h_policies[policy_name], callback);
        app.post('/'+controller+'/'+method, Horizon.h_policies[policy_name], callback);
      } else {
        app.get('/'+controller+'/'+method, callback);
        app.post('/'+controller+'/'+method, callback);
      }
    } else {
      app.get('/'+controller+'/'+method, callback);
      app.post('/'+controller+'/'+method, callback);
    }
  },

  create_routes : function (req, res, next) {
    for(var i in Horizon.h_routes) {
      app.get(i, function (reqi, resi) { resi.redirect(Horizon.h_routes[i]); } );
      app.post(i, function (reqi, resi) { resi.redirect(Horizon.h_routes[i]); } );
    }
  },

  create_page_not_found : function () {
    app.get('*', function(req, res){
      res.render('404');
    });
    app.post('*', function(req, res){
      res.render('404');
    });
  },

  convert_controller_to_path : function (str) {
    var str_new = str[0].toLowerCase();
    for(var i = 1; i < str.length; i++) {
      if(str[i] == str[i].toUpperCase())
        str_new += '_';
      str_new += str[i].toLowerCase();
    }
    return str_new;
  },

  convert_path_to_model : function (str) {
    var str_new = str[0].toUpperCase();
    for(var i = 1; i < str.length; i++) {
      if(str[i] == '_') {
        i += 1;
        if(typeof str[i] !== 'undefined')
        str_new += str[i].toUpperCase();
      } else
        str_new += str[i].toLowerCase();
    }
    return str_new;
  },

  method_check : function (req, res, next) {
    req.isPost = function () {
      if(this.method == 'POST') return true;
      return false;
    }

    req.isGet = function () {
      if(this.method == 'GET') return true;
      return false;
    }

    next();
  },

  multilang : function (req, res, next) {
    res.locals.__ = function(message) {
      if(Horizon.h_i18n[message])
        return Horizon.h_i18n[message];
      return message;
    }
    next();
  },
  
  session_user : function (req, res, next) { 
    if(typeof req.session.user != 'undefined')
      res.locals.session_user = req.session.user;
    else
      res.locals.session_user = null;
    next();
  },

  flash : function (req, res, next) {
    var session = req.session;
    var messages = session.messages || (session.messages = []);

    req.flash = function(type, message) {
      messages.push([type, message])
    }
    res.locals.messages = req.session.messages;
    next()
  },

}

