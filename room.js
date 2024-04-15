import { Timestamp, collection, getFirestore } from "firebase/firestore";
import {
  checkParticipants,
  getRoom,
  requireAuth,
  sendMessageToRoom,
  subscribeToRoom,
  updateRoomName,
} from "./scripts/firebase";

function appendMessages(message) {
  const messageContainer = document.getElementById("messages");
  const messageElement = document.createElement("div");
  messageElement.classList.add("message");
  const user = document.createElement("div");
  user.innerText = message.senderName;
  const messageText = document.createElement("div");
  if (message.isSelf) {
    user.classList.add("message-user-self");
    messageText.classList.add("text-self");
  } else {
    user.classList.add("message-user");
    messageText.classList.add("text");
  }
  messageText.innerText = message.content;

  messageElement.appendChild(user);
  messageElement.appendChild(messageText);
  messageContainer.appendChild(messageElement);
}

function sendMessage(roomId) {
  const messageinput = document.getElementById("input-form-input");
  const message = messageinput.value;
  if (message === "") return;
  sendMessageToRoom(roomId, message);
  messageinput.value = "";
}
function goToBottom() {
  const messages = document.getElementById("messages");
  messages.scrollTop = messages.scrollHeight - messages.clientHeight;
}
function addSendMessageListener(roomId) {
  const sendMessageButton = document.getElementById("input-form-button");
  sendMessageButton.addEventListener("click", () => {
    sendMessage(roomId);
  });
  const input = document.getElementById("input-form-input");
  input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") sendMessageButton.click();
  });
}
function setInviteUrl() {
  const currentUrl = window.location.href;
  const inviteLink = document.getElementById("invite-link");
  inviteLink.value = currentUrl;
}
function addInviteButtonListener() {
  const inviteButton = document.getElementById("invite-button");
  const inviteModal = document.getElementById("invite-modal");
  setInviteUrl();
  inviteButton.addEventListener("click", () => {
    inviteModal.classList.add("open");
  });
}
function addCloseInviteModalListener() {
  const closeModalButton = document.getElementById("close-invite-modal");
  const inviteModal = document.getElementById("invite-modal");
  closeModalButton.addEventListener("click", () => {
    inviteModal.classList.remove("open");
  });
}
function addCopyButtonListener() {
  const copyButton = document.getElementById("copy-link-btn");
  copyButton.addEventListener("click", () => {
    navigator.clipboard.writeText(window.location.href);
    copyButton.innerText = "Copied ! ";
    setTimeout(() => {
      copyButton.innerText = "Copy link";
    }, 2000);
  });
}
function createTitleInput(value) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = value;
  input.classList.add("editable-input");
  return input;
}
function addEditIconListener(roomId) {
  const editIcon = document.getElementById("edit-icon");
  editIcon.addEventListener("click", () => {
    const title = document.getElementById("chat-room-name");
    const input = createTitleInput(title.textContent);
    title.parentNode.replaceChild(input, title);
    input.focus();
    editIcon.style.display = "none";
    function saveTitle() {
      updateRoomName(input.value, roomId)
        .then(() => {
          title.textContent = input.value;
        })
        .finally(() => {
          input.parentNode.replaceChild(title, input);
          editIcon.style.display = "block";
        });
    }
    input.addEventListener("blur", saveTitle);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        input.blur();
      }
    });
  });
}
async function loadRoomName(roomId) {
  const title = document.getElementById("chat-room-name");
  const room = await getRoom(roomId);
  title.textContent = room.name;
}
function scroll() {
  const scrollContainer = document.getElementById("messages");
  let lastY = null;

  scrollContainer.addEventListener("mousedown", function (event) {
    lastY = event.clientY;
  });

  scrollContainer.addEventListener("mousemove", function (event) {
    if (lastY !== null && scrollContainer.scrollTop !== undefined) {
      const deltaY = event.clientY - lastY;
      scrollContainer.scrollTop -= deltaY;
      lastY = event.clientY;
    }
  });

  window.addEventListener("mouseup", function () {
    lastY = null;
  });
}
function setupEventListeners(roomId) {
  addSendMessageListener(roomId);
  addInviteButtonListener();
  addCloseInviteModalListener();
  addCopyButtonListener();
  addEditIconListener(roomId);
  scroll();
}
const messageIds = new Set();
function messageUpdateHandler(messages) {
  messages.forEach((message) => {
    if (!messageIds.has(message.id)) {
      messageIds.add(message.id);
      appendMessages(message);
    }
  });
  goToBottom();
}
requireAuth().then((user) => {
  const roomId = new URLSearchParams(window.location.search).get("roomID");
  loadRoomName(roomId);
  setupEventListeners(roomId);
  subscribeToRoom(messageUpdateHandler, roomId);
  checkParticipants(roomId);
});
