using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using System;

public class DatabaseManager : MonoBehaviour
{
    private const string baseUrl = "http://localhost:3030/api";

    public IEnumerator ValidateLogin(LoginData loginData, Action<bool, int, LoginData> callback)
    {
        string url = $"{baseUrl}/player/validate";

        string jsonBody = JsonUtility.ToJson(loginData);

        UnityWebRequest request = new UnityWebRequest(url, "POST")
        {
            uploadHandler = new UploadHandlerRaw(System.Text.Encoding.UTF8.GetBytes(jsonBody)),
            downloadHandler = new DownloadHandlerBuffer()
        };
        request.SetRequestHeader("Content-Type", "application/json");

        yield return request.SendWebRequest();

        if (request.result == UnityWebRequest.Result.Success)
        {
            string responseText = request.downloadHandler.text;
            try
            {
                var response = JsonUtility.FromJson<PlayerLoginResponse>(responseText);
                int playerId = response.playerId;

                Debug.Log("Login successful! Player ID: " + playerId);
                callback(true, playerId, loginData);
            }
            catch (Exception e)
            { 
                Debug.LogError("Failed to parse response: " + e.Message);
                callback(false, -1, loginData);
            }
        }
        else
        {
            Debug.LogError("Login failed: " + request.error);
            callback(false, -1, loginData);
        } 
    }

    [System.Serializable]
    public class PlayerLoginResponse
    {
        public int playerId;
    }
}
