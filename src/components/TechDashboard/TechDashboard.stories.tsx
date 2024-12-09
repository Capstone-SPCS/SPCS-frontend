import React from 'react';  
import { Meta } from '@storybook/react';  
import TechDashboard from './TechDashboard';  

const meta: Meta<typeof TechDashboard> = {  
  title: 'Dashboards/TechDashboard',  
  component: TechDashboard,  
};  

function Default() {  
  return <TechDashboard />;  
}  

Default.storyName = 'Default View';  

export { meta as default, Default };