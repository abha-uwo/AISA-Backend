import express from 'express';
const router = express.Router();

// Placeholder for agents routes to prevent 404s
router.get('/get_my_agents', (req, res) => {
    res.json([]);
});
router.post('/get_my_agents', (req, res) => {
    res.json([]);
});

router.get('/me', (req, res) => {
    res.json([]);
});
router.post('/me', (req, res) => {
    res.json([]);
});

router.get('/', (req, res) => {
    res.json([]);
});
router.post('/', (req, res) => {
    res.json([]);
});

export default router;
