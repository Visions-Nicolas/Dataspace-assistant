import { MongoClient } from "mongodb";
import {Logger} from "../../libs/loggers";

let client: MongoClient;

export async function getMongodbConnection() {
    if (client) {
        return client;
    }

    client = new MongoClient(process.env.MONGODB_URI ?? "");
    await client.connect()
        .then(() => Logger.log({message: "✅ Mongodb connecté !"}))
        .catch((err) => console.error.bind(console, "MongoDB connection error: "));

    return client;
}


