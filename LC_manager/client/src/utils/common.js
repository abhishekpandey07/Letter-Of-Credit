const formatDate = (date) => {
  var elem = String(date).split(' ')
  // day month date year
  return (elem[2] + ' ' + elem[1] + "'" + elem[3].slice(2))
}
// later
const formatAmount = (amount) => {
	var x = String(amount)
	var lastThree = x.substring(x.length-3);
	var otherNumbers = x.substring(0,x.length-3);
	if(otherNumbers != '')
	    lastThree = ',' + lastThree;
	var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
	return res
}

const roundAmount = (amount) => {
	return String(Number(Math.round(amount + 'e2') + 'e-2'))
}
export {
	formatDate,
	formatAmount,
	roundAmount
}
