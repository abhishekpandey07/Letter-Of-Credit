const formatDate = (date) => {
	if(date){
		var elem = String(date).split(' ')
  		// day month date year
  		return (elem[2] + ' ' + elem[1] + "'" + elem[3].slice(2))
	}
	return ""
  
}
// later
const formatAmount = (amount) => {
	var number = String(amount)
	var decimal = number.split('.')
	var lastThree = decimal[0].substring(decimal[0].length-3);
	var otherNumbers = decimal[0].substring(0,decimal[0].length-3);
	if(otherNumbers != '')
	    lastThree = ',' + lastThree;
	var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
	return decimal[1] ? res + '.' + decimal[1] : res
}

const roundAmount = (amount) => {
	return String(Number(Math.round(amount + 'e2') + 'e-2'))
}

export {
	formatDate,
	formatAmount,
	roundAmount
}
