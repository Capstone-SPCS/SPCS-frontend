// CustomInput.jsx
import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import styles from './CustomInput.module.css'

const CustomInput = ({
	type = 'text',
	placeholder = '',
	value = '',
	onChange = (e: React.ChangeEvent<HTMLInputElement>) => {},
	...props
}: {
	type?: string
	placeholder?: string
	value?: string
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
	[key: string]: any
}) => {
	const [showPassword, setShowPassword] = useState(false)
	const [focused, setFocused] = useState(false)

	const isPassword = type === 'password'

	return (
		<div className={styles.inputWrapper}>
			<input
				type={isPassword && showPassword ? 'text' : type}
				className={`${styles.input} ${focused ? styles.focused : ''}`}
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
				{...props}
			/>
			{isPassword && (
				<button
					type="button"
					className={styles.eyeIcon}
					onClick={() => setShowPassword(!showPassword)}
					aria-label={showPassword ? 'Hide password' : 'Show password'}>
					{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
				</button>
			)}
		</div>
	)
}

export default CustomInput
