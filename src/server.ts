import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';

let server: Server;

const dbuser = process.env.DBUSER;
const dbpass = process.env.DBPASS;

const PORT = 10000;

async function main() {
    try {
        await mongoose.connect(`mongodb+srv://hidayahdb:UcYVcLEbfejO5qV7@cluster0.ivo4yuq.mongodb.net/hidayahDB?retryWrites=true&w=majority&appName=Cluster0`);
        console.log("Connected to MongoDB Using Mongoose!!");
        server = app.listen(PORT, () => {
            console.log(`App is listening on port ${PORT}`);
        });
    } catch (error) {
        console.log(error);
    }
}

main()