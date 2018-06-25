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
			submitted: props.exists
		}			
		this.name = props.name
		console.log(this.name)
		this.id = props.id
		this.index = props.index
	}

	handleChange = (files) => {
		console.log('in files: ' + JSON.stringify(files))
		this.setState({selected:true})
		this.data = new FormData()
		this.data.append('file',files[0])
		this.data.append('name',this.name)		
		this.data.append('index',this.index)
		this.filename = files[0].name
	}

	handleSubmit = ({}) => {
		const url = '/documents/' + this.id

		fetch(url,{
			method: 'POST',
			body: this.data
		}).then(response => {
			this.setState({submitted : true})
			this.props.onSubmit(response.json().data)
		}).catch(error => console.log(error))
	}

	handleDownload = (event) => {
		console.log('handleDownlaod : name: '+ this.name)
		const url = '/documents/' + this.id
					+ '/' + String(this.index)
					+ '/' + this.name		

		var a = document.createElement("a");
		fetch (url).
		then(response => {
			console.log(response)
			return response.blob();
		}).then( blob => {
				var documentURL = window.URL.createObjectURL(blob);
				/*a.href = documentURL
				a.download = 'download.pdf'
				a.click()
				window.URL.revokeObjectURL(documentURL)*/
				window.open(documentURL)
		}).catch(error => {
			console.log(error)
		})
	}

	render() {
		var {classes} = this.props;

		if(this.state.submitted){
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