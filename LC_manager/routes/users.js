const express = require('express'),
      router = express.Router(),
      mongoose = require('mongoose'),
      bodyParser = require('body-parser'),
      methodOverride = require('method-override'),
      userDB = mongoose.model('Users')
      bcrypt = require('bcrypt')
      generatePassword = require('password-generator')
      sendEmail = require('../jobs/emailer/genAndSend')
      logger = require('../logger/logger')
router.use(bodyParser.urlencoded({ extended: true }))

userLogger = logger.createLogger('user.log');

const authRole = ['admin']

// no idea what this code does
router.use(methodOverride(function(req, res){
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}))

const validate = function(req,res){
  if(req.session.authenticated &&
     req.session.user && 
     authRole.includes(req.session.user.role)){
      
      console.log('returnin true')
      return true 
  }
  
  userLogger.log({
      level:'warning',
      message: 'Unauthorized access',
      user: req.session.user
    })
    console.log('returning false');
    return false
}

const blockSession = function(req){
  if(req.session.blocked)
    return
  req.session.blocked = true
  userLogger.info('Session '+ req.SessionID + ' was blocked')
}

const blockUser = function(user){
  user.locked = true,
  user.save(function(error,user){
    if(error){
      userLogger.log({
        level:'error',
        message: 'User could not be blocked',
        error: error,
      })
      return res.end(error)
    } else {
      userLogger.log({
        level: 'warning',
        message: 'User Blocked',
        user: {
          id: user._id,
          name: user.name
        }
      })
    }

  })
}

router.route('/').get(function(req,res){
  if(!validate(req,res))
    return res.json(JSON.stringify{
      status: 401,
      message: 'Unauthorised access'
    });
  
  userDB.find({},function(error,users){
    if(error){
      userLogger.log({
        level: 'error',
        message: 'could not read users',
        error: error
      })
      return res.end(error)
    } else {

      userLogger.info('Users successfully read')
      var userData = users.map((user,key) => {
        return {
          name: user.name,
          email: user.email,
          role: user.role,
          username: user.username,
          created: user.created,
          lastLogin: user.lastLogin
        }
      })

      return res.json(JSON.stringify(userData));
    }

  })
})

router.post('/register', function(req, res, next) {
  	validate(req,res);
    if( req.body.name &&
  		req.body._id  &&
  		req.body.role &&
  		req.body.email &&
      req.body.name
  		){

      const password = generatePassword(12,false);

  		var user = null;
      console.log('computing hash')
  		bcrypt.hash(password,10)
  		.then((hash) => {
  			console.log('Generated Hash :' + hash)
  			user = {
  			_id: parseFloat(req.body._id),
  			name: req.body.name,
  			email: req.body.email, 
  			role: req.body.role,
        username: req.body.email.split('@')[0],
  			password: hash,
  			}

        if(user) {
          console.log('creating new user')
          userDB.create(user,function(error,user){
            if(error){
              userLogger.log({
                level:'error',
                message: 'User could not be created',
                error: error,
              })
              return res.end(error)
            }
            
            userLogger.log({
              level: 'audit',
              kind: 'create',
              message: 'User created',
              payload: req.body,
              user: req.session.user
            })

            sendEmail.genAndSendNewUserEmail({
              email: req.body.email,
              password: password,
              name: req.body.name.split(' ')[0]
            },function(error,userLogger){
              if(error){
                userLogger.log({
                  level: 'error',
                  message: 'Registration email could not be sent',
                  error: error
                })  
              } else{
                userLogger.log({
                  level: 'info',
                  message: 'Registraion Email sent.',
                  to: req.body.email,
                })
              }
            })

            res.format({
              json: function(){
                res.json(JSON.stringify(user.role))
              }
            })

          })
        }

  		})
      .catch(error =>{
          userLogger.log({
            level: 'error',
            message: 'Hash could not be generated.',
            error: error
          })
          return res.end(error)
      });
  		
  	} else{

  		error = new Error('All fields are required!')
  		error.status = 401
  		return res.end(error)
  	}
});

