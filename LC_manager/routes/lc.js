const express = require('express'),
      router = express.Router(),
      mongoose = require('mongoose'),
      bodyParser = require('body-parser'),
      methodOverride = require('method-override'),
      bankMethods = require('./helpers/nativeBanks'),
      supplierMethods = require('./helpers/Suppliers'),
      LCMethods = require('./helpers/lc'),
      formidable = require('express-formidable'),
      fs = require('fs'),
      mv = require('mv'),
      util = require('util');
      logger = require('../logger/logger')

// SchemaConnections
const LCDB = mongoose.model('LC')
const natBankDB = mongoose.model('nativeBanks')
const supplierDB = mongoose.model('Supplier')

// logger connections
const lcLogger = logger.createLogger('LC.log')

//
const writeRoles = ['readWrite','admin']

const saveErrorLog = function(error,LC_no){
    lcLogger.log({
        level: 'error',
        message: ' could not edit Margin Details',
        error: String(error),
        LC_no: LC_no,
    })
}
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
//router.use(formidable())

// building the Rest Operations at the base of supplier directory
// this will be accessible from https:127.0.0.1:300/suppliers/ if the default router for /
// is not changed

// the root directory will show all suppliers
router.route('/')
    .get(function(req,res){

    if(req.session.authenticated !== true){
        lcLogger.log({
            level: 'warning',
            message: 'Unauthorized read attempt'
        });
        res.status(401)
        return res.end('Not authorized')
    }
    
    
	LCDB.find({},null,{sort:[{'LC_no':1}]})
	    .populate('supplier')
	    .populate('issuer')
        .populate('project',['name','location'])
	    .exec(function(err,LCs){
	    if(err){
		console.log(err);
		throw err;

	    }else{


            var LCHashMap =  new Map()
            LCs.reduce((map,prop,key) => {
                LCHashMap.set(prop.LC_no,prop)
            },LCHashMap)
    		res.format({
    		    /*html: function(){
    			res.render('LCs/index',{
    			    title: 'List of All Letters of Credit',
    			    "LCs" : LCs
    			});
    		    },*/


    		    json: function(){
    			res.json(JSON.stringify([...LCHashMap]));
    		    }
    		});
    	}
	});
    });

