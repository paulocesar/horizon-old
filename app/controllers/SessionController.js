module.exports = {

  index : function(req,res) { res.render('session/index'); },
  view : function(req,res) { res.redirect('/'); },
  create : function(req,res) { res.redirect('/'); },
  edit : function(req,res) { res.redirect('/'); },
  delete : function(req,res) { res.redirect('/'); },
  login : function(req,res) {
    if(req.session.user) {
      res.json({response:'OK'});
      return;
    }

    if(req.isGet()) {
      res.json({response:'FAIL', description:'POST to login'});
      return;
    }

    email = req.body.email;
    password = req.body.password;
    if(!email || !password) {
      res.json({response:'FAIL', description:'empty field'});
      return;
    }

    password = Utils.passwordHash(password);
    User.findOne({email:email,password:password},function(err,user){
      if(err) {
        res.send(__('500'),500);
        return;
      }
      if(!user) {
        res.json({response:'FAIL', description:'wrong login or password'});
        return;
      }
      if(user) {
        req.session.user = user;
        res.json({response:'OK'});
      }
    });
  },

  logout : function (req,res) {
    req.session.user = null;
    res.json({response:'OK'});
  }
}