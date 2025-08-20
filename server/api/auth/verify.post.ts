import { and, eq } from "drizzle-orm";
import { ethers } from "ethers";

import { users } from "~/server/db/schema";
import { createSession } from "~/server/utils/session";
import { db } from "~/server/utils/db";

export default defineEventHandler(async (event) => {
  const { did, signature } = await readBody(event);

  if (!did || !signature) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing did or signature",
    });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.did, did),
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  const signerAddress = ethers.verifyMessage(user.did, signature);

  if (signerAddress.toLowerCase() !== user.publicKey.toLowerCase()) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid signature",
    });
  }

  const session = await createSession(user.id);

  return {
    message: "User verified",
    session,
  };
});