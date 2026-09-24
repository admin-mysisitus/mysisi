const DEFAULT_SCHOOL_LOCATION = {
  lat: -7.4026,
  lng: 112.7444,
  radiusMeters: 60
};

const DEFAULT_ATTENDANCE_RULES = Object.freeze({
  checkInStart: '07:00',
  checkInEnd: '09:00',
  checkOutStart: '15:00',
  checkOutEnd: '17:00',
  attendanceStartDate: '',
  attendanceEndDate: ''
});

const MAX_ACCURACY_METERS = 200;

function getSchoolLocation(env) {
  const lat = Number(env?.SCHOOL_LAT ?? DEFAULT_SCHOOL_LOCATION.lat);
  const lng = Number(env?.SCHOOL_LNG ?? DEFAULT_SCHOOL_LOCATION.lng);
  const radiusMeters = Number(env?.SCHOOL_RADIUS_METERS ?? DEFAULT_SCHOOL_LOCATION.radiusMeters);

  return {
    lat: Number.isFinite(lat) ? lat : DEFAULT_SCHOOL_LOCATION.lat,
    lng: Number.isFinite(lng) ? lng : DEFAULT_SCHOOL_LOCATION.lng,
    radiusMeters: Number.isFinite(radiusMeters) ? radiusMeters : DEFAULT_SCHOOL_LOCATION.radiusMeters
  };
}

function getCorsHeaders(origin) {
  const allowOrigin = origin && /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/.test(origin)
    ? origin
    : '*';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400'
  };
}

function jsonResponse(statusCode, body, request) {
  const origin = request ? request.headers.get('Origin') : '';
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...getCorsHeaders(origin)
    }
  });
}

function getDistanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const p1 = lat1 * Math.PI / 180;
  const p2 = lat2 * Math.PI / 180;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function timeToMinutes(value) {
  if (!value || typeof value !== 'string') return null;
  const match = value.match(/^([0-1]?\d|2[0-3]):([0-5]\d)$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours * 60 + minutes;
}

function isTimeInWindow(currentTime, start, end) {
  const currentMinutes = timeToMinutes(currentTime);
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);

  if (currentMinutes == null || startMinutes == null || endMinutes == null) return true;
  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }
  return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
}

function isDateRangeAllowed(dateStr, startDate, endDate) {
  if (!dateStr) return true;
  if (!startDate && !endDate) return true;

  const current = new Date(`${dateStr}T00:00:00+07:00`);
  if (startDate) {
    const start = new Date(`${startDate}T00:00:00+07:00`);
    if (current < start) return false;
  }
  if (endDate) {
    const end = new Date(`${endDate}T23:59:59+07:00`);
    if (current > end) return false;
  }

  return true;
}

