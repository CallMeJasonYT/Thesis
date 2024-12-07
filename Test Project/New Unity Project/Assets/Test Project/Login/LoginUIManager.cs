using UnityEngine;
using UnityEngine.UI;
using System;

public class LoginUIManager : MonoBehaviour
{
    private Canvas canvas;
    private GameObject loginPanel;
    private InputField usernameInput;
    private InputField passwordInput;
    private Button loginButton;
    private Text statusText;
    private LoginManager loginManager;

    void Start()
    {
        canvas = new GameObject("Canvas").AddComponent<Canvas>();
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;
        
        canvas.gameObject.AddComponent<CanvasScaler>();
        canvas.gameObject.AddComponent<GraphicRaycaster>();

        CreateLoginPanel();

        loginManager = FindObjectOfType<LoginManager>();
    }

    private void CreateLoginPanel()
    {
        loginPanel = new GameObject("LoginPanel");
        loginPanel.transform.SetParent(canvas.transform);

        RectTransform panelRect = loginPanel.AddComponent<RectTransform>();
        panelRect.sizeDelta = new Vector2(400, 400);
        panelRect.anchoredPosition = Vector2.zero;
        panelRect.localScale = Vector3.one;

        Image panelImage = loginPanel.AddComponent<Image>();
        panelImage.color = new Color(0.2f, 0.2f, 0.2f, 0.8f);

        usernameInput = CreateInputField("Username");
        usernameInput.transform.SetParent(loginPanel.transform);
        usernameInput.transform.localPosition = new Vector3(0, 100, 0);

        passwordInput = CreateInputField("Password");
        passwordInput.transform.SetParent(loginPanel.transform);
        passwordInput.transform.localPosition = new Vector3(0, 50, 0);
        passwordInput.contentType = InputField.ContentType.Password;

        loginButton = CreateButton("Login");
        loginButton.transform.SetParent(loginPanel.transform);
        loginButton.transform.localPosition = new Vector3(0, -50, 0);
        loginButton.onClick.AddListener(OnLoginButtonClicked);

        statusText = CreateText("Please enter your credentials");
        statusText.transform.SetParent(loginPanel.transform);
        statusText.transform.localPosition = new Vector3(0, -100, 0);
        statusText.alignment = TextAnchor.MiddleCenter;
    }


    private InputField CreateInputField(string placeholderText)
    {
        GameObject inputFieldObject = new GameObject(placeholderText + "InputField");
        InputField inputField = inputFieldObject.AddComponent<InputField>();
        RectTransform rectTransform = inputFieldObject.AddComponent<RectTransform>();
        rectTransform.sizeDelta = new Vector2(300, 30);

        GameObject textObject = new GameObject("Text");
        Text text = textObject.AddComponent<Text>();
        text.text = "";
        text.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
        text.color = Color.black;
        text.alignment = TextAnchor.MiddleLeft;
        textObject.transform.SetParent(inputFieldObject.transform);
        inputField.textComponent = text;

        GameObject placeholderObject = new GameObject("Placeholder");
        Text placeholderTextComponent = placeholderObject.AddComponent<Text>();
        placeholderTextComponent.text = placeholderText;
        placeholderTextComponent.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
        placeholderTextComponent.color = Color.gray;
        placeholderTextComponent.alignment = TextAnchor.MiddleLeft;
        placeholderObject.transform.SetParent(inputFieldObject.transform);
        inputField.placeholder = placeholderTextComponent;

        return inputField;
    }

    private Button CreateButton(string buttonText)
    {
        GameObject buttonObject = new GameObject(buttonText + "Button");
        Button button = buttonObject.AddComponent<Button>();
        RectTransform rectTransform = buttonObject.AddComponent<RectTransform>();
        rectTransform.sizeDelta = new Vector2(300, 50);

        GameObject textObject = new GameObject("Text");
        Text text = textObject.AddComponent<Text>();
        text.text = buttonText;
        text.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
        text.color = Color.white;
        text.alignment = TextAnchor.MiddleCenter;
        textObject.transform.SetParent(buttonObject.transform);
        
        return button;
    }

    private Text CreateText(string textContent)
    {
        GameObject textObject = new GameObject("Text");
        Text text = textObject.AddComponent<Text>();
        text.text = textContent;
        text.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
        text.color = Color.white;
        RectTransform rectTransform = textObject.GetComponent<RectTransform>();
        rectTransform.sizeDelta = new Vector2(300, 30);
        return text;
    }

    private void OnLoginButtonClicked()
    {
        string username = usernameInput.text;
        string password = passwordInput.text;

        if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password))
        {
            LoginData loginData = new LoginData(username, password);
            StartCoroutine(loginManager.LoginPlayer(loginData));
        }
        else
        {
            statusText.text = "Please enter both username and password!";
            statusText.color = Color.red;
        }
    }

    public void UpdateLoginStatus(bool success, string message)
    {
        if (success)
        {
            statusText.text = "Login Successful!";
            statusText.color = Color.green;
        }
        else
        {
            statusText.text = "Login Failed: " + message;
            statusText.color = Color.red;
        }
    }
}
