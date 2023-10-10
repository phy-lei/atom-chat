import type { APIRoute } from 'astro'
import { getSession } from "@auth/solid-start"
import { authOptions } from '@/server/auth'

const accessToken = import.meta.env.GITHUB_ACCESS_TOKEN;
export const POST: APIRoute = async (context) => {
  try {
    const body = await context.request.json()
    const { base64 } = body

    const session: Session = (await getSession(context.request, authOptions)) as any

    if (!session) return new Response(JSON.stringify({
      message: 'Unauthorized',
    }), { status: 401 })

    if (!accessToken) return new Response(JSON.stringify({
      message: 'Unauthorized',
    }), { status: 401 })

    const filePath =
      new Date().toLocaleDateString().replace(/\//g, '') +
      '/' +
      Date.now() +
      'image.png';

    const res = await fetch('https://api.github.com/repos/phy-lei/blob-imgs/contents/' + filePath, {
      method: 'put',
      headers: {
        Authorization: 'token ' + accessToken,
      },
      body: JSON.stringify({
        message: 'upload img',
        content: base64,
      })
    })
    const data = await res.json()

    return new Response(JSON.stringify({
      data: data.content.download_url
    }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({
      message: 'Internal Server Error',
    }), { status: 500 })
  }
}
