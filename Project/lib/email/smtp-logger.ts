import fs from 'fs';
import path from 'path';

export interface SMTPLogEntry {
    timestamp: string;
    status: 'SUCCESS' | 'FAILED';
    recipient: string;
    userType: 'guest' | 'user';
    bookingCode: string;
    messageId?: string;
    error?: string;
}

export class SMTPLogger {
    private logDir: string;

    constructor() {
        // Use logs/smtp directory in project root
        this.logDir = path.join(process.cwd(), 'logs', 'smtp');
        this.ensureLogDirectory();
    }

    private ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    private getLogFileName(): string {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        return path.join(this.logDir, `smtp-${today}.log`);
    }

    private formatLogEntry(entry: SMTPLogEntry): string {
        const parts = [
            `[${entry.timestamp}]`,
            `[${entry.status}]`,
            `recipient=${entry.recipient}`,
            `user_type=${entry.userType}`,
            `booking_code=${entry.bookingCode}`,
        ];

        if (entry.messageId) {
            parts.push(`message_id=${entry.messageId}`);
        }

        if (entry.error) {
            parts.push(`error=${entry.error}`);
        }

        return parts.join(' ') + '\n';
    }

    log(entry: SMTPLogEntry) {
        try {
            const logFile = this.getLogFileName();
            const logLine = this.formatLogEntry(entry);

            // Append to log file
            fs.appendFileSync(logFile, logLine, 'utf8');

            console.log('[SMTP_LOGGER]', logLine.trim());
        } catch (error) {
            console.error('[SMTP_LOGGER_ERROR] Failed to write log:', error);
        }
    }

    logSuccess(recipient: string, userType: 'guest' | 'user', bookingCode: string, messageId: string) {
        this.log({
            timestamp: new Date().toISOString(),
            status: 'SUCCESS',
            recipient,
            userType,
            bookingCode,
            messageId,
        });
    }

    logFailure(recipient: string, userType: 'guest' | 'user', bookingCode: string, error: string) {
        this.log({
            timestamp: new Date().toISOString(),
            status: 'FAILED',
            recipient,
            userType,
            bookingCode,
            error,
        });
    }
}

export const smtpLogger = new SMTPLogger();
