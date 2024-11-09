const { runMongoFunction } = require("../core/mongoConnection");

class broadcastManager {
  current_room = null;
  db_string;
  collection_string;

  constructor() {
    this.db_string = "kinoChat";
    this.collection_string = "broadcasts";
  }

  async initBroadcast(room) {
    this.current_room = room;
    // if the broadcast already exists in the database, get the page token
    const broadcast = await runMongoFunction(
      this.db_string,
      this.collection_string,
      async (collection) => {
        return await collection.findOne({ id: room.id });
      }
    );

    if (broadcast != null) {
      this.current_room = {
        ...this.current_room,
        pageToken: broadcast.pageToken,
        roomType: broadcast.roomType,
        additionalInfo: broadcast.additionalInfo,
      };
      return broadcast;
    } else {
      await runMongoFunction(
        this.db_string,
        this.collection_string,
        async (collection) => {
          return await collection.insertOne({
            id: room.id,
            pageToken: null,
            roomType: ["privateBattle"],
            additionalInfo: {
              waitingList: [],
              joinerList: [],
            },
          });
        }
      );

      this.current_room = {
        ...this.current_room,
        pageToken: null,
        roomType: ["privateBattle"],
        additionalInfo: {
          waitingList: [],
          joinerList: [],
        },
      };

      return {
        id: room.id,
        pageToken: null,

        roomType: ["privateBattle"],
        additionalInfo: {
          waitingList: [],
          joinerList: [],
        },
      };
    }
  }

  async resetBroadcast(room) {
    this.current_room = room;
    await runMongoFunction(
      this.db_string,
      this.collection_string,
      async (collection) => {
        return await collection.updateOne(
          { id: room.id },
          {
            $set: {
              pageToken: null,
              roomType: ["privateBattle"],
              additionalInfo: {
                waitingList: [],
                joinerList: [],
              },
            },
          }
        );
      }
    );
    return {
      id: room.id,
      pageToken: null,
      roomType: ["privateBattle"],
      additionalInfo: {
        waitingList: [],
        joinerList: [],
      },
    };
  }

  async updatePageToken(token) {
    this.current_room.pageToken = token;
    await runMongoFunction(
      this.db_string,
      this.collection_string,
      async (collection) => {
        return await collection.updateOne(
          { id: this.current_room.id },
          { $set: { pageToken: token } }
        );
      }
    );
  }

  getPageToken() {
    return this.current_room.pageToken;
  }

  getCurrentBroadcastChatId() {
    if (this.current_room == null) {
      throw new Error("Room does not exist");
    }
    return this.current_room.snippet.liveChatId;
  }

  async updateRoomAdditionalInfo(additionalInfo) {
    this.current_room.additionalInfo = additionalInfo;
    await runMongoFunction(
      this.db_string,
      this.collection_string,
      async (collection) => {
        return await collection.updateOne(
          { id: this.current_room.id },
          { $set: { additionalInfo: additionalInfo } }
        );
      }
    );

    return this.current_room;
  }

  isMemberInJoinerList(memberChannelId) {
    return this.current_room.additionalInfo.joinerList.some(
      (member) => member.channelId === memberChannelId
    );
  }

  isMemberInWaitingList(memberChannelId) {
    return this.current_room.additionalInfo.waitingList.some(
      (member) => member.channelId === memberChannelId
    );
  }

  async addMemberToWaitingList(member) {
    this.current_room.additionalInfo.waitingList.push(member);
    await runMongoFunction(
      this.db_string,
      this.collection_string,
      async (collection) => {
        return await collection.updateOne(
          { id: this.current_room.id },
          {
            $set: { additionalInfo: this.current_room.additionalInfo },
          }
        );
      }
    );
  }

  async addMemberToJoinerList(member) {
    this.current_room.additionalInfo.joinerList.push(member);
    await runMongoFunction(
      this.db_string,
      this.collection_string,
      async (collection) => {
        return await collection.updateOne(
          { id: this.current_room.id },
          {
            $set: { additionalInfo: this.current_room.additionalInfo },
          }
        );
      }
    );
  }

