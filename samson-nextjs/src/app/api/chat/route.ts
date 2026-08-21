import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK_URL;
    if (!webhookUrl) {
      return Response.json({ error: 'n8n chat webhook URL is not configured' }, { status: 500 });
    }

    const body = await req.json();
    const secret = process.env.N8N_TOOL_SECRET || process.env.NEXT_PUBLIC_N8N_TOOL_SECRET;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (secret) {
      headers['Authorization'] = `Bearer ${secret}`;
      headers['N8N_TOOL_SECRET'] = secret;
      headers['x-n8n-tool-secret'] = secret;
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      return Response.json(
        { error: `n8n webhook error: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const responseText = await response.text();
    if (!responseText.trim()) {
      return Response.json({ reply: 'Thank you for your message. How can I assist you further?' });
    }

    try {
      const data = JSON.parse(responseText);
      return Response.json(data);
    } catch {
      return Response.json({ reply: responseText });
    }
  } catch (error: any) {
    console.error('Error forwarding chat message to n8n:', error);
    return Response.json(
      { error: error?.message || 'Failed to connect to chat assistant' },
      { status: 500 }
    );
  }
}
