const mongoose = require('mongoose');

// add a new supplier to a project

function addSupplier(project,supplier,callback){
    console.log('Attempting to upgrade the supplier details');
    // Adding supplier to the project;
    project.suppliers.push(supplier._id);
    var neg_error = null
    project.save(function(err,projectID){
	if(err){
	    neg_error = new Error('Could not update project details. Removing supplier.');
	    neg_error.status=500;
	    supplier.remove(function(rm_error,supplier){
		if(rm_error){
		    console.log('supplier '+supplier._id+' could not me removed. Marking it as InValid')
		    supplier.update({
			status: 'InValid'
		    })
		}
	    });
	    
	} else {
	    console.log('project supplier_used value updated: '+ project._id);
	    console.log('New supplier_used value : ' + supplier.name);
	}
	return callback(neg_error, project);
    });
}

// remove an supplier from a project

function removeprojectsupplier(project,supplier,callback){

    var supplier_used = parseFloat(project.supplier_used);
    var amount = parseFloat(supplier.amount);
    supplier_used -= amount;
    
    project.supplier_used = supplier_used;
    project.suppliers.pull(supplier._id);
    console.log('issuer supplier_used changed to : '+ project.supplier_used);
    project.save(function(error,project){
	if(error){
	    console.error(error);
	    return callback(error,project)
	} else {
	    console.log('issuing project: ' + project.name +
			' updated supplier_used : ' + project.supplier_used);
	    console.log('returning');
	    return callback(null,project);
	}
    });

}

function closesupplier(project,supplier,callback){

    var supplier_used = parseFloat(project.supplier_used);
    var amount = parseFloat(supplier.amount);
    supplier_used -= amount;

    console.log('issuer supplier_used changed to : '+ project.supplier_used);
    project.save(function(error,project){
	if(error){
	    console.error(error);
	    return callback(error,project);
	} else {
	    console.log('issuing project: ' + project.name +
			' updated supplier_used : ' + project.supplier_used);
	    return callback(null,project);
	}
    });

}

module.exports = {
    addSupplier,
    removeprojectsupplier,
    closesupplier
    
}