  // async moveMemberToJoinerList(memberChannelId) {
  //   const member = this.current_room.additionalInfo.waitingList.find(
  //     (member) => member.channelId === memberChannelId
  //   );

  //   if (member) {
  //     this.current_room.additionalInfo.waitingList =
  //       this.current_room.additionalInfo.waitingList.filter(
  //         (member) => member.channelId !== memberChannelId
  //       );
  //     this.current_room.additionalInfo.joinerList.push(member);

  //     await runMongoFunction(
  //       this.db_string,
  //       this.collection_string,
  //       async (collection) => {
  //         return await collection.updateOne(
  //           { id: this.current_room.id },
  //           {
  //             $set: { additionalInfo: this.current_room.additionalInfo },
  //           }
  //         );
  //       }
  //     );
  //   }
  // }

  // async moveMemberToWaitingList(memberChannelId) {
  //   const member = this.current_room.additionalInfo.joinerList.find(
  //     (member) => member.channelId === memberChannelId
  //   );

  //   if (member) {
  //     this.current_room.additionalInfo.joinerList =
  //       this.current_room.additionalInfo.joinerList.filter(
  //         (member) => member.channelId !== memberChannelId
  //       );
  //     this.current_room.additionalInfo.waitingList.push(member);

  //     await runMongoFunction(
  //       this.db_string,
  //       this.collection_string,
  //       async (collection) => {
  //         return await collection.updateOne(
  //           { id: this.current_room.id },
  //           {
  //             $set: { additionalInfo: this.current_room.additionalInfo },
  //           }
  //         );
  //       }
  //     );
  //   }
  // }

  async rmvMemberFromBothLists(memberChannelId) {
    console.log("removing member from both lists", memberChannelId);
    this.current_room.additionalInfo.waitingList =
      this.current_room.additionalInfo.waitingList.filter(
        (member) => member.channelId !== memberChannelId
      );
    this.current_room.additionalInfo.joinerList =
      this.current_room.additionalInfo.joinerList.filter(
        (member) => member.channelId !== memberChannelId
      );

    await runMongoFunction(
      this.db_string,
      this.collection_string,
      async (collection) => {
        return await collection.updateOne(
          { id: this.current_room.id },
          {
            $set: { additionalInfo: this.current_room.additionalInfo },
          }
        );
      }
    );
  }

  async updateMemberInListAndDB(memberChannelId, additionalInfo) {
    if (this.isMemberInJoinerList(memberChannelId)) {
      this.current_room.additionalInfo.joinerList =
        this.current_room.additionalInfo.joinerList.map((member) => {
          if (member.channelId === memberChannelId) {
            return {
              ...member,
              additionalInfo: additionalInfo,
            };
          }
          return member;
        });
    }

    if (this.isMemberInWaitingList(memberChannelId)) {
      this.current_room.additionalInfo.waitingList =
        this.current_room.additionalInfo.waitingList.map((member) => {
          if (member.channelId === memberChannelId) {
            return {
              ...member,
              additionalInfo: additionalInfo,
            };
          }
          return member;
        });
    }

    await runMongoFunction(
      this.db_string,
      this.collection_string,
      async (collection) => {
        return await collection.updateOne(
          { id: this.current_room.id },
          {
            $set: { additionalInfo: this.current_room.additionalInfo },
          }
        );
      }
    );
  }

  async updateBothListsAndDB(joinerList, waitingList) {
    this.current_room.additionalInfo.joinerList = joinerList;
    this.current_room.additionalInfo.waitingList = waitingList;

    await runMongoFunction(
      this.db_string,
      this.collection_string,
      async (collection) => {
        return await collection.updateOne(
          { id: this.current_room.id },
          {
            $set: { additionalInfo: this.current_room.additionalInfo },
          }
        );
      }
    );
  }
}

module.exports = broadcastManager;
