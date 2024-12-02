import React from 'react'
import Probability from '../../components/Graphs/Probability'
import MissDistance from '../../components/Graphs/MissDistance'
import RSSErrorEvolution from '../../components/Graphs/RSSEvolution'

const GraphDetail = () => {
	return <div>
		<h1>GraphDetail</h1>
		<Probability></Probability>
		<MissDistance></MissDistance>
		<RSSErrorEvolution></RSSErrorEvolution>
		</div>
}

export default GraphDetail