// post request to create a supplier entry
router.route('/').post(function(req,res){
    // GET values from POST requests. These can be done through forms or rest calls. These rely on the "name" attributes of forms
    
    if(req.session.authenticated !== true ||
        !writeRoles.includes(req.session.user.role)){
        lcLogger.log({
            level: 'warning',
            message: 'Unauthorized LC creation attempt by :'  + req.session.user.name,
            user: req.session.user
        })
        return res.end('Not authorized')
    }

    var issuer = req.body.issuer;
    var supplier = req.body.supplier;
    var dates = [{
	openDT: req.body.openDT,
	expDT: req.body.expDT,
    open: req.body.open, 
    amend: 0,
    post: req.body.post,
    GST: req.body.GST,
    }];

    var LC_no = req.body.LC_no;
    var FDR_no = req.body.FDR_no;
    var FDR_DT = req.body.FDR_DT;
    var m_amt = req.body.m_amt;
    var amount = req.body.amount;

    // following won't be present at the time of creation
    var payment = {
	   cycles: [],
	   total_due : 0, // assuming total due is equal to current due
	   total_payed: 0,
    }

    // following have been reorganized in the structure.
    /*
    var charges = {
	opening: req.body.opening,
	amendment: req.body.amendment,
	bill_of_ex_acc: req.body.boea,
	postal: req.body.postal,
	GST: req.body.GST,
	disbursement: req.body.disbursement
    }*/

    // creating the entry
    LCDB.create({
	issuer: issuer,
	supplier: supplier,
	dates: dates,
	LC_no: LC_no,
	FDR_no: FDR_no,
	FDR_DT: FDR_DT,
	m_amt: m_amt,
	amount: amount,
	status: 'Active',
    project: req.body.project,
    supBank: req.body.supBank,
    payment: payment
    }, function(error,LC){
	if(error){
	    lcLogger.log({
            level: 'error',
            message: String(error),
            user: req.session.user,
        })
	    return res.end('An error occured. Could not create the new LC.')
	}else{

	    // LC created
	    // need to deduct LC_used from nativeBank
        console.log('LC was successfully created : ',LC);
	    natBankDB.findById(issuer, function(error, bank){
    		if(error){
    		    lcLogger.log({
                    level: 'error',
                    message: 'error retreiving issuing bank data.',
                    error: String(error)
                });
    		    return res.end('An error occured while retreiving issuing bank data.')
    		} else {
    		    var LC_used = bank.LC_used;
    		    LC_used += LC.amount;
    		    if(LC_used < 0){
    			res.status = 409;
    			neg_error = new Error('LC_limit crossed!. Removing generated LC.');
    			neg_error.status = 409;
    			LC.remove(function(rm_error,LC){
    			    if(error){
    				console.log('LC '+LC._id+' could not me removed. Marking it as InValid')
    				LC.update({
    				    status: 'InValid'
    				})
    			    }
    			});
    			return res.end(neg_error);
    		    }else {
    			// add LC to bank 
        			bankMethods.addBankLC(bank, LC, function(error,bank){
        			    if (error) {
                            lcLogger.log({
                                level:'warning',
                                message: 'LC limit of issuing bank could not be updated. LC limit may be inconsistent',
                                bank: bank.name
                            })
            				return res.end(error);
        			    }
        			    else {
        				    lcLogger.log({
                                'level': 'info',
                                message: 'LC limit of bank successfully updated.'
                            })
        			    }
        			});
    		    }      
    		}
	    });

        supplierDB.findById(supplier, function(error, supplier){
            if(error){
                lcLogger.log({
                    level: 'warning',
                    message: 'Supplier was not found. LC could not be updated to supplier',
                    supplierID: supplier
                })
                return res.end('An error occured while retreiving issuing supplier data.')
            } else {
                supplierMethods.addLC(supplier, req.body.supBank, LC, function(error,supplier){
                    if (error) {
                        lcLogger.log({
                            level:'warning',
                            message: 'LC could not be added to supplier.',
                            supplier: supplier.name
                        })
                        return res.end(error);
                    }
                    else {
                    lcLogger.log('info','LC successfully added to : '+ supplier.name);
                    }
                });
                }
            }
        );

        lcLogger.log({
            level: 'audit',
            kind: 'create',
            message: 'LC',
            LC_no: LC.LC_no,
            user: req.session.user
        })
	    res.format({

		/*html: function(){
		    res.location("LettersOfCredit");
		    res.redirect("/LCs");
		},*/

		json: function(){
		    res.json(JSON.stringify(LC))
		}
	    })
	}
	
    });
});


router.get('/new', function(req,res){
    res.render('LCs/new', {title: 'Register a new Letter Of Credit'});
});

router.param('id', function(req,res,next,id){
    
    if(req.session.authenticated !== true){
        lcLogger.log({
            level: 'warning',
            message: 'Unauthorized read attempt.'
        });
        res.status(401)
        return res.end('Not authorized')
    }
    // find the LC by ID
    console.log('In param function.')
    LCDB.findById(id)
	.populate('supplier')
	.populate('issuer')
    .populate('project')
	.exec(function(error,LC){
	    if (error){
    		
    		var err = new Error('LC with ID : '+ id + ' not found');
    		err.status = 404
            lcLogger.log({
                level: 'error',
                message : 'LC with ID : '+ id + ' not found',
                error: error
            })
    		res.format({
    		    /*html: function(){
    			next(err);
    		    },*/
    		    json: function(){
    			res.json({message: err.status + ' ' + err});
    		    }
    		})
	    }
        else{
        //console.log(LC);
		res.locals.id = LC._id;
		res.locals.LC = LC;
		res.locals.issuer = LC.issuer;
		res.locals.supplier = LC.supplier;
		next();
	    }
	    
	});
});


// used findByID in router.param  as well. Maybe this can be optimised
router.route('/:id')
    .get(function(req, res){

    	res.format({
    	    /*html: function(){
    		res.render('LCs/show', {
    		    "LC": res.locals.LC,
    		    "supplier": res.locals.supplier,
    		    "issuer": res.locals.issuer
    		    
    		});
    	    },*/
    	    json: function(){
    		res.json(res.locals.LC);
    	    }
    	    
    	});
    });


