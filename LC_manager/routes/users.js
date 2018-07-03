const express = require('express'),
      router = express.Router(),
      mongoose = require('mongoose'),
      bodyParser = require('body-parser'),
      methodOverride = require('method-override'),
      userDB = mongoose.model('Users')
      bcrypt = require('bcrypt')
      generatePassword = require('password-generator')
      sendEmail = require('../jobs/emailer/genAndSend')
router.use(bodyParser.urlencoded({ extended: true }))

// no idea what this code does
router.use(methodOverride(function(req, res){
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}))

router.route('/').get(function(req,res){
  userDB.find({},function(error,users){
    if(error){
      console.log(error)
      return res.end(error)
    } else {

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
  	console.log(req.body)
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
              console.log(error)
              return res.send(error)
            }
            
            console.log('Sending email to the new user.')
            sendEmail.genAndSendNewUserEmail({
              email: req.body.email,
              password: password,
              name: req.body.name.split(' ')[0]
            })
            console.log('sending Reply')
            res.format({
              json: function(){
                res.json(JSON.stringify(user.role))
              }
            })

            console.log('reply sent')

          })
        }

  		})
      .catch(error =>{
          console.error(error)
          error = new Error('Hash could not be generated.')
          error.status = 501
          return res.send(error)
      });
  		
  	} else{

  		error = new Error('All fields are required!')
  		error.status = 401
  		return res.send(error)
  	}
});

router.post('/login', function(req, res, next) {
    console.log(req.session)
  	if( req.body.username &&	
  		req.body.password
  		){

  		userDB.findOne({username:req.body.username}, function(error,user){
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
          return res.json(JSON.stringify({
            message:'The user does not exist',
            status: 404,
            authenticated: false
          }))
        }
  			
        bcrypt.compare(req.body.password,user.password, (error,same) => {
  				if(error){
  					console.log(error)
  					res.send(error)
  				}

  				if(!same){
  					error = new Error('Incorrect Password')
  					error.status = 401
            //res.status(401)
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
            req.session.role = user.role
            req.session.name = user.name

            user.lastLogin = new Date(Date.now())
            user.save(function(error,userID){
              if(error){
                console.log('Last Login could not be updated')
                console.log(error)
              } else{
                console.log('Last Login was updated')
              }
            })

  					return res.json(JSON.stringify(data))  					
  				}
  			})
  			
  		})
  		
  	} else{

  		error = new Error('All fields are required!')
  		error.status = 401
  		return res.send(error)
  	}
});

router.route('/sessionAuthentication')
  .get(function(req,res){
    console.log(req.session)
    var data = undefined
    if(req.session.name &&
       req.session.role &&
       req.session.authenticated){
        
      req.session.authenticated ? 
      data = {
        name: req.session.name,
        role: req.session.role,
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
    console.log(data)
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
    console.log('Logging out user: ' + req.session.name)
    var logout = false
    try{
      req.session.destroy()
      logout = true
    } catch(error){
      console.log(error)
    }

    res.format({
      json: function(){
        res.json(JSON.stringify({logout: logout}))
      }
    })

  })

module.exports = router;
