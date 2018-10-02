import React from 'react';
import PropTypes from 'prop-types';
import {request} from 'utils/requests';
import CustomSelect from './CustomSelect';
import Grid from '@material-ui/core/Grid';

// May be Unnecessary.

// Toolbar for LC Home Page
class LCToolBar extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      error: null,
    }
  }
  // why binding fetching with Display? Well, first of all 
  // the fetch is not hardcoded, it can be easily changed by
  // providing a different request config.

  issueAPICall = async (requestConfig) => {
    const response = await request(requestConfig)
    const body = await EJSON.parse(response.data)
    return body
  }

  componentDidMount(){
    // call api asynchronously;
    this.issueAPICall(this.props.issuerAPI)
    .then((issuerList) => this.setState({issuerList: issuerList}))
    .catch((error) => this.setState({error}));

    this.issueAPICall(this.props.supplierAPI)
    .then((supplierList) => this.setState({supplierList: supplierList}))
    .catch((error) => this.setState({error}));
  }

  handleChange = (name) => (event) => {
    this.setState({[name]: event.target.value});
  }

  render () {
    const {classes} = this.props;
    return(
      <div>
        <Grid container>
          <Grid item xs>
            <CustomSelect
              onChange={this.props.display.handleChange}
              label='Display'
              native
              defaultValue = {this.props.display.defaultValue}
            />
          </Grid>
          <Grid item xs>
          <CustomSelect
              onChange={this.props.handleDisplayChange}
              label='Display'
            />
          </Grid>
        </Grid>
      </div>
    );
  }

}

LCToolBar.propTypes = {
  classes: PropTypes.object.isRequired,
  issuerAPI: PropTypes.object.isRequired,
  supplierAPI: PropTypes.object.isRequired,
}


export default LCToolbar