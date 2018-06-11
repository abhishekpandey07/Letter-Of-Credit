import React from 'react'
import FileUpload from '@material-ui/icons/FileUpload'
import FileDownload from '@material-ui/icons/FileDownload'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import axios from 'axios'

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: 'none',
  },
});


class FileUploadButton extends React.Component {
	constructor(props){
		super(props)
		this.state = {
			selected: false,
			fileinput: null
		}			
		this.name = props.name
		this.id = props.id
		this.index = props.index

	}

	handleChange = (files) => (event) => {
		this.setState({selected:true,
						fileinput:files})
		console.log(files)
		console.log(this.state.fileinput)
	}

	handleSubmit = (event) => {
		var files = document.getElementById('contained-button-file')
		console.log(this.files)
		const payload = {
			name: this.name,
			index: this.index,
			files: this.files,
			_method: 'PUT'
		}

		const url = '/LCs/' + this.id
					+ '/addDocument'

		axios.post(url,payload)
		.then((response) => {console.log(response)})
		.then((error) => {console.log(error)})
	}

	render() {
		var {classes} = this.props;
		/*var jsx = this.state.selected?
					(<Button size='small' className={{margin:'2px'}}
						onClick={this.handleSubmit(this.fileinput)}></Button>)
						:
					(<div>
					<input
				        className={{display:none}}
				        id="contained-button-file"
				        multiple
				        type="file"
				        ref= {(input) => {this.fileinput = input}}
				      />
				      <label htmlFor="contained-button-file">
				        <Button variant="contained" component="span" className={{margin:theme.spacing.unit}}>
				          <FileUpload/>
				        </Button>
				      </label>
				    </div>)
		return jsx */
		if (!this.state.selected){
		return (

				<div>
					<input
				        id="contained-button-file"
				        multiple
				        type="file"
				        className={classes.input}
				        ref = {(input) => {this.fileinput = input}}
				        onChange = {this.handleChange}
				      />
				      <label htmlFor="contained-button-file">
				        <Button variant="contained" component="span"
				        className={classes.button}
				        >
				          Upload <FileUpload/>
				        </Button>
				      </label>
			    </div>
			)
		}
		else {
			return (
				(<Button size='small' className={classes.button} variant='contained'
						onClick={this.handleSubmit}>Submit {this.fileinput.files[0].name.slice(0,5)}</Button>)
			)
		}
				
	}
}

FileUploadButton.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(FileUploadButton);