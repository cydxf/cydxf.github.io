// js/wsManager.js
let ws;

function initializeWebSocket(url, onMessage, onError, onClose) {
    ws = new WebSocket(url);

    ws.onopen = () => {
        console.log('WebSocket 连接已建立');
    };

    ws.onmessage = (event) => {
        onMessage(JSON.parse(event.data));
    };

    ws.onerror = (error) => {
        console.error('WebSocket 错误:', error);
        if (onError) onError(error);
    };

    ws.onclose = () => {
        console.log('WebSocket 连接关闭');
        if (onClose) onClose();
        // 尝试重新连接
        setTimeout(() => initializeWebSocket(url, onMessage, onError, onClose), 5000);
    };
}

function sendMessage(message) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    } else {
        console.error('WebSocket 尚未连接');
    }
}

export { initializeWebSocket, sendMessage };
