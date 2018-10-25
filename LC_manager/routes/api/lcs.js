const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bankMethods = require('./helpers/nativeBanks');
const supplierMethods = require('./helpers/Suppliers');
const LCMethods = require('./helpers/lc');
const logger = require('../../logger/logger')
const acl = require('../../authorization/acl')
// SchemaConnections
const LCDB = mongoose.model('LC')
const natBankDB = mongoose.model('banks')
const supplierDB = mongoose.model('Supplier')

// logger connections
const lcLogger = logger.createLogger('LC.log')

const saveErrorLog = function (error, LC_no) {
  lcLogger.log({
    level: 'error',
    message: ' could not edit Margin Details',
    error: String(error),
    LC_no: LC_no,
  })
}


function createHaetosResponse(object, projections) {
  var links = projections.reduce((acc, model, idx) => {
    objects = [{
      rel: model.name,
      href: model.api + model._id,
      method: 'GET',
      types: ['application/json']
    }, {
      rel: model.name,
      href: model.api + model._id,
      method: 'PUT',
      types: ['application/json']
    }]

    return links.concat(objects)
  },[]);

  object['links'] = links
}

// authorize first
router.use(acl.authorize({}))

// the root directory will show all suppliers
router.route('/').get( async function (req, res) {
    const offset = parseInt(req.query.skip)
    const limit = parseInt(req.query.limit)
    try {
      LCs = await LCDB.find({}, '_id LC_no amount status', {sort: [{'LC_no': 1}]})
                      .skip(offset).limit(limit)
                      .populate('issuer','_id name')
                      .populate('supplier','_id name')
                      .exec()
      const response_array = LCs.map((prop,key) => {
        const base_url = `/api/lcs/${prop._id}`
        links = {
          lc: {
            link: base_url,
            method: 'GET'
          },
          supplier: {
            link: `/api/suppliers/${prop.supplier._id}`,
            method: 'GET'
          },
          issuer: {
            link: `/api/banks/${prop.issuer._id}`,
            method: 'GET'
          }
        }
        
        
        res_object = {
          _id: prop._id,
          LC_no: prop.LC_no,
          amount: prop.amount,
          issuer: prop.issuer,
          supplier: prop.supplier,
          status: prop.status,
          links: links,
        } 
        return res_object
      });

      const data = {
        offset: offset,
        limit: limit,
        data: response_array,
        links: {
          create: {
            link: '/api/lcs',
            method: 'POST'
          }
        }
      }

      return res.json(JSON.stringify(data))

    } catch(error){
      lcLogger.log({
        level: 'error',
        error: error.toString(),
      })

      return res.sendStatus(500);
    }
  });

// post request to create a supplier entry
router.route('/').post(function (req, res) {
  // GET values from POST requests. These can be done through forms or rest calls. These rely on the "name" attributes of forms

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
    total_due: 0, // assuming total due is equal to current due
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
  }, function (error, LC) {
    if (error) {
      lcLogger.log({
        level: 'error',
        message: String(error),
        user: req.session.user,
      })
      return res.end('An error occured. Could not create the new LC.')
    } else {

      // LC created
      // need to deduct LC_used from nativeBank
      natBankDB.findById(issuer, function (error, bank) {
        if (error) {
          lcLogger.log({
            level: 'error',
            message: 'error retreiving issuing bank data.',
            error: String(error)
          });
          return res.end('An error occured while retreiving issuing bank data.')
        } else {
          var LC_used = bank.LC_used;
          LC_used += LC.amount;
          if (LC_used < 0) {
            res.status = 409;
            neg_error = new Error('LC_limit crossed!. Removing generated LC.');
            neg_error.status = 409;
            LC.remove(function (rm_error, LC) {
              if (error) {
                console.log('LC ' + LC._id + ' could not me removed. Marking it as InValid')
                LC.update({
                  status: 'InValid'
                })
              }
            });
            return res.end(neg_error);
          } else {
            // add LC to bank 
            bankMethods.addBankLC(bank, LC, function (error, bank) {
              if (error) {
                lcLogger.log({
                  level: 'warning',
                  message: 'LC limit of issuing bank could not be updated. LC limit may be inconsistent',
                  bank: bank.name
                })
                return res.end(error);
              } else {
                lcLogger.log({
                  'level': 'info',
                  message: 'LC limit of bank successfully updated.'
                })
              }
            });
          }
        }
      });

      supplierDB.findById(supplier, function (error, supplier) {
        if (error) {
          lcLogger.log({
            level: 'warning',
            message: 'Supplier was not found. LC could not be updated to supplier',
            supplierID: supplier
          })
          return res.end('An error occured while retreiving issuing supplier data.')
        } else {
          supplierMethods.addLC(supplier, req.body.supBank, LC, function (error, supplier) {
            if (error) {
              lcLogger.log({
                level: 'warning',
                message: 'LC could not be added to supplier.',
                supplier: supplier.name
              })
              return res.end(error);
            } else {
              lcLogger.log('info', 'LC successfully added to : ' + supplier.name);
            }
          });
        }
      });

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

        json: function () {
          res.json(JSON.stringify(LC))
        }
      })
    }

  });
});

