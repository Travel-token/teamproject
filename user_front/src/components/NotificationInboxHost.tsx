import React, { useEffect, useState } from 'react';
import NotificationsModal from './NotificationsModal';
import { consumeInboxRequest, subscribeInbox } from '../services/notificationInbox';
import { subscribeSession } from '../services/authSession';
export default function NotificationInboxHost() {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const open = () => { if (consumeInboxRequest()) setVisible(true); };
        const inbox = subscribeInbox(open); open();
        const auth = subscribeSession(session => { if (!session) { consumeInboxRequest(); setVisible(false); } });
        return () => { inbox(); auth(); };
    }, []);
    return <NotificationsModal visible={visible} onClose={() => setVisible(false)} onRead={() => undefined} />;
}