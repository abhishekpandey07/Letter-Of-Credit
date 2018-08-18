import React, {Component} from 'react';
import PropTypes from "prop-types";
import {withStyles} from '@material-ui/core'
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { Tabs, Tab } from '@material-ui/core';
import BugReport from '@material-ui/icons/BugReport'
import sliderTabsStyle from "assets/jss/material-dashboard-react/sliderTabsStyle";
/*
	Needs three callback handlers
	1 -> For left keyboard arrow click
	2 -> For right keyboard arrow click
	3 -> For selecting Tabs

*/
class SliderTabs extends Component{
	constructor(props){
		super(props)
		this.state = {
			startIdx: props.currIdx
		}	
	}
	
	render(){
		var { classes, currIdx, data, tabChangeHandle, icon} = this.props
		console.log(classes)
		var range = null
		if(!('range' in this.props)){
			range = data.length > 4 ? 4 : data.length
		} else {
			range = this.props.range	
		}
		
		const cutOff = range === data.length ? data.length: data.length - range
		console.log(icon);
		return (
			<Grid container direction='row' alignItems='center'>
		        <Grid item>
		          <Typography variant='title' style={{color:'purple'}} padding={20}>{this.props.title}:</Typography>
		        </Grid>
		        <Grid item>
		          <IconButton onClick={() => this.state.startIdx === 0 ? null :this.setState((prevState,props) => ({startIdx: prevState.startIdx - 1}))}>
		            <KeyboardArrowLeft style={{color:'purple'}}/>
		          </IconButton>
		        </Grid>
		        <Grid item>
		          <Tabs
		            classes={{
		              flexContainer: classes.tabsContainer,
		              indicator: classes.displayNone,              
		            }}
		            value={currIdx}
		            onChange={tabChangeHandle}
		            textColor="inherit"
		          >
		          { data.map((prop,key) => {
		              if(key >= this.state.startIdx && key < this.state.startIdx + range)
		                return <Tab
		                    classes={{
		                      wrapper: classes.tabWrapper,
		                      labelIcon: classes.labelIcon,
		                      label: classes.label,
		                      selected: classes.textColorInheritSelected
		                    }}
		                    icon={<this.props.icon className={classes.tabIcon} />}
		                    label={prop}
		                    value={key}
		                    style={{color:'purple'}}
		                  />
		              return 
		            })
		          }
		          </Tabs>
		        </Grid>
		        <Grid item>
		          <IconButton onClick={() => this.state.startIdx === cutOff ? null :this.setState((prevState,props) => ({startIdx: prevState.startIdx + 1}))}>
		            <KeyboardArrowRight style={{color:'purple'}}/>
		          </IconButton>
		        </Grid>
			</Grid>
		);
	}
	
}

//Type checking using PropTypes library

SliderTabs.defaultProps = {
	icon: BugReport
}
SliderTabs.propTypes = {
	classes: PropTypes.object.isRequired,	
	range: PropTypes.number,
	currIdx: PropTypes.number,
	data: PropTypes.array.isRequired,
	tabChangeHandle: PropTypes.func,
	//icon: PropTypes.func
}

export default withStyles(sliderTabsStyle)(SliderTabs);