const express = require('express'),
      router = express.Router(),
      mongoose = require('mongoose'),
      bodyParser = require('body-parser'),
      methodOverride = require('method-override');
      projectMethods = require('./helpers/projects')
      logger = require('../logger/logger')
      validator = require('./validators/validators')

projectDB = mongoose.model('projects')
supplierDB = mongoose.model('Supplier')
//  router.use makes sure that all the requests go through the defined packages first

// loggers
const supLogger = logger.createLogger('sup.log')
readRoles = ['admin','readWrite','read']
writeRoles = ['admin','readWrite']

const validateRead = function(req,res){
    return validator.validateAccess(req,res,readRoles,supLogger)
}
const validateWrite = function(req,res){
    return validator.validateAccess(req,res,writeRoles,supLogger)
}

const readErrorLog = function(req,res,error){
    validator.readErrorLog(req,res,error,'supplier',supLogger)
}

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


// building the Rest Operations at the base of supplier directory
// this will be accessible from https:127.0.0.1:300/suppliers/ if the default router for /
// is not changed

// the root directory will show all suppliers
router.route('/')
    .get(function(req,res){
    //if(validateRead(req,res))

	supplierDB.find({}).
    populate('projects','name').
    populate('banks.LCs',['status','amount','LC_no']).
    exec(function(err,suppliers){
	    if(err){
            return readErrorLog(error)
	    } else{
            console.log(JSON.stringify(suppliers))
		res.format({
		    /*html: function(){
			res.render('suppliers/index',{
			    title: 'List of All suppliers',
			    "suppliers" : suppliers
			});
		    },*/

		    json: function(){
			res.json(JSON.stringify(suppliers));
		    }
		});
	    }
	});
    });

// post request to create a supplier entry
router.route('/').post(function(req,res){
    // GET values from POST requests. These can be done through forms or rest calls. These rely on the "name" attributes of forms
    validateWrite(req,res)
    var name = req.body.name;
    var city = req.body.city;
    var bank = req.body.bank;
    var branch = req.body.branch;
    var IFSC = req.body.IFSC;
    var project = req.body.project;
    //        var project = req.body.project;
    var banks = [{
	name : bank,
	branch : branch,
	IFSC : IFSC
    }];
    
    // creating the entry
    supplierDB.create({
	name : name,
	city : city,
	projects : [project],
	banks : banks
	
    }, function(error,supplier){
	if(error){
	    supLogger.log({
            level: 'error',
            message: 'supplier could not be created',
            error: error,
            payload: req.body
        })
        return res.end('supplier could not be created')
	}else{

        projectDB.findById(project, function(error, project){
            if(error){
                
                // project logger
                return res.end('An error occured while retreiving issuing supplier data.')
            } else {

                projectMethods.addSupplier(project, supplier, function(error,project){
                    if (error) {
                        supLogger.error({
                            message: 'supplier could not be added to the project',
                            error: error,
                        })
                        return res.end(error);
                    }
                    else {
                    console.log('supplier successfully added to : '+ project.name);
                    }
                });
                }
            }
        );
	    // supplier created
	    supLogger.log({
            level: 'audit',
            kind: 'create',
            message: 'Supplier',
            payload: req.body,
            user: req.body.user,
        })
	    res.format({

		html: function(){
		    res.location("suppliers");
		    res.redirect("/suppliers");
		},

		json: function(){
		    res.json(supplier)
		}
	    })
	}
	
    });
});


router.get('/new', function(req,res){
    res.render('suppliers/new', {title: 'Register a new supplier'});
});

router.param('id', function(req,res,next,id){
    // find the supplier by ID
    validateRead(req,res)
    supplierDB.findById(id)
	.populate({ path:'LCs', match: { status : "Active" }})
    .populate('projects',['name','location'])
	.exec(function(err,supplier){
	    if (err){
		  readErrorLog(req,res,error)

	    } else{
    		res.locals.id = id;
    		res.locals.supplier = supplier;
    		res.locals.LCs = supplier.LCs;
    		next();
	    }
	    
	});
});


// used findByID in router.param  as well. Maybe this can be optimised

