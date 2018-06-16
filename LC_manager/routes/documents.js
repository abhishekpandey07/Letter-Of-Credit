const express = require('express'),
      router = express.Router(),
      mongoose = require('mongoose'),
      bodyParser = require('body-parser'),
      methodOverride = require('method-override')
      formidable = require('express-formidable'),
      path = require('path'),
      fs = require('fs'),
      mv = require('mv')

const LCDB = mongoose.model('LC')

router.use(bodyParser.urlencoded({ extended: true }))

router.use(methodOverride(function(req, res){
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}))

router.use(formidable())


function getDateString(date){
      return (String(date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear()))
}




router.param('id', function(req,res,next,id){
    // find the LC by ID
    console.log('In param function.')
    LCDB.findById(id)
      .populate('supplier')
      .populate('issuer')
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
            next();
          }
          
      });
});

router.route('/:id').post(function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    //find the document by ID
    var LC = res.locals.LC;

    var sName = LC.supplier.name
    sName = sName.split(' ').join('_')
    
    var file = req.files.file;
    var name = req.fields.name;
    
    var index = parseFloat(req.fields.index);
    var DueDate = LC.payment.DT_amt[index].due_DT
          
    var newpath = __dirname + '/' +'../DATA_FILES/'
                  +sName +'/' + LC.LC_no +'/' + name
                  +'/' + getDateString(DueDate) + '.'
                  + file.name.split('.')[1]
    
    switch(name){
        case "receipt": {            
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
    newpath = path.resolve(newpath)
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

router.route('/:id/:index/:name').get(function(req,res){

      LC = res.locals.LC
      var name = req.params.name
      var index = parseFloat(req.params.index)
      console.log(name,index)
      var error = false
      var filepath = null
      console.log('reaching switch')
      switch(name){
            case 'receipt':{
                  if(LC.payment.DT_amt[index].rec.rec)
                        filepath = LC.payment.DT_amt[index].rec.name
                  else
                        error=true

                  break;
            }
            case 'acceptance':{
                  if(LC.payment.DT_amt[index].acc.rec)
                        filepath = LC.payment.DT_amt[index].acc.name
                  else
                        error=true

                  break;
            }

            case 'bankCharges': {
                  if(LC.dates[index].bc.rec)
                        filepath = LC.dates[index].bc.name
                  else
                        error=true

                  break;
            }

            case 'application': {
                  if(LC.dates[index].app.rec)
                        filepath = LC.dates[index].app.name
                  else
                        error=true

                  break;
            }

            default: error=true;

      }

      filepath = path.resolve(filepath)
      console.log('checking reply: path : ' + filepath)
      
      if(error){
            console.log('Record not yet uploaded.')
            error = new Error('Record does not exist')
            error.status = 404;
            return res.end(error)
      }

      console.log('Sending reply')
      var filename = filepath.split('/').slice(-1).pop()
      console.log(filename)

      res.setHeader('Content-disposition','attachment; filename='+filename)
      res.setHeader('content-type','application/pdf')
      res.download(path.resolve(filepath),filename,(error) => {
            if(error) {
                  console.log(error)
            }else{
                  console.log('File Sent Successfully')
            }
      })
      

});

module.exports = router