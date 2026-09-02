import User from "./models/user.model.js";

export const repairAuthIndexes = async () => {
  try {
    const indexes = await User.collection.indexes();
    const usernameIndex = indexes.find((index) => index.name === "username_1");

    const usernameIndexIsSafe =
      usernameIndex?.unique === true &&
      usernameIndex?.partialFilterExpression?.username?.$type === "string";

    if (usernameIndex && !usernameIndexIsSafe) {
      await User.collection.dropIndex("username_1");
      console.log("Rebuilt unsafe users.username index");
    }

    await User.syncIndexes();
    await User.updateMany(
      { credits: { $exists: false } },
      { $set: { credits: 1000, creditsUsed: 0 } }
    );
  } catch (error) {
    console.warn("Auth index repair skipped:", error.message);
  }
};
