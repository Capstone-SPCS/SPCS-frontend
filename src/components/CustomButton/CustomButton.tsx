// CustomButton.jsx
import React from 'react'
import styles from './CustomButton.module.css'

const CustomButton = ({
	children,
	type = 'button' as 'button' | 'submit' | 'reset',
	onClick,
	...props
}: {
	children: React.ReactNode
	type?: 'button' | 'submit' | 'reset'
	onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
	[key: string]: any
}) => {
	return (
		<button type={type} className={styles.button} onClick={onClick} {...props}>
			{children}
		</button>
	)
}

export default CustomButton
