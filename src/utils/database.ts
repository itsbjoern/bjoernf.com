import { type Db, MongoClient } from "mongodb";
import type * as Models from "./models";

class Database {
  private client?: MongoClient;
  private db?: Db;

  async connect() {
    this.client = await MongoClient.connect(process.env.MONGO_URL!);
    this.db = this.client.db(process.env.MONGO_DATABASE!);
  }

  posts() {
    return (this.db as Db).collection<Models.Post>("posts");
  }

  users() {
    return (this.db as Db).collection<Models.User>("users");
  }
}

let db: Database | null = null;

export const getDb = async () => {
  if (!db) {
    db = new Database();
    await db.connect();
  }

  return db;
};
