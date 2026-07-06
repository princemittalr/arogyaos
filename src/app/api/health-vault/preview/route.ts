import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/firebase/admin';
import { verifySessionCookie } from '@/lib/auth-server';
import crypto from 'crypto';

const SUPPORTED_PREVIEW_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json({ error: 'Missing fileId parameter' }, { status: 400 });
    }

    // 1. Session verification
    const session = await verifySessionCookie(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    // 2. Fetch file metadata
    const metaDocRef = adminDb.collection('health_vault_file_metadata').doc(fileId);
    const metaSnap = await metaDocRef.get();
    if (!metaSnap.exists) {
      return NextResponse.json({ error: 'File metadata not found' }, { status: 404 });
    }

    const metadata = metaSnap.data();
    if (!metadata) {
      return NextResponse.json({ error: 'File metadata is empty' }, { status: 500 });
    }

    if (metadata.status === 'ARCHIVED' && session.role !== 'super_admin') {
      return NextResponse.json({ error: 'File is archived' }, { status: 403 });
    }

    // Validate preview support
    if (!SUPPORTED_PREVIEW_TYPES.includes(metadata.contentType)) {
      return NextResponse.json({ error: 'Preview not supported for this file format.' }, { status: 415 });
    }

    // Validate access permission
    const isOwner = metadata.ownerId === session.uid;
    const isClinical = ['doctor', 'nurse', 'hospital_admin'].includes(session.role);
    const isSuperAdmin = session.role === 'super_admin';

    if (!isOwner && !isClinical && !isSuperAdmin) {
      return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }

    // 3. Download physical file from Storage bucket
    const bucket = adminStorage.bucket();
    const storageFile = bucket.file(metadata.storagePath);
    
    const [exists] = await storageFile.exists();
    if (!exists) {
      return NextResponse.json({ error: 'Physical file not found.' }, { status: 404 });
    }

    const [buffer] = await storageFile.download();

    // 4. Server-side checksum verification
    const hash = crypto.createHash('sha256');
    hash.update(buffer);
    const serverChecksum = hash.digest('hex');

    if (serverChecksum !== metadata.checksum) {
      console.error('[IntegrityCheck] Checksum mismatch during preview!', {
        fileId,
        metadataChecksum: metadata.checksum,
        calculatedChecksum: serverChecksum,
      });
      return NextResponse.json({ error: 'Integrity validation failed.' }, { status: 500 });
    }

    // 5. Append audit log entry
    await adminDb.collection('audit_trail').add({
      operation: 'PREVIEW',
      userId: session.uid,
      userRole: session.role,
      fileId,
      recordId: metadata.recordId,
      recordType: metadata.recordType,
      timestamp: new Date(),
      result: 'SUCCESS',
    });

    // 6. Return inline preview response
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': metadata.contentType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(metadata.originalFileName)}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });

  } catch (err: unknown) {
    console.error('[PreviewRoute] Error during file preview:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Internal storage server error.' }, { status: 500 });
  }
}
