const express = require('express'),
      router = express.Router(),
      mongoose = require('mongoose'),
      bodyParser = require('body-parser'),
      methodOverride = require('method-override'),
      bankMethods = require('./helpers/nativeBanks'),
      supplierMethods = require('./helpers/Suppliers'),
      formidable = require('express-formidable'),
      fs = require('fs'),
      mv = require('mv'),
      util = require('util');

const LCDB = mongoose.model('LC')
const natBankDB = mongoose.model('nativeBanks')
const supplierDB = mongoose.model('Supplier')
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

    console.log('request session: ' + req.sessionID)
    console.log(req.session)
	LCDB.find({})
	    .populate('supplier')
	    .populate('issuer')
        .populate('project',['name','location'])
	    .exec(function(err,LCs){
	    if(err){
		console.log(err);
		throw err;

	    }else{
        console.log('response Session : '+res.sessionID);
        console.log(res.session)
		res.format({
		    /*html: function(){
			res.render('LCs/index',{
			    title: 'List of All Letters of Credit',
			    "LCs" : LCs
			});
		    },*/

		    json: function(){
			res.json(JSON.stringify(LCs));
		    }
		});
	    }
	});
    });

// post request to create a supplier entry
router.route('/').post(function(req,res){
    // GET values from POST requests. These can be done through forms or rest calls. These rely on the "name" attributes of forms
    var issuer = req.body.issuer;
    var supplier = req.body.supplier;
    var dates = [{
	openDT: req.body.openDT,
	expDT: req.body.expDT
    }];

    var LC_no = req.body.LC_no;
    var FDR_no = req.body.FDR_no;
    var FDR_DT = req.body.FDR_DT;
    var m_amt = req.body.m_amt;
    var amount = req.body.amount;

    var payment = {
	DT_amt: [{
	    due_DT: req.body.due_DT,
	    due_amt: req.body.due_amt,
	    payed_amt: req.body.payed_amt // assuming 0 payed when creating LC.
	}],
	total_due : req.body.due_amt, // assuming total due is equal to current due
	total_payed: req.body.payed_amt,
    pay_ref: req.body.pay_ref
    }

    var charges = {
	opening: req.body.opening,
	amendment: req.body.amendment,
	bill_of_ex_acc: req.body.boea,
	postal: req.body.postal,
	GST: req.body.GST,
	disbursement: req.body.disbursement
    }

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
	payment: payment,
	charges: charges,
	status: 'Active',
    project: req.body.project,
    supBank: req.body.supBank
	
    }, function(error,LC){
	if(error){
	    console.error(error)
	    res.send('An error occured. Could not create the new LC.')
	}else{
	    // LC created
	    // need to deduct LC_used from nativeBank
	    natBankDB.findById(issuer, function(error, bank){
    		if(error){
    		    console.log('error retreiving issuing bank data.');
    		    console.error('error')
    		    res.send('An error occured while retreiving issuing bank data.')
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
    			return res.send(neg_error);
    		    }else {
    			// add LC to bank 
    			
    			bankMethods.addBankLC(bank, LC, function(error,bank){
    			    if (error) {
    				res.status = error.status;
    				res.send(error);
    			    }
    			    else {
    				console.log('LC successfully added to : '+ bank.name);
    			    }
    			});
    		    }


    		}
	    });

        supplierDB.findById(supplier, function(error, supplier){
            if(error){
                console.log('error retreiving supplier data.');
                console.error('error')
                res.send('An error occured while retreiving issuing supplier data.')
            } else {
                supplierMethods.addLC(supplier, req.body.supBank, LC, function(error,supplier){
                    if (error) {
                    res.status = error.status;
                    res.send(error);
                    }
                    else {
                    console.log('LC successfully added to : '+ supplier.name);
                    }
                });
                }
            }
        );

	    console.log('POST creating new LC : '+ LC);
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
    // find the LC by ID
    console.log('In param function.')
    LCDB.findById(id)
	.populate('supplier')
	.populate('issuer')
    .populate('project')
	.exec(function(error,LC){
	    if (error){
    		console.log('Error retreiving LC with ID : '+ id)
    		var err = new Error('LC with ID : '+ id + ' not found');
    		err.status = 404
            console.log('sending error response')
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
        console.log(' Setting locals variables')
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
        console.log('in route /LCs/:id')
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
    var LC = res.locals.LC;
    console.log('GET Processing ID: ' + LC._id);
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
            res.send("There was a problem updating the information to the database: " + err);
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

//PUT to update a bank by ID
router.put('/:id/addExtension', function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    //find the document by ID
    var LC = res.locals.LC;
    
    var extension = {
	openDT : req.body.openDT,
	expDT : req.body.expDT
    }
    LC.dates.push(extension);
    LC.status = 'Extended';
    LC.save(function (err, LCID) {
        if (err) {
            res.send("There was a problem updating the information to the database: " + err);
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



router.put('/:id/addDueDetails', function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    //find the document by ID
    console.log('Adding new Installment now.');
    var LC = res.locals.LC;
    var details = {
	due_DT: req.body.due_DT,
	due_amt: req.body.due_amt,
	//payed_amt: req.body.payed_amt // remember to make it default to 0 in form
    }

    LC.payment.DT_amt.push(details);

    var total_due = parseFloat(LC.payment.total_due);
    var due_amt = parseFloat(req.body.due_amt);
    //var total_payed = parseFloat(LC.payment.total_payed);
    //var payed_amt = parseFloat(req.body.payed_amt);

    total_due += due_amt;
    //total_payed += payed_amt;
    
    LC.payment.total_due = total_due;
    //LC.payment.total_payed = total_payed;
    
    LC.save(function (err, LCID) {
        if (err) {
            res.send("There was a problem updating the information to the database: " + err);
        } 
        else {
            //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
	    console.log('Installment Details Added: '+ LC.payment)
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
    var LC = res.locals.LC; // is this pass by reference?
    var payment = parseFloat(req.body.payment);
    var pay_ref = req.body.pay_ref;
    var payArray = LC.payment.DT_amt; // is this pass by reference?
    console.log(req.body)
    var index = parseFloat(req.body.index)
    
    var lastInstallment = payArray[index];
    console.log('Installment :' + String(lastInstallment))
    var payed_amt = parseFloat(lastInstallment['payed_amt']);
    
    
    payed_amt = payment;
    lastInstallment['payed_amt'] = payed_amt;
    lastInstallment['pay_ref'] = pay_ref;

    payArray[index] = lastInstallment;
    LC.payment.DT_amt = payArray;

    
    var total_payed = parseFloat(LC.payment.total_payed);
    total_payed += payment;
    LC.payment.total_payed = total_payed;
    

    LC.save(function (err, LCID) {
        if (err) {
            res.send("There was a problem updating the information to the database: " + err);
        } 
        else {

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
            
            LC.payment.DT_amt[index].rec.name = newpath;
            LC.payment.DT_amt[index].rec.rec = true;
            break;
        }
        case "acceptance": {
            LC.payment.DT_amt[index].acc.name = newpath;
            LC.payment.DT_amt[index].acc.rec = true;
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
            res.send("There was a problem updating the information to the database: " + err);
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


/* Can only edit LC_no, FDR_no, amount. Need authorisation.*/    
router.put('/:id/edit', function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    //find the document by ID
    var LC = res.locals.LC;

    LC.FDR_no = req.body.FDR_no;
    LC.LC_no = req.body.LC_no;
    LC.amount = req.body.amount;
        
    LC.save(function (err, LCID) {
        if (err) {
            res.send("There was a problem updating the information to the database: " + err);
        } 
        else {

            bankMethods.update(LC.issuer,function(error,bank){
                if(error){
                    console.log(error)
                } else{
                    console.log('Bank updated')
                }
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

/* Can only edit LC_no, FDR_no, amount. Need authorisation.*/    
router.put('/:id/close', function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    //find the document by ID
    var LC = res.locals.LC;
    LC.status === 'Expired'? res.format({json:function(){res.json(JSON.stringify(LC))}}): null
    console.log('Updating LC')
    LC.status = 'Expired';

    bankMethods.closeLC(res.locals.issuer,LC,function(error,bank){
        if(error) {
            console.error(error)
            return res.send(error)
        }
        console.log('LC Closed')
    })

    try{supplierMethods.removeLC(res.locals.supplier,LC,function(error,supplier){
        if(error){
            console.error(error)
            return res.send(error)
        }

        console.log('LC successfully removed from supplier.')

    })}
    catch(error){
        console.log(error)
    }
    
    LC.save(function (err, LCID) {
        if (err) {
            res.send("There was a problem updating the information to the database: " + err);
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

//DELETE a Bank by ID
router.delete('/:id/edit', function (req, res){
    //find bank by ID
    
    res.locals.LC.remove(function (err, LC) {
        if (err) {
            return console.error(err);
        } else {
            //Returning success messages saying it was deleted
            console.log('DELETE removing ID: ' + LC._id);

	    // need to increase issuer LC_used value!
	    bankMethods.removeBankLC(res.locals.issuer,res.locals.LC,
				 function(error,bank){
				     if (error) {
					 return res.send(error);
				     } else {
					 console.log('LC removed successfully.');
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

module.exports = router;
