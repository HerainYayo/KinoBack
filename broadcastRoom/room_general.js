const axios = require("axios");
const messageActions = require("../core/messageActions");

const axiosInstance = axios.create({
  baseURL: "https://www.googleapis.com/youtube/v3",
  headers: {
    "Content-Type": "application/json",
  },
});

function register(app, moduleManagerInstance) {
  // get all live broadcasts
  app.get("/listLiveBroadcasts", async (req, res) => {
    axiosInstance
      .get("/liveBroadcasts", {
        params: {
          part: "snippet",
          broadcastType: "all",
          broadcastStatus: "all",
        },
        headers: {
          Authorization:
            "Bearer " + moduleManagerInstance.m_authManager.getAccessToken(),
        },
      })
      .then((response) => {
        res.json(response.data);
      })
      .catch((err) => {
        console.log(err);
        res.status(err.status).json({ message: err.message });
      });
  });

  app.post("/listLiveChatMessages", async (req, res) => {
    let nextPageToken = req.session.nextPageToken
      ? req.session.nextPageToken
      : null;
    axiosInstance
      .get("/liveChat/messages", {
        params: {
          part: "snippet, authorDetails",
          liveChatId: req.body.liveChatId,
          pageToken: nextPageToken,
        },
        headers: {
          Authorization:
            "Bearer " + moduleManagerInstance.m_authManager.getAccessToken(),
        },
      })
      .then((response) => {
        req.session.nextPageToken = response.data.nextPageToken;
        res.json(response.data);
      })
      .catch((err) => {
        res.status(err.status).json({ message: err.message });
      });
  });

  app.post("/insertLiveChatMessage", async (req, res) => {
    let data = {
      snippet: {
        type: "textMessageEvent",
        liveChatId: req.body.liveChatId,
        textMessageDetails: {
          messageText: req.body.message,
        },
      },
    };

    axiosInstance
      .post("/liveChat/messages", data, {
        headers: {
          Authorization:
            "Bearer " + moduleManagerInstance.m_authManager.getAccessToken(),
        },
        params: {
          part: "snippet",
        },
      })
      .then((response) => {
        res.json(response.data);
      })
      .catch((err) => {
        res.status(err.status).json({ message: err.message });
      });
  });

  /*
  this endpoint is for getting a single broadcast
  it will also set the broadcast as the current broadcast
  */

  app.get("/broadcasts", async (req, res) => {
    let broadCastId = req.query.broadCastId;
    axiosInstance
      .get("/liveBroadcasts", {
        params: {
          part: "snippet",
          id: broadCastId,
        },
        headers: {
          Authorization:
            "Bearer " + moduleManagerInstance.m_authManager.getAccessToken(),
        },
      })
      .then(async (response) => {
        let responseData = {};
        if (response.data.items.length > 0) {
          let broadcast = response.data.items[0];
          let dbInfo =
            await moduleManagerInstance.m_broadcastManager.initBroadcast(
              broadcast
            );
          responseData = {
            ...broadcast,
            dbInfo: dbInfo,
          };
        }
        res.json(responseData);
      })
      .catch((err) => {
        res.status(err.status).json({ message: err.message });
      });
  });

  app.get("/resetBroadcast", async (req, res) => {
    let broadCastId = req.query.broadCastId;
    axiosInstance
      .get("/liveBroadcasts", {
        params: {
          part: "snippet",
          id: broadCastId,
        },
        headers: {
          Authorization:
            "Bearer " + moduleManagerInstance.m_authManager.getAccessToken(),
        },
      })
      .then(async (response) => {
        let responseData = {};
        if (response.data.items.length > 0) {
          let broadcast = response.data.items[0];
          let dbInfo =
            await moduleManagerInstance.m_broadcastManager.resetBroadcast(
              broadcast
            );
          responseData = {
            ...broadcast,
            dbInfo: dbInfo,
          };
        }
        res.json(responseData);
      })
      .catch((err) => {
        res.status(err.status).json({ message: err.message });
      });
  });

  /*
  this endpoint is for getting lists of all rooms
  there is three types of lists might be returned
  1. newWaitingList
  2. rmvWaitingList
  3. rmvJoinerList
  */
  app.post("/processMessages", async (req, res) => {
    console.log("processMessages", Date.now());
    try {
      let chatId =
        moduleManagerInstance.m_broadcastManager.getCurrentBroadcastChatId();
      let nextPageToken =
        moduleManagerInstance.m_broadcastManager.getPageToken();
      axiosInstance
        .get("/liveChat/messages", {
          params: {
            part: "snippet, authorDetails",
            liveChatId: chatId,
            pageToken: nextPageToken,
          },
          headers: {
            Authorization:
              "Bearer " + moduleManagerInstance.m_authManager.getAccessToken(),
          },
        })
        .then(async (response) => {
          //lazy update the page token
          moduleManagerInstance.m_broadcastManager.updatePageToken(
            response.data.nextPageToken
          );

          let messages = response.data.items;
          let batchResults = {};
          for (let i = 0; i < messages.length; i++) {
            batchResults = await messageActions(
              moduleManagerInstance.m_broadcastManager.current_room,
              messages[i],
              batchResults
            );
          }

          res.json({
            ...batchResults,
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(err.status).json({ message: err.message });
        });
    } catch (e) {
      res.status(404).json({ message: e.message });
    }
  });

  app.post("/updateRoomAdditionalInfo", async (req, res) => {
    try {
      let additionalInfo = req.body.additionalInfo;
      let updatedRoomInfo =
        await moduleManagerInstance.m_broadcastManager.updateRoomAdditionalInfo(
          additionalInfo
        );
      res.json(updatedRoomInfo);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/updateUserAdditionalInfo", async (req, res) => {
    try {
      let userChannelId = req.body.channelId;
      let additionalInfo = req.body.additionalInfo;
      let channelId =
        moduleManagerInstance.m_broadcastManager.current_room.snippet.channelId;
      console.log("channelId", channelId);
      console.log("userChannelId", userChannelId);
      console.log("additionalInfo", additionalInfo);

      moduleManagerInstance.m_userManager.setUserAdditionalInfo(
        channelId,
        userChannelId,
        additionalInfo
      );

      moduleManagerInstance.m_broadcastManager.updateMemberInListAndDB(
        userChannelId,
        additionalInfo
      );

      res.json("Update Message Received");
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/removeMember", async (req, res) => {
    try {
      let memberChannelId = req.body.channelId;
      moduleManagerInstance.m_broadcastManager.rmvMemberFromBothLists(
        memberChannelId
      );
      res.json("Member Removed");
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  });

  //this function will receive a whole joiner list and waiting list, and update the db accordingly
  app.post("/startGame", async (req, res) => {
    try {
      let joinerList = req.body.joinerList;
      let waitingList = req.body.waitingList;

      moduleManagerInstance.m_broadcastManager.updateBothListsAndDB(
        joinerList,
        waitingList
      );

      res.json("Game Started Message Received");
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  });
}

exports.register = register;
