import React from 'react'
import CircularProgress from '@material-ui/core/CircularProgress'

function SplashPage(props) {
  const {size,margin} = props
	return (
		<div style={{display:'flex', alignItems:'center',flexDirection:'column',marginTop:`${margin}`}}>
			<CircularProgress size={size} align='center' style={{color:'purple'}}/>
		</div>
	)
}

export default SplashPage;