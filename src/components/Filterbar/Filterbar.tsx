import React from 'react';
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./Filterbar.module.css";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={styles.container}>
      <motion.div
        animate={{ width: isCollapsed ? 100 : 300 }}
        className={styles.sidebar}
      >
        <div className={styles.toggleContainer}>
          <button
            className={styles.toggleButton}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </button>
          {/* Keep the Filters title next to the toggle button */}
          <h2 className={styles.title}>Filters</h2>
        </div>
        {!isCollapsed && (
          <div className={styles.filters}>
            <label className={styles.filterOption}>
                <span>Satellite ID</span>
              <input type="text" placeholder="Enter Satellite Designator ID" className={styles.textField} />
            </label>
            <button>Update</button>
            <h3>My Preferences</h3>
            <h3>Satellite Subscriptions</h3>
            <span>List of current subscriptions: </span>
            <label className={styles.filterOption}>
                <span>Satellite ID</span>
              <input type="text" placeholder="Enter Satellite Designator ID" className={styles.textField} />
            </label>
            <h3>Alerting Thresholds</h3>
            <label className={styles.filterOption}>
                <span>Probabliity of collision</span>
              <input type="text" placeholder="Enter a POC" className={styles.textField} />
            </label>
            <label className={styles.filterOption}>
                <span>Time of Closest Approach</span>
              <input type="text" placeholder="Enter a TCA" className={styles.textField} />
            </label>
          </div>
        )}
      </motion.div>
      <div className={styles.mainContent}>Main Content Here</div>
    </div>
  );
}
