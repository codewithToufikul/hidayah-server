import express, { Application, Request, Response } from 'express';
import { userRoutes } from './app/controllers/user.controller';
import dotenv from "dotenv";
import cors from "cors";
import { duaRoutes } from './app/controllers/dua.controller';


const app: Application = express();
app.use(express.json());
app.use(cors({
  origin: 'https://hidayah-client.vercel.app', 
  credentials: true                
}));
dotenv.config();

app.use("/users", userRoutes)
app.use("/dua", duaRoutes)

app.get('/', (req: Request, res: Response) => {
    res.send('Api is running');
});


export default app;