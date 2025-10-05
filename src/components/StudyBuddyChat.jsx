import React, { useState, useEffect, useRef } from 'react'
import { studyBuddyService } from '../services/studyBuddyService'

// Simple icon components using Unicode
const MessageCircleIcon = () => <span>💬</span>
const SendIcon = () => <span>📤</span>
const BotIcon = () => <span>🤖</span>
const UserIcon = () => <span>👤</span>
const LightbulbIcon = () => <span>💡</span>
const BookOpenIcon = () => <span>📖</span>
const ClockIcon = () => <span>🕒</span>
const Trash2Icon = () => <span>🗑️</span>

const StudyBuddyChat = ({ isFloating = false, onClose = null, quizContext = null }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showQuickPrompts, setShowQuickPrompts] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    loadConversationHistory()
    loadStudySuggestions()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadConversationHistory = async () => {
    const { data, error } = await studyBuddyService.getConversationHistory(10)
    if (!error && data) {
      const formattedMessages = data.flatMap(conv => [
        {
          id: `user-${conv.id}`,
          text: conv.user_message,
          sender: 'user',
          timestamp: new Date(conv.created_at)
        },
        {
          id: `ai-${conv.id}`,
          text: conv.ai_response,
          sender: 'ai',
          timestamp: new Date(conv.created_at)
        }
      ])
      setMessages(formattedMessages)
      setShowQuickPrompts(formattedMessages.length === 0)
    }
  }

  const loadStudySuggestions = async () => {
    if (messages.length === 0) {
      const { data, error } = await studyBuddyService.getStudySuggestions()
      if (!error && data && Array.isArray(data)) {
        const suggestionMessage = {
          id: 'welcome',
          text: data.join('\n\n'),
          sender: 'ai',
          timestamp: new Date(),
          isWelcome: true
        }
        setMessages([suggestionMessage])
      }
    }
  }

  const sendMessage = async (messageText = null) => {
    const text = messageText || newMessage.trim()
    if (!text) return

    const userMessage = {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage('')
    setIsLoading(true)
    setIsTyping(true)
    setShowQuickPrompts(false)

    try {
      const context = quizContext ? studyBuddyService.generateStudyContext(quizContext) : null
      const { data, error } = await studyBuddyService.sendMessage(text, context)

      if (error) {
        throw new Error(error)
      }

      const aiMessage = {
        id: Date.now() + 1,
        text: data.response || 'I apologize, but I encountered an issue. Please try asking your question again.',
        sender: 'ai',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])

      // Save conversation to database
      await studyBuddyService.saveConversation(text, aiMessage.text, context)

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please check your connection and try again.',
        sender: 'ai',
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  const clearHistory = async () => {
    const { error } = await studyBuddyService.clearHistory()
    if (!error) {
      setMessages([])
      setShowQuickPrompts(true)
      loadStudySuggestions()
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const QuickPrompts = () => {
    const prompts = studyBuddyService.getQuickPrompts()
    
    return (
      <div className="p-4 border-b border-gray-200/20">
        <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
          <LightbulbIcon />
          Quick Start Prompts
        </h3>
        <div className="space-y-3">
          {prompts.map((category, idx) => (
            <div key={idx}>
              <p className="text-xs text-gray-400 mb-2">{category.category}</p>
              <div className="flex flex-wrap gap-2">
                {category.prompts.map((prompt, promptIdx) => (
                  <button
                    key={promptIdx}
                    onClick={() => sendMessage(prompt)}
                    className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const chatClasses = isFloating 
    ? "fixed bottom-4 right-4 w-96 h-96 bg-black/30 backdrop-blur-lg border border-gray-200/20 rounded-2xl shadow-2xl z-50"
    : "bg-black/30 backdrop-blur-lg border border-gray-200/20 rounded-2xl h-full max-h-[600px]"

  return (
    <div className={chatClasses}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <BotIcon />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Study Buddy</h3>
            <p className="text-xs text-gray-400">
              {isTyping ? 'Typing...' : 'Ready to help you study!'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearHistory}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            title="Clear conversation"
          >
            <Trash2Icon />
          </button>
          {isFloating && onClose && (
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-80">
        {showQuickPrompts && <QuickPrompts />}
        
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {message.sender === 'ai' && (
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <BotIcon />
              </div>
            )}
            
            <div className={`max-w-[80%] ${
              message.sender === 'user' 
                ? 'bg-blue-600/90 text-white' 
                : message.isWelcome 
                  ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-blue-100 border border-blue-400/30'
                  : message.isError
                    ? 'bg-red-600/20 text-red-200 border border-red-400/30'
                    : 'bg-gray-700/90 text-gray-100'
            } rounded-2xl px-4 py-2`}>
              <div className="text-sm whitespace-pre-wrap">{message.text}</div>
              <div className="text-xs opacity-60 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {message.sender === 'user' && (
              <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <UserIcon />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <BotIcon />
            </div>
            <div className="bg-gray-700/90 text-gray-100 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200/20">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your studies..."
            className="flex-1 bg-gray-800/50 text-white placeholder-gray-400 border border-gray-600/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
            rows="1"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white p-2 rounded-xl transition-colors flex items-center justify-center"
          >
            <SendIcon />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}

export default StudyBuddyChat