import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, fileName, metadata } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'No image data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing TIF image: ${fileName}`);
    console.log(`Image metadata:`, metadata);

    const systemPrompt = `You are an expert botanist and remote sensing specialist analyzing satellite/drone imagery of saplings and vegetation.

Your task is to analyze the provided image (which may be a GeoTIFF, satellite image, or drone capture) and identify individual saplings or plant areas.

For each sapling or vegetation area you can identify, estimate:
1. Species (if identifiable from visual characteristics)
2. Approximate age/maturity stage
3. Health status based on color/vigor
4. Estimated height category
5. Environmental conditions visible (soil, moisture indicators, surrounding vegetation)

Return a JSON object with:
{
  "saplings": [
    {
      "id": "S001",
      "species": "best guess species name",
      "age_months": estimated age in months,
      "height_cm": estimated height,
      "soil_ph": estimated soil pH (6.0-7.0 typical),
      "moisture_level": estimated moisture 0-100,
      "sunlight_hours": estimated daily sunlight hours,
      "temperature_avg": estimated average temperature
    }
  ],
  "imageAnalysis": {
    "vegetationCoverage": percentage,
    "healthyVegetation": percentage,
    "soilVisibility": percentage,
    "overallAssessment": "brief description"
  }
}

If you cannot identify specific saplings, create estimates based on vegetation patterns visible.
Return ONLY valid JSON, no markdown or explanation.`;

    const userMessage: any = {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `Analyze this vegetation/sapling image and extract data about visible plants. File: ${fileName}. ${metadata ? `Metadata: ${JSON.stringify(metadata)}` : ''}`
        },
        {
          type: 'image_url',
          image_url: {
            url: `data:image/tiff;base64,${imageBase64}`
          }
        }
      ]
    };

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          userMessage
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI image analysis failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: 'Invalid AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON from the AI response
    let analysisResult;
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      analysisResult = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI analysis' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully analyzed image, found ${analysisResult.saplings?.length || 0} saplings`);

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-tif-image:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
