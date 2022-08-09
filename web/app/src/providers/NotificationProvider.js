import React, { forwardRef, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';

export const NotificationContext = React.createContext(null);

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const createNotification = useCallback(
    (message, severity, timeout = 5000) => {
      setNotifications([{ message, severity, timeout }, ...notifications]);
    },
    [notifications]
  );

  const displayedNotification = notifications[notifications.length - 1];

  return (
    <NotificationContext.Provider value={{ createNotification, notifications }}>
      <Snackbar
        open={!!displayedNotification}
        onClose={() => {
          notifications.splice(0, 1);
          setNotifications([...notifications]);
        }}
        autoHideDuration={displayedNotification?.timeout}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {displayedNotification ? (
          <Alert severity={displayedNotification.severity}>
            {displayedNotification.message}
          </Alert>
        ) : null}
      </Snackbar>
      {children}
    </NotificationContext.Provider>
  );
};

export const withNotification = (cls) => {
  const Wrapper = forwardRef((props, ref) => {
    const context = useContext(NotificationContext);

    return cls({ ...props, ...context, ref });
  });
  Wrapper.displayName = cls.displayName;

  return Wrapper;
};

export default NotificationProvider;