async function getAttendanceRules(env) {
  const runtimeEnv = typeof globalThis !== 'undefined' && globalThis.ATTENDANCE_ENV ? globalThis.ATTENDANCE_ENV : {};
  const databaseUrl = env?.FIREBASE_DATABASE_URL || runtimeEnv.FIREBASE_DATABASE_URL || '';
  const secret = env?.FIREBASE_DB_SECRET || runtimeEnv.FIREBASE_DB_SECRET || '';

  if (!databaseUrl || !secret) {
    return { ...DEFAULT_ATTENDANCE_RULES };
  }

  try {
    const url = `${databaseUrl}/settings.json?auth=${encodeURIComponent(secret)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      return { ...DEFAULT_ATTENDANCE_RULES };
    }

    const settings = await response.json();
    const rules = settings && typeof settings.attendanceRules === 'object' ? settings.attendanceRules : {};
    return {
      ...DEFAULT_ATTENDANCE_RULES,
      ...rules
    };
  } catch (error) {
    return { ...DEFAULT_ATTENDANCE_RULES };
  }
}

async function hashString(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function signPayload(payload, secret) {
  const text = `${secret}:${JSON.stringify(payload)}`;
  const hash = await hashString(text);
  return hash;
}

async function blobToBase64(blob) {
  const buffer = await blob.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function loadImageForStamping(dataUrl) {
  if (typeof createImageBitmap === 'function') {
    const blob = await fetch(dataUrl).then((response) => response.blob());
    return await createImageBitmap(blob);
  }

  if (typeof Image !== 'undefined') {
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = dataUrl;
    });
    return image;
  }

  return null;
}

async function stampPhotoOnImage({ photoDataUrl, location, accuracy, serverTimestamp }) {
  if (!photoDataUrl || !photoDataUrl.startsWith('data:image')) {
    return photoDataUrl;
  }

  let imageBitmap = null;
  try {
    imageBitmap = await loadImageForStamping(photoDataUrl);
  } catch (error) {
    return photoDataUrl;
  }

  if (!imageBitmap) {
    return photoDataUrl;
  }

  const width = imageBitmap.width || imageBitmap.naturalWidth || 0;
  const height = imageBitmap.height || imageBitmap.naturalHeight || 0;

  const canvas = typeof OffscreenCanvas !== 'undefined'
    ? new OffscreenCanvas(width || 1, height || 1)
    : (typeof document !== 'undefined' ? document.createElement('canvas') : null);

  if (!canvas) {
    return photoDataUrl;
  }

  canvas.width = width || 1;
  canvas.height = height || 1;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return photoDataUrl;
  }

  ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);

  const stampText1 = new Date(serverTimestamp).toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    dateStyle: 'short',
    timeStyle: 'medium'
  });
  const stampText2 = `Lokasi: ${Number(location.lat).toFixed(6)}, ${Number(location.lng).toFixed(6)} | Akurasi ${Number(accuracy || 0).toFixed(0)} m`;

  const padding = 22;
  const barHeight = 90;
  const fontSize = 22;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.62)';
  ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);

  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${fontSize}px Arial`;
  ctx.fillText(stampText1, padding, canvas.height - 42);

  ctx.font = `500 18px Arial`;
  ctx.fillText(stampText2, padding, canvas.height - 16);

  if (typeof canvas.convertToBlob === 'function') {
    const stampedBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.9 });
    return `data:image/jpeg;base64,${await blobToBase64(stampedBlob)}`;
  }

  return canvas.toDataURL('image/jpeg', 0.9);
}

async function forwardToDriveUploadUrl({ gasUploadUrl, fileName, mimeType, photoDataUrl }) {
  const gasUrl = (gasUploadUrl || '').trim();
  if (!gasUrl) {
    throw new Error('GOOGLE_DRIVE_UPLOAD_URL / GAS_UPLOAD_URL belum di-set di env Worker.');
  }

  const base64Data = (photoDataUrl || '').includes('base64,')
    ? photoDataUrl.split('base64,')[1]
    : photoDataUrl;

  if (!base64Data) {
    throw new Error('photoDataUrl kosong.');
  }

  const params = new URLSearchParams();
  params.append('action', 'upload');
  params.append('fileName', fileName);
  params.append('mimeType', mimeType);
  params.append('fileData', base64Data);
  params.append('folderKey', 'attendance');

  const response = await fetch(gasUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    },
    body: params.toString()
  });

  let result = {};
  try {
    result = await response.json();
  } catch (error) {
    const text = await response.text();
    throw new Error(text || 'Upload ke Drive gagal.');
  }

  if (!response.ok || result.status !== 'success') {
    throw new Error(result && result.message ? result.message : 'Upload ke Drive gagal.');
  }

  return result.fileUrl || '';
}

