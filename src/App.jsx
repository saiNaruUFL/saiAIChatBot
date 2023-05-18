import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {MainContainer,ChatContainer,MessageList,Message,MessageInput,TypingIndicator} from "@chatscope/chat-ui-kit-react"
import {PERSONALITY} from './person.js'
import cors from 'cors';

function App() {
  const [typing,setTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello, I am SaiAI. Feel free to ask questions about my skills, experience, and projects as a computer science student!",
      sender: "SaiAI"
    }
  ])

  const handleSend = async(message) => {
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing"
    }

    const newMessages = [...messages,newMessage];
    
    setMessages(newMessages);

    setTyping(true);

    await processMessageToChatGpt(newMessages);
  }

  async function processMessageToChatGpt(chatMessages){
    
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if(messageObject.sender ==- 'SaiAI')
        role = "assistant";
      else
        role = "user";

      return {role: role, content: messageObject.message}
    })

    const systemMessage = {
      role: "system",
      content: PERSONALITY
    }

    const apiRequestBody = {
      "model":"gpt-3.5-turbo",
      messages: [
        systemMessage,
        ...apiMessages
      ]
    }
    
    await fetch("https://api.openai.com/v1/chat/completions",{
    method: "POST",
    headers: {
      "Authorization": "Bearer " + import.meta.env.VITE_REACT_APP_API_KEY,
      "Content-Type" : "application/json"
    },
    body: JSON.stringify(apiRequestBody)
  }).then(response => response.json())
    .then(data => {
      setMessages(
        [...chatMessages,{
          message: data.choices[0].message.content,
          sender: "SaiAI"
        }]
      )

      setTyping(false);
    });
    
  }


  return (
    <>
      <div style={{position:"relative",height: "800px",width: "700px"}}>
        <MainContainer>
          <ChatContainer>
            <MessageList
             scrollBehavior='smooth'  
             typingIndicator={typing ? <TypingIndicator content="SaiAI is typing"/> : null}
             style={{backgroundColor: "#D1D5DB"}}
            >
              {messages.map((message,i) => {
                return <Message key={i} model={message}/>
              })}
            </MessageList>
            <MessageInput placeholder='Type message here' onSend={handleSend}/>
          </ChatContainer>
        </MainContainer>
      </div>
    </>
  )
}

export default App
