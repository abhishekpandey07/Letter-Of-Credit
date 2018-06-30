const mongoose = require('mongoose');
bankDB = mongoose.model('nativeBanks')
// add a new LC to a bank

function addBankLC(bank,LC,callback){
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

function removeBankLC(bank,LC,callback){

    if(LC.status !== 'Expired'){
      var LC_used = parseFloat(bank.LC_used);
      var due_amt = parseFloat(LC.payment.due_amt)
      var amount = parseFloat(LC.amount);
      LC_used -= (amount - due_amt);
      bank.LC_used = LC_used;
    }

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
    var used = parseFloat(LC.payment.due_amt);
    var amount = parseFloat(LC.amount)

    LC_used -= (amount - used);

    bank.LC_used = LC_used
    console.log('issuer LC_used changed to : '+ LC_used);
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

function onPayment(bankID,amount,callback) {
  bankDB.findById(bankID._id,function(error,bank){
    if(error){
      console.log(error)
      return callback(error,null)
    } else {
      console.log('Updating LC_used')
      bank.LC_used = parseFloat(bank.LC_used) - parseFloat(amount)
      bank.save(function(error,bankID){
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

  })
}

function update(bankID, callback){

  console.log('retreiving bank with ID '+ bankID)
  bankDB.findById(bankID._id)
  .populate('LCs',['amount','status','payment'])
  .exec(function(error,bank){
    if(error){
      console.error(error)
      return callback(error,bank)
    } else {
      console.log('Recalculating.')
      const LC_used = bank.LCs.reduce((total,lc)=>{
        if(lc.status === 'Active' || lc.status === 'Extended')
          total += parseFloat(lc.amount);
          lc.payment.cycles.map((cycle,index)=>{
            if(cycle.payed==true){
              total-= parseFloat(cycle.due_amt)
            }
          })        
        return total
      },0)

      if(LC_used === bank.LC_used){
        console.log('No inconsistencies found. LC_used : ' + LC_used)
      } else {
        bank.LC_used = LC_used;
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
    }
  })

}

module.exports = {
    addBankLC,
    removeBankLC,
    closeLC,
    update,
    onPayment
    
}
