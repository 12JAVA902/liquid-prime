const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TMDB_BASE = 'https://api.themoviedb.org/3'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const apiKey = Deno.env.get('TMDB_API_KEY')
    if (!apiKey) throw new Error('TMDB_API_KEY not configured')

    const url = new URL(req.url)
    const endpoint = url.searchParams.get('endpoint') || 'trending/movie/week'
    const query = url.searchParams.get('query') || ''
    const page = url.searchParams.get('page') || '1'

    let tmdbUrl = `${TMDB_BASE}/${endpoint}?page=${page}&language=en-US`
    if (query) tmdbUrl += `&query=${encodeURIComponent(query)}`

    const resp = await fetch(tmdbUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await resp.json()
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