//GET the individual blob by Mongo ID
router.get('/:id/edit', function(req, res) {
    
    if(req.session.authenticated !== true ||
        !writeRoles.includes(req.session.user.role)){
        lcLogger.log({
            level: 'warning',
            message: 'Unauthorized LC Edit attempt on LC_NO : '+ res.locals.id + ' by :'  + req.session.user.name,
            user: req.session.user
        })
        return res.end('Not authorized')
    }

    var LC = res.locals.LC;
    
    //format the date properly for the value to show correctly in our edit form
    res.format({
        //HTML response will render the 'edit.jade' template
        /*html: function(){
            res.render('LCs/edit', {
                title: 'LC: ' + LC._id,
                "LC": LC
            });
        },*/
        //JSON response will return the JSON output
        json: function(){
            res.json(JSON.stringify(LC));
        }
    });
});

//GET the individual LC by Mongo ID
router.get('/:id/addCharges', function(req, res) {
    var LC = res.locals.LC;
    console.log('GET Processing ID: ' + LC._id);
    //format the date properly for the value to show correctly in our edit form
    res.format({
        //HTML response will render the 'edit.jade' template
        /*html: function(){
            res.render('LCs/addCharges', {
                title: 'LC: ' + LC._id,
                "LC": LC
            });
        },*/
        //JSON response will return the JSON output
        json: function(){
            res.json(JSON.stringify(LC));
        }
    });
});

//GET the individual blob by Mongo ID
router.get('/:id/addExtension', function(req, res) {
    var LC = res.locals.LC;
    console.log('GET Processing ID: ' + LC._id);
    //format the date properly for the value to show correctly in our edit form
    res.format({
        //HTML response will render the 'edit.jade' template
        /*html: function(){
            res.render('LCs/addExtension', {
                title: 'LC: ' + LC._id,
                "LC": LC
            });
        },*/
        //JSON response will return the JSON output
        json: function(){
            res.json(JSON.stringify(LC));
        }
    });
});

//GET the individual blob by Mongo ID
router.get('/:id/addPayment', function(req, res) {
    var LC = res.locals.LC;
    console.log('GET Processing ID: ' + LC._id);
    //format the date properly for the value to show correctly in our edit form
    res.format({
        //HTML response will render the 'edit.jade' template
        /*html: function(){
            res.render('LCs/addPayment', {
                title: 'LC: ' + LC._id,
                "LC": LC
            });
        },*/
        //JSON response will return the JSON output
        json: function(){
            res.json(JSON.stringify(LC));
        }
    });
});

//GET the individual blob by Mongo ID
router.get('/:id/addDueDetails', function(req, res) {
    var LC = res.locals.LC;
    console.log('GET Processing ID: ' + LC._id);
    //format the date properly for the value to show correctly in our edit form
    res.format({
        //HTML response will render the 'edit.jade' template
        /*html: function(){
            res.render('LCs/addDueDetails', {
                title: 'LC: ' + LC._id,
                "LC": LC
            });
        },*/
        //JSON response will return the JSON output
        json: function(){
            res.json(JSON.stringify(LC));
        }
    });
});

router.get('/:id/addDocument', function(req, res) {
    var LC = res.locals.LC;
    console.log('GET Processing ID: ' + LC._id);
    //format the date properly for the value to show correctly in our edit form
    res.format({
        //HTML response will render the 'edit.jade' template
        /*html: function(){
            res.render('LCs/addDueDetails', {
                title: 'LC: ' + LC._id,
                "LC": LC
            });
        },*/
        //JSON response will return the JSON output
        json: function(){
            res.json(JSON.stringify(LC));
        }
    });
});

//GET the individual blob by Mongo ID
router.get('/:id/close', function(req, res) {
    var LC = res.locals.LC;
    console.log('GET Processing ID: ' + LC._id);
    //format the date properly for the value to show correctly in our edit form
    res.format({
        //HTML response will render the 'edit.jade' template
        /*html: function(){
            res.render('LCs/close', {
                title: 'LC: ' + LC._id,
                "LC": LC
            });
        },*/
        //JSON response will return the JSON output
        json: function(){
            res.json(JSON.stringify(LC));
        }
    });
});

