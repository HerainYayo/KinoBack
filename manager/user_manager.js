const { runMongoFunction } = require("../core/mongoConnection");
class userManager {
  db_string;
  collection_string;
  constructor() {
    this.db_string = "kinoChat";
    this.collection_string = "users";
  }

  async getUserInfo(userDetails, commenterChannelId) {
    const user = await runMongoFunction(
      this.db_string,
      this.collection_string,
      // find one that matches the channelId and commenterChannelId
      async (collection) => {
        return await collection.findOne({
          channelId: userDetails.channelId,
          commenterChannelId: commenterChannelId,
        });
      }
    );

    console.log("User info", user);

    if (user != null) {
      return user;
    } else {
      await runMongoFunction(
        this.db_string,
        this.collection_string,
        async (collection) => {
          collection.insertOne({
            commenterChannelId: commenterChannelId,
            channelId: userDetails.channelId,
            displayName: userDetails.displayName,
            profileImage: userDetails.profileImageUrl,
            additionalInfo: {},
          });
        }
      );

      return {
        commenterChannelId: commenterChannelId,
        channelId: userDetails.channelId,
        displayName: userDetails.displayName,
        profileImage: userDetails.profileImageUrl,
        additionalInfo: {},
      };
    }
  }

  async setUserAdditionalInfo(channelId, commenterChannelId, additionalInfo) {
    await runMongoFunction(
      this.db_string,
      this.collection_string,
      async (collection) => {
        collection.updateOne(
          {
            channelId: channelId,
            commenterChannelId: commenterChannelId,
          },
          {
            $set: {
              additionalInfo: additionalInfo,
            },
          }
        );

        return;
      }
    );
  }
}

module.exports = userManager;
