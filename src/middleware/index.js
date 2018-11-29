function loggedOut(req, res, next) {
    if(req.session && req.session.userId){
        return res.redirect('/users/profile')
    }
    return next();
}

function requiresLogin(req, res, next){
    if(req.session && req.session.userId){
        return next();
    } else{
        let error = new Error('You must be logged in to view this page');
        error.status = 401;
        return next(error);
    }
}

module.exports = {
    loggedOut : loggedOut,
    requiresLogin: requiresLogin
}