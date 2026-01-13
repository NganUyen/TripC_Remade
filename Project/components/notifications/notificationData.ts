
export interface Notification {
    id: string
    type: 'reward' | 'booking' | 'system'
    title: string
    message: string
    time: string
    isRead: boolean
    deepLink?: string
}

export const NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'reward',
        title: 'Daily Jackpot',
        message: 'You won 500 Tcent in the daily spin!',
        time: '2m ago',
        isRead: false,
        deepLink: '/rewards'
    },
    {
        id: '2',
        type: 'booking',
        title: 'Hotel Check-in',
        message: 'Reminder: Check-in at Grand Hotel is tomorrow at 2 PM.',
        time: '1h ago',
        isRead: false,
        deepLink: '/profile/bookings'
    },
    {
        id: '3',
        type: 'system',
        title: 'Security Alert',
        message: 'New login detected from Chrome on Windows.',
        time: '5h ago',
        isRead: true,
        deepLink: '/profile/settings'
    },
    {
        id: '4',
        type: 'reward',
        title: 'Level Up!',
        message: 'Congratulation! You reached Gold Tier.',
        time: '1d ago',
        isRead: true,
        deepLink: '/profile'
    },
    {
        id: '5',
        type: 'booking',
        title: 'Flight Delayed',
        message: 'Flight VN123 is delayed by 30 mins.',
        time: '2d ago',
        isRead: true,
        deepLink: '/profile/bookings'
    }
]
