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
          </div>
        )}
      </motion.div>
      <div className={styles.mainContent}>Main Content Here</div>
    </div>
  );
}