//PUT to update a bank by ID
router.put('/:id/addCharges', function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    //find the document by ID

    if(req.session.authenticated !== true ||
        !writeRoles.includes(req.session.user.role)){
        lcLogger.log({
            level: 'warning',
            message: 'Unauthorized LC edit attempt on LC_NO : '+ res.locals.id + ' by :'  + req.session.user.name,
            user: req.session.user
        })
        return res.end('Not authorized')
    }

    var LC = res.locals.LC;
    var charges = {
	opening : req.body.opening,                // miscellaneous charges
	amendment : req.body.amendment,
	bill_of_ex_acc : req.body.boea,
	postal : req.body.postal,
	GST : req.body.GST,
	disbursement : req.body.disbursement
    }
    var total = (+req.body.opening) + (+req.body.amendment) + (+req.body.boea)
	+ (+req.body.postal) + (+req.body.GST) + (+req.body.disbursement);

    var ex_cha = {
	charges : charges,
	total: total
    }

    LC.ex_cha = ex_cha;
    
    LC.save(function (err, LCID) {
        if (err) {
            saveErrorLog(err,LC.LC_no)
            return res.end("There was a problem updating the information to the database: " + err);
        } 
        else {
            //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
            res.format({
                /*html: function(){
                    res.redirect("/LCs/" + LC._id);
                },*/
                //JSON responds showing the updated values
                json: function(){
                    res.json(JSON.stringify(LC));
                }
            });
            
        }
    });
});

router.put('/:id/addMarginData', function(req,res) {
    if(req.session.authenticated !== true ||
        !writeRoles.includes(req.session.user.role)){
        lcLogger.log({
            level: 'warning',
            message: 'Unauthorized LC Margin Data Edit attempt on LC_NO : '+ res.locals.id + ' by :'  + req.session.user.name,
            user: req.session.user
        })
        return res.end('Not authorized')
    }
    var LC = res.locals.LC;    
    LC.m_cl_DT = req.body.m_cl_DT;
    LC.m_cl_amt = parseFloat(req.body.m_cl_amt);
    LC.save(function(error,LCID) {
        if(error){
            saveErrorLog(error,LC.LC_no)
            return res.end(error)
        } else {
            lcLogger.log({
                level: 'audit',
                kind: 'edit',
                message: 'Margin Details',
                payload: req.body,
                LC_no: LC.LC_no,
                user: req.session.user
            })
            res.json(JSON.stringify(LC))
        }
    });
});

//PUT to update a bank by ID
router.put('/:id/addOrEditExtension', function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    //find the document by ID
    if(req.session.authenticated !== true ||
        !writeRoles.includes(req.session.user.role)){
        lcLogger.log({
            level: 'warning',
            message: 'Unauthorized LC Extension Edit attempt on LC_NO : '+ res.locals.id + ' by :'  + req.session.user.name,
            user: req.session.user
        })
        return res.end('Not authorized')
    }

    var LC = res.locals.LC;
    
    const index = (req.body.index === undefined)? null : parseFloat(req.body.index)
    console.log(index)
    if(index != null){
        
        extension = LC.dates[index]
        extension.openDT = req.body.openDT,
        extension.expDT= req.body.expDT,
        extension.open= req.body.open,
        extension.post= req.body.post,
        extension.amend= req.body.amend,
        extension.GST= req.body.GST,
        extension.TID= req.body.TID
    } else {
        console.log('creating extension')
        var extension = {
            openDT : req.body.openDT,
            expDT : req.body.expDT,
            open : req.body.open,
            post: req.body.post,
            amend: req.body.amed,
            GST: req.body.GST,
            TID: req.body.TID,  
        }

        LC.dates.push(extension)
        LC.status = 'Extended'
    }
    
    LC.save(function (err, LCID) {
        if (err) {
            saveErrorLog(err,LC.LC_no)
            return res.end("There was a problem updating the information to the database: " + err);
        } 
        else {
            
            lcLogger.log({
                level: 'audit',
                kind: req.body.index === undefined ? 'create' : 'edit',
                message: 'Opening/Extension Details',
                payload: req.body,
                LC_no: LC.LC_no,
                user: req.session.user
            })
            //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
            res.format({
                /*html: function(){
                    res.redirect("/LCs/" + LC._id);
                },*/
                //JSON responds showing the updated values
                json: function(){
                    res.json(JSON.stringify(LC));
                }
            });
            
        }
    });
});





