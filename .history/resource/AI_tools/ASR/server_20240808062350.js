const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 5501 });

wss.on('connection', (ws) => {
    console.log('WebSocket 连接已建立');

    ws.on('message', (message) => {
        console.log('收到消息:', message);
        const data = JSON.parse(message);

        if (data.command === 'start') {
            // 模拟读取文件操作
            try {
                // 在这里处理文件
                console.log('开始处理文件:', data.file);
                // 模拟文件处理结果
                ws.send(JSON.stringify({ progress: 50, text: '识别结果' }));
            } catch (error) {
                console.error('读取文件失败:', error);
                ws.send(JSON.stringify({ error: '读取文件失败' }));
            }
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket 错误:', error);
    });

    ws.on('close', () => {
        console.log('WebSocket 连接关闭');
    });
});
