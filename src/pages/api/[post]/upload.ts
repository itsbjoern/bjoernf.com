import { SecureEndpoint, APIError } from "@/pages/api/_def";
import { uploadFile } from "@/utils/aws";
import { getDb } from "@/utils/database";
import { ObjectId } from "mongodb";
import sharp from "sharp";

type Mappings = {
  image: FormDataEntryValue & File;
};

type UploadFormDataFields = keyof Mappings;

export interface UploadFormData extends FormData {
  append<T extends UploadFormDataFields>(name: T, value: Mappings[T]): void;
  get<T extends UploadFormDataFields>(name: T): Mappings[T];
}

type UploadRequestBody = UploadFormData;
type UploadReturnData = {
  url: string;
};

export const POST = SecureEndpoint<UploadRequestBody, UploadReturnData>(
  async ({ params, request, cookies }) => {
    const formData = await request.formData();

    const data = formData.get("image");
    if (!data) {
      throw new APIError(400, "No image data");
    }
    const postId = params.post;

    const database = await getDb();
    const post = await database.posts().findOne({ _id: new ObjectId(postId) });
    if (!post) {
      throw new APIError(404, "Post not found");
    }

    let resized = null;
    try {
      const imageBuffer = await data.arrayBuffer();
      resized = await sharp(imageBuffer)
        .resize({
          width: 500,
          height: 500,
          fit: "inside",
        })
        .jpeg({ quality: 95 })
        .toBuffer();
    } catch {
      throw new APIError(400, "Unsupported image type");
    }

    const fileName = data.name.split(".")[0] + ".jpg";
    const folder = import.meta.env.DEV ? "uploads-dev/" : "uploads/";

    await uploadFile(folder + fileName, "image/jpeg", resized);

    return {
      url: `/${folder}${fileName}`,
    };
  },
);

export type UploadEndpoint = typeof POST;
