import { NextRequest, NextResponse } from 'next/server';
import { ReviewResponse } from '@/lib/types';

export async function POST(request: NextRequest): Promise<NextResponse<ReviewResponse>> {
  try {
    const body = await request.json();
    const { name, email, comments, teamName, objectType, objectConfidence } = body;

    if (!name || !email || !teamName) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields.',
      });
    }

    console.log('Contact request submitted:', {
      name,
      email,
      comments,
      teamName,
      objectType,
      objectConfidence,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Thank you, ${name}! Your message has been sent to team "${teamName}". They'll reach out to ${email} shortly.`,
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    return NextResponse.json({
      success: false,
      message: 'An error occurred while submitting your contact request. Please try again.',
    });
  }
}