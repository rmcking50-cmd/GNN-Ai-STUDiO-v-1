import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { RepositoryAsset, AssetType } from '../types';

// Initialize Firebase App singleton safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Auth Provider with Google Workspace (Drive + Gmail) scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.readonly');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/drive');
provider.addScope('https://mail.google.com/');
provider.addScope('https://www.googleapis.com/auth/gmail.modify');
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
provider.addScope('https://www.googleapis.com/auth/gmail.labels');

// In-memory token cache as required by security guidelines (NEVER stored in localStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  iconLink?: string;
  starred?: boolean;
}

// Initialize Auth listener to clear token when user signs out or updates
export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google Drive scopes via popup
export const signInWithGoogleDrive = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google Drive OAuth access token from authentication credentials');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('[Google Drive Auth] Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Get current in-memory access token
export const getDriveAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

// Set in-memory token explicitly if needed
export const setCachedDriveToken = (token: string | null) => {
  cachedAccessToken = token;
};

// Sign out from Google Drive session
export const signOutGoogleDrive = async (): Promise<void> => {
  await firebaseSignOut(auth);
  cachedAccessToken = null;
};

// Fetch files from Google Drive v3 API
export async function fetchGoogleDriveFiles(
  accessToken: string,
  options?: { query?: string; orderBy?: string }
): Promise<GoogleDriveFile[]> {
  const fields = 'files(id,name,mimeType,size,modifiedTime,webViewLink,webContentLink,thumbnailLink,iconLink,starred)';
  let q = 'trashed = false';
  if (options?.query && options.query.trim()) {
    const escaped = options.query.trim().replace(/['\\]/g, '\\$&');
    q += ` and name contains '${escaped}'`;
  }

  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.set('fields', fields);
  url.searchParams.set('pageSize', '50');
  url.searchParams.set('q', q);
  if (options?.orderBy) {
    url.searchParams.set('orderBy', options.orderBy);
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Google Drive API error: ${res.statusText}`);
  }

  const data = await res.json();
  return data.files || [];
}

// Convert Google Drive File into a GNN RepositoryAsset
export function mapDriveFileToRepositoryAsset(file: GoogleDriveFile): RepositoryAsset {
  let type: AssetType = 'video';
  const mime = (file.mimeType || '').toLowerCase();
  const name = (file.name || '').toLowerCase();

  if (
    mime.includes('video') ||
    name.endsWith('.mp4') ||
    name.endsWith('.mov') ||
    name.endsWith('.mkv') ||
    name.endsWith('.webm') ||
    name.endsWith('.avi')
  ) {
    type = 'video';
  } else if (
    mime.includes('image') ||
    name.endsWith('.png') ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.webp') ||
    name.endsWith('.svg') ||
    name.endsWith('.gif')
  ) {
    type = 'image';
  } else if (
    mime.includes('audio') ||
    name.endsWith('.mp3') ||
    name.endsWith('.wav') ||
    name.endsWith('.aac') ||
    name.endsWith('.ogg') ||
    name.endsWith('.m4a')
  ) {
    type = 'audio';
  } else if (name.endsWith('.srt') || name.endsWith('.vtt') || name.endsWith('.sub')) {
    type = 'subtitles';
  } else {
    type = 'script';
  }

  // Format human-readable file size
  let formattedSize = '1.5 MB';
  if (file.size) {
    const bytes = parseInt(file.size, 10);
    if (!isNaN(bytes)) {
      if (bytes > 1024 * 1024 * 1024) formattedSize = `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
      else if (bytes > 1024 * 1024) formattedSize = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      else formattedSize = `${(bytes / 1024).toFixed(0)} KB`;
    }
  }

  return {
    id: `drive-${file.id}`,
    name: file.name,
    type,
    url: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
    dataUrl: file.thumbnailLink,
    size: formattedSize,
    createdAt: file.modifiedTime ? new Date(file.modifiedTime).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
    status: 'Ready',
    category: 'Google Drive',
  };
}

// Sample Google Drive storage assets for instant demonstration & offline preview
export const SAMPLE_GOOGLE_DRIVE_FILES: GoogleDriveFile[] = [
  {
    id: 'sample-drive-vid-01',
    name: 'GNN_Breaking_Headline_B-Roll_4K.mp4',
    mimeType: 'video/mp4',
    size: '142606336',
    modifiedTime: new Date(Date.now() - 3600000 * 4).toISOString(),
    webViewLink: 'https://assets.mixkit.co/videos/preview/mixkit-news-studio-studio-desk-broadcasting-41554-large.mp4',
    starred: true
  },
  {
    id: 'sample-drive-img-02',
    name: 'Studio_Overhead_Chroma_Rig.png',
    mimeType: 'image/png',
    size: '4194304',
    modifiedTime: new Date(Date.now() - 3600000 * 12).toISOString(),
    webViewLink: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
    starred: false
  },
  {
    id: 'sample-drive-aud-03',
    name: 'Presidential_Press_Briefing_Audio_Master.wav',
    mimeType: 'audio/wav',
    size: '35651584',
    modifiedTime: new Date(Date.now() - 3600000 * 24).toISOString(),
    webViewLink: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
    starred: true
  },
  {
    id: 'sample-drive-doc-04',
    name: 'Nightly_Broadcast_Rundown_Teleprompter_v3.docx',
    mimeType: 'application/vnd.google-apps.document',
    size: '524288',
    modifiedTime: new Date(Date.now() - 3600000 * 48).toISOString(),
    webViewLink: 'https://docs.google.com/document/d/sample-nightly-rundown/edit',
    starred: false
  },
  {
    id: 'sample-drive-vid-05',
    name: 'Anchor_Desk_Opening_Sequence.mp4',
    mimeType: 'video/mp4',
    size: '98450124',
    modifiedTime: new Date(Date.now() - 3600000 * 72).toISOString(),
    webViewLink: 'https://assets.mixkit.co/videos/preview/mixkit-news-anchor-on-chroma-key-studio-41551-large.mp4',
    starred: false
  },
  {
    id: 'sample-drive-sub-06',
    name: 'Live_Telecast_Subtitles_Bilingual_EN_ES.srt',
    mimeType: 'text/plain',
    size: '143360',
    modifiedTime: new Date(Date.now() - 3600000 * 96).toISOString(),
    webViewLink: 'https://drive.google.com/file/d/sample-subtitles/view',
    starred: false
  }
];
