import { type Db, MongoClient, ServerApiVersion } from "mongodb";
import type * as Models from "./models";

class Database {
  private connection?: Promise<MongoClient>;
  private db?: Db;

  async connect() {
    if (!this.connection) {
      this.connection = MongoClient.connect(process.env.MONGO_URL!, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
      });
    }

    const client = await this.connection;
    this.db = client.db(process.env.MONGO_DATABASE!);
    return this;
  }

  posts() {
    return (this.db as Db).collection<Models.Post>("posts");
  }

  users() {
    return (this.db as Db).collection<Models.User>("users");
  }
}

let db: Database = new Database();

export const getDb = async () => {
  return db.connect();
};
