import React from 'react'
import { Meta } from '@storybook/react'
import Filterbar from './Filterbar'

const meta: Meta<typeof Filterbar> = {
	title: 'Filter/Filterbar',
	component: Filterbar
}

function Default() {
	return <Filterbar>child</Filterbar>
}

Default.storyName = 'Default View'

export { meta as default, Default }