router.put('/:id/addNewCycle', function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    //find the document by ID
    
    if(req.session.authenticated !== true ||
        !writeRoles.includes(req.session.user.role)){
        lcLogger.log({
            level: 'warning',
            message: 'Unauthorized LC Cycle Creation attempt on LC_NO : '+ res.locals.id + ' by :'  + req.session.user.name,
            user: req.session.user
        })
        return res.end('Not authorized')
    }
    try{
    var LC = res.locals.LC;
    var details = {
    	due_DT: req.body.due_DT,
    	due_amt: req.body.due_amt,
    	LB_pay_ref: req.body.LB_pay_ref? req.body.LB_pay_ref:'',
        acc: {
            acc: req.body.acc,
            GST: req.body.GST,
            TID: req.body.TID? req.body.TID : ''   
        },
        pay: {
            bill_com: 0,
            post: 0,
            GST: 0,
            TID: '',
            mode: 'Not Updated'
        },
        payed: false
    }

    LC.payment.cycles.push(details);

    var total_due = parseFloat(LC.payment.total_due);
    var due_amt = parseFloat(req.body.due_amt);
    //var total_payed = parseFloat(LC.payment.total_payed);
    //var payed_amt = parseFloat(req.body.payed_amt);

    total_due = LCMethods.updateTotal(LC)
    //total_payed += payed_amt;
    
    LC.payment.total_due = total_due;
    //LC.payment.total_payed = total_payed;
    }catch(error){
        console.log(error)
    }
    LC.save(function (err, LCID) {
        if (err) {
            saveErrorLog(err,LC.LC_no)
            return res.end("There was a problem updating the information to the database: " + err);
        } 
        else {

            lcLogger.log({
                level: 'audit',
                kind: 'create',
                message: 'Cycle',
                payload: req.body,
                LC_no: LC.LC_no,
                user: req.session.user
            })
            //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
            res.format({
                /*html: function(){
                    res.redirect("/LCs/" + LC._id);
                },*/
                //JSON responds showing the updated values
                json: function(){
                    res.json(JSON.stringify(LC));
                }
            });
            
        }
    });
});

router.put('/:id/editCycle', function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    //find the document by ID
    
    if(req.session.authenticated !== true ||
        !writeRoles.includes(req.session.user.role)){
        lcLogger.log({
            level: 'warning',
            message: 'Unauthorized LC Cycle Edit attempt on LC_NO : '+ res.locals.id + ' by :'  + req.session.user.name,
            user: req.session.user
        })
        return res.end('Not authorized')
    }

    var LC = res.locals.LC;

    const idx = parseFloat(req.body.index)
    
    // old cycle
    var cycle = LC.payment.cycles[idx]
    console.log('LC payment total_due: ' + LC.payment.total_due)


    //updating cycle
    cycle.due_DT = req.body.due_DT
    console.log(req.body.payed_DT)
    cycle.payed_DT = req.body.payed_DT
    cycle.due_amt = req.body.due_amt
    cycle.LB_pay_ref = req.body.LB_pay_ref
    cycle.acc = {
            acc: req.body.acc,
            GST: req.body.accGST,
            TID: req.body.accTID   
        }
    cycle.pay = {
            bill_com: req.body.payBC,
            post: req.body.payPost,
            GST: req.body.payGST,
            TID: req.body.payTID,
            mode: req.body.payMode
        }
    // saving the update cycle
    LC.payment.cycles[idx] = cycle;

    var total_due = LCMethods.updateTotal(LC)
    console.log(total_due)

    LC.payment.total_due = total_due;
    console.log(LC.payment.total_due)
    LC.save(function (err, LCID) {
        if (err) {
            saveErrorLog(err,LC.LC_no)
            return res.end("There was a problem updating the information to the database: " + err);
        } 
        else {
            //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
            lcLogger.log({
                level: 'audit',
                kind: 'edit',
                message: 'Cycle',
                payload: req.body,
                LC_no: LC.LC_no,
                user: req.session.user
            })
            res.format({
                /*html: function(){
                    res.redirect("/LCs/" + LC._id);
                },*/
                //JSON responds showing the updated values
                json: function(){
                    res.json(JSON.stringify(LC));
                }
            });
            
        }
    });
});