router.param('id', function (req, res, next, id) {

  // find the LC by ID
  LCDB.findById(id)
    .populate('supplier','name banks')
    .populate('issuer','name LC_used')
    .populate('project', 'name')
    .exec(function (error, LC) {
      if (error) {
        lcLogger.log({
          level: 'error',
          message: error.toString(),
          error: error
        })
        return res.sendStatus(500)

      } else {
        if(!LC){
          return res.status(404).json({
            message: `LC was not found`
          })
        }

        res.locals.id = LC._id;
        res.locals.LC = LC;
        res.locals.issuer = LC.issuer;
        res.locals.supplier = LC.supplier;
        next();
      }

    });
});


// used findByID in router.param  as well. Maybe this can be optimised
router.route('/:id').get(function (req, res) {
    return res.json(JSON.stringify(res.locals.LC));
  });

//patch to update a bank by ID
router.patch('/:id/add-charges', function (req, res) {
  // Get our REST or form values. These rely on the "name" attributes
  //find the document by ID


  var LC = res.locals.LC;
  var charges = {
    opening: req.body.opening, // miscellaneous charges
    amendment: req.body.amendment,
    bill_of_ex_acc: req.body.boea,
    postal: req.body.postal,
    GST: req.body.GST,
    disbursement: req.body.disbursement
  }
  var total = (+req.body.opening) + (+req.body.amendment) + (+req.body.boea) +
    (+req.body.postal) + (+req.body.GST) + (+req.body.disbursement);

  var ex_cha = {
    charges: charges,
    total: total
  }

  LC.ex_cha = ex_cha;

  LC.save(function (err, LCID) {
    if (err) {
      saveErrorLog(err, LC.LC_no)
      return res.end("There was a problem updating the information to the database: " + err);
    } else {
      //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
      res.format({
        /*html: function(){
            res.redirect("/LCs/" + LC._id);
        },*/
        //JSON responds showing the updated values
        json: function () {
          res.json(JSON.stringify(LC));
        }
      });

    }
  });
});

router.patch('/:id/add-margin-data', function (req, res) {
  var LC = res.locals.LC;
  LC.m_cl_DT = req.body.m_cl_DT;
  LC.m_cl_amt = parseFloat(req.body.m_cl_amt);
  LC.save(function (error, LCID) {
    if (error) {
      saveErrorLog(error, LC.LC_no)
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

//patch to update a bank by ID
router.patch('/:id/add-or-edit-extension', function (req, res) {
  // Get our REST or form values. These rely on the "name" attributes
  //find the document by ID

  var LC = res.locals.LC;

  const index = (req.body.index === undefined) ? null : parseFloat(req.body.index)
  if (index != null) {

    extension = LC.dates[index]
    extension.openDT = req.body.openDT,
      extension.expDT = req.body.expDT,
      extension.open = req.body.open,
      extension.post = req.body.post,
      extension.amend = req.body.amend,
      extension.GST = req.body.GST,
      extension.TID = req.body.TID
  } else {
    var extension = {
      openDT: req.body.openDT,
      expDT: req.body.expDT,
      open: req.body.open,
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
      saveErrorLog(err, LC.LC_no)
      return res.end("There was a problem updating the information to the database: " + err);
    } else {

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
        json: function () {
          res.json(JSON.stringify(LC));
        }
      });

    }
  });
});





router.patch('/:id/add-new-cycle', function (req, res) {
  // Get our REST or form values. These rely on the "name" attributes
  //find the document by ID
  try {
    var LC = res.locals.LC;
    var details = {
      due_DT: req.body.due_DT,
      due_amt: req.body.due_amt,
      LB_pay_ref: req.body.LB_pay_ref ? req.body.LB_pay_ref : '',
      acc: {
        acc: req.body.acc,
        GST: req.body.GST,
        TID: req.body.TID ? req.body.TID : ''
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
  } catch (error) {
    console.log(error)
  }
  LC.save(function (err, LCID) {
    if (err) {
      saveErrorLog(err, LC.LC_no)
      return res.end("There was a problem updating the information to the database: " + err);
    } else {

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
        json: function () {
          res.json(JSON.stringify(LC));
        }
      });

    }
  });
});

router.patch('/:id/edit-cycle', function (req, res) {
  // Get our REST or form values. These rely on the "name" attributes
  //find the document by ID
  const LC = res.locals.LC;
  const idx = parseFloat(req.body.index)

  // old cycle
  var cycle = LC.payment.cycles[idx]

  //updating cycle
  cycle.due_DT = req.body.due_DT
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
  LC.payment.total_due = total_due;

  LC.save(function (err, LCID) {
    if (err) {
      saveErrorLog(err, LC.LC_no)
      return res.end("There was a problem updating the information to the database: " + err);
    } else {
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
        json: function () {
          res.json(JSON.stringify(LC));
        }
      });

    }
  });
});

