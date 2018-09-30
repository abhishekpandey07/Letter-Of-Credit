const express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'),
  methodOverride = require('method-override'),
  acl = require('../../authorization/acl');

// creating database variable
const projectsDB = mongoose.model('projects');


router.use(express.urlencoded({
  extended: true
}));


router.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

//authorisation
router.use(acl.authorize())

// root route = server/projects/
// A get request to projects root will display all projects.
router.route('/')
  .get(function (req, res) {
    // finding all projects.
    projectsDB.find({})
      .populate({
        path: 'suppliers'
      }).
    exec(function (err, projects) {

      if (err) {
        console.log('error retreiveing projects.');
        return console.error(err);
      }
      res.format({
        /*html: function(){
        res.render('projects/index',{
        	title: 'All Projects',
        	'projects': projects
        });
        },*/
        json: function () {
          res.json(JSON.stringify(projects));
        }
      });

    });
  });
router.route('/').post(function (req, res) {
  // receiving post forms to create a database entry
  var project = {
    WO_no: req.body.WO_no,
    WO_DT: req.body.WO_DT,
    name: req.body.name,
    client: req.body.client,
    location: req.body.location,
    startDT: req.body.startDT,
    stipEndDT: req.body.stipEndDT,
    expcEndDT: req.body.expcEndDT,
    value: req.body.value,
    variation: req.body.variation,
    finalBill: req.body.finalBill,
    status: req.body.status,
    arbLoc: req.body.arbLoc,
    arbId: req.body.arbId,
    managerName: req.body.manager,
    managerContact: req.body.contact,
  }
  // create database entry
  projectsDB.create(project, function (error, project) {

    if (error) {
      console.log('Error creating new project entry');
      return console.error(error);
    } else {

      res.format({
        // html response
        html: function () {
          // go back to root directory
          res.location('projects');
          res.redirect('/projects')
        },

        json: function () {
          res.json(project);
        }

      });
    }
  });

});

/* Reroute /new to new.jade view.*/
router.get('/new', function (req, res) {
  res.render('projects/new', {
    title: 'Register New Project'
  });
});

router.param('id', function (req, res, next, id) {

  projectsDB.findById(id, function (err, project) {
    if (err) {

      res.status(404);
      var error = new Error('Not Found.')
      error.status = 404;
      res.format({
        html: function () {
          next(error);
        },
        json: function () {
          res.json({
            message: error.status + ' ' + error
          });
        }
      });
    } else {
      res.locals.id = id
      res.locals.project = project;
      next();
    }
  });
});


router.route('/:id')
  .get(function (req, res) {

    res.format({
      html: function () {
        res.render('projects/show', {
          project: res.locals.project
        });
      },

      json: function () {
        res.json(res.locals.project)
      }
    });
  });

router.get('/:id/edit', function (req, res) {
  res.format({
    html: function () {
      res.render('projects/edit', {
        title: 'Project ' + res.locals.id,
        "project": res.locals.project
      });
    },
    json: function () {
      res.json(res.locals.project);
    }
  })
});

router.put('/:id/edit', function (req, res) {
  // maybe able to edit the project object and send it directly.
  var project = res.locals.project
  project.WO_no = req.body.WO_no
  project.WO_DT = req.body.WO_DT
  project.name = req.body.name
  project.client = req.body.client
  project.location = req.body.location
  project.startDT = req.body.startDT
  project.stipEndDT = req.body.stipEndDT
  project.expcEndDT = req.body.expcEndDT
  project.value = req.body.value
  project.variation = req.body.variation
  project.finalBill = req.body.finalBill
  project.status = req.body.status
  project.managerName = req.body.manager
  project.managerContact = req.body.contact
  project.arbLoc = req.body.arbLoc
  project.arbId = req.body.arbId


  project.save(function (error, projectID) {
    if (error) {

      return console.error(error);

    } else {
      res.format({
        html: function () {
          res.redirect('/projects/' + project._id);
        },
        json: function () {
          res.json(project);
        }
      });
    }

  });
});

router.delete('/:id/edit', function (req, res) {
  /*
projectsDB.findById(res.locals.id, function(err,project){
	if(err) {
	    console.log('could not delete project with id : ' + res.locals.id);
	    return console.error(err);
	} else {
    */
  res.locals.project.remove(function (error, project) {
    if (error) {

      return console.error(error)
    } else {
      res.format({
        html: function () {
          res.redirect('/projects');
        },
        json: function () {
          res.json({
            message: "deleted",
            item: project
          });

        }
      });
    }
  });
});

module.exports = router;