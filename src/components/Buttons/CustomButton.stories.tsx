import React from 'react';  
import CustomButton from './CustomButton';  

export default {  
  title: 'Inputs/CustomButton',  
  component: CustomButton,  
};  

const Template = (args) => <CustomButton {...args} />;  

export const Default = Template.bind({});  
Default.args = {  
  children: 'Click Me',  
  type: 'button',  
};