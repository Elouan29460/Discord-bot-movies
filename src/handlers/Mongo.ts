import mongoose from "mongoose";
import { color } from "../functions";

module.exports = () => {
    const MONGO_URI = process.env.MONGO_URI
    if (!MONGO_URI) return console.log(color("text",`🍃 Mongo URI not found, ${color("error", "skipping.")}`));

    mongoose.set('strictQuery', false);

    mongoose.connect(`${MONGO_URI}/${process.env.MONGO_DATABASE_NAME}`)
    .then(() => console.log(color("text",`🍃 La connection avec MongoDB a été établie avec ${color("variable", "succès.")}`)))
    .catch(() => console.log(color("text",`🍃 La connection avec MongoDB a ${color("error", "échouée.")}`)));
}