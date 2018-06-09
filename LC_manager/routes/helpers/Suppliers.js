const mongoose = require('mongoose');

// add a new LC to a supplier

function addLC(supplier,LC,callback){
    console.log('Attempting to upgrade the LC details');
    // Adding LC to the ;
    supplier.LCs.push(LC._id);
    var neg_error = null
    supplier.save(function(err,supplierID){
	if(err){
	    neg_error = new Error('Could not update supplier details. Removing LC.');
	    neg_error.status=500;
	    LC.remove(function(rm_error,LC){
		if(rm_error){
		    console.log('LC '+LC._id+' could not me removed. Marking it as InValid')
		    LC.update({
			status: 'InValid'
		    })
		}
	    });
	    
	} else {
	    console.log('LC Added to Supplier: '+ supplier._id);
	}
	return callback(neg_error, supplier);
    });
}

// remove an LC from a supplier

function removeLC(supplier,LC,callback){

    supplier.LCs.pull(LC._id);
    console.log('LC removed from supplier: '+ supplier._id);
    supplier.save(function(error,supplier){
	if(error){
	    console.error(error);
	    return callback(error,supplier)
	} else {
	    return callback(null,supplier);
	}
    });

}

/*function closeLC(supplier,LC,callback){

    var LC_used = parseFloat(supplier.LC_used);
    var amount = parseFloat(LC.amount);
    LC_used -= amount;

    console.log('issuer LC_used changed to : '+ supplier.LC_used);
    supplier.save(function(error,supplier){
	if(error){
	    console.error(error);
	    return callback(error,supplier);
	} else {
	    console.log('issuing supplier: ' + supplier.name +
			' updated LC_used : ' + supplier.LC_used);
	    return callback(null,supplier);
	}
    });

}
*/
module.exports = {
    addLC,
    removeLC,
    //closeLC
    
}
