const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const formidable = require('express-formidable');
const path = require('path');
const fs = require('fs');
const mv = require('mv');
const mime = require('mime');
const acl = require('../../authorization/acl')
const LCDB = mongoose.model('LC')
const baseDirectory = path.resolve(__dirname + '/../DATA_FILES/')


router.use(bodyParser.urlencoded({
  extended: true
}))

router.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}))

// authorisation
router.use(acl.authorize({}))


router.use(formidable())

function getDateString(date) {
  return (String(date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear()))
}

router.param('id', function (req, res, next, id) {
  // find the LC by ID
  console.log('In param function.')
  LCDB.findById(id)
    .populate('supplier')
    .populate('issuer')
    .populate('project')
    .exec(function (error, LC) {
      if (error) {
        console.log('Error retreiving LC with ID : ' + id)
        var err = new Error('LC with ID : ' + id + ' not found');
        err.status = 404
        console.log('sending error response')
        res.format({
          /*html: function(){
            next(err);
          },*/
          json: function () {
            res.json({
              message: err.status + ' ' + err
            });
          }
        })
      } else {
        //console.log(LC);
        console.log(' Setting locals variables')
        res.locals.id = LC._id;
        res.locals.LC = LC;
        next();
      }

    });
});

router.route('/:id').post(function (req, res) {
  // Get our REST or form values. These rely on the "name" attributes
  //find the document by ID
  try {
    var LC = res.locals.LC;

    var sName = LC.supplier.name
    sName = sName.split(' ').join('_')

    var file = req.files.file;
    var name = req.fields.name;

    var index = parseFloat(req.fields.index);
    var folder = null;
    var date = new Date(Date.now());
    if (name === 'receipt' || name === 'acceptance' || name === 'bill_of_material') {
      var date = LC.payment.cycles[index].due_DT
      var folder = 'cycleDocuments/'
    } else {
      var date = LC.dates[index].openDT
      var folder = 'open_ext_documents/'
    }

    var filepath = sName + '/' + LC.LC_no + '/' + folder + '/' + name;
    var filename = getDateString(date) + '.' + file.name.split('.').slice(-1)


    var newpath = baseDirectory + '/' + filepath + filename
    console.log(newpath)

    switch (name) {
      case "receipt":
        {
          LC.payment.cycles[index].documents.rec.name = filepath + filename;
          LC.payment.cycles[index].documents.rec.rec = true;
          break;
        }
      case "acceptance":
        {
          LC.payment.cycles[index].documents.acc.name = filepath + filename;
          LC.payment.cycles[index].documents.acc.rec = true;
          break;
        }
      case "bill_of_material":
        {
          LC.payment.cycles[index].documents.boe.name = filepath + filename;
          LC.payment.cycles[index].documents.boe.rec = true;
          break;
        }
      case "bankCharges":
        {

          LC.dates[index].bc.name = filepath + filename;
          LC.dates[index].bc.rec = true;
          break;
        }
      case "application":
        {
          LC.dates[index].app.name = filepath + filename;
          LC.dates[index].app.rec = true;
          break;
        }

      default:
        {
          error = new Error('Invalid request')
          error.status = 405
          return res.send(error)
        }
    }


    console.log('moving')
    mv(file.path, newpath, {
      mkdirp: true
    }, function (err) {
      if (err) {
        console.log('moving error')
        console.log(err);
        return res.end(err)
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
  } catch (error) {
    console.log(error)
  }
});

router.route('/:id/:index/:name').get(function (req, res) {

  LC = res.locals.LC
  var name = req.params.name
  var index = parseFloat(req.params.index)
  console.log(name, index)
  var error = false
  var filepath = null
  console.log('reaching switch')
  switch (name) {
    case 'receipt':
      {
        if (LC.payment.cycles[index].documents.rec.rec)
          filepath = LC.payment.cycles[index].documents.rec.name
        else
          error = true

        break;
      }
    case 'acceptance':
      {
        if (LC.payment.cycles[index].documents.acc.rec)
          filepath = LC.payment.cycles[index].documents.acc.name
        else
          error = true

        break;
      }

    case 'bill_of_material':
      {
        if (LC.payment.cycles[index].documents.boe.rec)
          filepath = LC.payment.cycles[index].documents.boe.name
        else
          error = true

        break;
      }

    case 'bankCharges':
      {
        if (LC.dates[index].bc.rec)
          filepath = LC.dates[index].bc.name
        else
          error = true

        break;
      }

    case 'application':
      {
        if (LC.dates[index].app.rec)
          filepath = LC.dates[index].app.name
        else
          error = true

        break;
      }

    default:
      error = true;

  }

  console.log('checking reply: path : ' + filepath)

  if (error) {
    console.log('Record not yet uploaded.')
    var error = new Error('Record does not exist')
    error.status = 404;
    return res.end(error)
  }

  console.log('Sending reply')
  var fullname = baseDirectory + '/' + filepath;
  console.log(fullname)
  var filename = path.basename(filepath)
  console.log(filename)
  try {
    var mimetype = mime.getType(fullname)
  } catch (error) {
    console.log(error)
  }
  console.log(mimetype)

  //res.set('Content-disposition','attachment; filename='+filename)
  //res.set('content-type',mimetype)
  res.download(fullname, filename, (error) => {
    if (error) {
      console.log(error)
    } else {
      console.log('File Sent Successfully')
    }
  })


});

module.exports = router