using UnityEngine;
using System.Collections;

public class LoginManager : MonoBehaviour
{
    private DatabaseManager databaseManager;
    private LoginUIManager loginUIManager;

    void Start()
    {
        databaseManager = FindObjectOfType<DatabaseManager>();
        loginUIManager = FindObjectOfType<LoginUIManager>();

        if (databaseManager == null)
        {
            Debug.LogError("DatabaseManager not found in the scene!");
        }

        if (loginUIManager == null)
        {
            Debug.LogError("LoginUIManager not found in the scene!");
        }
    }

    public IEnumerator LoginPlayer(LoginData loginData)
    {
        if (databaseManager == null)
        {
            loginUIManager.UpdateLoginStatus(false, "DatabaseManager is missing!");
            yield break;
        }

        yield return StartCoroutine(databaseManager.ValidateLogin(loginData, OnLoginComplete));
    }

    private void OnLoginComplete(bool success, int playerId, LoginData loginData)
    {
        if (success)
        {
            loginUIManager.UpdateLoginStatus(true, "Successful.");

            WebSocketConnection webSocketConnection = FindObjectOfType<WebSocketConnection>();
            webSocketConnection.StartWebSocketConnection(playerId, loginData);
        }
        else
        {
            loginUIManager.UpdateLoginStatus(false, "Invalid credentials.");
        }
    }
}
