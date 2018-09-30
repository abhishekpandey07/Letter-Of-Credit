const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const userDB = mongoose.model('Users');
const bcrypt = require('bcrypt');
const generatePassword = require('password-generator');
const sendEmail = require('../../jobs/emailer/genAndSend');
const logger = require('../../logger/logger');
const acl = require('../../authorization/acl');
const userLogger = logger.createLogger('user.log');

router.use(acl.authorize({
  unless: '/login'
}));

const blockSession = function (req) {
  if (req.session.blocked)
    return
  req.session.blocked = true
  userLogger.info('Session ' + req.SessionID + ' was blocked')
}

const blockUser = function (user) {
  user.locked = true,
    user.save(function (error, user) {
      if (error) {
        userLogger.log({
          level: 'error',
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

router.route('/').get(function (req, res) {
  console.log('processing GET Users')
  userDB.find({}, function (error, users) {
    if (error) {
      userLogger.log({
        level: 'error',
        message: 'could not read users',
        error: error
      })
      return res.end(error)
    } else {

      userLogger.info('Users successfully read')
      var userData = users.map((user, key) => {
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

router.post('/register', function (req, res, next) {
  if (!validate(req, res)) {
    console.log('Sending reply false. Unauthorised access attempt')
    return res.json(JSON.stringify({
      status: 401,
      message: 'Unauthorised access attempt'
    }));
  }
  if (req.body.name &&
    req.body._id &&
    req.body.role &&
    req.body.email
  ) {

    console.log('generating password')
    const password = generatePassword(12, false);

    var user = null;
    console.log('computing hash')
    bcrypt.hash(password, 10)
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

        if (user) {
          console.log('creating new user')
          userDB.create(user, function (error, user) {
            if (error) {
              userLogger.log({
                level: 'error',
                message: 'User could not be created',
                error: error,
              })
              err = new Error('User could not be created')
              err.status = 500
              return res.end(JSON.stringify(err))
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
            }, function (error, userLogger) {
              if (error) {
                userLogger.log({
                  level: 'error',
                  message: 'Registration email could not be sent',
                  error: error
                })
              } else {
                userLogger.log({
                  level: 'info',
                  message: 'Registraion Email sent.',
                  to: req.body.email,
                })
              }
            })

            res.format({
              json: function () {
                res.json(JSON.stringify({
                  status: 200,
                  role: user.role,
                  email: user.email,
                  name: user.name
                }))
              }
            })

          })
        }

      })
      .catch(error => {
        userLogger.log({
          level: 'error',
          message: 'Hash could not be generated.',
          error: error
        })
        return res.end(error)
      });

  } else {
    console.log('all fields are required error')
    error = new Error('All fields are required!')
    error.status = 401
    return res.end(JSON.stringify(error))
  }
});

router.post('/login', async function (req, res) {

  // check for a blocked session
  if (req.session.blocked) {
    return res.status(401).json(JSON.stringify({
      error: 'Session Blocked'
    }))
  }

  // check fields
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({
      error: 'username and password fields are required.'
    });
  }

  // catch internal errors
  try {

    // get user asynchronously
    user = await userDB.findOne({
      email: req.body.username
    });

    // unauthorize if user is blocked.
    if (user && user.locked) {
      userLogger.log({
        level: 'warning',
        message: 'Attempt to login using a block ID',
        user: user.email
      })
      return res.status(401).json({
        message: 'User blocked'
      })
    }

    var same = false
    if (user && user.password) {
      //verify password
      same = await user.verifyPassword(req.body.password)

      if (same) {
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
        
        try {
          user.lastLogin = new Date(Date.now())
          user.save()
          userLogger.log({
            level: 'info',
            message: 'User successfully logged in.',
            user: user.email,
          })
        } catch (error) {
          console.log('user last login could not be savesd');
        }

        
        return res.status(200).json(JSON.stringify(data));
      } else {

        // if password is incorrect increase the login attempts
        req.session.loginAttempts++;
        req.session.loginAttempts >= 10 ? blockUser(user) : {}
      }
    }

    if (!user || !same) {
      userLogger.log({
        level: 'warning',
        message: 'Invalid login attempt password Incorrect',
        payload: req.body
      })
      return res.status(401).json(JSON.stringify({
        error: 'username or password is invalid'
      }))
    }

  } catch (error) {
    // if internal errors happen
    userLogger.log({
      level: 'error',
      message: error.toString(),
      error: error
    })
    return res.sendStatus(500);
  }
});
    
router.route('/logout')
  .post(function (req, res) {

    var logout = false
    try {
      req.session.destroy()
      logout = true
    } catch (error) {
      userLogger.error({
        message: 'User ould not be logged out',
        error: error,
      })
    }

    res.format({
      json: function () {
        res.json(JSON.stringify({
          logout: logout
        }))
      }
    })

  });

router.route('/changePass')
  .put(function (req, res) {
    if (
      req.session.authenticated &&
      req.session.user) {
      console.log('changing password')

      userDB.findOne({
        email: req.session.user.email
      }, function (error, user) {
        if (error) {
          console.error(error)
          error = new Error('User not found!')
          error.status = 404
          return res.format({
            json: () => {
              res.json(JSON.stringify({
                status: 500,
                authenticated: false,
                message: 'Credentials could not be verified'
              }))
            }
          })
        } else {

          bcrypt.compare(req.body.old, user.password, (error, same) => {
            if (error) {
              console.log(error)
              userLogger.log({
                level: 'error',
                message: 'Could not verify password',
                error: error
              })
              return res.end(error)
            }

            if (!same) {
              console.log('password does not match')
              // if old password does not match return 401 status
              userLogger.log({
                level: 'warning',
                message: 'Invalid login attempt password Incorrect',
                payload: req.body
              })

              return res.json({
                status: 401,
                message: 'Incorrect Old Password',
                authenticated: false
              })
            } else {
              console.log('password matches')
              // hash new password and store it.
              console.log
              bcrypt.hash(req.body.new, 10)
                .then((hash) => {
                  user.password = hash;
                  user.save(function (error, ID) {
                    if (error) {
                      userLogger.log({
                        level: 'error',
                        message: ' Error saving user in password update.',
                        error: error
                      })
                      return res.json({
                        error: error
                      })
                    } else {
                      userLogger.log({
                        level: 'info',
                        message: ' Password successfully changed',
                        user: req.body.user
                      })

                      return res.json({
                        status: 200,
                        message: 'Passwotd Successfully changed',
                        passwordChange: true
                      })
                    }
                  })
                })
            }

          })
        }
      })
    } else {
      return res.json({
        status: 401,
        message: 'Unauthorized Password change attempt'
      })
    }


  });

router.route('/remove')
  .delete(function (req, res) {
    if (!validate(req, res))
      return res.json(JSON.stringify({
        status: 401,
        message: 'Unauthorised access'
      }));

    if (req.body.email) {
      userDB.remove({
        email: req.body.email
      }, function (error, user) {
        if (error) {
          userLogger.log({
            level: 'error',
            message: 'Could not remove user with email : ' + req.body.email,
            error: error
          })
          return req.json(JSON.stringify({
            status: 500,
            message: 'An error occured while removing the user'
          }))
        } else {
          userLogger.log({
            level: 'audit',
            message: 'remove action',
            payload: req.body,
            user: req.session.user,
          })
          return res.json(JSON.stringify({
            status: 200,
            message: 'User successfully removed'
          }))
        }
      })
    } else {

      return res.json(JSON.stringify({
        status: 405,
        message: 'Payload empty'
      }))
    }
  })

module.exports = router;