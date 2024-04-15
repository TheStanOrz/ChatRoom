import { getAuth } from "firebase/auth";
import { createRoom, getHistoriesRoom, requireAuth } from "./scripts/firebase";
getAuth;
function setupEventListeners() {
  const btn = document.getElementById("create-room-btn");
  btn.addEventListener("click", async () => {
    console.log("click");
    const roomId = await createRoom();
    window.location.href = `room.html?roomID=${roomId}`;
  });
}
async function appendRooms() {
  const container = document.getElementById("rooms");
  const q = await getHistoriesRoom();
  q.forEach((doc) => {
    const data = doc.data();
    console.log(doc.id, " => ", doc.data(), data.name);
    const link = document.createElement("a");
    link.textContent = data.name;
    link.href = `room.html?roomID=${doc.id}`;
    link.classList.add("rooms-link");
    container.appendChild(link);
  });
}
function showCurrentUser() {
  const auth = getAuth();
  const container = document.getElementById("show-user");
  const text = document.createElement("p");
  text.innerText = `Current User : ${auth.currentUser.email}`;
  container.appendChild(text);
}
requireAuth().then(() => {
  setupEventListeners();
  appendRooms();
  showCurrentUser();
});
