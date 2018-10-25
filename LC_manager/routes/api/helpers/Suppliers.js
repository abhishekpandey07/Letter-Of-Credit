const mongoose = require('mongoose');

var removeByAttr = function(arr, attr, value){
    var i = arr.length;
    while(i--){
       if( arr[i] 
           && arr[i].hasOwnProperty(attr) 
           && (arguments.length > 2 && arr[i][attr] === value ) ){ 

           arr.splice(i,1);

       }
    }
    return arr;
}

// add a new LC to a supplier
function addLC(supplier, supBank, LC, callback){
    console.log('Attempting to upgrade the LC details');
    // Adding LC to the ;
    var banks = supplier.banks;

    /*findBank = (bank) => {
    	return  bank._id === supBank;
    }*/
    console.log(supBank)
    const index = banks.findIndex( (bank) => {console.log(bank._id); return String(bank._id) === String(supBank);}) 
    console.log(index)
    
    var bank = banks[index]
	bank.LCs.push(LC._id);

	banks[index] = bank;
	supplier.banks = banks;
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
    try{
      var banks = supplier.banks;
      const index = banks.findIndex((bank) => {return String(bank._id) === String(LC.supBank)})
      var bank = banks[index]

      bank.LCs = removeByAttr(bank.LCs,'_id',LC._id);

      banks[index] = bank;
      supplier.banks=banks
      console.log('LC removed from supplier: '+ supplier._id);
      supplier.save(function(error,supplier){

    if(error){
        console.error(error);
        return callback(error,supplier)
    } else {
        return callback(null,supplier);
    }
      });
    } catch(error){
      console.log(error)
    }

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
