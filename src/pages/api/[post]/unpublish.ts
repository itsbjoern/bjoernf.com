import { SecureEndpoint, APIError } from "@/pages/api/_def";
import { getDb } from "@/utils/database";
import type { Post } from "@/utils/models";
import { ObjectId, type WithId } from "mongodb";

type UnpublishRequestBody = null;
type UnpublishReturnData = {
  post: WithId<Post>;
};

export const POST = SecureEndpoint<UnpublishRequestBody, UnpublishReturnData>(
  async ({ request, params }) => {
    const postId = params.post;

    const database = await getDb();
    const hasPost = await database
      .posts()
      .findOne({ _id: new ObjectId(postId) });
    if (!hasPost) {
      throw new APIError(404, "Post not found");
    }

    const post = await database
      .posts()
      .findOneAndUpdate({ _id: hasPost._id }, { $unset: { published: 1 } });

    return {
      post: post!,
    };
  },
);

export type UnpublishEndpoint = typeof POST;
