
var app = require('./')({
  
  bootstrap: function () {
    User.findOne({}).exec(function(err,user){
      if(!user)
        User({
          name: 'Paulo César',
          email: 'pauloc062@gmail.com',
          description: 'Administrador',
          password: Utils.passwordHash('123asd'),
          role: 1,
        }).save(function(err){if(err) console.log(err);});
    });
  },

});

var server = require('http').createServer(app);
server.listen(8764);