import { MongoClient } from "mongodb";

const uri = "mongodb://localhost:27017/";
const client = new MongoClient(uri);

let db = null;

export async function connectDB() {
  if (!db) {
    try {
      await client.connect();
      console.log("Kết nối thành công đến MongoDB");
      db = client.db("CafeLand"); 
    } catch (error) {
      console.error("Lỗi kết nối MongoDB:", error);
      throw error;
    }
  }
  return db;
}
