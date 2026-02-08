import { NextRequest, NextResponse } from 'next/server';
import { analyzeImage } from '@/lib/claude';
import { findTeam, logUpload } from '@/lib/db';
import { AnalysisResponse, Location, ConfidenceThreshold } from '@/lib/types';

const VALID_LOCATIONS: Location[] = ['mediterranean', 'caribbean', 'pacific'];
const VALID_THRESHOLDS: ConfidenceThreshold[] = [50, 65, 80, 95];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const VALID_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Fire-and-forget logging — never block the response
function log(params: Parameters<typeof logUpload>[0]) {
  logUpload(params).catch((err) => console.error('logUpload failed:', err));
}

export async function POST(request: NextRequest): Promise<NextResponse<AnalysisResponse>> {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    const location = formData.get('location') as string | null;
    const thresholdStr = formData.get('confidenceThreshold') as string | null;

    // Validate inputs
    if (!imageFile || !location || !thresholdStr) {
      return NextResponse.json({
        success: false,
        error: { code: '5.1', message: 'Missing required fields: image, location, and confidence threshold.' },
      });
    }

    if (!VALID_LOCATIONS.includes(location as Location)) {
      return NextResponse.json({
        success: false,
        error: { code: '5.1', message: 'Invalid location selected.' },
      });
    }

    const confidenceThreshold = parseInt(thresholdStr, 10) as ConfidenceThreshold;
    if (!VALID_THRESHOLDS.includes(confidenceThreshold)) {
      return NextResponse.json({
        success: false,
        error: { code: '5.1', message: 'Invalid confidence threshold.' },
      });
    }

    if (!VALID_TYPES.includes(imageFile.type)) {
      return NextResponse.json({
        success: false,
        error: { code: '5.1', message: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.' },
      });
    }

    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        error: { code: '5.1', message: 'File too large. Maximum size is 10MB.' },
      });
    }

    // Convert image to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    const mediaType = imageFile.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

    // Step 1-4: Claude Vision Analysis
    const analysis = await analyzeImage(base64Image, mediaType);

    // Error 5.1: Safety violation
    if (analysis.safetyViolation) {
      log({
        location,
        confidenceThreshold,
        objectDetected: null,
        objectConfidence: null,
        teamMatched: null,
        errorType: '5.1',
      });
      return NextResponse.json({
        success: false,
        error: {
          code: '5.1',
          message: "Error: Your image didn't pass security guardrails. Please upload an appropriate underwater archaeology image.",
        },
      });
    }

    // Error 5.2: Not underwater
    if (!analysis.isUnderwater) {
      log({
        location,
        confidenceThreshold,
        objectDetected: null,
        objectConfidence: null,
        teamMatched: null,
        errorType: '5.2',
      });
      return NextResponse.json({
        success: false,
        error: {
          code: '5.2',
          message: 'Error: Your image is not an underwater image. Please upload a photo taken underwater.',
        },
      });
    }

    // Error 5.3: No man-made object found
    if (!analysis.hasManMadeObject) {
      log({
        location,
        confidenceThreshold,
        objectDetected: null,
        objectConfidence: null,
        teamMatched: null,
        errorType: '5.3',
      });
      return NextResponse.json({
        success: false,
        error: {
          code: '5.3',
          message: "Error: Didn't find any man-made object in the image. Please upload an image containing archaeological artifacts.",
        },
      });
    }

    // Error 5.4: Below confidence threshold (man-made OR object type)
    if (analysis.manMadeConfidence < confidenceThreshold || analysis.objectConfidence < confidenceThreshold) {
      const lowestConfidence = Math.min(analysis.manMadeConfidence, analysis.objectConfidence);
      log({
        location,
        confidenceThreshold,
        objectDetected: analysis.objectType,
        objectConfidence: lowestConfidence,
        teamMatched: null,
        errorType: '5.4',
      });
      return NextResponse.json({
        success: false,
        error: {
          code: '5.4',
          message: `Error: Object identified is below confidence level (Threshold: ${confidenceThreshold}%, Detected: ${lowestConfidence}%). Try uploading a clearer image or adjusting the confidence threshold.`,
        },
      });
    }

    // Step 5: Database lookup
    const objectType = analysis.objectType?.toLowerCase() ?? '';
    const team = await findTeam(location, objectType);

    // Error 5.5: No team match in database
    if (!team) {
      log({
        location,
        confidenceThreshold,
        objectDetected: objectType,
        objectConfidence: analysis.objectConfidence,
        teamMatched: null,
        errorType: '5.5',
      });
      return NextResponse.json({
        success: false,
        error: {
          code: '5.5',
          message: "Warning: Your image didn't match any team in our database. Would you like to submit a review request?",
        },
      });
    }

    // Success: Team found
    log({
      location,
      confidenceThreshold,
      objectDetected: objectType,
      objectConfidence: analysis.objectConfidence,
      teamMatched: team.team_name,
      errorType: null,
    });

    return NextResponse.json({
      success: true,
      result: {
        teamName: team.team_name,
        projectName: team.project_name ?? '',
        objectType,
        objectConfidence: analysis.objectConfidence,
        manMadeConfidence: analysis.manMadeConfidence,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Analysis error:', message);
    return NextResponse.json({
      success: false,
      error: {
        code: '5.1',
        message: `An unexpected error occurred: ${message}`,
      },
    });
  }
}