router.put('/:id/checkCyclePayment', function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    //find the document by ID
    if(req.session.authenticated !== true ||
        !writeRoles.includes(req.session.user.role)){
        lcLogger.log({
            level: 'warning',
            message: 'Unauthorized LC Cycle Payment review attempt on LC_NO : '+ res.locals.id + ' by :'  + req.session.user.name,
            user: req.session.user
        })
        return res.end('Not authorized')
    }
    var LC = res.locals.LC;

    const idx = parseFloat(req.body.index)
    
    // old cycle
    var cycle = LC.payment.cycles[idx]
    console.log(req.body.payMode)
    //updating payment details
    cycle.pay = {
            bill_com: req.body.payBC,
            post: req.body.payPost,
            GST: req.body.payGST,
            TID: req.body.payTID,
            mode: req.body.payMode
        }
    console.log(req.body.payed_DT)

    cycle.payed_DT = req.body.payed_DT
    // saving the update cycle
    LC.payment.cycles[idx] = cycle;
    
    LC.save(function (err, LCID) {
        if (err) {
            saveErrorLog(err,LC.LC_no)
            return res.end("There was a problem updating the information to the database: " + err);
        } 
        else {
            //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
            lcLogger.log({
                level: 'audit',
                kind: 'edit',
                message: 'Cycle Payment review',
                payload: req.body,
                LC_no: LC.LC_no,
                user: req.session.user
            })
            res.format({
                /*html: function(){
                    res.redirect("/LCs/" + LC._id);
                },*/
                //JSON responds showing the updated values
                json: function(){
                    res.json(JSON.stringify(LC));
                }
            });
            
        }
    });
});

router.put('/:id/addPayment', function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    //find the document by ID
    if(req.session.authenticated !== true ||
        !writeRoles.includes(req.session.user.role)){
        lcLogger.log({
            level: 'warning',
            message: 'Unauthorized LC adding Payment attempt on LC_NO : '+ res.locals.id + ' by :'  + req.session.user.name,
            user: req.session.user
        })
        return res.end('Not authorized')
    }
    var LC = res.locals.LC; // is this pass by reference?
    var payment = parseFloat(req.body.payment);
    var pay_ref = req.body.pay_ref;
    var payArray = LC.payment.cycles; // is this pass by reference?
    
    var index = parseFloat(req.body.index)
    
    var lastInstallment = payArray[index];
    console.log('Installment :' + String(lastInstallment))
    var payed_amt = parseFloat(lastInstallment['payed_amt']);
    
    
    payed_amt = payment;
    lastInstallment['payed_amt'] = payed_amt;
    lastInstallment['pay_ref'] = pay_ref;

    payArray[index] = lastInstallment;
    LC.payment.cycles = payArray;

    
    var total_payed = parseFloat(LC.payment.total_payed);
    total_payed += payment;
    LC.payment.total_payed = total_payed;
    

    LC.save(function (err, LCID) {
        if (err) {
            saveErrorLog(err,LC.LC_no)
            return res.end("There was a problem updating the information to the database: " + err);
        } 
        else {
            lcLogger.log({
                level: 'audit',
                kind: 'edit',
                message: 'Cycle Payment amount',
                payload: req.body,
                LC_no: LC.LC_no,
                user: req.session.user
            })
            // Need to free utilized from bank.
            bankMethods.onPayment(LC.issuer,payment, function(error,bank){
                if(error){
                    res.status = 500;
                    res.end(error)
                }
            })


            //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
            console.log('Sending reply!')
            res.format({
                /*html: function(){
                    res.redirect("/LCs/" + LC._id);
                },*/
                //JSON responds showing the updated values
                json: function(){
                    res.json(JSON.stringify(LC));
                }
            });
            
        }
    });
});

/* Document Upload Handle*/

router.route('/:id/addDocument').post(function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    //find the document by ID
    if(req.session.authenticated !== true ||
        !writeRoles.includes(req.session.user.role)){
        lcLogger.log({
            level: 'warning',
            message: 'Unauthorized document Addition attempt on LC_NO : '+ res.locals.id + ' by :'  + req.session.user.name,
            user: req.session.user
        })
        return res.end('Not authorized')
    }
    var LC = res.locals.LC;
    var file = req.files.file;
    var name = req.fields.name;
    var index = parseFloat(req.fields.index);    
    
    var newpath = null
    switch(name){
        case "receipt": {
            console.log('entered case')
            newpath = __dirname + '/' +'../DATA_FILES/'+res.locals.id
                            + '/receipt.' + file.name.split('.')[1]
            
            LC.payment.cycles[index].rec.name = newpath;
            LC.payment.cycles[index].rec.rec = true;
            break;
        }
        case "acceptance": {
            LC.payment.cycles[index].acc.name = newpath;
            LC.payment.cycles[index].acc.rec = true;
            break;   
        }
        case "bankCharges": {
            LC.dates[index].bc.name = newpath;
            LC.dates[index].bc.rec = true;
            break;      
        }
        case "application": {
            LC.dates[index].app.name = newpath;
            LC.dates[index].app.rec = true;
            break;         
        }

        default: {
            error = new Error('Invalid request')
            error.status = 405
            return res.send(error)
        }
    }
    

    console.log('moving')
    mv(file.path,newpath,{mkdirp: true}, function (err){
        if (err){ 
            console.log('moving error')
            console.log(err);
            return res.send(err)
        }
        //res.writeHead(200,{"Content-Type" : "text/html"});
        //res.write('File uploaded and moved to '+ newpath+"<br>");
        //res.end(util.inspect({fields:fields, files:files}))
        
    });
    

    //res.send(new Error('just checking'))
    console.log('saving')
    LC.save(function (err, LCID) {
        if (err) {
            saveErrorLog(err,LC.LC_no)
            return res.end("There was a problem updating the information to the database: " + err);
        } 
        else {
            //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
            lcLogger.log({
                level: 'audit',
                kind: 'create',
                message: 'Document',
                payload: req.fields,
                LC_no: LC.LC_no,
                user: req.session.user
            })
            res.format({
                /*html: function(){
                    res.redirect("/LCs/" + LC._id);
                },*/
                //JSON responds showing the updated values
                json: function(){
                    res.json(JSON.stringify(LC));
                }
            });
            
        }
    });
});


