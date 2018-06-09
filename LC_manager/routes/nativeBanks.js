const express = require('express'),
      router = express.Router(),
      mongoose = require('mongoose'),
      bodyParser = require('body-parser'),
      methodOverride = require('method-override');




natBankDB = mongoose.model('nativeBanks')
//  router.use makes sure that all the requests go through the defined packages first

// adds req.body property to manipulate post requests
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


// build the Rest operations at the base for native Banks
// this will be accessible from https:127.0.0.1:3000/nativeBanks if the default router for /
// is left unchanged

router.route('/')
    //GET all banks
    .get(function(req, res, next) {
        //retrieve all blobs from Monogo
        natBankDB.find({}, function (err, banks) {
              if (err) {
                  return console.error(err);
		  
              } else {
		  console.log('generating response!')
                  //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                  //console.log(banks[0].LC_limit)
                  banksdata = banks.reduce((banks,bank)=>{
                    banks.push([bank.name,bank.branch,bank.IFSC,
                                  parseFloat(bank.LC_limit),
                                  parseFloat(bank.LC_used)])
                    return banks
                  },[]);
                  res.format({
                      //HTML response will render the index.jade file in the views/banks folder. We are also setting "banks" to be an accessible variable in our jade view
                    /*html: function(){
                        res.render('nativeBanks/index', {
                              title: 'All my Banks',
                              "banks" : banks
                          });
                    },*/
                    //JSON response will show all banks in JSON format
                    json: function(){
                        res.json(JSON.stringify(banks));
                    }
                });
              }     
        });
    })


//POST a new bank
    .post(function(req, res) {
        // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
        var name = req.body.name;
        var branch = req.body.branch;
        var IFSC = req.body.IFSC;
        var LC_limit = req.body.LC_limit;
	var LC_used = req.body.LC_used;
	
        //call the create function for our database
        natBankDB.create({
            name : name,
	    branch : branch,
	    IFSC : IFSC,
	    LC_limit : LC_limit,
	    LC_used : LC_used
	    
        }, function (err, bank) {
            if (err) {
		console.log(err)
                  res.send("There was a problem adding the information to the database.");
		  
              } else {
                  //Bank has been created
                  console.log('POST creating new bank: ' + bank);
                  res.format({
                      //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function(){
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("nativeBanks");
                        // And forward to success page
                        res.redirect("/nativeBanks");
                    },
                    //JSON response will show the newly created blob
                    json: function(){
                        res.json(bank);
                    }
                });
              }
        })
    });

/* GET new Native Bank page */
router.get('/new', function(req,res){
    res.render('nativeBanks/new', {title: 'Register New Native Bank'});
});



// route middleware to validate :id
router.param('id', function(req, res, next, id) {
    //console.log('validating ' + id + ' exists');
    //find the ID in the Database
    natBankDB.findById(id, function (err, bank) {
        //if it isn't found, we are going to repond with 404
        if (err) {
            console.log(id + ' was not found');
            res.status(404)
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function(){
                    next(err);
                 },
                json: function(){
                       res.json({message : err.status  + ' ' + err});
                 }
            });
        //if it is found we continue on
        } else {
            //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
            console.log(bank);
            // once validation is done save the new item in the req
            req.id = id;
	    res.locals.bank = bank
            // go to the next thing
            next(); 
        } 
    });
});


router.route('/:id')
    .get(function(req, res) {


	
    natBankDB.findById(req.id, function (err, bank) {
      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
        console.log('GET Retrieving ID: ' + bank._id);

          /*var bankName = bank.name;
	  var bankLC_limit = bank.LC_limit;
	  var bankLCs = bank.LCs;
	  var bankbranch = bank.LC_used;
	  var bankIFSC = bank.IFSC;
	*/
	var bank = res.locals.bank
        res.format({
          html: function(){
              res.render('nativeBanks/show', {
		  "name" : bank.name,
		  "branch" : bank.branch,
		  "LC_lim" : bank.LC_limit,
		  "IFSC" : bank.IFSC,
		  "LC_used" : bank.LC_used,
		  "LCs" : bank.LCs,
		  "bank" : bank
              });
          },
          json: function(){
              res.json(bank);
          }
        });
      }
    });
    });
      //GET the individual blob by Mongo ID
router.get('/:id/edit', function(req, res) {
    //search for the bank within Mongo
    natBankDB.findById(req.id, function (err, bank) {
        if (err) {
            console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
            //Return the bank
            console.log('GET Retrieving ID: ' + bank._id);
            //format the date properly for the value to show correctly in our edit form
            res.format({
                //HTML response will render the 'edit.jade' template
                html: function(){
                    res.render('nativeBanks/edit', {
                        title: 'Bank' + bank._id,
                        "LCs" : bank.LCs,
                        "bank" : bank
                    });
                },
                 //JSON response will return the JSON output
                json: function(){
                       res.json(bank);
                }
            });
        }
    });
});


//PUT to update a bank by ID
router.put('/:id/edit', function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    var name = req.body.name;
    var branch = req.body.branch;
    var IFSC = req.body.IFSC;
    var LC_limit = req.body.LC_limit;
    var LC_used = req.body.LC_used;

   //find the document by ID
        natBankDB.findById(req.id, function (err, bank) {
            //update it
            bank.update({
                name : name,
		branch : branch,
		IFSC : IFSC,
		LC_limit : LC_limit,
		LC_used : LC_used,
            }, function (err, bankID) {
              if (err) {
                  res.send("There was a problem updating the information to the database: " + err);
              } 
              else {
                      //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                      res.format({
                          html: function(){
                               res.redirect("/nativeBanks/" + bank._id);
                         },
                         //JSON responds showing the updated values
                        json: function(){
                               res.json(bank);
                        }
                      });
              }
            })
        });
});

//DELETE a Bank by ID
router.delete('/:id/edit', function (req, res){
    //find bank by ID
    natBankDB.findById(req.id, function (err, bank) {
        if (err) {
            return console.error(err);
        } else {
            //remove it from Mongo
            bank.remove(function (err, bank) {
                if (err) {
                    return console.error(err);
                } else {
                    //Returning success messages saying it was deleted
                    console.log('DELETE removing ID: ' + bank._id);
                    res.format({
                        //HTML returns us back to the main page, or you can create a success page
                        html: function(){
                            res.redirect("/nativeBanks");
                        },
                        //JSON returns the item with the message that is has been deleted
                        json: function(){
                            res.json({message : 'deleted',
                                      item : bank
				     });
                        }
                    });
                }
            });
        }
    });
});
      
module.exports = router;
