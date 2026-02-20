import 'dotenv/config';
import express from 'express'

const app = express();
const PORT = process.env.port || 3001;

app.use(express.json());

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log('Backend running on port ${PORT}');
})