/* Can only edit LC_no, FDR_no, amount. Need authorisation.*/    
router.put('/:id/edit', function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    //find the document by ID
    if(req.session.authenticated !== true ||
        !writeRoles.includes(req.session.user.role)){
        lcLogger.log({
            level: 'warning',
            message: 'Unauthorized Edit attempt on LC_NO : '+ res.locals.id + ' by :'  + req.session.user.name,
            user: req.session.user
        })
        return res.end('Not authorized')
    }
    var LC = res.locals.LC;
    console.log(req.body)
    try{
    LC.FDR_no = req.body.FDR_no;
    LC.LC_no = req.body.LC_no;
    LC.amount = req.body.amount;
        
    LC.save(function (err, LCID) {
        if (err) {
            saveErrorLog(err,LC.LC_no)
            return res.end("There was a problem updating the information to the database: " + err);
        } 
        else {
            lcLogger.log({
                level: 'audit',
                kind: 'edit',
                message: 'LC',
                payload: req.body,
                LC_no: LC.LC_no,
                user: req.session.user
            })

            bankMethods.update(LC.issuer,function(error,bank){
                if(error){
                    console.log(error)
                } else{
                    console.log('Bank updated')
                }
            })

            //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
            console.log('sending reply')
            res.format({
                /*html: function(){
                    res.redirect("/LCs/" + LC._id);
                },*/
                //JSON responds showing the updated values
                json: function(){
                    res.json(JSON.stringify(LC));
                }
            });
            
        }
    });
    }
    catch(error){
        console.log(error)
    }
});

/* Can only edit LC_no, FDR_no, amount. Need authorisation.*/    
router.put('/:id/close', function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    //find the document by ID
    if(req.session.authenticated !== true ||
        !writeRoles.includes(req.session.user.role)){
        lcLogger.log({
            level: 'warning',
            message: 'Unauthorized Closing attempt on LC_NO : '+ res.locals.id + ' by :'  + req.session.user.name,
            user: req.session.user
        })
        return res.end('Not authorized')
    }
    var LC = res.locals.LC;

    if(LC.status === 'Closed'){
        return res.format({json:function(){res.json(JSON.stringify(LC))}})
    }
    
    LC.status = 'Closed';
    LC.closeDT = new Date(Date.now())

    bankMethods.closeLC(res.locals.issuer,LC,function(error,bank){
        if(error) {
            console.error(error)
            return res.send(error)
        }
        console.log('LC Closed')
    })

    supplierMethods.removeLC(res.locals.supplier,LC,function(error,supplier){
        if(error){
            console.error(error)
            return res.send(error)
        }

        console.log('LC successfully removed from supplier.')

    })
    
    LC.save(function (err, LCID) {
        if (err) {
            saveErrorLog(err,LC.LC_no)
            return res.end("There was a problem updating the information to the database: " + err);
        } 
        else {
            lcLogger.log({
                level: 'audit',
                kind: 'edit',
                message: 'Close LC',
                LC_no: LC.LC_no,
                user: req.session.user
            })
            //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
            res.format({
                /*html: function(){
                    res.redirect("/LCs/" + LC._id);
                },*/
                //JSON responds showing the updated values
                json: function(){
                    res.json(JSON.stringify(LC));
                }
            });
            
        }
    });
});

