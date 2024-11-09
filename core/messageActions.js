const moduleManagerInstance = require("../core/moduleManager");
const axios = require("axios");

const roomActions = {
  privateBattle: [handleJoinMessageAction, handleExitMessageAction],
};

const axiosInstance = axios.create({
  baseURL: "https://www.googleapis.com/youtube/v3",
  headers: {
    "Content-Type": "application/json",
  },
});

async function handleJoinMessageAction(roomInfo, message, previousResult) {
  let result = previousResult;
  let joinMessage = roomInfo.additionalInfo.joinMessage || "join";
  console.log("Join message action", joinMessage);
  if (
    message.snippet.type === "textMessageEvent" &&
    message.snippet.textMessageDetails.messageText === joinMessage
  ) {
    console.log("Join message received");

    let userInfo = await moduleManagerInstance.m_userManager.getUserInfo(
      message.authorDetails,
      roomInfo.snippet.channelId
    );

    console.log("result newWaitingList", result.newWaitingList);
    console.log(
      "in waiting list",
      moduleManagerInstance.m_broadcastManager.isMemberInWaitingList(
        message.authorDetails.channelId
      )
    );

    if (
      moduleManagerInstance.m_broadcastManager.isMemberInWaitingList(
        message.authorDetails.channelId
      )
    ) {
      console.log("already in waiting list");
      return;
    }

    userInfo.additionalInfo.playCount = 0;

    if (result.newWaitingList) {
      //if the user is already in the new waiting list or the current waiting list, return
      if (
        result.newWaitingList.find(
          (element) => element.channelId === message.authorDetails.channelId
        )
      ) {
        console.log("already in waiting list");
        return result;
      }
      result.newWaitingList.push(userInfo);
    } else {
      result.newWaitingList = [userInfo];
    }

    moduleManagerInstance.m_broadcastManager.addMemberToWaitingList(userInfo);

    //insert welcome message
    let welcomeMessage = roomInfo.additionalInfo.welcomeMessage || "Welcome!";
    welcomeMessage = welcomeMessage.replace(":name", userInfo.displayName);

    let data = {
      snippet: {
        type: "textMessageEvent",
        liveChatId: roomInfo.snippet.liveChatId,
        textMessageDetails: {
          messageText: "[きのボット] " + welcomeMessage,
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
        console.log("Welcome message sent");
      })
      .catch((err) => {
        console.log("Error sending welcome message", err);
      });
  }
  return result;
}

async function handleExitMessageAction(roomInfo, message, previousResult) {
  let result = previousResult;
  let exitMessage = roomInfo.additionalInfo.leaveMessage || "exit";
  if (
    message.snippet.type === "textMessageEvent" &&
    message.snippet.textMessageDetails.messageText === exitMessage
  ) {
    console.log(
      "Exit message received",
      message.authorDetails.channelId,
      message.snippet.textMessageDetails.messageText
    );

    if (
      !moduleManagerInstance.m_broadcastManager.isMemberInWaitingList(
        message.authorDetails.channelId
      ) &&
      !moduleManagerInstance.m_broadcastManager.isMemberInJoinerList(
        message.authorDetails.channelId
      )
    ) {
      console.log("not in waiting list or joiner list");
      return;
    }

    if (result.rmvWaitingList) {
      if (result.rmvWaitingList.includes(message.authorDetails.channelId)) {
        return result;
      }
      result.rmvWaitingList.push(message.authorDetails.channelId);
    } else {
      result.rmvWaitingList = [message.authorDetails.channelId];
    }

    moduleManagerInstance.m_broadcastManager.rmvMemberFromBothLists(
      message.authorDetails.channelId
    );

    //insert goodbye message
    let goodbyeMessage = roomInfo.additionalInfo.goodbyeMessage || "Goodbye!";
    goodbyeMessage = goodbyeMessage.replace(
      ":name",
      message.authorDetails.displayName
    );

    let data = {
      snippet: {
        type: "textMessageEvent",
        liveChatId: roomInfo.snippet.liveChatId,
        textMessageDetails: {
          messageText: "[きのボット] " + goodbyeMessage,
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
        console.log("Goodbye message sent");
      })
      .catch((err) => {
        console.log("Error sending goodbye message", err);
      });
  }
  return result;
}

async function messageActions(roomInfo, message, batchResults) {
  let result = batchResults;
  if (roomActions[roomInfo.roomType]) {
    for (let i = 0; i < roomActions[roomInfo.roomType].length; i++) {
      result = await roomActions[roomInfo.roomType][i](
        roomInfo,
        message,
        result
      );
    }
    return result;
  }
}

module.exports = messageActions;
