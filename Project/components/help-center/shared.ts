
import { MessageCircle, Mail, AlertCircle, Calendar, Receipt, CreditCard, Shield, Settings, FileText, Gift, Smartphone } from 'lucide-react'

// Quick Actions Data
export const QUICK_ACTIONS = [
    { id: 1, label: 'Live Chat', icon: MessageCircle, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' },
    { id: 2, label: 'Email Us', icon: Mail, color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30' },
    { id: 3, label: 'Report Issue', icon: AlertCircle, color: 'bg-red-100 text-red-600 dark:bg-red-900/30' },
    { id: 4, label: 'Manage Booking', icon: Calendar, color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' },
    { id: 5, label: 'Refund Status', icon: Receipt, color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30' },
]

// FAQ Data
export const FAQ_CATEGORIES = [
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'rewards', label: 'Rewards & Tcent', icon: Gift },
    { id: 'account', label: 'Account', icon: Settings },
    { id: 'safety', label: 'Safety', icon: Shield },
    { id: 'technical', label: 'Technical', icon: Smartphone },
]

export const FAQS = [
    {
        id: 'b1',
        category: 'bookings',
        question: 'How do I change my flight dates?',
        answer: 'You can change your flight dates by going to "My Bookings", selecting your trip, and clicking on "Manage Booking". Note that change fees may apply depending on the airline policy.'
    },
    {
        id: 'b2',
        category: 'bookings',
        question: 'Can I cancel my hotel reservation?',
        answer: 'Cancellation policies vary by hotel. Check your booking confirmation email or the "My Bookings" section to see if your reservation is refundable.'
    },
    {
        id: 'p1',
        category: 'payments',
        question: 'What payment methods do you accept?',
        answer: 'We accept major credit cards (Visa, Mastercard, Amex), PayPal, and TripC Wallet credits.'
    },
    {
        id: 'p2',
        category: 'payments',
        question: 'How do I request a receipt?',
        answer: 'Receipts are automatically emailed to you after booking. You can also download them anytime from your "My Bookings" history.'
    },
    {
        id: 'r1',
        category: 'rewards',
        question: 'How do I earn Tcent?',
        answer: 'You earn Tcent on every eligible booking made through TripC. You also earn bonus points for completing daily quests and reviewing visited places.'
    },
    {
        id: 'r2',
        category: 'rewards',
        question: 'Do Tcent points expire?',
        answer: 'Tcent points expire 12 months from the date they were earned, unless you make a new booking which resets the expiry for all points.'
    },
    {
        id: 'a1',
        category: 'account',
        question: 'How do I reset my password?',
        answer: 'Go to the login page and click "Forgot Password". We will send you a link to reset it securely via email.'
    },
]

// Popular Articles
export const POPULAR_ARTICLES = [
    { id: 1, title: 'How to change reservation dates', readTime: '2 min', category: 'Bookings' },
    { id: 2, title: 'Cancellation and Refund Policy', readTime: '5 min', category: 'Policy' },
    { id: 3, title: 'Redeeming Vouchers for Hotels', readTime: '3 min', category: 'Rewards' },
    { id: 4, title: 'Verifying your payment card', readTime: '4 min', category: 'Payments' },
    { id: 5, title: 'Downloading VAT Invoices', readTime: '1 min', category: 'Account' },
]
