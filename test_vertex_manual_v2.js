import 'dotenv/config'; // Load env vars before other imports
import { askVertex } from './services/vertex.service.js';

const runTest = async () => {
    try {
        console.log("Testing Vertex AI...");
        const response = await askVertex("Hello, this is a test. Who are you?");
        console.log("Vertex AI Response:", response);
    } catch (error) {
        console.error("Test Failed:", error);
    }
};

runTest();
