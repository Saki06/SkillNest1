import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

let stompClient = null;
let isConnected = false;

export const connectWebSocket = (userId, onMessageReceived) => {
  if (!userId) {
    console.warn("Cannot connect WebSocket: userId is missing.");
    return;
  }

  const socket = new SockJS('http://localhost:8000/chat');
  stompClient = Stomp.over(socket);

  stompClient.connect({}, () => {
    isConnected = true;
    console.log("✅ WebSocket connected for user:", userId);

    // ✅ Subscribe to /queue/messages
    if (stompClient && stompClient.connected) {
      stompClient.subscribe(`/user/${userId}/queue/messages`, (message) => {
        const msg = JSON.parse(message.body);
        onMessageReceived(msg);
      });
    }
  }, (error) => {
    console.error('❌ WebSocket connection error:', error);
    isConnected = false;
  });
};

export const sendIfConnected = (destination, headers = {}, body = {}) => {
  if (stompClient && stompClient.connected) {
    stompClient.send(destination, headers, JSON.stringify(body));
  } else {
    console.warn("⚠️ Cannot send message: WebSocket not connected.");
  }
};

export const disconnectWebSocket = () => {
  if (stompClient && isConnected) {
    stompClient.disconnect(() => {
      console.log("🔌 WebSocket disconnected");
    });
    stompClient = null;
    isConnected = false;
  } else {
    console.warn("⚠️ Cannot disconnect: WebSocket was not connected.");
  }
};

export const isWebSocketConnected = () => {
  return stompClient?.connected || false;
};
