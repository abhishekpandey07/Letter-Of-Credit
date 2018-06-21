const formatDate = (date) => {
  var elem = String(date).split(' ')
  // day month date year
  return (elem[2] + ' ' + elem[1] + "'" + elem[3].slice(2))
}
// later
/*const formatAmount = (amount) => {
	var ret = String(amount)
	var numbers = []
	for(i = 0 , i < ret.length , i++){
		(ret.length -1 - i > 3 ) ? 
	}


	return String(amount).toLocaleString()
}*/
export {
	formatDate,
}
