import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { videoId, title } = await req.json()

    if (!videoId) {
      return new Response(
        JSON.stringify({ error: 'Video ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Use yt-dlp to extract audio from YouTube
    const process = new Deno.Command('yt-dlp', {
      args: [
        '--extract-audio',
        '--audio-format', 'mp3',
        '--audio-quality', '0',
        '--output', '-',
        '--no-playlist',
        `https://www.youtube.com/watch?v=${videoId}`
      ],
      stdout: 'piped',
      stderr: 'piped',
    })

    const { code, stdout, stderr } = await process.output()

    if (code !== 0) {
      console.error('yt-dlp error:', stderr)
      return new Response(
        JSON.stringify({ error: 'Failed to download audio' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Return the audio file
    return new Response(stdout, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="${title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3"`
      }
    })

  } catch (error) {
    console.error('Download error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
