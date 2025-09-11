import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'Jenny', voiceType = 'microsoft' } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    let audioResponse: Response;

    switch (voiceType) {
      case 'microsoft':
        // Microsoft Azure TTS (placeholder - replace with your Azure key)
        const azureUrl = `https://eastus.tts.speech.microsoft.com/cognitiveservices/v1`;
        audioResponse = await fetch(azureUrl, {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY || '',
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
          },
          body: `
            <speak version='1.0' xml:lang='en-US'>
              <voice xml:lang='en-US' xml:gender='Female' name='en-US-JennyNeural'>
                ${text}
              </voice>
            </speak>
          `,
        });
        break;

      case 'google':
        // Google Cloud TTS (placeholder - replace with your API key)
        const googleUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_KEY}`;
        audioResponse = await fetch(googleUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text },
            voice: { languageCode: 'en-US', name: 'en-US-Standard-A' },
            audioConfig: { audioEncoding: 'MP3' },
          }),
        });

        if (audioResponse.ok) {
          const data = await audioResponse.json();
          const audioBuffer = Buffer.from(data.audioContent, 'base64');
          return new Response(audioBuffer, {
            headers: { 'Content-Type': 'audio/mpeg' },
          });
        }
        break;

      case 'elevenlabs':
        // ElevenLabs TTS (placeholder - replace with your API key)
        const elevenUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voice}`;
        audioResponse = await fetch(elevenUrl, {
          method: 'POST',
          headers: {
            Accept: 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': process.env.ELEVENLABS_API_KEY || '',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5,
            },
          }),
        });
        break;

      default:
        // Fallback to StreamElements (free option)
        const voiceName = voice.includes('Jenny') ? 'Brian' : voice;
        const streamUrl = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(voiceName)}&text=${encodeURIComponent(text)}`;
        audioResponse = await fetch(streamUrl);
    }

    if (!audioResponse.ok) {
      throw new Error(`TTS API responded with status: ${audioResponse.status}`);
    }

    const audioBuffer = await audioResponse.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('TTS API Error:', error);
    return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 });
  }
}
