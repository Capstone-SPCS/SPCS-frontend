// LoginPage.jsx
import React, { useState } from 'react'
import Navbar from '../../components/Navbar'
import CustomInput from '../../components/CustomInput'
import CustomButton from '../../components/CustomButton'
import styles from './Login.module.css'

const Login = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	const handleSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault()
		// Handle login logic here
	}

	return (
		<div className={styles.container}>
			<Navbar />
			<main className={styles.main}>
				<div className={styles.formWrapper}>
					<h1 className={styles.title}>Welcome to SCDS</h1>
					<form onSubmit={handleSubmit} className={styles.form}>
						<CustomInput
							type="email"
							placeholder="Email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
						<CustomInput
							type="password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						<CustomButton type="submit">Login</CustomButton>
					</form>
				</div>
			</main>
		</div>
	)
}

export default Login
