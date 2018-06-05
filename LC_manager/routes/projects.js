const express = require('express'),
      router = express.Router(),
      mongoose = require('mongoose'),
      bodyParser = require('body-parser'),
      methodOverride = require('method-override')

// creating database variable
projectsDB = mongoose.model('projects');

router.use(bodyParser.urlencoded({extended:true}));
router.use(methodOverride(function(req,res){
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
	// look in urlencoded POST bodies and delete it
	var method = req.body._method;
	delete req.body._method;
	return method;
    }
}));

// root route = server/projects/
// A get request to projects root will display all projects.
router.route('/')
    .get(function(req,res){
	// finding all projects.
	projectsDB.find({}, function(err,projects){
	    if(err) {
		console.log('error retreiveing projects.');
		return console.error(err);
	    } else{
		res.format({
		    html: function(){
			res.render('projects/index',{
			    title: 'All Projects',
			    'projects': projects
			});
		    },
		    json: function(){
			res.json(projects);
		    }
		});
	    }
	});
    });
router.route('/').post(function(req,res){
	// receiving post forms to create a database entry
	var name = req.body.name;
	var location = req.body.location;
	var value = req.body.value;

	// create database entry
	projectsDB.create({
	    name : name,
	    location : location,
	    value : value
	}, function(error,project){

	    if (error) {
		console.log('Error creating new project entry');
		return console.error(err);
	    } else{
		
		res.format({
		    // html response
		    html: function(){
			// go back to root directory
			res.location('projects');
			res.redirect('/projects')
		    },

		    json: function(){
			res.json(project);
		    }
		    
		});
	    }
	});
	
    });

/* Reroute /new to new.jade view.*/
router.get('/new', function(req,res){
    res.render('projects/new', {title:'Register New Project'});
});

router.param('id',function(req,res,next,id){
    console.log('validating '+ id + ' exists.')
    projectsDB.findById(id, function(err,project){
	if (err) {
	    console.log(id + ' was not found.');
	    res.status(404);
	    var error = new Error('Not Found.')
	    error.status = 404;
	    res.format({
		html: function(){
		    next(error);
		},
		json: function(){
		    res.json({message: error.status + ' ' + error });
		}
	    });
	} else{
	    console.log(project)
	    res.locals.id = id
	    res.locals.project = project;
	    next();
	}
    });
});


router.route('/:id')
    .get(function(req, res){
	console.log('printing res.locals variable:' + res.locals.project);
	res.format({
	    html: function(){
		res.render('projects/show', {
		    project: res.locals.project
		});
	    },

	    json: function(){
		res.json(res.locals.project)
	    }
	});
    });

router.get('/:id/edit', function(req, res){
    res.format({
	html: function(){
	    res.render('projects/edit', {
		title: 'Project ' + res.locals.id,
		"project": res.locals.project
	    });
	},
	json: function(){
	    res.json(res.locals.project);
	}
    })
});

router.put('/:id/edit', function(req, res){
    var name = req.body.name;
    var location = req.body.branch;
    var value = req.body.value;
    var manager = req.body.manager;

    projectsDB.findById(res.locals.id, function(err, project){
	project.update({
	    name: name,
	    location: location,
	    value: value,
	    manager: manager
	}, function(error,projectID){
	    if(error) {
		console.log('Value could not be updated');
		return console.error(error);
		
	    } else {
		res.format({
		    html: function(){
			res.redirect('/projects/'+project._id);
		    },
		    json: function(){
			res.json(project);
		    }
		});
	    }
	    
	});
    });
});

router.delete('/:id/edit', function(req,res){
    /*
projectsDB.findById(res.locals.id, function(err,project){
	if(err) {
	    console.log('could not delete project with id : ' + res.locals.id);
	    return console.error(err);
	} else {
    */
    res.locals.project.remove(function(error, project){
	if (error){
	    console.log('could not delete project with id : ' + res.locals.id)
	    return console.error(error)
	} else {
	    res.format({
		html: function(){
		    res.redirect('/projects');
		},
		json: function(){
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


