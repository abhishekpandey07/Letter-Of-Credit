const formatDate = (date) => {
  var elem = String(date).split(' ')
  // day month date year
  return (elem[2] + ' ' + elem[1] + "'" + elem[3].slice(2))
}

export {
	formatDate
}