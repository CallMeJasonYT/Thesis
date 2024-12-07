using System;
using System.Text;
using System.Threading.Tasks;
using NativeWebSocket;
using UnityEngine;

public class WebSocketConnection : MonoBehaviour
{
    private static WebSocketConnection instance;
    public static WebSocketConnection Instance
    {
        get
        {
            if (instance == null)
            {
                instance = FindObjectOfType<WebSocketConnection>();
                if (instance == null)
                {
                    GameObject obj = new GameObject("WebSocketConnection");
                    instance = obj.AddComponent<WebSocketConnection>();
                }
            }
            return instance;
        }
    }

    private WebSocket ws;
    private string playerUsername;
    private int playerId;
    private bool hasSentGameLaunchEvent = false;

    private void Awake()
    {
        if (instance != null && instance != this)
        {
            Destroy(gameObject);
        }
        else
        {
            instance = this;
            DontDestroyOnLoad(gameObject);
        }
    }

    public async void StartWebSocketConnection(int Id, LoginData loginData)
    {
        playerId = Id;
        playerUsername = loginData.username;
        if (ws == null || ws.State != WebSocketState.Open)
        {
            await InitializeWebSocket();
        }
    }

    public async Task InitializeWebSocket()
    {
        ws = new WebSocket("ws://localhost:8080");

        ws.OnOpen += () =>
        {
            Debug.Log("WebSocket Opened");
            SendGameLaunchEvent();
        };

        ws.OnError += (e) =>
        {
            Debug.LogError("WebSocket Error: " + e);
        };

        ws.OnClose += (e) =>
        {
            Debug.Log("WebSocket Closed: " + e);
        };

        ws.OnMessage += (bytes) =>
        {
            /*string message = Encoding.UTF8.GetString(bytes);
            Debug.Log("Message received from server: " + message);

            try
            {
                MovementData receivedMovementData = JsonUtility.FromJson<MovementData>(message);
                PlayerController player = FindObjectOfType<PlayerController>();
                if (player != null)
                {
                    player.TeleportToPosition(receivedMovementData.position);
                }
            }
            catch (Exception ex)
            {
                Debug.LogError("Error deserializing MovementData: " + ex.Message);
            }*/
        };

        await ws.Connect();
    }

    private async void SendGameLaunchEvent()
    {
        if (hasSentGameLaunchEvent) return;

        hasSentGameLaunchEvent = true;

        var launchEvent = new GameEvent
        {
            eventType = "playerConnect",
            username = playerUsername,
            playerId = playerId,
            timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
        };

        string launchMessage = JsonUtility.ToJson(launchEvent);
        byte[] encodedMessage = Encoding.UTF8.GetBytes(launchMessage);
        await ws.Send(encodedMessage);
    }

    public async void SendMovementData(MovementData moveData)
    {
        if (ws != null && ws.State == WebSocketState.Open)
        {
            string jsonData = JsonUtility.ToJson(moveData);
            byte[] encodedMessage = Encoding.UTF8.GetBytes(jsonData);

            await ws.Send(encodedMessage);
        }
    }

    private async void SendGameQuitEvent()
    {
        var quitEvent = new GameEvent
        {
            eventType = "playerDisconnect",
            username = playerUsername,
            playerId = playerId,
            timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
        };

        string quitMessage = JsonUtility.ToJson(quitEvent);
        byte[] encodedMessage = Encoding.UTF8.GetBytes(quitMessage);
        await ws.Send(encodedMessage);
    }

    private void Update()
    {
        if (ws != null)
        {
            ws.DispatchMessageQueue();
        }
    }

    private async void OnApplicationQuit()
    {
        if (ws != null)
        {
            SendGameQuitEvent(); // Send quit event before closing
            await ws.Close();
        }
    }

    [Serializable]
    public class GameEvent
    {
        public string eventType;
        public int playerId;
        public string username;
        public string timestamp;
    }
}
