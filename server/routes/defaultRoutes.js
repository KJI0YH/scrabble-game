import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => {
    res.send(`API server in running (${new Date().toLocaleString()})`);
});

export default router;