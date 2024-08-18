import { SecureEndpoint, APIError } from "@/pages/api/_def";
import { invalidateCache } from "@/utils/aws";
import { getDb } from "@/utils/database";
import { ObjectId } from "mongodb";

type DeleteRequestBody = null;
type DeleteReturnData = {
  postId: string;
};

export const POST = SecureEndpoint<DeleteRequestBody, DeleteReturnData>(
  async ({ request, params }) => {
    const postId = params.post;

    const database = await getDb();
    const hasPost = await database
      .posts()
      .findOne({ _id: new ObjectId(postId) });
    if (!hasPost) {
      throw new APIError(404, "Post not found");
    }

    await database.posts().deleteOne({ _id: hasPost._id });

    await invalidateCache(`/blog/${hasPost._id}`);

    return {
      postId: postId ?? "",
    };
  },
);

export type DeleteEndpoint = typeof POST;
