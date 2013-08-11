Horizon
===============

Horizon is a really small MVC framework based on Sails.js with a default user authentication system. It was developed for learning purposes. Horizon uses **express**, **mongoose** and **jade**.

### Install

First, install and run **MongoDB**. I suggest you google It =). Then create a project folder and execute:

    mkdir sample; cd sample
    npm install horizon

### Run

	npm install -g horizon
	horizon start <app_name>
	node <app_name>
	//open your browser in http://localhost:5321

The `horizon start` command will generate a folder called `app` and a file called `<app_name>.js`. The app folder has the MVC structure and the runnable script has the structure bellow:

	//<app_name>.js
	
	//it returns express app
	var app = require('horizon')({
	
		language: 'br', //'en' is default 
		
		bootstrap: function () {
			//anything you need
			
			//create a default user if it doesn't exists
			User.findOne({}).exec(function(err,user){
      			if(!user)
       				User({
          				name: 'Admin',
          				email: 'admin@horizon.com',
          				description: 'Administrator',
          				password: Utils.passwordHash('123asd'),
          				role: 1,
        			}).save(function(err){
        				if(err) console.log(err);
        			});
    		});
    		
		},
		
		configure: [
			function (req,res,cb) {
				//express funcitons
			}
		]
		
	});
	
	app.listen(5321);

The system already starts with a auth system. To understand how it works, just look in the auto generated models, views and controllers. 

### Usage

Now that the Horizon MVC Framework is installed, the work is only create models, views and controllers. It has a command line tool that can helps with the code generation:
	
	//it generates model and controller
	horizon generate Sample
	
	//it generates only the controller
	horizon controller Sample
	
	//it generates only the model
	horizon model Sample
	

**TODO: view template generation**

Any template that generates files are found in `app/templates` directory. Developers can costumize the project's templates.


After generate a model and template they will have a structure like below:

	//====app/models//Sample.js====
	
    var model = Schema({
     _id :  ObjectId,
     name: String,
    });

    model.path('name').required(true);

    module.exports.schema = model;
    module.exports.methods = {

    };
    
    //===app/controllers/SampleController.js===
    
    module.exports = {
    
    };

With this basic struture, the Horizon MCV already generates a basic CRUD. For example, accessing the `localhost:5321` in the browser, you can do the basic list, add, edit and delete commands with the `Sample` strutucture using `POST` or `GET`. You can see bellow some cases using GET:

	//list Samples with name paul
	localhost:5321/sample/index?name=paul
	
	//Adding Sample with name paul
	localhost:5321/sample/add?name=paul

The response from those automatically generated methods are in **JSON**:

	//response from sample/index
	[
		{_id: 93jbca8a70bac0bac9bb, name: paul},
		{_id: 93jbca8a70bac0bac9bb, name: amy},
		{_id: 93jbca8a70bac0bac9bb, name: josh}
	]

**TODO: explain default Auth system**

### Structure
The Horizon auto generated `app` folder has the structure bellow:

	app\
	  controllers\
	    SessionController.js
	    UserController.js
	  locales\
	    en.js
	  models\
	    User.js
	  policies\
	    auth.js
	  public\
	    css\
	    img\
	      js\
	  templates\
	    controller.js
	    model.js
	  views\
	    layout.jade
	    session\
	      index.jade
	  policy.js
	  route.js
	  utils.js
	  
Please, visit the Sails.js wiki to understand the struture.

### Thanks
TODO...