router.route('/:id')
    .get(function(req, res){
    validateRead(req,res)
	res.format({
	    html: function(){
		res.render('suppliers/show', {
		    "supplier": res.locals.supplier,
		    "LCs": res.locals.LCs
		});
	    },
	    json: function(){
		res.json({'supplier': res.locals.supplier,
			  'LCs': res.locals.LCs})
	    }
	    
	});
    });

//GET the individual blob by Mongo ID
router.get('/:id/edit', function(req, res) {
    validateRead(req,res)
    //search for the bank within Mongo
    console.log('GET processing ID: ' + supplier._id);
    //format the date properly for the value to show correctly in our edit form
    res.format({
        //HTML response will render the 'edit.jade' template
        html: function(){
            res.render('suppliers/edit', {
                title: 'supplier: ' + res.locals.id,
                "supplier": res.locals.supplier
            });
        },
        //JSON response will return the JSON output
        json: function(){
            res.json(res.locals.supplier);
        }
    });
});

//PUT to update a bank by ID
router.put('/:id/edit', function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    validateWrite(req,res)

    var supplier = res.locals.supplier;
    var name = req.body.name;
    var city = req.body.city;
    var bank = req.body.bank;
    var project = req.body.project;
    
    //find the document by ID
    supplier.name = name;
    supplier.city = city;
    if(!(bank in supplier.banks) && bank != undefined){
	   supplier.banks.push(bank)
	
    }
    if(!(project in projects) && project != undefined){
	   supplier.projects.push(project)
    }
    supplier.save(function (err, supplierID) {
        if (err) {
           return validator.saveErrorLog(req,res,err,{name:supplier.name,payload:req.body},supLogger) 
        } 
        else {
            //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
            res.format({
                html: function(){
                    res.redirect("/suppliers/" + supplier._id);
                },
                //JSON responds showing the updated values
                json: function(){
                    res.json(supplier);
                }
            });
        }
    });
});

//PUT to update a bank by ID
router.put('/:id/addProject', function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    var supplier = res.locals.supplier;
    var project = req.body.project;
    
    
    supplier.projects.push(project)
    supplier.save(function (err, supplierID) {
        if (err) {
            return validator.saveErrorLog(req,res,err,{name:supplier.name,payload:req.body},supLogger)
        } 
        else {
            //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.

            // rereading supplier to have the new project name
            supplierDB.findById(supplier._id)
            .populate({ path:'LCs', match: { status : "Active" }})
            .populate('projects',['name','location'])
            .exec(function(error, supplier) {
                if(error){
                    res.status =500
                    res.end(error)
                } else{
                    res.format({
                        /*html: function(){
                            res.redirect("/suppliers/" + supplier._id);
                        },*/
                        //JSON responds showing the updated values
                        json: function(){
                            res.json(JSON.stringify(supplier));
                        }
                    });
                }
            })

        }
    });
});

router.put('/:id/addBank', function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    var supplier = res.locals.supplier;
    var bank = {
        name: req.body.name,
        branch: req.body.branch,
        IFSC: req.body.IFSC
    }
    
    
    supplier.banks.push(bank)
    supplier.save(function (err, supplierID) {
        if (err) {
            return validator.saveErrorLog(req,res,err,{name:supplier.name,payload:req.body},supLogger)
        } 
        else {
            //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
            res.format({
                /*html: function(){
                    res.redirect("/suppliers/" + supplier._id);
                },*/
                //JSON responds showing the updated values
                json: function(){
                    res.json(JSON.stringify(supplier));
                }
            });
        }
    });
});

//DELETE a Bank by ID
router.delete('/:id/edit', function (req, res){
    var supplier = res.locals.supplier;
    supplier.remove(function (err, supplier) {
        if (err) {
            
        } else {
            //Returning success messages saying it was deleted
            console.log('DELETE removing ID: ' + supplier._id);
            res.format({
                //HTML returns us back to the main page, or you can create a success page
                html: function(){
                    res.redirect("/suppliers");
                },
                //JSON returns the item with the message that is has been deleted
                json: function(){
                    res.json({message : 'deleted',
                              item : supplier
			     });
                }
            });
        }
    });
});

module.exports = router;
