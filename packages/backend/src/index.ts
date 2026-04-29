import 'dotenv/config';
import { createApp } from './app';

const app = createApp();
const PORT = process.env.port || 3001;

app.listen(PORT, () => {
    console.log('Backend running on port 3001');
})
