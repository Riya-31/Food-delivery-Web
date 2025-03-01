// Logger.js

class Logger {
    constructor(serverEndpoint) {
        this.serverEndpoint = serverEndpoint;
        this.pid = 'N/A';
    }

    log(message, severity = 'INFO') {
        const logEntry = {
            message,
            severity,
            // timestamp: new Date().toISOString(),
            timestamp: this.getFormattedTimestamp(),
            pid: this.pid,
        };

        this.sendToServer(logEntry);
    }

    getFormattedTimestamp() {
        // Using toLocaleString to format the timestamp
        const date = new Date();
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true, // AM/PM format
        });
    }

    sendToServer(logEntry) {
        fetch(this.serverEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(logEntry),
        }).catch((error) => {
            console.error('Error sending log to server:', error);
        });
    }
}

export default Logger;
