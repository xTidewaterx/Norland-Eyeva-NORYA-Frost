import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { uid } = await request.json();
    const authKey = process.env.COMETCHAT_AUTH_KEY;

    if (!uid || !authKey) {
      return NextResponse.json(
        { success: false, error: 'Missing UID or authKey' },
        { status: 400 }
      );
    }

    // Instead of using CometChat.login() here, just return the authKey
    // Let your frontend handle the SDK and login, which avoids "window" errors server-side
    return NextResponse.json({ success: true, authKey });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}