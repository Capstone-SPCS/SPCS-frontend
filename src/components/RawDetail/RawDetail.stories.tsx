import React from 'react';  
import { Meta } from '@storybook/react';  
import RawDetail from './RawDetail';  

const meta: Meta<typeof RawDetail> = {  
  title: 'Details/RawDetail',  
  component: RawDetail,  
};  

function Default() {  
  return <RawDetail />;  
}  

Default.storyName = 'Default View';  

export { meta as default, Default };