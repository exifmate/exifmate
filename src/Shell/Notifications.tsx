import type { UnlistenFn } from '@tauri-apps/api/event';
import { useEffect, useState } from 'react';
import { type Notification, onNotification } from '../core/events';

function Notifications() {
  const [notifications, setNotifications] = useState<Map<number, Notification>>(
    new Map(),
  );

  useEffect(() => {
    let unlisten: UnlistenFn | undefined;
    let counter = 0;

    onNotification((notification) => {
      const id = counter++;
      setNotifications((prev) => new Map(prev.set(id, notification)));

      setTimeout(() => {
        setNotifications((prev) => {
          const newList = new Map(prev);
          newList.delete(id);
          return newList;
        });
      }, 5_000);
    }).then((newUnlisten) => {
      unlisten = newUnlisten;
    });

    return () => {
      unlisten?.();
    };
  }, []);

  return (
    <div className="toast toast-center">
      {Array.from(notifications.entries()).map((n) => (
        <div key={n[0]} className={`alert alert-${n[1].level}`} role="alert">
          <span>{n[1].message}</span>
        </div>
      ))}
    </div>
  );
}

export default Notifications;
