import React from 'react';  
import { Meta } from '@storybook/react';  
import Login from './Login';  

const meta: Meta<typeof Login> = {  
  title: 'Auth/Login',  
  component: Login,  
};  

function Default() {  
  return <Login />;  
}  

Default.storyName = 'Default View';  

export { meta as default, Default };