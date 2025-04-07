// Navbar.jsx
import React from 'react'
import styles from './Navbar.module.css'
import useLogin from '../../hooks/useLogin'

const Navbar = ({ userRole, showLogout }: { userRole?: string; showLogout?: boolean }) => {
	const { logout, isAuthenticated } = useLogin()
	return (
		<nav className={styles.navbar}>
			<div className={styles.content}>
				<div className={styles.logo}>
					<img src="/Logo_AgenceSpatialeCanada.png" alt="CSA Logo" className={styles.logoImg} />
					<span className={styles.logoText}>Space Collision Detection System</span>
				</div>
				<button className={styles.loginBtn} onClick={() => logout()}>
					{isAuthenticated ? 'Logout' : ''}
				</button>
			</div>
		</nav>
	)
}

export default Navbar
