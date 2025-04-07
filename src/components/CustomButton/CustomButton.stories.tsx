import React from 'react';  
import { Meta } from '@storybook/react';  
import CustomButton from './CustomButton';  

const meta: Meta<typeof CustomButton> = {  
  title: 'Buttons/CustomButton',  
  component: CustomButton,  
};  

function Default() {  
  return <CustomButton  
    type="button"  
    onClick={() => alert('Button clicked!')}  
  >  
    Click Me  
  </CustomButton>;  
}  

Default.storyName = 'Default View';  

export { meta as default, Default };