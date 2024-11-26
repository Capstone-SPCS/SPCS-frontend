// CDMDataTable.jsx
import React from 'react'
import styles from './CDMDataTable.module.css'

const CDMDataTable = ({ data }: { data: { key: React.ReactNode; value: React.ReactNode }[] }) => {
	return (
		<div className={styles.tableContainer}>
			<table className={styles.table}>
				<tbody>
					{data.map(
						(
							row: {
								key:
									| string
									| number
									| boolean
									| React.ReactElement<any, string | React.JSXElementConstructor<any>>
									| Iterable<React.ReactNode>
									| React.ReactPortal
									| null
									| undefined
								value:
									| string
									| number
									| boolean
									| React.ReactElement<any, string | React.JSXElementConstructor<any>>
									| Iterable<React.ReactNode>
									| React.ReactPortal
									| null
									| undefined
							},
							index: React.Key | null | undefined
						) => (
							<tr key={index} className={styles.row}>
								<td className={styles.key}>{row.key}</td>
								<td className={styles.value}>{row.value}</td>
							</tr>
						)
					)}
				</tbody>
			</table>
		</div>
	)
}

export default CDMDataTable
