import { type NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// POST /api/admin/login — validate admin password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (password !== adminPassword) {
      return Response.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Set admin cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_token', 'authenticated', {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
      sameSite: 'strict',
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('POST /api/admin/login error:', error);
    return Response.json({ error: 'Login failed' }, { status: 500 });
  }
}
