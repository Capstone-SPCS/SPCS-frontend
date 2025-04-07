import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './main/App'
import { Provider } from 'react-redux'
import { store } from './redux/store'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

declare global {
	interface Window {
	  CESIUM_BASE_URL: string;
	}
  }
  
window.CESIUM_BASE_URL = '/cesium';

root.render(
	// <React.StrictMode>
		<Provider store={store}>
			<App />
		</Provider>
	// </React.StrictMode>
)
