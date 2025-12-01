// frontend/src/pages/Chat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext'; // Fixed: Correct import path
import { useAuth } from '../contexts/AuthContext'; // Added: Import useAuth
import { chatAPI } from '../services/api';
import { toast } from 'react-toastify';

const Chat = () => {
  const { socket, onlineUsers } = useSocket(); // Added: Get onlineUsers from socket context
  const { user } = useAuth(); // Added: Get current user
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(null); // Changed: Store which user is typing
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await chatAPI.getConversations();
        setConversations(response.data.conversations);
        
        if (response.data.conversations.length > 0) {
          setActiveConversation(response.data.conversations[0]._id);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast.error('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      const fetchMessages = async () => {
        try {
          const response = await chatAPI.getMessages(activeConversation);
          setMessages(response.data.messages);
          scrollToBottom();
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };

      fetchMessages();
    }
  }, [activeConversation]);

  useEffect(() => {
    if (socket) {
      // Listen for new messages
      socket.on('receive_message', (message) => {
        if (message.conversationId === activeConversation) {
          setMessages(prev => [...prev, message]);
          scrollToBottom();
        }
        
        // Update conversation list with latest message
        setConversations(prev => prev.map(conv => 
          conv._id === message.conversationId 
            ? { ...conv, lastMessage: message.text, lastMessageTime: message.timestamp }
            : conv
        ));
      });

      // Listen for typing indicators
      socket.on('user_typing', (data) => {
        if (data.conversationId === activeConversation && data.userId !== user._id) {
          setUserTyping(data.userId);
          setTimeout(() => setUserTyping(null), 3000);
        }
      });

      // Listen for new conversations
      socket.on('new_conversation', (conversation) => {
        setConversations(prev => [conversation, ...prev]);
      });

      return () => {
        socket.off('receive_message');
        socket.off('user_typing');
        socket.off('new_conversation');
      };
    }
  }, [socket, activeConversation, user._id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      // Send message via API first
      const response = await chatAPI.sendMessage(activeConversation, newMessage);
      
      // Then emit via socket for real-time updates
      if (socket) {
        socket.emit('send_message', {
          conversationId: activeConversation,
          message: response.data.message
        });
      }
      
      setNewMessage('');
      scrollToBottom();
      
      // Update conversation list with latest message
      setConversations(prev => prev.map(conv => 
        conv._id === activeConversation 
          ? { ...conv, lastMessage: response.data.message.text, lastMessageTime: response.data.message.timestamp }
          : conv
      ));
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleTyping = () => {
    if (socket) {
      socket.emit('typing', { 
        conversationId: activeConversation,
        userId: user._id
      });
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-4 mb-4 mb-lg-0">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Messages</h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {conversations.length > 0 ? (
                  conversations.map(conversation => (
                    <button
                      key={conversation._id}
                      className={`list-group-item list-group-item-action ${activeConversation === conversation._id ? 'active' : ''}`}
                      onClick={() => setActiveConversation(conversation._id)}
                    >
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0 position-relative">
                          <img 
                            src={conversation.participant.avatar || `https://picsum.photos/seed/${conversation.participant._id}/40/40.jpg`} 
                            alt={conversation.participant.name} 
                            className="rounded-circle"
                            width="40"
                            height="40"
                          />
                          {onlineUsers.some(u => u._id === conversation.participant._id) && (
                            <span className="position-absolute bottom-0 end-0 p-1 bg-success border border-white rounded-circle"></span>
                          )}
                        </div>
                        <div className="flex-grow-1 ms-3 text-start">
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">{conversation.participant.name}</h6>
                            <small className="text-muted">{formatDate(conversation.lastMessageTime)}</small>
                          </div>
                          <p className="mb-0 text-truncate small text-muted">
                            {conversation.lastMessage || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-chat-dots fs-1 text-muted"></i>
                    <p className="mt-2 text-muted">No conversations yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-lg-8">
          {activeConversation ? (
            <div className="card shadow-sm h-100">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0 position-relative">
                    <img 
                      src={conversations.find(c => c._id === activeConversation)?.participant.avatar || `https://picsum.photos/seed/${activeConversation}/40/40.jpg`} 
                      alt="User" 
                      className="rounded-circle me-3"
                      width="40"
                      height="40"
                    />
                    {onlineUsers.some(u => u._id === conversations.find(c => c._id === activeConversation)?.participant._id) && (
                      <span className="position-absolute bottom-0 end-0 p-1 bg-success border border-white rounded-circle"></span>
                    )}
                  </div>
                  <div>
                    <h5 className="mb-0">
                      {conversations.find(c => c._id === activeConversation)?.participant.name}
                    </h5>
                    <small className="text-muted">
                      {onlineUsers.some(u => u._id === conversations.find(c => c._id === activeConversation)?.participant._id) 
                        ? 'Online' 
                        : 'Offline'
                      }
                    </small>
                  </div>
                </div>
                <div className="dropdown">
                  <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                    <i className="bi bi-three-dots"></i>
                  </button>
                  <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    <li><a className="dropdown-item" href="#">View Profile</a></li>
                    <li><a className="dropdown-item" href="#">Search in Conversation</a></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><a className="dropdown-item text-danger" href="#">Delete Conversation</a></li>
                  </ul>
                </div>
              </div>
              
              <div className="card-body p-0" style={{ height: '400px', overflowY: 'auto' }}>
                <div className="p-3">
                  {messages.length > 0 ? (
                    <div className="chat-messages">
                      {messages.map((message, index) => (
                        <div 
                          key={index} 
                          className={`d-flex mb-3 ${message.sender === user._id ? 'justify-content-end' : ''}`}
                        >
                          {message.sender !== user._id && (
                            <div className="flex-shrink-0">
                              <img 
                                src={conversations.find(c => c._id === activeConversation)?.participant.avatar || `https://picsum.photos/seed/${activeConversation}/30/30.jpg`} 
                                alt="User" 
                                className="rounded-circle"
                                width="30"
                                height="30"
                              />
                            </div>
                          )}
                          <div className={`flex-grow-1 ${message.sender === user._id ? 'ms-2' : 'ms-2'}`}>
                            <div className={`p-2 rounded ${message.sender === user._id ? 'bg-primary text-white' : 'bg-light'}`}>
                              {message.text}
                            </div>
                            <div className={`small text-muted mt-1 ${message.sender === user._id ? 'text-end' : ''}`}>
                              {formatTime(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))}
                      {userTyping && (
                        <div className="d-flex mb-3">
                          <div className="flex-shrink-0">
                            <img 
                              src={conversations.find(c => c._id === activeConversation)?.participant.avatar || `https://picsum.photos/seed/${activeConversation}/30/30.jpg`} 
                              alt="User" 
                              className="rounded-circle"
                              width="30"
                              height="30"
                            />
                          </div>
                          <div className="flex-grow-1 ms-2">
                            <div className="p-2 rounded bg-light">
                              <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <i className="bi bi-chat-dots fs-1 text-muted"></i>
                      <p className="mt-2 text-muted">No messages yet. Start a conversation!</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="card-footer bg-white">
                <form onSubmit={handleSendMessage}>
                  <div className="input-group">
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      ref={inputRef}
                    />
                    <button className="btn btn-primary" type="submit">
                      <i className="bi bi-send"></i>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="card shadow-sm h-100">
              <div className="card-body d-flex align-items-center justify-content-center">
                <div className="text-center">
                  <i className="bi bi-chat-dots fs-1 text-muted"></i>
                  <p className="mt-2 text-muted">Select a conversation to start messaging</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;