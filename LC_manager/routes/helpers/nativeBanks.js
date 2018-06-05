const mongoose = require('mongoose');

// add a new LC to a bank

function addLC(bank,LC,callback){
    console.log('Attempting to upgrade the LC details');
    // Adding LC to the bank;
    var LC_used = parseFloat(bank.LC_used);
    var amount = parseFloat(LC.amount);

    LC_used += amount;
  
    bank.LCs.push(LC._id);
    bank.LC_used = LC_used;
    console.log(typeof LC.amount);
    console.log('New LC_used amount :' + bank.LC_used);
    var neg_error = null
    bank.save(function(err,bankID){
	if(err){
	    neg_error = new Error('Could not update bank details. Removing LC.');
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
	    console.log('Bank LC_used value updated: '+ bank._id);
	    console.log('New LC_used value : ' + bank.LC_used);
	}
	return callback(neg_error, bank);
    });
}

// remove an LC from a bank

function removeLC(bank,LC,callback){

    var LC_used = parseFloat(bank.LC_used);
    var amount = parseFloat(LC.amount);
    LC_used -= amount;
    
    bank.LC_used = LC_used;
    bank.LCs.pull(LC._id);
    console.log('issuer LC_used changed to : '+ bank.LC_used);
    bank.save(function(error,bank){
	if(error){
	    console.error(error);
	    return callback(error,bank)
	} else {
	    console.log('issuing Bank: ' + bank.name +
			' updated LC_used : ' + bank.LC_used);
	    console.log('returning');
	    return callback(null,bank);
	}
    });

}

function closeLC(bank,LC,callback){

    var LC_used = parseFloat(bank.LC_used);
    var amount = parseFloat(LC.amount);
    LC_used -= amount;

    console.log('issuer LC_used changed to : '+ bank.LC_used);
    bank.save(function(error,bank){
	if(error){
	    console.error(error);
	    return callback(error,bank);
	} else {
	    console.log('issuing Bank: ' + bank.name +
			' updated LC_used : ' + bank.LC_used);
	    return callback(null,bank);
	}
    });

}

module.exports = {
    addLC,
    removeLC,
    closeLC
    
}
