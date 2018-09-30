usersDB = require('../model/users')

function authenticate(req, res, next) {
    
    var data = {
        authenticated: false
    };

    if (req.session.user &&
        req.session.authenticated &&
        req.session.authenticated == true) {
            data.name = req.session.user.name;
            data.role = req.session.user.role;
            data.email = req.session.user.email;
            data.authenticated = true;
    }
    res.status(200).json(JSON.stringify(data))
}

module.exports = authenticate