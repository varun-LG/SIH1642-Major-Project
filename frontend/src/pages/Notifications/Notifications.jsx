import { useEffect, useState } from 'react';
import axios from 'axios';
import { Bell, X, Check, FileText, Users, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:3000/api/v1/notifications', {
                withCredentials: true
            });
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unreadCount);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await axios.put(
                `http://localhost:3000/api/v1/notifications/${notificationId}/read`,
                {},
                { withCredentials: true }
            );
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put(
                'http://localhost:3000/api/v1/notifications/mark-all-read',
                {},
                { withCredentials: true }
            );
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await axios.delete(
                `http://localhost:3000/api/v1/notifications/${notificationId}`,
                { withCredentials: true }
            );
            fetchNotifications();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'APPLICATION_STATUS':
                return <FileText className="w-5 h-5 text-blue-600" />;
            case 'MENTOR_APPROVAL':
                return <Users className="w-5 h-5 text-green-600" />;
            case 'DOCUMENT_UPLOAD':
                return <FileText className="w-5 h-5 text-purple-600" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-600" />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'APPLICATION_STATUS':
                return 'bg-blue-50 border-blue-200';
            case 'MENTOR_APPROVAL':
                return 'bg-green-50 border-green-200';
            case 'DOCUMENT_UPLOAD':
                return 'bg-purple-50 border-purple-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl">Loading notifications...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bell className="w-6 h-6 text-green-600" />
                                <div>
                                    <CardTitle>Notifications</CardTitle>
                                    <CardDescription>
                                        {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                                    </CardDescription>
                                </div>
                            </div>
                            {unreadCount > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={markAllAsRead}
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    Mark all as read
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {notifications.length === 0 ? (
                            <div className="text-center py-12">
                                <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg">No notifications yet</p>
                                <p className="text-gray-400 text-sm mt-2">We'll notify you when something important happens</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 rounded-lg border transition ${notification.isRead ? 'bg-white border-gray-200' : getNotificationColor(notification.type)
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">
                                                            {notification.title}
                                                            {!notification.isRead && (
                                                                <Badge className="ml-2 bg-green-600">New</Badge>
                                                            )}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-2">
                                                            {new Date(notification.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {!notification.isRead && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => markAsRead(notification.id)}
                                                                title="Mark as read"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => deleteNotification(notification.id)}
                                                            title="Delete"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
