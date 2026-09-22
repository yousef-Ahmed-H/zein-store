// Cloudflare Pages Function - تخفي مفتاح Groq
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    
    // المفتاح بيتقرأ من Cloudflare Environment Variables
    const apiKey = env.GROQ_API_KEY;
    
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: { message: 'API key not configured on server' } 
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify(body)
    });
    
    const data = await groqResponse.json();
    
    return new Response(JSON.stringify(data), {
      status: groqResponse.status,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ 
      error: { message: err.message } 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}