import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, voiceConfig } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    const apiKey = Deno.env.get('GOOGLE_TTS_API_KEY');
    if (!apiKey) {
      console.error('❌ GOOGLE_TTS_API_KEY not configured');
      throw new Error('Google TTS API Key not configured');
    }

    console.log('🎤 [Google TTS] Synthesizing text:', text.substring(0, 50) + '...');

    // Default voice configuration
    const defaultVoiceConfig = {
      languageCode: 'pt-BR',
      name: 'pt-BR-Neural2-C',
      ssmlGender: 'FEMALE'
    };

    const finalVoiceConfig = voiceConfig || defaultVoiceConfig;

    // Call Google Text-to-Speech API
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: finalVoiceConfig,
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 0.75,
            pitch: 1.1,
            volumeGainDb: 1.5,
            effectsProfileId: ['headphone-class-device'],
            sampleRateHertz: 24000
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [Google TTS] API error:', response.status, errorText);
      throw new Error(`Google TTS API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.audioContent) {
      console.error('❌ [Google TTS] Invalid response:', data);
      throw new Error('Invalid response from Google TTS API');
    }

    console.log('✅ [Google TTS] Audio generated successfully');

    return new Response(
      JSON.stringify({ audioContent: data.audioContent }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ [Google TTS] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
