import { getDb } from "@/utils/database";
import type * as Models from "@/utils/models";
import { checkPasswordHash, createToken } from "@/utils/auth";

import { Endpoint, APIError } from "@/pages/api/_def";

type LoginRequestBody = {
  username: string;
  password: string;
};
type LoginReturnData = {
  user: Models.User;
};

export const POST = Endpoint<LoginRequestBody, LoginReturnData>(
  async ({ request, cookies }) => {
    const { username, password } = await request.json();

    const auth = request.headers.get("Authorization");
    if (auth) {
      throw new APIError(400, "Already logged in");
    }

    if (!username || !password) {
      throw new APIError(400, "Username and password required");
    }

    const database = await getDb();
    const user = await database.users().findOne({ username: username });
    if (!user) {
      throw new APIError(400, "User not found");
    }

    const isValid = await checkPasswordHash(user["password"], password);
    if (!isValid) {
      throw new APIError(400, "Invalid password");
    }

    const token = createToken(user["_id"].toString());
    await database.users().updateOne({ _id: user["_id"] }, { $set: { token } });

    cookies.set("token", token, {
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
    });

    return {
      user,
    };
  },
);

export type LoginEndpoint = typeof POST;
