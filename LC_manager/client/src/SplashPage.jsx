import React from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'

function SplashPage({...props}) {
	return (
		<div style={{display:'flex', alignItems:'center',flexDirection:'column',marginTop:'50px'}}>
			<CircularProgress size={100} align='center' style={{color:'purple'}}/>
		</div>
	)
}

export default SplashPage;