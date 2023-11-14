import { SecureEndpoint } from "@/pages/api/_def";
import { getDb } from "@/utils/database";
import type { Post } from "@/utils/models";
import { type WithId } from "mongodb";

type CreateRequestBody = null;
type CreateReturnData = {
  post: WithId<Post>;
};

export const POST = SecureEndpoint<CreateRequestBody, CreateReturnData>(
  async () => {
    const database = await getDb();
    const insertResult = await database.posts().insertOne({
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const post = await database
      .posts()
      .findOne({ _id: insertResult.insertedId });

    return {
      post: post!,
    };
  },
);

export type CreateEndpoint = typeof POST;
