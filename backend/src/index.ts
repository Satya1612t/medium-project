import { Hono } from 'hono'

import authRouter from './route/authRouter';
import blogRouter from './route/blogRouter';

const app = new Hono()

app.route('/api/v1/user', authRouter);
app.route('/', blogRouter);

export default app
