import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { isRateLimited, getClientIp } from "@/lib/rateLimit";
import crypto from 'node:crypto';

const MAX_PHOTOS = 6;

function getEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (await isRateLimited(`photos-upload:${ip}`, 10, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait before trying again." },
        { status: 429 }
      );
    }

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.id as string;

    const existingPhotos = await prisma.photo.findMany({
      where: { userId },
      select: { id: true, isPrimary: true },
    });

    if (existingPhotos.length >= MAX_PHOTOS) {
      return NextResponse.json(
        { error: `You can only upload up to ${MAX_PHOTOS} photos.` },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { url, publicId, isPrimary } = body as { url?: string; publicId?: string; isPrimary?: boolean };

    if (!url || !publicId) {
      return NextResponse.json(
        { error: 'URL and publicId are required.' },
        { status: 400 }
      );
    }

    // Validate that the photo URL comes from the approved Cloudinary upload path
    function isAllowedPhotoUrl(photoUrl: string) {
      try {
        const parsed = new URL(photoUrl);
        return (
          parsed.protocol === "https:" &&
          parsed.hostname === "res.cloudinary.com" &&
          parsed.pathname.includes("/image/upload/") &&
          parsed.pathname.includes("/sneh-matrimony/profiles/")
        );
      } catch {
        return false;
      }
    }

    if (!isAllowedPhotoUrl(url)) {
      return NextResponse.json(
        { error: 'Profile photos must come from the approved upload flow.' },
        { status: 400 }
      );
    }

    // If this photo should be primary, clear existing primary first
    const shouldBePrimary = isPrimary === true || existingPhotos.length === 0;

    if (shouldBePrimary && existingPhotos.length > 0) {
      await prisma.photo.updateMany({
        where: { userId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const photo = await prisma.photo.create({
      data: {
        userId,
        url,
        publicId,
        status: 'PENDING',
        isPrimary: shouldBePrimary,
      },
    });

    return NextResponse.json({ photo });
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.id as string;
    const body = await request.json() as { photoId?: number };
    const { photoId } = body;

    if (!photoId) {
      return NextResponse.json({ error: 'photoId is required.' }, { status: 400 });
    }

    if (isNaN(photoId)) {
      return NextResponse.json({ error: "Invalid photo ID." }, { status: 400 });
    }

    const photo = await prisma.photo.findFirst({
      where: { id: photoId, userId },
    });

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found or you do not have permission.' },
        { status: 404 }
      );
    }

    // Clear existing primary, set new one
    await prisma.$transaction([
      prisma.photo.updateMany({
        where: { userId, isPrimary: true },
        data: { isPrimary: false },
      }),
      prisma.photo.update({
        where: { id: photoId },
        data: { isPrimary: true },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = token.id as string;
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('id');

    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required.' },
        { status: 400 }
      );
    }

    const parsedPhotoId = Number(photoId);
    if (isNaN(parsedPhotoId)) {
      return NextResponse.json({ error: "Invalid photo ID." }, { status: 400 });
    }

    const photo = await prisma.photo.findFirst({
      where: { id: parsedPhotoId, userId },
    });

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found or you do not have permission to delete it.' },
        { status: 404 }
      );
    }

    await prisma.photo.delete({
      where: { id: photo.id },
    });

    // If we deleted the primary, promote the oldest remaining photo
    if (photo.isPrimary) {
      const next = await prisma.photo.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });
      if (next) {
        await prisma.photo.update({
          where: { id: next.id },
          data: { isPrimary: true },
        });
      }
    }

    if (photo.publicId) {
      const cloudName = getEnv('CLOUDINARY_CLOUD_NAME');
      const apiKey = getEnv('CLOUDINARY_API_KEY');
      const apiSecret = getEnv('CLOUDINARY_API_SECRET');

      const timestamp = Math.floor(Date.now() / 1000);
      const signatureBase = `public_id=${photo.publicId}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto
        .createHash('sha1')
        .update(signatureBase)
        .digest('hex');

      try {
        const cloudinaryRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              public_id: photo.publicId,
              timestamp,
              api_key: apiKey,
              signature,
            }),
          }
        );
        if (!cloudinaryRes.ok) {
          console.error(
            `Cloudinary delete failed for publicId=${photo.publicId}: HTTP ${cloudinaryRes.status}`
          );
        } else {
          const result = await cloudinaryRes.json() as { result?: string };
          if (result.result !== 'ok') {
            console.error(
              `Cloudinary delete returned unexpected result for publicId=${photo.publicId}:`,
              result
            );
          }
        }
      } catch (err) {
        console.error(`Cloudinary delete threw for publicId=${photo.publicId}:`, err);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
