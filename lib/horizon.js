var fs = require('fs');

//setting paths
global['ROOT'] = __dirname+'/../../..';
global['ROOT_APP'] = ROOT+'/app';

//create app folder is doesn't exists
if(!fs.existsSync(ROOT_APP)) {
  var wrench = require('wrench');
  wrench.copyDirSyncRecursive(__dirname+'/../app',ROOT_APP,{});
}

//setting utils as global 
global['Utils'] = require(ROOT_APP+'/utils.js');

//mongoDb
var mongoose = require('mongoose');
global['Schema'] = mongoose.Schema;
global['ObjectId'] = mongoose.Schema.Types.ObjectId;

//express
var express = require('express');
var app = express();

//=========HELPERS=============


function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}


//============HORIZON=FRAMEWORK=================


module.exports = function (configuration) {

  function set_conf(deft,param) {
    if (typeof param !== 'undefined')
      return param;
    return deft;
  }

  //set default or custom config
  config = set_conf(null,configuration.configure);
  language = set_conf('en',configuration.language);
  database = set_conf('horizon',configuration.database);

  //startup database connection
  global['mongoose'] = require('mongoose');
  mongoose.connect('mongodb://localhost/'+database);
  mongoose.connection.on('error',function(err){
    console.log("Cannot connect to database! Please run Mongodb");
    process.exit();
  });

  //startup horizon
  Horizon.set_language(language);
  Horizon.bootstrap(app,config);

  //startup initial custom configuration
  bootstrap = set_conf(function(){},configuration.bootstrap);
  bootstrap();

  return app;
}

var Horizon = {
  h_models : [],
  h_policies : {},
  h_policies_rules : require(ROOT_APP+'/policy.js'),
  h_routes : require(ROOT_APP+'/route.js'),
  h_controllers : {},
  h_i18n : null,

  /**
   * List of template methods for controller
   * if the user set a empty template, those methods will be added
   */
  h_controller_template : {
    
    // template for controller's index method
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

    // template for controller's view method
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

    // template for controller's create method
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

    // template for controller's delete method
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

    // template for controller's edit method
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

  //set language that is localized in app/locales
  set_language : function (lang) {
    Horizon.h_i18n = require(ROOT_APP+'/locales/'+lang+'.js');
  },
  
  //startup all stuff needed and run Horizon
  bootstrap : function (app,configure) {

    /**
      *setting all express app configuration
      */
    app.configure(function(){

      app.set('views',ROOT_APP + '/views');
      app.set('view engine', 'jade');
      app.use(express.static(ROOT_APP + '/public'));
      app.use(express.favicon(ROOT_APP + '/public/images/favicon.ico')); 
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

    /**
      * loading horizon's MVC struture
      */
    Horizon.create_models();
    Horizon.create_policies();
    Horizon.create_controllers(app);
    Horizon.create_routes();
    Horizon.create_page_not_found();
  },

  /**
    * read files in app/models and load in horizon MVC
    */
  create_models : function () {
    models = fs.readdirSync(ROOT_APP+'/models');
    for(i in models) {
      if(models[i].match(/(.*)[.]js/)) {
        name = models[i].match(/(.*)[.]js/)[1];
        Horizon.h_models.push(name);
        model = require(ROOT_APP+'/models/'+name+'.js');
        global[name] = mongoose.model(name, model.schema);
        for(var key in model.methods) {
          global[name][key] = model.methods[key];
          // console.log(global[name]) 
        }
      }
    }
  },

  /**
    * read files in app/policies and load in horizon MVC
    */
  create_policies : function () {
    policies = fs.readdirSync(ROOT_APP+'/policies');
    for(var i in policies) {
      if(policies[i].match(/(.*).js/)) {
        name = policies[i].match(/(.*).js/)[1].toLowerCase();
        Horizon.h_policies[name] = require(ROOT_APP+'/policies/'+policies[i]);
      }
    }
  },

  /**
    * read files in app/controllers and load in horizon MVC
    */
  create_controllers : function (app) {
    controllers = fs.readdirSync(ROOT_APP+'/controllers');
    for(var i in controllers) {
      if(controllers[i].match(/(.*)Controller.js/)) {
        
        name = Horizon.convert_controller_to_path( controllers[i].match(/(.*)Controller.js/)[1] );//.toLowerCase();

        nameController = controllers[i].match(/(.*).js/)[1];
        Horizon.h_controllers[name] = require(ROOT_APP+'/controllers/'+controllers[i]);

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

  /**
    * set the GET and POST routes in express for controllers
    * if some file needs a policy, it will be set here
    */
  create_controller_route : function (controller, method, nameController, callback) {
    if(typeof Horizon.h_policies_rules[nameController] !== 'undefined') {
      policy_name = Horizon.h_policies_rules[nameController][method];
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

  //create routes
  create_routes : function (req, res, next) {
    for(var i in Horizon.h_routes) {
      app.get(i, function (reqi, resi) { resi.redirect(Horizon.h_routes[i]); } );
      app.post(i, function (reqi, resi) { resi.redirect(Horizon.h_routes[i]); } );
    }
  },

  //for any other path, it will be redirected to a 404 error page
  create_page_not_found : function () {
    app.get('*', function(req, res){
      res.render('404');
    });
    app.post('*', function(req, res){
      res.render('404');
    });
  },


  /**
    * the next methods are handlers
    */

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

