import { MongoClient } from "mongodb";
import GridFsStorage from 'multer-gridfs-storage';
import Grid from 'gridfs-stream';

const connectionString = process.env.MONGO_URL || "";

const client = new MongoClient(connectionString);

let conn;
try {
    conn = await client.connect();
    conn.once('open', () => {
        gfs = Grid(conn.db);
        gfs.collection('uploads');
  });
} catch(e) {
    console.error(e);
}

let db = conn.db("qeeps_test");

export default db;