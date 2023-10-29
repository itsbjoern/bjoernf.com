import { SecureEndpoint, APIError } from "@/pages/api/_def";
import { getDb } from "@/utils/database";
import type { Post } from "@/utils/models";
import { ObjectId, type WithId } from "mongodb";

type UpdateRequestBody = {
  title?: string;
  tags?: string[];
  text?: string;
  html?: string;
  image?: string;
};
type UpdateReturnData = {
  post: WithId<Post>;
};

export const POST = SecureEndpoint<UpdateRequestBody, UpdateReturnData>(
  async ({ request, params }) => {
    const postId = params.post;

    const database = await getDb();
    const hasPost = await database
      .posts()
      .findOne({ _id: new ObjectId(postId) });
    if (!hasPost) {
      throw new APIError(404, "Post not found");
    }

    const data = await request.json();

    const allowedKeys = ["title", "tags", "text", "html", "image"];
    for (const key of Object.keys(data)) {
      if (!allowedKeys.includes(key)) {
        throw new APIError(400, `Invalid key: ${key}`);
      }
    }

    const theUpdate = {
      updatedAt: new Date(),
      ...Object.fromEntries(
        Object.entries(data).map(([key, value]) => [`draft.${key}`, value]),
      ),
    };

    const post = await database
      .posts()
      .findOneAndUpdate({ _id: hasPost._id }, { $set: theUpdate });

    return {
      post: post!,
    };
  },
);

export type UpdateEndpoint = typeof POST;
