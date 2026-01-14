import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUnreadCount();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/v1/notifications', {
                withCredentials: true
            });
            setUnreadCount(response.data.unreadCount);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate('/notifications')}
        >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
                <Badge
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-600 text-white text-xs"
                >
                    {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
            )}
        </Button>
    );
}
