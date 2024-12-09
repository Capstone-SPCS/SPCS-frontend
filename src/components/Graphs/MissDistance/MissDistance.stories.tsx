import React from 'react';  
import MissDistance from './MissDistance';  

export default {  
  title: 'Graphs/MissDistance',  
  component: MissDistance,  
};  

const Template = (args) => <MissDistance {...args} />;  

export const Default = Template.bind({});  
Default.args = {};  

export const WithData = Template.bind({});  
WithData.args = {  
  data: [  
    { created_at: Date.now() - 86400000, miss_distance: 500 },  
    { created_at: Date.now() - 43200000, miss_distance: 600 },  
    { created_at: Date.now(), miss_distance: 700 },  
  ],  
};