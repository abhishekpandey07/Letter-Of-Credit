function updateTotal(LC){
	var total_due = LC.payment.cycles.reduce((acc,prop,key) => {
        acc += parseFloat(prop.due_amt)
        return acc
    },0)
    return total_due
}

module.exports = {
	updateTotal
}