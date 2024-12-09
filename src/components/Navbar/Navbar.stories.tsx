import React from 'react';  
import { Meta } from '@storybook/react';  
import Navbar from './Navbar';  

const meta: Meta<typeof Navbar> = {  
  title: 'Navigation/Navbar',  
  component: Navbar,  
};  

function Default() {  
  return <Navbar userRole="Admin" showLogout={true} />;  
}  

Default.storyName = 'Default View';  

export { meta as default, Default };