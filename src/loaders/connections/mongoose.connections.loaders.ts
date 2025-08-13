import mongoose from "mongoose";
import Bluebird from "bluebird";

let connection: mongoose.Connection | null = null;

export async function getMongooseConnection() {
    if (connection) {
        return connection;
    }

    const connect = await mongoose.connect(
        process.env.MONGODB_URI || "mongodb://localhost:27017",
    );

    connection = connect.connection;

    connection.on(
        "error",
        console.error.bind(console, "MongoDB connection error: ")
    );

    mongoose.Promise = Bluebird;

    return connection;
}

