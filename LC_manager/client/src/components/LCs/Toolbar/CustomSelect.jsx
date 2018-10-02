import React from 'react';
//import withStyles from '@material-ui/core/styles'
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';


function CustomSelect(props){
  return (
    <FormControl fullWidth={true} margin='normal'>
      <InputLabel htmlFor="props.id">{props.label}</InputLabel>
      <Select
        {...props}
      >
        <option value=''/>
        {props.options.map((prop,key) => {
          return (<option value={prop._id} key={`${props.label}-${key}`}>{prop.name}</option>)
        },)}
      </Select>
    </FormControl>
  );
}


export default CustomSelect;