router.post('/login', function(req, res, next) {

    req.session.loginAttempts >= 10 ? blockSession(req) : {}

    if(req.session.blocked){
      return res.end(JSON.stringify({
        status: 401,
        message: 'Session Blocked'
      }))
    }

  	if( req.body.username &&	
  		req.body.password
  		){

  		userDB.findOne({email:req.body.username}, function(error,user){
  			if(error) {
  				console.error(error)
  				error = new Error('User not found!')
  				error.status = 404
  				return res.format({
            json: ()=>{
             res.json(JSON.stringify({
              status : 500,
              authenticated:false,
              message: 'Credentials could not be verified'
            }))
            }
          })
  			}

        if(user == null){
          //res.status(404);
          req.session.loginAttempts++;
          userLogger.log({
            level: 'warning',
            message: 'Invalid User ID login attempt',
            payload: req.body
          })

          return res.json(JSON.stringify({
            message:'The user does not exist',
            status: 404,
            authenticated: false
          }))
        }
  			
        if(user.locked === true){
          userLogger.log({
            level: 'warning',
            message: 'Attempt to login using a block ID',
            user: user.email
          })
          return res.json({
            status: 401,
            message: 'User blocked',
            authenticated: false
          })
        }

        bcrypt.compare(req.body.password,user.password, (error,same) => {
  				if(error){
  					userLogger.log({
              level: 'error',
              message: 'Could not verify password',
              error: error
            })
  					return res.end(error)
  				}

  				if(!same){
            req.session.loginAttempts++;
            req.session.loginAttempts >= 10 ? blockUser(user) : {}

  					error = new Error('Incorrect Password')
  					error.status = 401
            //res.status(401)
            userLogger.log({
              level: 'warning',
              message: 'Invalid login attempt password Incorrect',
              payload: req.body
            })

            return res.json(JSON.stringify({
              status: 401,
              message: 'Incorrect Password',
              authenticated:false
            }))

  				} else{
  					// what to do if the user exists and password matches!
  					// just return the user
            const data = {
              name: user.name,
              role: user.role,
              authenticated: true,
              email: user.email,
              status: 200
            }
            req.session.authenticated = true
            
            req.session.user = {
              role: user.role,
              ID: user._id,
              name: user.name,
              email: user.email
            }

            user.lastLogin = new Date(Date.now())
            user.save(function(error,userID){
              if(error){
                console.log('Last Login could not be updated')
                console.log(error)
              } else{

                userLogger.log({
                  level: 'info',
                  message: 'User successfully logged in.',
                  user: user.email,
                })
              }
            })

  					return res.json(JSON.stringify(data))  					
  				}
  			})
  			
  		})
  		
  	} else{
      req.session.loginAttempts++;
    		error = new Error('All fields are required!')
    		error.status = 401
  		return res.send(error)
  	}
});

router.route('/sessionAuthentication')
  .get(function(req,res){
    var data = undefined
    if(req.session.user &&
       req.session.authenticated){
        
      req.session.authenticated ? 
      data = {
        name: req.session.user.name,
        role: req.session.user.role,
        authenticated: req.session.authenticated,
      }:

      data = {
        authenticated: false
      }

    } else {
      data = {
        authenticated: false
      }
    }
    try {
      res.format({
        json: function(){
          res.json(JSON.stringify(data))
        }
      })
    }catch(error){
      console.log(error)
    }
  })

router.route('/logout')
  .post(function(req,res){
    
    var logout = false
    try{
      req.session.destroy()
      logout = true
    } catch(error){
      userLogger.error({
        message: 'User ould not be logged out',
        error: error,
      })
    }

    res.format({
      json: function(){
        res.json(JSON.stringify({logout: logout}))
      }
    })

  })

module.exports = router;
