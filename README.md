Horizon
===============

MVC Framework based on Sails.js functionalities with default user authentication system.

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

The system already starts with auth and login system. To understand how it works, just look in the auto generated models, views and controllers. 

### Usage

Now that the Horizon MVC Framework is installed, the work is only create models, views and controllers. It has a command line tool that can helps with the code generation:
	
	//it generates model and controller
	horizon generate Sample
	
	//it generates only the controller
	horizon controller Sample
	
	//it generates only the model
	horizon model Sample
	
	
Any template that generates files are found in `app/templates` directory. Developers can costumize the project's templates.

**TODO: view template generation**

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
	  
### TODO: explain all the structure

### Thanks
TODO...
