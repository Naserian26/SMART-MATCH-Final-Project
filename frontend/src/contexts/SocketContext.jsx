// frontend/src/contexts/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(process.env.REACT_APP_API_URL, {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      // Connection events
      newSocket.on('connect', () => {
        console.log('Connected to server');
        setConnectionStatus('connected');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setConnectionStatus('disconnected');
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setConnectionStatus('error');
      });

      // Custom events
      newSocket.on('online_users', (users) => {
        setOnlineUsers(users);
      });

      newSocket.on('receive_message', (message) => {
        // This event will be handled in the Chat component
        // We'll emit a custom event that the Chat component can listen to
        newSocket.emit('new_message_received', message);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setConnectionStatus('disconnected');
      };
    }
  }, [user]);

  const value = {
    socket,
    onlineUsers,
    connectionStatus
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}