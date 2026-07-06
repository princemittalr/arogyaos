import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminStorage } from '@/firebase/admin';
import { verifySessionCookie } from '@/lib/auth-server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json({ error: 'Missing fileId parameter' }, { status: 400 });
    }

    // 1. Session and Permission verification
    const session = await verifySessionCookie(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    // 2. Fetch file metadata using adminDb
    const metaDocRef = adminDb.collection('health_vault_file_metadata').doc(fileId);
    const metaSnap = await metaDocRef.get();
    if (!metaSnap.exists) {
      return NextResponse.json({ error: 'File metadata not found' }, { status: 404 });
    }

    const metadata = metaSnap.data();
    if (!metadata) {
      return NextResponse.json({ error: 'File metadata is empty' }, { status: 500 });
    }

    // Check status: hide files if archived unless requested by super_admin
    if (metadata.status === 'ARCHIVED' && session.role !== 'super_admin') {
      return NextResponse.json({ error: 'File is archived and inaccessible' }, { status: 403 });
    }

    // Validate access permission
    const isOwner = metadata.ownerId === session.uid;
    const isClinical = ['doctor', 'nurse', 'hospital_admin'].includes(session.role);
    const isSuperAdmin = session.role === 'super_admin';

    if (!isOwner && !isClinical && !isSuperAdmin) {
      return NextResponse.json({ error: 'Access Denied: Unauthorized to read this file.' }, { status: 403 });
    }

    // 3. Download physical file from Storage bucket
    const bucket = adminStorage.bucket();
    const storageFile = bucket.file(metadata.storagePath);
    
    const [exists] = await storageFile.exists();
    if (!exists) {
      return NextResponse.json({ error: 'Physical storage object not found.' }, { status: 404 });
    }

    const [buffer] = await storageFile.download();

    // 4. Server-side checksum verification to detect corruption or tampering
    const hash = crypto.createHash('sha256');
    hash.update(buffer);
    const serverChecksum = hash.digest('hex');

    if (serverChecksum !== metadata.checksum) {
      console.error('[IntegrityCheck] Checksum mismatch detected during download!', {
        fileId,
        metadataChecksum: metadata.checksum,
        calculatedChecksum: serverChecksum,
      });
      return NextResponse.json({ error: 'Integrity validation failed. File may be corrupted or tampered.' }, { status: 500 });
    }

    // 5. Append audit log entry (write-only audit trail)
    await adminDb.collection('audit_trail').add({
      operation: 'DOWNLOAD',
      userId: session.uid,
      userRole: session.role,
      fileId,
      recordId: metadata.recordId,
      recordType: metadata.recordType,
      timestamp: new Date(),
      result: 'SUCCESS',
    });

    // 6. Return Streaming download response
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': metadata.contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(metadata.originalFileName)}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });

  } catch (err: unknown) {
    console.error('[DownloadRoute] Error during file retrieval:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Internal storage server error.' }, { status: 500 });
  }
}
