Horizon
===============

MVC Framework based on Sails.js functionalities with default user authentication system.

### Install

First, install and run **MongoDB**. I suggest you google It =). Then create a project folder and execute:

    mkdir sample; cd sample
    npm install horizon

### Run
Create the runnable node script.

	//app.js
	
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

Run it!
	
	node app
	//open in your browser http://localhost:5321

### Usage

TODO...

### Structure
After it runs, the horizon app folder will be created automatically. This folder will have the structure bellow:

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
