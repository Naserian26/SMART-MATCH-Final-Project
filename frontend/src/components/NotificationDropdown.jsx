// frontend/src/components/NotificationDropdown.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Fetch notifications
    // This would be replaced with an actual API call
    const mockNotifications = [
      { id: 1, text: 'Your application for Senior Developer was viewed', read: false, date: '2 hours ago' },
      { id: 2, text: 'New job matching your profile: React Developer', read: false, date: '5 hours ago' },
      { id: 3, text: 'You have a new message from TechCorp', read: true, date: '1 day ago' },
    ];
    
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="dropdown" ref={dropdownRef}>
      <button 
        className="btn btn-link nav-link position-relative text-white" 
        type="button" 
        id="notificationDropdown" 
        data-bs-toggle="dropdown" 
        aria-expanded="false"
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className="bi bi-bell-fill"></i>
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount}
          </span>
        )}
      </button>
      
      <ul className={`dropdown-menu dropdown-menu-end notification-dropdown ${isOpen ? 'show' : ''}`} aria-labelledby="notificationDropdown" style={{ width: '300px' }}>
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
          <h6 className="mb-0">Notifications</h6>
          {unreadCount > 0 && (
            <button className="btn btn-sm btn-link text-primary p-0" onClick={markAllAsRead}>
              Mark all as read
            </button>
          )}
        </div>
        
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <li key={notification.id} className={`notification-item ${!notification.read ? 'unread' : ''}`}>
                <div className="dropdown-item" onClick={() => markAsRead(notification.id)}>
                  <div className="d-flex">
                    <div className="flex-grow-1">
                      <p className="mb-1">{notification.text}</p>
                      <small className="text-muted">{notification.date}</small>
                    </div>
                    {!notification.read && (
                      <div className="ms-2">
                        <span className="badge bg-primary rounded-pill">New</span>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="p-3 text-center text-muted">
              No notifications
            </li>
          )}
        </div>
        
        <div className="p-2 border-top text-center">
          <Link to="/notifications" className="btn btn-sm btn-outline-primary w-100">
            View all notifications
          </Link>
        </div>
      </ul>
    </div>
  );
};

export default NotificationDropdown;