//DELETE a Bank by ID
router.delete('/:id/edit', function (req, res){
    //find bank by ID
    if(req.session.authenticated !== true ||
        !writeRoles.includes(req.session.user.role)){
        lcLogger.log({
            level: 'warning',
            message: 'Unauthorized Deletion attempt on LC_NO : '+ res.locals.id + ' by :'  + req.session.user.name,
            user: req.session.user
        })
        return res.end('Not authorized')
    }
    res.locals.LC.remove(function (err, LC) {
        if (err) {
            saveErrorLog(err,LC.LC_no)
            return res.end(err);
        } else {
            //Returning success messages saying it was deleted
            console.log('DELETE removing ID: ' + LC._id);

	    // need to increase issuer LC_used value!
	    bankMethods.removeBankLC(res.locals.issuer,res.locals.LC,
				 function(error,bank){
				     if (error) {
					 return res.send(error);
				     } else {
					 console.log('LC removed from bank successfully.');
				     }
				 });

        supplierMethods.removeLC(res.locals.supplier,res.locals.LC,
                function(error,supplier){
                    if(error) {
                        console.error(error)
                        return res.send(error)
                    }

                    console.log('LC removed from supplier successfully.')
                })
	    
        lcLogger.log({
                level: 'audit',
                kind: 'delete',
                message: 'delete LC',
                LC_no: LC.LC_no,
            })

	    res.format({
		
        //HTML returns us back to the main page, or you can create a success page
		/*html: function(){
		    res.redirect("/LCs");
		},*/
		//JSON returns the item with the message that is has been deleted
		json: function(){
		    res.json({message : 'deleted',
			      item : JSON.stringify(LC)
			     });
		}
	    });
	}
    });
});

//PUT to update a bank by ID
router.delete('/:id/deleteExtension', function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    //find the document by ID
    if(req.session.authenticated !== true ||
        !writeRoles.includes(req.session.user.role)){
        lcLogger.log({
            level: 'warning',
            message: 'Unauthorized Extension deletion attempt on LC_NO : '+ res.locals.id + ' by :'  + req.session.user.name,
            user: req.session.user
        })
        return res.end('Not authorized')
    }
    var LC = res.locals.LC;
    console.log(req.body)
    const index = (req.body.index === undefined)? null : parseFloat(req.body.index)
    console.log(index)
    var ext = LC.dates[index]
    LC.dates.splice(index,1)

    LC.dates.length === 1 ? LC.status='Active' : {}

    LC.save(function (err, LCID) {
        if (err) {
            saveErrorLog(err,LC.LC_no)
            return res.end("There was a problem updating the information to the database: " + err);
        } 
        else {
            //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
            lcLogger.log({
                level: 'audit',
                kind: 'delete',
                message: 'delete Extension',
                data : ext,
                LC_no: LC.LC_no,
            })
            res.format({
                /*html: function(){
                    res.redirect("/LCs/" + LC._id);
                },*/
                //JSON responds showing the updated values
                json: function(){
                    res.json(JSON.stringify(LC));
                }
            });
            
        }
    });
});

//PUT to update a bank by ID
router.delete('/:id/deleteCycle', function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    //find the document by ID
    if(req.session.authenticated !== true ||
        !writeRoles.includes(req.session.user.role)){
        lcLogger.log({
            level: 'warning',
            message: 'Unauthorized cycle deletion attempt on LC_NO : '+ res.locals.id + ' by :'  + req.session.user.name,
            user: req.session.user
        })
        return res.end('Not authorized')
    }
    var LC = res.locals.LC;
    const index = (req.body.index === undefined)? null : parseFloat(req.body.index)
    
    var delCycle = LC.payment.cycles[index]
    LC.payment.cycles.splice(index,1)    

    var total_due = LCMethods.updateTotal(LC)
    LC.total_due = total_due    

    LC.save(function (err, LCID) {
        if (err) {
            saveErrorLog(err,LC.LC_no)
            return res.end("There was a problem updating the information to the database: " + err);
        } 
        else {
            //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
            lcLogger.log({
                level: 'audit',
                kind: 'delete',
                message: 'delete Cycle',
                data : delCycle,
                LC_no: LC.LC_no,
            })
            res.format({
                /*html: function(){
                    res.redirect("/LCs/" + LC._id);
                },*/
                //JSON responds showing the updated values
                json: function(){
                    res.json(JSON.stringify(LC));
                }
            });
            
        }
    });
});

module.exports = router;
