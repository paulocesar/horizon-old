module.exports = function(req,res,ok) {
  if(req.session.user)
    ok();
  else
    res.redirect('/session/login');
};