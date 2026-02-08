import { NextRequest, NextResponse } from 'next/server';
import { ReviewResponse } from '@/lib/types';

export async function POST(request: NextRequest): Promise<NextResponse<ReviewResponse>> {
  try {
    const body = await request.json();
    const { name, email, location, objectDetected, confidence, timestamp } = body;

    if (!name || !email || !location || !objectDetected) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields.',
      });
    }

    // In production, this would store the review request in a database
    // or send an email notification. For the prototype, we log and confirm.
    console.log('Review request submitted:', {
      name,
      email,
      location,
      objectDetected,
      confidence,
      timestamp,
    });

    return NextResponse.json({
      success: true,
      message: `Thank you, ${name}! Your review request has been submitted. We'll reach out to ${email} with updates.`,
    });
  } catch (error) {
    console.error('Review submission error:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred while submitting your review request. Please try again.',
    });
  }
}