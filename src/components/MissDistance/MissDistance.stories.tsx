import React from 'react';  
import { Meta } from '@storybook/react';  
import MissDistance from './MissDistance';  

const meta: Meta<typeof MissDistance> = {  
  title: 'Graphs/MissDistance',  
  component: MissDistance,  
};  

function Default() {  
  return <MissDistance />;  
}  

Default.storyName = 'Default View';  

export { meta as default, Default };