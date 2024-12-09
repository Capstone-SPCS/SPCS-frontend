import React from 'react';  
import { Meta } from '@storybook/react';  
import CDMDataTable from './CDMDataTable';  

const meta: Meta<typeof CDMDataTable> = {  
  title: 'CDM/CDMDataTable',  
  component: CDMDataTable,  
};  

function Default() {  
  return <CDMDataTable  
    data={[  
      { key: 'Message ID', value: 'MSG001' },  
      { key: 'Creation Date', value: '2024-02-15' },  
      { key: 'Object Designator', value: 'SAT123' },  
      { key: 'Catalog ID', value: 'CAT456' },  
      { key: 'Object Type', value: 'PAYLOAD' },  
      { key: 'Operator', value: 'SpaceX' },  
      { key: 'Ephemeris Name', value: 'EPH789' },  
      { key: 'Covariance Method', value: 'CALCULATED' },  
      { key: 'Maneuverable', value: 'YES' },  
  ]} />;  
}  

Default.storyName = 'Default View';  

export { meta as default, Default };