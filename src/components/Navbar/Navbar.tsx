// Navbar.jsx
import React from 'react'
import styles from './Navbar.module.css'

const Navbar = ({ userRole, showLogout }: { userRole?: string; showLogout?: boolean }) => {
	return (
		<nav className={styles.navbar}>
			<div className={styles.content}>
				<div className={styles.logo}>
					<img src="/api/placeholder/24/24" alt="SCDS Logo" className={styles.logoImg} />
					<span className={styles.logoText}>Space Collision Detection System</span>
				</div>
				<button className={styles.loginBtn}>Login</button>
			</div>
		</nav>
	)
}

export default Navbar
