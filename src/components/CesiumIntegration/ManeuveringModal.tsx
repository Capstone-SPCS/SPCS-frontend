import React, { useState } from "react";

interface ManeuveringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (inputs: { satId: string; time: string; velocityX: string; velocityY: string; velocityZ: string }) => void;
}

const ManeuveringModal: React.FC<ManeuveringModalProps> = ({ isOpen, onClose, onSave }) => {
  const [inputs, setInputs] = useState({
    satId: "sat1",
    time: "",
    velocityX: "",
    velocityY: "",
    velocityZ: "",
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    // Validate or process the inputs as needed
    onSave(inputs);
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Input a Maneuver to display</h2>
        <div style={styles.inputContainer}>
          <label style={styles.label}>Sat ID</label>
          <select name="satId" value={inputs.satId} onChange={handleChange}>
            <option value="sat1">sat1</option>
            <option value="sat2">sat2</option>
          </select>
        </div>
        <div style={styles.inputContainer}>
          <label style={styles.label}>Time:</label>
          <input
            style={styles.input}
            name="time"
            type="datetime-local"
            value={inputs.time}
            onChange={handleChange}
          />
        </div>
        <div style={styles.inputContainer}>
          <label style={styles.label}>Velocity X:</label>
          <input
            style={styles.input}
            name="velocityX"
            type="number"
            placeholder="Enter velocity X"
            value={inputs.velocityX}
            onChange={handleChange}
          />
        </div>
        <div style={styles.inputContainer}>
          <label style={styles.label}>Velocity Y:</label>
          <input
            style={styles.input}
            name="velocityY"
            type="number"
            placeholder="Enter velocity Y"
            value={inputs.velocityY}
            onChange={handleChange}
          />
        </div>
        <div style={styles.inputContainer}>
          <label style={styles.label}>Velocity Z:</label>
          <input
            style={styles.input}
            name="velocityZ"
            type="number"
            placeholder="Enter velocity Z"
            value={inputs.velocityZ}
            onChange={handleChange}
          />
        </div>
        <div style={styles.buttonContainer}>
          <button onClick={handleSubmit} style={styles.button}>Save</button>
          <button style={styles.button}>Export</button>
          <button onClick={onClose} style={styles.button}>Close</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0px 4px 6px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
    minWidth: "350px",
  },
  inputContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontWeight: "bold",
    marginRight: "10px",
    minWidth: "100px",
  },
  select: {
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "16px",
  },
  input: {
    flex: 1,
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },
  button: {
    padding: "8px 12px",
    cursor: "pointer",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#2196F3",
    color: "white",
  },
};

export default ManeuveringModal;
