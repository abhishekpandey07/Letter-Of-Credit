const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const logger = require('../../logger/logger');
const acl = require('../../authorization/acl')

//logger
const bankLogger = logger.createLogger('bank.log')

bankDB = mongoose.model('banks')
//  router.use makes sure that all the requests go through the defined packages first



const logReadError = function (error) {
  bankLogger.log({
    level: 'error',
    message: ' Could not read bank Details',
    error: error
  })
}

const logLimitChange = function (newData, bank) {
  bankLogger.log({
    level: 'audit',
    kind: 'critical',
    message: 'Modifying bank limits or used data',
    changes: {
      bank: {
        name: bank.name,
        id: bank._id
      },
      LC_limit: {
        old: parseFloat(bank.LC_limit),
        new: newData.LC_limit,
      },
      LC_used: {
        old: parseFloat(bank.LC_used),
        new: newData.LC_used
      },
      user: req.session.user
    }
  })
}

// middleware for authorisation
router.use(acl.authorize())

router.route('/')
  //GET all banks
  .get(function (req, res, next) {
    bankDB.find({})
      .populate('LCs', 'status')
      .exec(function (err, banks) {
        if (err) {
          logReadError(err)
          return res.end(err);
        } else {

          //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
          //console.log(banks[0].LC_limit)
          banksdata = banks.reduce((banks, bank) => {
            banks.push([bank.name, bank.branch, bank.IFSC,
              parseFloat(bank.LC_limit),
              parseFloat(bank.LC_used)
            ])
            return banks
          }, []);
          res.format({
            //HTML response will render the index.jade file in the views/banks folder. We are also setting "banks" to be an accessible variable in our jade view
            /*html: function(){
                res.render('nativeBanks/index', {
                      title: 'All my Banks',
                      "banks" : banks
                  });
            },*/
            //JSON response will show all banks in JSON format
            json: function () {
              res.json(JSON.stringify(banks));
            }
          });
        }
      });
  })


  //POST a new bank
  .post(function (req, res) {
    // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
    var name = req.body.name;
    var branch = req.body.branch;
    var IFSC = req.body.IFSC;
    var LC_limit = req.body.LC_limit;
    var LC_used = req.body.LC_used;

    //call the create function for our database
    bankDB.create({
      name: name,
      branch: branch,
      IFSC: IFSC,
      LC_limit: LC_limit,
      LC_used: LC_used
    }, function (err, bank) {
      if (err) {
        bankLogger.log({
          level: 'error',
          message: "Bank could not be created",
          payload: req.body,
          error: err
        })
        return res.end("There was a problem adding the information to the database.")
      } else {
        bankLogger.log({
          level: 'audit',
          kind: 'create',
          message: 'Bank',
          user: req.session.user,
        })

        res.format({
          /*//HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
          html: function(){
              // If it worked, set the header so the address bar doesn't still say /adduser
              res.location("nativeBanks");
              // And forward to success page
              res.redirect("/nativeBanks");
          },*/

          json: function () {
            res.json(JSON.stringify(bank));
          }
        });
      }
    })
  });

// route middleware to validate :id
router.param('id', function (req, res, next, id) {
  //console.log('validating ' + id + ' exists');
  //find the ID in the Database

  bankDB.findById(id, function (err, bank) {
    //if it isn't found, we are going to repond with 404
    if (err) {
      logReadError(err)

      res.status(404)
      var err = new Error('Not Found');
      err.status = 404;
      res.format({
        html: function () {
          next(err);
        },
        json: function () {
          res.json({
            message: err.status + ' ' + err
          });
        }
      });
      //if it is found we continue on
    } else {

      // once validation is done save the new item in the req
      res.locals.id = id;
      res.locals.bank = bank
      // go to the next thing
      next();
    }
  });
});


router.route('/:id')
  .get(function (req, res) {
    var bank = res.locals.bank
    res.format({
      html: function () {
        res.render('nativeBanks/show', {
          "name": bank.name,
          "branch": bank.branch,
          "LC_lim": bank.LC_limit,
          "IFSC": bank.IFSC,
          "LC_used": bank.LC_used,
          "LCs": bank.LCs,
          "bank": bank
        });
      },
      json: function () {
        res.json(bank);
      }
    });
  });

//PUT to update a bank by ID
router.put('/:id/edit', function (req, res) {
  // Get our REST or form values. These rely on the "name" attributes
  var name = req.body.name;
  var branch = req.body.branch;
  var IFSC = req.body.IFSC;
  var LC_limit = req.body.LC_limit;
  var LC_used = req.body.LC_used;

  //find the document by ID
  bankDB.findById(req.id, function (err, bank) {

    if (LC_limit != bank.LC_limit || LC_used != bank.LC_user) {

      logLimitChange({
        LC_limit: LC_limit,
        LC_used: LC_used
      }, bank)
    }

    bank.update({
      name: name,
      branch: branch,
      IFSC: IFSC,
      LC_limit: LC_limit,
      LC_used: LC_used,
    }, function (err, bankID) {
      if (err) {
        logReadError(err)
        return res.end("There was a problem updating the information to the database");
      } else {
        //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
        bankLogger.log({
          level: 'audit',
          kind: 'edit',
          message: 'Bank',
          bank: {
            name: bank.name,
            _id: bank._id
          },
          payload: req.body,
          user: req.body.user
        })
        res.format({
          html: function () {
            res.redirect("/nativeBanks/" + bank._id);
          },
          //JSON responds showing the updated values
          json: function () {
            res.json(bank);
          }
        });
      }
    })
  });
});

//DELETE a Bank by ID
router.delete('/:id/edit', function (req, res) {
  //find bank by ID
  bankDB.findById(req.id, function (err, bank) {
    if (err) {
      logReadError(err)
      return res.end(err);
    } else {
      //remove it from Mongo
      bank.remove(function (err, bank) {
        if (err) {
          bankLogger.log({
            level: 'error',
            message: 'Bank could not be removed from the databse',
            error: err
          })
          res.status(500)
          return res.end(err);
        } else {
          //Returning success messages saying it was deleted
          bankLogger.log({
            level: 'audit',
            kind: 'delete',
            message: 'Bank',
            bank: bank,
            user: req.session.user
          })
          res.json({
            message: 'deleted',
            item: bank
          });
        }
      });
    }
  });
});

module.exports = router;