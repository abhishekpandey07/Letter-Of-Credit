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
		this.id = props.id
		this.index = props.index
	}

	handleChange = (event) => {
		console.log('in files: ' + JSON.stringify(this.uploadInput.files))
		this.setState({selected:true})
		this.data = new FormData()
		this.data.append('file',this.uploadInput.files[0])
		this.data.append('name',this.name)		
		this.data.append('index',this.index)

		this.filename = this.uploadInput.files[0].name
	}

	handleSubmit = ({}) => {
		const url = '/documents/' + this.id

		fetch(url,{
			method: 'POST',
			body: this.data
		}).then(response => {
			this.setState({submitted : true})
			this.props.onSubmit(response.json())
		}).catch(error => console.log(error))
	}

	handleDownload = (event) => {
		const url = '/documents/' + this.id
					+ '/' + String(this.index)
					+ '/' + this.name		
		
		/*var request = new FormData()
		request.append('name',this.name)
		request.append('index',this.index)
		*/

		fetch (url).
		then(response => {
			console.log('File Downloaded')
		}).catch(error => {
			console.log(error)
		})
	}

	render() {
		var {classes} = this.props;

		if(this.state.submitted){
			return(
				(<Button size='small' className={classes.button} variant='contained'
						onClick={this.handleDownload}><FileDownload/></Button>)
				)

		}
		if (!this.state.selected){
		return (
				<div>
				<div>
						<input
							id='fileinput'
							ref = {(ref) => {this.uploadInput = ref}}
					        type="file"
					        onChange={this.handleChange}
					        
					      />
					     <label htmlFor='fileinput' >
					    	<Button variant='contained'>Upload <FileUpload/>
					    	</Button>
					    </label>
					
			    </div>
			    
			    {/*<Files 
			    	onChange={this.handleChange}
			    	clickable
			    	>
			    	Upload
			    </Files>*/}
			    </div>
			)
		}
		else {
			return (
				(<Button size='small' className={classes.button} variant='contained'
						onClick={this.handleSubmit}>Submit {this.filename}</Button>)
			)
		}
				
	}
}

FileIOButton.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(FileIOButton);