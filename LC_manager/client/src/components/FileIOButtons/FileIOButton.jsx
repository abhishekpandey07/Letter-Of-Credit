import React from 'react'
import FileUpload from '@material-ui/icons/FileUpload'
import FileDownload from '@material-ui/icons/FileDownload'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Files from 'react-files'

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
    labelStyle: {
    	pointerEvents: 'none',
    }
  },
  input: {
    display: 'none',
  },
});


class FileIOButton extends React.Component {
	constructor(props){
		super(props)
		this.state = {
			selected: false,
		}			
	}

	resetState = () => {
		this.setState({selected: false})
		this.filename = ''
	}

	handleChange = (files) => {
		this.setState({selected:true})
		this.data = new FormData()
		this.data.append('file',files[0])
		this.data.append('name',this.props.name)		
		this.data.append('index',this.props.index)
		this.filename = files[0].name
	}

	handleSubmit = async () => {
		const url = '/documents/' + this.props.id

		const response = await fetch(url,{
			method: 'POST',
			body: this.data
		},{credentials:'include'})
		const body = await response.json();
		console.log(body)
		if(response.status != 200)
			console.log(body.message)
		else {
			this.resetState()
			this.props.onSubmit(body);	
		}		
	}

	handleDownload = (event) => {		
		const url = '/documents/' + this.props.id
					+ '/' + String(this.props.index)
					+ '/' + this.props.name		

		var a = document.createElement("a");
		fetch(url,{credentials:'include'}).
		then(response => {
			return response.blob();
		}).then( blob => {
				var documentURL = window.URL.createObjectURL(blob);
				a.href = documentURL
				a.download = 'download.pdf'
				a.click()
				window.URL.revokeObjectURL(documentURL)
				//window.open(documentURL)
		}).catch(error => {
			console.log(error)
		})
	}

	render() {
		var {classes} = this.props;

		if(this.props.exists ){
			return(
				(<Button size='medium' className={classes.button} variant='outlined'
						onClick={this.handleDownload}>Download<FileDownload/></Button>)
				)

		}
		if (!this.state.selected){
		return (
			    <div>
			    	<Files 
			    		onChange={this.handleChange}
			    		accepts={['image/png','.pdf','.txt','.xlsx']}
			    		clickable
			    		>
				    	<Button variant='outlined' className={classes.button} size='medium'>
				    		Upload <FileUpload />
						</Button>
			    	</Files>
			    </div>
			)
		}
		else {
			return (
				(<Button size='medium' className={classes.button} variant='outlined'
						onClick={this.handleSubmit}>Submit {this.filename}</Button>)
			)
		}
				
	}
}

FileIOButton.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(FileIOButton);