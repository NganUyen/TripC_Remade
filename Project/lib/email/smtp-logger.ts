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
    private isServerless: boolean;

    constructor() {
        // Use logs/smtp directory in project root
        this.logDir = path.join(process.cwd(), 'logs', 'smtp');
        
        // Detect serverless environment (Vercel, AWS Lambda, etc.)
        this.isServerless = process.env.VERCEL === '1' || 
                           process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined ||
                           !this.canWriteToFilesystem();
        
        if (!this.isServerless) {
            this.ensureLogDirectory();
        }
    }

    private canWriteToFilesystem(): boolean {
        try {
            const testDir = path.join(process.cwd(), 'logs');
            if (!fs.existsSync(testDir)) {
                fs.mkdirSync(testDir, { recursive: true });
            }
            return true;
        } catch {
            return false;
        }
    }

    private ensureLogDirectory() {
        try {
            if (!fs.existsSync(this.logDir)) {
                fs.mkdirSync(this.logDir, { recursive: true });
            }
        } catch (error) {
            console.warn('[SMTP_LOGGER] Cannot create log directory (likely serverless environment):', error);
            this.isServerless = true;
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
            // Always log to console
            const logLine = this.formatLogEntry(entry);
            console.log('[SMTP_LOGGER]', logLine.trim());

            // Only write to file in non-serverless environments
            if (!this.isServerless) {
                const logFile = this.getLogFileName();
                fs.appendFileSync(logFile, logLine, 'utf8');
            }
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
