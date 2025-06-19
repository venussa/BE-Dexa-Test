import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class FcmService {
    constructor() {
        const serviceAccount = JSON.parse(
            readFileSync(join(__dirname, '../config/service-account.json'), 'utf8'),
        );

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }
    }

    async sendNotificationToToken(
        fcmToken: string,
        title: string,
        body: string,
        data?: Record<string, string>
    ) {
        const message: admin.messaging.Message = {
            token: fcmToken,
            notification: {
                title,
                body,
            },
            data,
        };

        try {
            const res = await admin.messaging().send(message);
            return { success: true, messageId: res };
        } catch (error) {
            console.error('Error sending FCM:', error);
            return { success: false, error };
        }
    }
}