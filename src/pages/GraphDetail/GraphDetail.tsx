import React from 'react'
import Probability from '../../components/Graphs/Probability'
import MissDistance from '../../components/Graphs/MissDistance'
import RSSErrorEvolution from '../../components/Graphs/RSSEvolution'

const GraphDetail = () => {
	return <div>
		<h1>GraphDetail</h1>
		<Probability id={0} sat1_object_designator={''} sat2_object_designator={''} cdms={[]}></Probability>
		<MissDistance id={0} sat1_object_designator={''} sat2_object_designator={''} cdms={[]}></MissDistance>
		<RSSErrorEvolution id={0} sat1_object_designator={''} sat2_object_designator={''} cdms={[]}></RSSErrorEvolution>
		</div>
}

export default GraphDetail
