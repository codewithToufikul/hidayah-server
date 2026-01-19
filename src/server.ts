import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';

let server: Server;

const PORT = 10000;

async function main() {
    try {
        await mongoose.connect(``);
        console.log("Connected tmongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ivo4yuq.mongodb.net/hidayahDB?retryWrites=true&w=majority&appName=Cluster0o MongoDB Using Mongoose!!");
        server = app.listen(PORT, () => {
            console.log(`App is listening on port ${PORT}`);
        });
    } catch (error) {
        console.log(error);
    }
}

main()