import { SecureEndpoint, APIError } from "@/pages/api/_def";
import { invalidateCache } from "@/utils/aws";
import { getDb } from "@/utils/database";
import type { Post } from "@/utils/models";
import { ObjectId, type WithId } from "mongodb";

type PublishRequestBody = null;
type PublishReturnData = {
  post: WithId<Post>;
};

export const POST = SecureEndpoint<PublishRequestBody, PublishReturnData>(
  async ({ request, params }) => {
    const postId = params.post;

    const database = await getDb();
    const hasPost = await database
      .posts()
      .findOne({ _id: new ObjectId(postId) });
    if (!hasPost) {
      throw new APIError(404, "Post not found");
    }

    if (!hasPost.draft) {
      throw new APIError(400, "No post draft");
    }

    if (!hasPost.draft.title) {
      throw new APIError(400, "No post title");
    }

    if (!hasPost.draft.text) {
      throw new APIError(400, "No post text");
    }

    const summary = hasPost.draft.text.split(".").slice(0, 3).join(".") + ".";

    const theUpdate = {
      updatedAt: new Date(),
      published: {
        ...hasPost.draft,
        summary,
        version: (hasPost.published?.version ?? 0) + 1,
        publishedAt: new Date(),
      },
    };

    const post = await database
      .posts()
      .findOneAndUpdate({ _id: hasPost._id }, { $set: theUpdate });

    await invalidateCache(`/blog/${hasPost._id}`);

    return {
      post: post!,
    };
  },
);

export type PublishEndpoint = typeof POST;
