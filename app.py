import google.generativeai as genai

API_KEY ="AIzaSyCtPyrLIwKrCcfmysljeDKKmKHlrIY8y5Y"
genai.configure(api_key=API_KEY)

model = genai.GenerativeModel("gemini-2.5-flash")

chat = model.start_chat()

response = chat.send_message("Hello!! How are you?")
print("Gemini:", response.text)

print("Chat with Gemini!! Type 'exit' to end the chat.")
while True:
    user_input = input("You: ")
    if user_input.lower() == 'exit':
        print("Ending the chat. Goodbye!")
        break
    response = chat.send_message(user_input)
    print("Gemini:", response.text)