router.patch('/:id/check-cycle-payment', function (req, res) {
  // Get our REST or form values. These rely on the "name" attributes
  //find the document by ID
  var LC = res.locals.LC;

  const idx = parseFloat(req.body.index)

  // old cycle
  var cycle = LC.payment.cycles[idx]

  //updating payment details
  cycle.pay = {
    bill_com: req.body.payBC,
    post: req.body.payPost,
    GST: req.body.payGST,
    TID: req.body.payTID,
    mode: req.body.payMode
  }


  cycle.payed_DT = req.body.payed_DT
  // saving the update cycle
  LC.payment.cycles[idx] = cycle;

  LC.save(function (err, LCID) {
    if (err) {
      saveErrorLog(err, LC.LC_no)
      return res.end("There was a problem updating the information to the database: " + err);
    } else {
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
        json: function () {
          res.json(JSON.stringify(LC));
        }
      });

    }
  });
});

router.patch('/:id/add-payment', function (req, res) {
  // Get our REST or form values. These rely on the "name" attributes
  //find the document by ID
  var LC = res.locals.LC; // is this pass by reference?
  var payment = parseFloat(req.body.payment);
  var pay_ref = req.body.pay_ref;
  var payArray = LC.payment.cycles; // is this pass by reference?

  var index = parseFloat(req.body.index)

  var lastInstallment = payArray[index];

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
      saveErrorLog(err, LC.LC_no)
      return res.end("There was a problem updating the information to the database: " + err);
    } else {
      lcLogger.log({
        level: 'audit',
        kind: 'edit',
        message: 'Cycle Payment amount',
        payload: req.body,
        LC_no: LC.LC_no,
        user: req.session.user
      })
      // Need to free utilized from bank.
      bankMethods.onPayment(LC.issuer, payment, function (error, bank) {
        if (error) {
          res.status = 500;
          res.end(error)
        }
      })


      //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.

      res.format({
        /*html: function(){
            res.redirect("/LCs/" + LC._id);
        },*/
        //JSON responds showing the updated values
        json: function () {
          res.json(JSON.stringify(LC));
        }
      });

    }
  });
});

/* Can only edit LC_no, FDR_no, amount. Need authorisation.*/
router.patch('/:id/edit', function (req, res) {
  // Get our REST or form values. These rely on the "name" attributes
  //find the document by I
  var LC = res.locals.LC;

  try {
    LC.FDR_no = req.body.FDR_no;
    LC.LC_no = req.body.LC_no;
    LC.amount = req.body.amount;

    LC.save(function (err, LCID) {
      if (err) {
        saveErrorLog(err, LC.LC_no)
        return res.end("There was a problem updating the information to the database: " + err);
      } else {
        lcLogger.log({
          level: 'audit',
          kind: 'edit',
          message: 'LC',
          payload: req.body,
          LC_no: LC.LC_no,
          user: req.session.user
        })

        bankMethods.update(LC.issuer, function (error, bank) {
          if (error) {
            console.log(error)
          } else {
            console.log('Bank updated')
          }
        })

        //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.

        res.format({
          /*html: function(){
              res.redirect("/LCs/" + LC._id);
          },*/
          //JSON responds showing the updated values
          json: function () {
            res.json(JSON.stringify(LC));
          }
        });

      }
    });
  } catch (error) {
    console.log(error)
  }
});

