import React from 'react'
import { ArrowLeft } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { CesiumIntegration } from '../../components/CesiumIntegration'
import styles from './EventDetail.module.css'

const EventDetail = () => {
	return (
		<div className={styles.container}>
		  <Navbar userRole="Technical Operator" showLogout={true} />
		  
		  <main className={styles.main}>
			{/* Back Navigation */}
			<button onClick={() => window.history.back()} className={styles.backButton}>
			  <ArrowLeft className={styles.backIcon} />
			  Back to Event Dashboard
			</button>
	
			{/* Header */}
			<div className={styles.header}>
			  <h1 className={styles.title}>Event $id</h1>
			  <button className={styles.rawDataButton}>
				Raw CDM Data
			  </button>
			</div>
	
			{/* 3D Visualization Section */}
			<div className={styles.visualizationContainer}>
			  <div className={styles.visualizationHeader}>
				<h2 className={styles.sectionTitle}>3D Visualization</h2>
			  </div>
			  <div className={styles.visualizationContent}>
				<CesiumIntegration />
			  </div>
			</div>

			{/* CDM Specific Section */}
			<section className={styles.section}>
			  <h2 className={styles.sectionTitle}>CDM Specific</h2>
			  <div className={styles.graphGrid}>
				<div className={styles.graphCard}>
				  <h3 className={styles.graphTitle}>Probability ISO lines</h3>
				  <div className={styles.graphContent}>
					{/* Insert your graph component here */}
				  </div>
				</div>
				<div className={styles.graphCard}>
				  <h3 className={styles.graphTitle}>Miss distance ISO lines</h3>
				  <div className={styles.graphContent}>
					{/* Insert your graph component here */}
				  </div>
				</div>
				<div className={styles.graphCard}>
				  <h3 className={styles.graphTitle}>Time to TCA</h3>
				  <div className={styles.graphContent}>
					{/* Insert your graph component here */}
				  </div>
				</div>
			  </div>
			</section>
			{/* Event Specific Section */}

			<section className={styles.section}>
			  <h2 className={styles.sectionTitle}>Event Specific</h2>
			  <div className={styles.graphGrid}>
				<div className={styles.graphCard}>
				  <h3 className={styles.graphTitle}>Probability vs. HBR</h3>
				  <div className={styles.graphContent}>
					{/* Insert your graph component here */}
				  </div>
				</div>
				<div className={styles.graphCard}>
				  <h3 className={styles.graphTitle}>Probability Sensitivity to RSS Error evolution</h3>
				  <div className={styles.graphContent}>
					{/* Insert your graph component here */}
				  </div>
				</div>
				<div className={styles.graphCard}>
				  <h3 className={styles.graphTitle}>Visualizer 3</h3>
				  <div className={styles.graphContent}>
					{/* Insert your graph component here */}
				  </div>
				</div>
			  </div>
			</section>
			
		  </main>
		</div>
	  );
	};

export default EventDetail
