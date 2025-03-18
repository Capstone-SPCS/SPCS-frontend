import React, { useState } from 'react'
import Navbar from '../../components/Navbar'
import CustomInput from '../../components/CustomInput'
import CustomButton from '../../components/CustomButton'
import styles from './Login.module.css'
import useLogin from '../../hooks/useLogin'

const Login = () => {
	const { login, error } = useLogin()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loginError, setLoginError] = useState('')

	const handleSubmit = async (e: { preventDefault: () => void }) => {
		e.preventDefault()
		try {
			const loginSuccessful = await login(email, password)
			if (!loginSuccessful) {
				setLoginError('Invalid login credentials')
			}
		} catch (err) {
			setLoginError('Invalid login credentials')
			console.error(err)
		}
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
						{(loginError || error) && <p className={styles.errorMessage}>{loginError || error}</p>}
						<CustomButton type="submit">Login</CustomButton>
					</form>
				</div>
			</main>
		</div>
	)
}

export default Login