/* Can only edit LC_no, FDR_no, amount. Need authorisation.*/
router.patch('/:id/close', function (req, res) {
  // Get our REST or form values. These rely on the "name" attributes
  //find the document by ID
  var LC = res.locals.LC;

  if (LC.status === 'Closed') {
    return res.format({
      json: function () {
        res.json(JSON.stringify(LC))
      }
    })
  }

  LC.status = 'Closed';
  LC.closeDT = new Date(Date.now())

  bankMethods.closeLC(res.locals.issuer, LC, function (error, bank) {
    if (error) {
      console.error(error)
      return res.send(error)
    }

  })

  supplierMethods.removeLC(res.locals.supplier, LC, function (error, supplier) {
    if (error) {
      console.error(error)
      return res.send(error)
    }


  })

  LC.save(function (err, LCID) {
    if (err) {
      saveErrorLog(err, LC.LC_no)
      return res.end("There was a problem updating the information to the database: " + err);
    } else {
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
        json: function () {
          res.json(JSON.stringify(LC));
        }
      });

    }
  });
});

//DELETE a Bank by ID
router.delete('/:id', function (req, res) {
  //find bank by ID
  res.locals.LC.remove(function (err, LC) {
    if (err) {
      saveErrorLog(err, LC.LC_no)
      return res.end(err);
    } else {


      // need to increase issuer LC_used value!
      bankMethods.removeBankLC(res.locals.issuer, res.locals.LC,
        function (error, bank) {
          if (error) {
            return res.send(error);
          } else {
            console.log('LC removed from bank successfully.');
          }
        });

      supplierMethods.removeLC(res.locals.supplier, res.locals.LC,
        function (error, supplier) {
          if (error) {
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
        json: function () {
          res.json({
            message: 'deleted',
            item: JSON.stringify(LC)
          });
        }
      });
    }
  });
});

//PUT to update a bank by ID
router.delete('/:id/delete-extension', function (req, res) {
  // Get our REST or form values. These rely on the "name" attributes
  //find the document by ID
  var LC = res.locals.LC;

  const index = (req.body.index === undefined) ? null : parseFloat(req.body.index)
  var ext = LC.dates[index]
  LC.dates.splice(index, 1)

  LC.dates.length === 1 ? LC.status = 'Active' : {}

  LC.save(function (err, LCID) {
    if (err) {
      saveErrorLog(err, LC.LC_no)
      return res.end("There was a problem updating the information to the database: " + err);
    } else {
      //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
      lcLogger.log({
        level: 'audit',
        kind: 'delete',
        message: 'delete Extension',
        data: ext,
        LC_no: LC.LC_no,
      })
      res.format({
        /*html: function(){
            res.redirect("/LCs/" + LC._id);
        },*/
        //JSON responds showing the updated values
        json: function () {
          res.json(JSON.stringify(LC));
        }
      });

    }
  });
});

//PUT to update a bank by ID
router.delete('/:id/delete-cycle', function (req, res) {
  // Get our REST or form values. These rely on the "name" attributes
  //find the document by I
  var LC = res.locals.LC;
  const index = (req.body.index === undefined) ? null : parseFloat(req.body.index)

  var delCycle = LC.payment.cycles[index]
  LC.payment.cycles.splice(index, 1)

  var total_due = LCMethods.updateTotal(LC)
  LC.total_due = total_due

  LC.save(function (err, LCID) {
    if (err) {
      saveErrorLog(err, LC.LC_no)
      return res.end("There was a problem updating the information to the database: " + err);
    } else {
      //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
      lcLogger.log({
        level: 'audit',
        kind: 'delete',
        message: 'delete Cycle',
        data: delCycle,
        LC_no: LC.LC_no,
      })
      res.format({
        /*html: function(){
            res.redirect("/LCs/" + LC._id);
        },*/
        //JSON responds showing the updated values
        json: function () {
          res.json(JSON.stringify(LC));
        }
      });

    }
  });
});

module.exports = router;