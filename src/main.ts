import './style.css';
import { initApp } from './app.ts';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('#app element not found');

initApp(root);
