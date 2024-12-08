class WebSocketManager {
    private websocket: WebSocket;
    private eventTarget: EventTarget;

    constructor(websocketUrl: string) {
        this.websocket = new WebSocket(websocketUrl);
        this.eventTarget = new EventTarget();

        this.websocket.onopen = () => console.log('WebSocket connection opened.');
        this.websocket.onclose = () => console.log('WebSocket connection closed.');
        this.websocket.onerror = (error) => console.error('WebSocket error:', error);
        this.websocket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('WebSocketManager received message:', message);
            const eventName = message.eventType || 'default';        
            const customEvent = new CustomEvent(eventName, { detail: message });
            this.eventTarget.dispatchEvent(customEvent);
        };
        
    }

    send(data: any) {
        if (this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify(data));
        } else {
            console.error('WebSocket is not open. Unable to send message.');
        }
    }

    addEventListener(eventType: string, listener: EventListener) {
        this.eventTarget.addEventListener(eventType, listener);
    }

    removeEventListener(eventType: string, listener: EventListener) {
        this.eventTarget.removeEventListener(eventType, listener);
    }
}

export default WebSocketManager;
