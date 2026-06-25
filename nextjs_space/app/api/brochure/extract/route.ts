export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    // Check file size (max 35MB)
    if (file.size > 35 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum 35MB.' }, { status: 400 });
    }

    const base64Buffer = await file.arrayBuffer();
    const base64String = Buffer.from(base64Buffer).toString('base64');

    const prompt = `You are a real estate data extraction expert. Analyze this project brochure PDF and extract the following details in JSON format. Extract as much information as you can find. If a field is not found, use an empty string or empty array.

Return ONLY valid JSON with this exact structure:
{
  "projectName": "Name of the project",
  "builderName": "Name of the builder/developer",
  "location": "Area/locality name",
  "city": "City name",
  "possessionDate": "Expected possession date",
  "projectDescription": "Brief description of the project (2-3 sentences)",
  "reraNumber": "RERA registration number if found",
  "projectType": "Residential or Commercial or Mixed Use or Villa or Plot",
  "priceRangeMin": "Starting price (e.g. 1.5 Cr)",
  "priceRangeMax": "Maximum price (e.g. 3.5 Cr)",
  "projectHighlights": ["highlight 1", "highlight 2", "highlight 3"],
  "builderDescription": "Brief about the builder",
  "builderExperience": "Years of experience (e.g. 25+ Years)",
  "builderProjects": "Number of projects (e.g. 100+)",
  "pricingData": [{"config": "2 BHK", "area": "850 sq.ft.", "price": "₹85 Lakh"}],
  "connectivityData": [{"place": "Airport", "distance": "15 km", "time": "25 mins"}],
  "amenities": ["Swimming Pool", "Gymnasium", "Clubhouse"]
}

Respond with raw JSON only. Do not include code blocks, markdown, or any other formatting.`;

    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.4-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'file',
                file: {
                  filename: file.name || 'brochure.pdf',
                  file_data: `data:application/pdf;base64,${base64String}`,
                },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('LLM API error:', errText);
      return NextResponse.json({ error: 'Failed to analyze brochure. Please try again.' }, { status: 500 });
    }

    const llmData = await response.json();
    const content = llmData?.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: 'No content extracted from brochure' }, { status: 500 });
    }

    let extracted;
    try {
      extracted = JSON.parse(content);
    } catch {
      // Try to extract JSON from the content
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extracted = JSON.parse(jsonMatch[0]);
      } else {
        return NextResponse.json({ error: 'Failed to parse extracted data' }, { status: 500 });
      }
    }

    return NextResponse.json({ extracted });
  } catch (error: any) {
    console.error('Brochure extraction error:', error);
    return NextResponse.json({ error: 'Failed to process brochure' }, { status: 500 });
  }
}
