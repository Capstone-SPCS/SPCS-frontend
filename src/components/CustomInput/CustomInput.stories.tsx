import React from 'react';  
import { Meta } from '@storybook/react';  
import CustomInput from './CustomInput';  

const meta: Meta<typeof CustomInput> = {  
  title: 'Inputs/CustomInput',  
  component: CustomInput,  
};  

function Default() {  
  return <CustomInput  
    type="text"  
    placeholder="Enter text..."  
    value="Sample text"  
    onChange={(e) => console.log(e.target.value)}  
  />;  
}  

Default.storyName = 'Default View';  

export { meta as default, Default };