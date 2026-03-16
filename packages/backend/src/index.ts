import 'dotenv/config';
import express from 'express'
import cors from 'cors';
import router from './server'

const app = express();
const PORT = process.env.port || 3001;

app.use(express.json());
app.use(cors());

app.use("/api", router.recipeRouter);
app.use("/auth", router.loginRouter);

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log('Backend running on port 3000');
})
