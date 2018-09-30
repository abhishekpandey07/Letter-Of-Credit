const acl = require('./acl.json')

function checkRole(role, baseUrl, method) {
    var access = null;

    acl_data = acl.find((obj) => {
        return obj.role === role;
    })

    for (let p of acl_data.permissions) {
        if (p.resource === baseUrl || p.resource === "*") {

            if (p.methods === "*" || p.methods.includes(method)) {
                access = p.access;
                break;
            }
        }
    }

    if (access === 'allow') return true;
    return false

}

authorize = (options) => (req, res, next) =>{
    // skip authorisation for certian paths
    // like '/login'
    if(options && req.path === options.unless){
        return next()
    }
    if (req.session && 
        req.session.user &&
        req.session.authenticated) {
        role = req.session.user.role;
        baseUrl = req.baseUrl;
        method = req.method;
        console.log(baseUrl)
        console.log(req.path)
        console.log(role)
        access = checkRole(role, baseUrl, method);
        console.log(access)
        if (access) return next();
    }
    res.sendStatus(401)
}

module.exports = {
    authorize
}