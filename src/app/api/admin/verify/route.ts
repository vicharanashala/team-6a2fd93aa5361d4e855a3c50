import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// GET /api/admin/verify — check if current session is admin
export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token');

    if (adminToken && adminToken.value === 'authenticated') {
      return Response.json({ authenticated: true });
    }

    return Response.json({ authenticated: false }, { status: 401 });
  } catch (error) {
    console.error('GET /api/admin/verify error:', error);
    return Response.json({ authenticated: false }, { status: 500 });
  }
}
