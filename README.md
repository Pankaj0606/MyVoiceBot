# My Personal Voice Bot Documentation
## Project Overview
This project is a personal voice bot that allows users to interact with a digital persona using voice or text input. The bot leverages the Google Gemini API (via a Netlify serverless function) to generate responses based on a predefined personal profile. The application is built with HTML, CSS, and JavaScript, and deployed on Netlify.

**Key Features:**
*   **Voice Interaction:** Users can speak to the bot using their microphone.
*   **Text Input:** Users can type questions or statements.
*   **Personalized Responses:** The bot responds as if it were the person described in the `personalData` object within the Netlify function.
*   **Chat History:** The application stores and displays the conversation history.
*   **Mute Functionality:** Users can mute the bot's audio output.
*   **Chat Session Management:** Users can create new chats, load previous chats, and delete chats.

**Supported Platforms/Requirements:**
*   Modern web browsers with Speech Recognition API support (e.g., Chrome, Edge).
*   A Netlify account for deployment.
*   A Google API key with access to the Gemini API.
## Getting Started
### Installation/Setup Instructions
1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```
    
2.  **Install Netlify CLI:**
    ```bash
    npm install -g netlify-cli
    ```
    
3.  **Configure Environment Variables:**
    *   Create a `.env` file in the root directory of the project.
    *   Add your Google API key to the `.env` file:
                GOOGLE_API_KEY=<your_google_api_key>
        
4.  **Deploy to Netlify:**
    *   Log in to Netlify:
        ```bash
        netlify login
        ```
        
    *   Deploy the project:
        ```bash
        netlify deploy --prod
        ```
        
    *   Alternatively, you can link the project to a Netlify site using the Netlify UI and then push your code to the linked Git repository.
5.  **Local Development (Optional):**
    *   Run the Netlify development server:
        ```bash
        netlify dev
        ```
        
    *   This will start a local server at `http://localhost:8888`.
### Dependencies/Prerequisites
*   **Node.js and npm:** Required for installing Netlify CLI and running the development server.
*   **Netlify CLI:** Used for deploying the project to Netlify.
*   **Google Gemini API:** The API used to generate responses.
*   **Web Browser with Speech Recognition API:** Required for voice interaction functionality.
## Code Structure
The project is organized as follows:
*   **`.gitignore`:** Specifies intentionally untracked files that Git should ignore.
*   **`index.html`:** The main HTML file containing the structure of the web application.
*   **`netlify.toml`:** Configuration file for Netlify, specifying build settings and function directories.
*   **`package.json`:** Contains metadata about the project and lists dependencies.
*   **`script.js`:** JavaScript file containing the application logic.
*   **`style.css`:** CSS file containing the styling for the web application.
*   **`netlify/functions/get-bot-response.js`:** Netlify serverless function that handles the API request to Google Gemini.

**Key Components:**
*   **`index.html`:** Defines the user interface, including the chat log, input fields, and buttons.
*   **`script.js`:** Handles user interactions, manages the chat history, interacts with the Speech Recognition API, and calls the Netlify function to get bot responses.
*   **`netlify/functions/get-bot-response.js`:** Receives user input from the client, constructs a prompt including the persona information and chat history, sends the prompt to the Google Gemini API, and returns the generated response to the client.

## API Documentation
The project uses a single API endpoint implemented as a Netlify serverless function.

**Endpoint:** `/.netlify/functions/get-bot-response`

**Method:** `POST`

**Input:**
*   **Headers:** `Content-Type: application/json`
*   **Body:** JSON object with the following structure:
    ```json
    {
      "history": [
        {
          "role": "user",
          "parts": [
            {
              "text": "What is your superpower?"
            }
          ]
        },
        {
          "role": "model",
          "parts": [
            {
              "text": "My superpower is consistency."
            }
          ]
        }
      ]
    }
    ```
    
    *   `history`: An array of objects representing the conversation history. Each object has a `role` (either "user" or "model") and a `parts` array containing a `text` field with the message content.

**Output:**
*   **Headers:** `Content-Type: application/json`
*   **Body:** JSON object with the following structure:
    ```json
    {
      "text": "I consistently show up every day, keep improving bit by bit, and stay focused on long-term growth."
    }
    ```
    
    *   `text`: The bot's response to the user's input.

**Example API Request:**
```javascript
fetch('/.netlify/functions/get-bot-response', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history: [{ role: 'user', parts: [{ text: 'What is your superpower?' }] }] })
})
.then(response => response.json())
.then(data => console.log(data.text));
```

**Example API Response:**
```json
{
  "text": "My superpower is consistency. I show up every day, keep improving bit by bit, and stay focused on long-term growth."
}
```
