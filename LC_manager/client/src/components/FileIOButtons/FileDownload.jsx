import React from 'react'
import FileDownload from '@material-ui/icons/FileDownload'
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

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


class FileDownloadButton extends React.Component {

	handleDownload = (event) => {
		var url = '/documents/'+ this.props.id + 'getDocument'
		var request = new FormData()
		request.append('name',this.props.name)
		request.append('index',this.props.index)

		fetch (url,{
			method: 'POST',
			body: request
		}).then(response => {
			console.log('File Downloaded')
		}).catch(error => {
			console.log(error)
		})
	}

	render() {
		var {classes} = this.props;
			return(
				(<Button size='small' className={classes.button} variant='contained'
						onClick={this.handleDownload}><FileDownload/></Button>)
				)

		}
		
}

FileDownloadButton.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(FileDownloadButton);