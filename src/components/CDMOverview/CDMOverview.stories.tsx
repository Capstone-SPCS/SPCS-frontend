import React from 'react';  
import { Meta } from '@storybook/react';  
import CDMOverview from './CDMOverview';  

const meta: Meta<typeof CDMOverview> = {  
  title: 'CDM/CDMOverview',  
  component: CDMOverview,  
};  

function Default() {  
  return <CDMOverview  
    id="1"  
    messageId="MSG001"  
    eventId="EVT001"  
    objectType="Satellite"  
    poc="12.5%"  
    tca="2024-02-15"  
    source="NASA"  
    operator="SpaceX"  
  />;  
}  

Default.storyName = 'Default View';  

export { meta as default, Default };