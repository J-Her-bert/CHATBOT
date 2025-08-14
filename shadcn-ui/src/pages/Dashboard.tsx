import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { LogOut, Send, Bot, User, Loader2 } from 'lucide-react'
import { mockDb } from '@/lib/mockDatabase'
import { toast } from 'sonner'

interface Message {
  id: string
  message: string
  response: string
  created_at: string
  isUser: boolean
  content: string
}

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<{
    id: string;
    user_id: string;
    message: string;
    response: string;
    created_at: string;
  }[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    loadChatHistory()
  }, [user])

  const loadChatHistory = async () => {
    if (!user) return

    try {
      const { data, error } = await mockDb.getMessagesByUser(user.id)

      if (error) throw error

      if (data) {
        setChatHistory(data)
        // Convert to message format for display
        const formattedMessages: Message[] = []
        data.forEach((item) => {
          formattedMessages.push({
            id: `${item.id}-user`,
            message: item.message,
            response: '',
            created_at: item.created_at,
            isUser: true,
            content: item.message
          })
          formattedMessages.push({
            id: `${item.id}-bot`,
            message: '',
            response: item.response,
            created_at: item.created_at,
            isUser: false,
            content: item.response
          })
        })
        setMessages(formattedMessages)
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
    }
  }

  // Generate AI-like responses based on the user query
  const generateAIResponse = async (query: string): Promise<string> => {
    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 1500))

    const lowerQuery = query.toLowerCase()

    // Define response patterns for different types of questions
    if (lowerQuery.includes('president') && lowerQuery.includes('kenya')) {
      return `The current President of Kenya is William Ruto, who took office on September 13, 2022. He won the 2022 presidential election and is Kenya's fifth president since independence. Prior to becoming president, Ruto served as Deputy President under Uhuru Kenyatta from 2013 to 2022.`
    }

    if (lowerQuery.includes('capital') && lowerQuery.includes('kenya')) {
      return `The capital city of Kenya is Nairobi. It's also the largest city in Kenya and serves as the country's economic, political, and cultural center. Nairobi is located in the south-central part of Kenya and has a population of over 4 million people.`
    }

    if (lowerQuery.includes('weather') || lowerQuery.includes('temperature')) {
      return `I don't have access to real-time weather data, but I can help you with general weather information. For current weather conditions, I recommend checking a reliable weather service like Weather.com, AccuWeather, or your local weather app for the most accurate and up-to-date information.`
    }

    if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
      return `Hello! I'm your AI assistant. I'm here to help answer your questions and provide information on a wide range of topics. What would you like to know today?`
    }

    if (lowerQuery.includes('who are you') || lowerQuery.includes('what are you')) {
      return `I'm an AI Search Chatbot designed to help answer your questions and provide information. I can assist with general knowledge, facts, explanations, and various topics. How can I help you today?`
    }

    if (lowerQuery.includes('time') || lowerQuery.includes('date')) {
      const now = new Date()
      return `The current date and time is: ${now.toLocaleString()}. Please note that this is based on your local system time.`
    }

    if (lowerQuery.includes('thank') || lowerQuery.includes('thanks')) {
      return `You're welcome! I'm glad I could help. If you have any other questions, feel free to ask!`
    }

    // General knowledge responses
    if (lowerQuery.includes('python') && lowerQuery.includes('programming')) {
      return `Python is a high-level, interpreted programming language known for its simplicity and readability. It was created by Guido van Rossum and first released in 1991. Python is widely used for web development, data science, artificial intelligence, automation, and many other applications. Its clean syntax makes it an excellent language for beginners.`
    }

    if (lowerQuery.includes('ai') || lowerQuery.includes('artificial intelligence')) {
      return `Artificial Intelligence (AI) refers to the simulation of human intelligence in machines that are programmed to think and learn like humans. AI systems can perform tasks such as visual perception, speech recognition, decision-making, and language translation. Common AI applications include virtual assistants, recommendation systems, autonomous vehicles, and machine learning algorithms.`
    }

    // Default response for queries we don't have specific answers for
    return `I understand you're asking about "${query}". While I don't have specific real-time information about this topic, I'd be happy to help with general information or guide you to reliable sources. Could you provide more details about what specific aspect you'd like to know about?`
  }



  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setLoading(true)

    // Add user message to UI immediately
    const userMsgId = Date.now().toString()
    const newUserMessage: Message = {
      id: userMsgId,
      message: userMessage,
      response: '',
      created_at: new Date().toISOString(),
      isUser: true,
      content: userMessage
    }

    setMessages(prev => [...prev, newUserMessage])

    try {
      // Get AI response
      const aiResponse = await generateAIResponse(userMessage)

      // Add bot response to UI
      const botMessage: Message = {
        id: `${userMsgId}-bot`,
        message: '',
        response: aiResponse,
        created_at: new Date().toISOString(),
        isUser: false,
        content: aiResponse
      }

      setMessages(prev => [...prev, botMessage])

      // Save to database
      if (user) {
        const { error } = await mockDb.insertMessage(user.id, userMessage, aiResponse)

        if (error) {
          console.error('Error saving message:', error)
          toast.error('Failed to save message to history')
        }
      }
    } catch (error) {
      console.error('Error getting AI response:', error)
      toast.error('Failed to get response. Please try again.')
      
      // Add error message
      const errorMessage: Message = {
        id: `${userMsgId}-error`,
        message: '',
        response: "I'm sorry, I encountered an error while processing your request. Please try again.",
        created_at: new Date().toISOString(),
        isUser: false,
        content: "I'm sorry, I encountered an error while processing your request. Please try again."
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Error signing out')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Bot className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">AI Search Chatbot</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600">{user?.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-4rem)]">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle className="text-center">Chat with AI Search Assistant</CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Ask me anything! I'll search multiple engines to give you the best answers.
            </p>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages Area */}
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-4 pb-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Welcome! Start a conversation by typing a message below.
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex max-w-[80%] space-x-3 ${
                          message.isUser ? 'flex-row-reverse space-x-reverse' : ''
                        }`}
                      >
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback>
                            {message.isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            message.isUser
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <Separator />
            
            {/* Input Area */}
            <div className="p-6">
              <div className="flex space-x-4">
                <Input
                  placeholder="Type your message here..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={loading || !inputMessage.trim()}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}