import React, {Component} from 'react'
import PropTypes from 'prop-types'

class BankEditPage extends Component{
	constructor(props){
		super(props);
		const {bank} = this.prop;

		this.state = {
			name: bank.name,
			branch: bank.branch,
			IFSC: bank.IFSC,
			LC_limit: parseFloat(bank.LC_limit), 
		}
	}

	 handleChange = (name) => (event,target) => {

	}

}