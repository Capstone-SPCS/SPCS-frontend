import React from 'react';  
import CustomInput from './CustomInput';  

export default {  
  title: 'Inputs/CustomInput',  
  component: CustomInput,  
};  

const Template = (args) => <CustomInput {...args} />;  

export const Default = Template.bind({});  
Default.args = {  
  type: 'text',  
  placeholder: 'Enter text here',  
  value: '',  
  onChange: () => {}  
};  

export const PasswordInput = Template.bind({});  
PasswordInput.args = {  
  type: 'password',  
  placeholder: 'Enter password',  
  value: '',  
  onChange: () => {}  
};