import React from 'react';  
import { Meta } from '@storybook/react';  
import Graphs from './Graphs';  

const meta: Meta<typeof Graphs> = {  
  title: 'Graphs',  
  component: Graphs,  
};  

function Default() {  
  return <Graphs />;  
}  

Default.storyName = 'Default View';  

export { meta as default, Default };