async function saveAttendanceRecord(record) {
  const runtimeEnv = typeof globalThis !== 'undefined' && globalThis.ATTENDANCE_ENV ? globalThis.ATTENDANCE_ENV : {};
  const databaseUrl = runtimeEnv.FIREBASE_DATABASE_URL || (typeof process !== 'undefined' ? process.env.FIREBASE_DATABASE_URL : '');
  const secret = runtimeEnv.FIREBASE_DB_SECRET || (typeof process !== 'undefined' ? process.env.FIREBASE_DB_SECRET : '');

  if (!databaseUrl || !secret) {
    return;
  }

  const url = `${databaseUrl}/teacher_attendance/${record.dateStr}/${record.teacherId}.json?auth=${encodeURIComponent(secret)}`;

  await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record.record)
  });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          ...getCorsHeaders(request.headers.get('Origin'))
        }
      });
    }

    if (request.method !== 'POST') {
      return jsonResponse(405, { status: 'error', message: 'Method not allowed.' }, request);
    }

    try {
      const body = await request.json();
      const { dateStr, teacherId, type, photoDataUrl, location, accuracy, clientTimestamp } = body || {};
      const authHeader = request.headers.get('Authorization') || '';
      const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
      const schoolLocation = getSchoolLocation(env);
      const attendanceRules = await getAttendanceRules(env);

      if (!teacherId || !dateStr || !photoDataUrl || !location || !location.lat || !location.lng) {
        return jsonResponse(400, { status: 'error', message: 'Payload absensi tidak lengkap.' }, request);
      }

      if (!idToken) {
        return jsonResponse(401, { status: 'error', message: 'Token otentikasi belum dikirim.' }, request);
      }

      if (!isDateRangeAllowed(dateStr, attendanceRules.attendanceStartDate, attendanceRules.attendanceEndDate)) {
        return jsonResponse(403, {
          status: 'error',
          message: `Tanggal absensi tidak dalam rentang yang diizinkan oleh admin.`
        }, request);
      }

      const serverTimestamp = new Date().toISOString();
      const jakartaNow = new Date(new Date(serverTimestamp).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
      const currentTimeText = jakartaNow.toTimeString().slice(0, 5);
      const windowName = type === 'in' ? 'hadir' : 'pulang';
      const validWindowStart = type === 'in' ? attendanceRules.checkInStart : attendanceRules.checkOutStart;
      const validWindowEnd = type === 'in' ? attendanceRules.checkInEnd : attendanceRules.checkOutEnd;

      if (!isTimeInWindow(currentTimeText, validWindowStart, validWindowEnd)) {
        return jsonResponse(403, {
          status: 'error',
          message: `Waktu absensi ${windowName} saat ini belum sesuai jadwal admin.`
        }, request);
      }

      const distance = getDistanceMeters(location.lat, location.lng, schoolLocation.lat, schoolLocation.lng);
      const radius = Number(schoolLocation.radiusMeters);
      const accuracyValue = Number(accuracy || 0);

      if (distance > radius) {
        return jsonResponse(403, { status: 'error', message: `Lokasi di luar area sekolah. Jarak: ${Math.round(distance)}m.` }, request);
      }

      if (accuracyValue > MAX_ACCURACY_METERS) {
        return jsonResponse(403, { status: 'error', message: `Akurasi posisi terlalu besar: ${Math.round(accuracyValue)}m. Maksimal ${MAX_ACCURACY_METERS}m.` }, request);
      }

      const stampedPhotoDataUrl = await stampPhotoOnImage({
        photoDataUrl,
        location,
        accuracy: accuracyValue,
        serverTimestamp
      });

      const signedPayload = {
        teacherId,
        dateStr,
        type,
        lat: Number(location.lat),
        lng: Number(location.lng),
        accuracy: accuracyValue,
        distanceMeters: Math.round(distance),
        clientTimestamp: clientTimestamp || serverTimestamp,
        serverTimestamp,
        userTokenPresent: !!idToken,
        photoHash: await hashString(stampedPhotoDataUrl)
      };

      const serverSignature = await signPayload(signedPayload, env.WORKER_SECRET || 'local-dev-secret');
      const fileName = `attendance_${teacherId}_${dateStr}_${Date.now()}.jpg`;
      const proofUrl = await forwardToDriveUploadUrl({
        gasUploadUrl: env.GOOGLE_DRIVE_UPLOAD_URL || env.GAS_UPLOAD_URL,
        fileName,
        mimeType: 'image/jpeg',
        photoDataUrl: stampedPhotoDataUrl
      });

      const record = {
        dateStr,
        teacherId,
        type,
        proof_url: proofUrl,
        location: {
          lat: Number(location.lat),
          lng: Number(location.lng),
          accuracy: accuracyValue,
          checkedAt: serverTimestamp
        },
        serverTimestamp,
        serverSignature,
        photoHash: signedPayload.photoHash,
        distanceMeters: Math.round(distance)
      };

      await saveAttendanceRecord({ dateStr, teacherId, record });

      return jsonResponse(200, {
        status: 'success',
        message: 'Absensi valid dan berhasil disimpan.',
        proof_url: proofUrl,
        location: record.location,
        serverTimestamp,
        serverSignature,
        record,
        distanceMeters: Math.round(distance)
      }, request);
    } catch (error) {
      return jsonResponse(500, {
        status: 'error',
        message: error && error.message ? error.message : 'Terjadi error di Worker.'
      }, request);
    }
  }
};
