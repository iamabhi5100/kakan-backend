import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as Twilio from 'twilio';

@Injectable()
export class TwilioService {
  private client;
  
  constructor() {
    console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID);
    this.client = Twilio(
      process.env.TWILIO_ACCOUNT_SID, 
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  async sendOtp(mobile: string, otp: string): Promise<void> {
    try {
      await this.client.messages.create({
        body: `Your OTP is ${otp}`,
        to: mobile, // Ensure the number is in E.164 format (e.g., +1234567890)
        from: process.env.TWILIO_PHONE_NUMBER,
      });
    } catch (error) {
      console.error('Twilio error:', error);
      throw new InternalServerErrorException('Failed to send OTP');
    }
  }
}
