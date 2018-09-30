const validateAccess = function(req,res,roles,logger){
	if(!req.session.authenticated &&
	   !roles.includes(req.session.user.roles)){
    logger.log({
      level: 'warning',
      message: 'Unauthorised Access attempt',
      user: req.session.user
    })
    res.status(401);
    return false
  }
  return true
}

const saveErrorLog = function(req,res,error,data,logger){
	logger.log({
		level: 'error',
		message: 'Could not save ' + data.name,
		payload: data.payload,
		error: error
	})
	return res.end(data.name + ' could not be saved to the database')
}

const readErrorLog = function(req,res,error,message,logger){
	logger.log({
		level: 'error',
		message: 'Could not read ' + message,
		error: error
	})
	return res.end(error)
}