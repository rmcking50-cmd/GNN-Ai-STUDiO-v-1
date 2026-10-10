import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { auth, setCachedDriveToken, getDriveAccessToken } from './googleDriveService';

// All configured Google Workspace scopes (Drive + Gmail)
export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive',
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.addons.current.action.compose',
  'https://www.googleapis.com/auth/gmail.addons.current.message.action',
  'https://www.googleapis.com/auth/gmail.addons.current.message.metadata',
  'https://www.googleapis.com/auth/gmail.addons.current.message.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.insert',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://www.googleapis.com/auth/gmail.metadata',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.settings.basic',
  'https://www.googleapis.com/auth/gmail.settings.sharing',
];

// Configure Google Provider with combined Workspace scopes
export const workspaceProvider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach(scope => workspaceProvider.addScope(scope));

// In-memory token cache (NEVER saved in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface GmailMessageSummary {
  id: string;
  threadId: string;
}

export interface EmailAttachment {
  id: string;
  messageId: string;
  filename: string;
  mimeType: string;
  size: string; // e.g., '2.8 MB'
  sizeBytes?: number;
  type: 'image' | 'document';
  url: string; // High-resolution direct url or data url
  thumbnailUrl?: string;
  dimensions?: string; // e.g. "1920 × 1080"
  description?: string;
  attachmentId?: string;
}

export interface GmailMessageDetail {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  internalDate: string;
  labelIds: string[];
  isRead: boolean;
  isStarred: boolean;
  bodyText: string;
  bodyHtml?: string;
  hasAttachments?: boolean;
  attachments?: EmailAttachment[];
}

export interface GmailLabel {
  id: string;
  name: string;
  type?: string;
  messagesTotal?: number;
  messagesUnread?: number;
}

export interface SendEmailPayload {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
  isHtml?: boolean;
}

// In-memory token helpers
export const getGmailAccessToken = async (): Promise<string | null> => {
  if (cachedAccessToken) return cachedAccessToken;
  const driveToken = await getDriveAccessToken();
  if (driveToken) {
    cachedAccessToken = driveToken;
    return driveToken;
  }
  return null;
};

export const setCachedGmailToken = (token: string | null) => {
  cachedAccessToken = token;
  setCachedDriveToken(token);
};

// Listen to auth state changes to clear memory on sign-out
export const initGmailAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const activeToken = cachedAccessToken || await getDriveAccessToken();
      if (activeToken) {
        if (onAuthSuccess) onAuthSuccess(user, activeToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      setCachedDriveToken(null);
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google Workspace scopes (Drive + Gmail)
export const signInWithGoogleWorkspace = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, workspaceProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google Workspace access token from credentials.');
    }
    cachedAccessToken = credential.accessToken;
    setCachedDriveToken(cachedAccessToken);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('[Google Workspace Auth] Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Sign out from Google Workspace
export const signOutGoogleWorkspace = async (): Promise<void> => {
  await firebaseSignOut(auth);
  cachedAccessToken = null;
  setCachedDriveToken(null);
};

// -------------------------------------------------------------
// GMAIL API CLIENT FUNCTIONS (Direct client-side fetch)
// -------------------------------------------------------------

// List message IDs from Gmail
export async function fetchGmailMessagesList(
  accessToken: string,
  options?: { query?: string; maxResults?: number; pageToken?: string; labelIds?: string[] }
): Promise<{ messages: GmailMessageSummary[]; nextPageToken?: string; resultSizeEstimate?: number }> {
  const params = new URLSearchParams();
  if (options?.query) params.append('q', options.query);
  if (options?.maxResults) params.append('maxResults', options.maxResults.toString());
  else params.append('maxResults', '20');
  if (options?.pageToken) params.append('pageToken', options.pageToken);
  if (options?.labelIds && options.labelIds.length > 0) {
    options.labelIds.forEach(lbl => params.append('labelIds', lbl));
  }

  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gmail API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return {
    messages: data.messages || [],
    nextPageToken: data.nextPageToken,
    resultSizeEstimate: data.resultSizeEstimate
  };
}

// Decode base64url string
function decodeBase64Url(input: string): string {
  try {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    // Decode UTF-8 bytes cleanly
    return decodeURIComponent(
      Array.prototype.map.call(decoded, (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
  } catch (err) {
    try {
      return atob(input.replace(/-/g, '+').replace(/_/g, '/'));
    } catch {
      return input;
    }
  }
}

// Extract body recursively from message payload
function extractBodyFromPayload(payload: any): { text: string; html?: string } {
  let text = '';
  let html = '';

  if (!payload) return { text, html };

  if (payload.body && payload.body.data) {
    const decoded = decodeBase64Url(payload.body.data);
    if (payload.mimeType === 'text/html') html = decoded;
    else text = decoded;
  }

  if (payload.parts && Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        text += (text ? '\n\n' : '') + decodeBase64Url(part.body.data);
      } else if (part.mimeType === 'text/html' && part.body?.data) {
        html = decodeBase64Url(part.body.data);
      } else if (part.parts) {
        const nested = extractBodyFromPayload(part);
        if (nested.text) text += (text ? '\n\n' : '') + nested.text;
        if (nested.html && !html) html = nested.html;
      }
    }
  }

  return { text: text || html.replace(/<[^>]+>/g, ' '), html };
}

// Helper to format bytes
function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Extract attachments from message payload parts recursively
function extractAttachmentsFromPayload(messageId: string, payload: any): EmailAttachment[] {
  const attachments: EmailAttachment[] = [];
  if (!payload) return attachments;

  function traverseParts(parts?: any[]) {
    if (!parts || !Array.isArray(parts)) return;
    for (const part of parts) {
      if (part.filename && part.filename.trim().length > 0) {
        const mimeType = (part.mimeType || 'application/octet-stream').toLowerCase();
        const isImage = mimeType.startsWith('image/');
        const sizeBytes = part.body?.size || 0;
        const attachmentId = part.body?.attachmentId;
        
        let url = '';
        if (part.body?.data) {
          const b64 = part.body.data.replace(/-/g, '+').replace(/_/g, '/');
          url = `data:${mimeType};base64,${b64}`;
        } else if (isImage) {
          url = `https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1600&q=80`;
        } else {
          url = `#attachment-${attachmentId || part.partId || Date.now()}`;
        }

        attachments.push({
          id: `${messageId}-att-${part.partId || attachments.length + 1}`,
          messageId,
          filename: part.filename,
          mimeType,
          size: formatBytes(sizeBytes),
          sizeBytes,
          type: isImage ? 'image' : 'document',
          url,
          thumbnailUrl: isImage ? url : undefined,
          dimensions: isImage ? '1920 × 1080' : undefined,
          attachmentId
        });
      }
      if (part.parts) {
        traverseParts(part.parts);
      }
    }
  }

  if (payload.parts) {
    traverseParts(payload.parts);
  }

  return attachments;
}

// Fetch full message details
export async function fetchGmailMessageDetail(
  accessToken: string,
  messageId: string
): Promise<GmailMessageDetail> {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gmail API detail error (${response.status}): ${errText}`);
  }

  const raw = await response.json();
  const headers = raw.payload?.headers || [];
  const getHeader = (name: string) => {
    const h = headers.find((item: any) => item.name.toLowerCase() === name.toLowerCase());
    return h ? h.value : '';
  };

  const subject = getHeader('Subject') || '(No Subject)';
  const from = getHeader('From') || 'Unknown Sender';
  const to = getHeader('To') || '';
  const date = getHeader('Date') || new Date().toLocaleString();
  const labelIds: string[] = raw.labelIds || [];
  const isRead = !labelIds.includes('UNREAD');
  const isStarred = labelIds.includes('STARRED');

  const { text, html } = extractBodyFromPayload(raw.payload);
  const attachments = extractAttachmentsFromPayload(raw.id, raw.payload);

  return {
    id: raw.id,
    threadId: raw.threadId,
    snippet: raw.snippet || '',
    subject,
    from,
    to,
    date,
    internalDate: raw.internalDate,
    labelIds,
    isRead,
    isStarred,
    bodyText: text || raw.snippet || '',
    bodyHtml: html,
    hasAttachments: attachments.length > 0 || Boolean(raw.payload?.parts?.some((p: any) => p.filename && p.filename.length > 0)),
    attachments
  };
}

// Fetch individual attachment raw data
export async function fetchGmailAttachment(
  accessToken: string,
  messageId: string,
  attachmentId: string
): Promise<{ size: number; data: string }> {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch attachment (${response.status})`);
  }

  return response.json();
}

// Fetch user's Gmail labels
export async function fetchGmailLabels(accessToken: string): Promise<GmailLabel[]> {
  const url = 'https://gmail.googleapis.com/gmail/v1/users/me/labels';
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.labels || [];
}

// Send an email via Gmail API (requires user confirmation before invocation!)
export async function sendGmailMessage(
  accessToken: string,
  email: SendEmailPayload
): Promise<{ id: string; threadId: string }> {
  // Construct RFC 2822 email format
  const boundary = `__boundary_${Date.now()}__`;
  const headers = [
    `To: ${email.to}`,
    email.cc ? `Cc: ${email.cc}` : null,
    email.bcc ? `Bcc: ${email.bcc}` : null,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(email.subject)))}?=`,
    'MIME-Version: 1.0',
    email.isHtml
      ? `Content-Type: text/html; charset="UTF-8"`
      : `Content-Type: text/plain; charset="UTF-8"`,
    'Content-Transfer-Encoding: 8bit',
    '',
    email.body
  ]
    .filter(line => line !== null)
    .join('\r\n');

  // Encode as base64url
  const encoded = btoa(unescape(encodeURIComponent(headers)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: encoded })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send email (${response.status}): ${errorText}`);
  }

  return response.json();
}

// Move email to Trash (requires confirmation before invocation)
export async function trashGmailMessage(
  accessToken: string,
  messageId: string
): Promise<void> {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/trash`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to move message to trash: ${errText}`);
  }
}

// Modify message labels (e.g. Star, Mark Read/Unread)
export async function modifyGmailMessage(
  accessToken: string,
  messageId: string,
  options: { addLabelIds?: string[]; removeLabelIds?: string[] }
): Promise<void> {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(options)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to update message: ${errText}`);
  }
}

// -------------------------------------------------------------
// SAMPLE GMAIL EDITORIAL DATA (For preview prior to sign-in)
// -------------------------------------------------------------
export const SAMPLE_GMAIL_MESSAGES: GmailMessageDetail[] = [
  {
    id: 'sample-msg-1',
    threadId: 'sample-thread-1',
    subject: 'BREAKING: Global Semiconductor Summit releases Joint AI Standards Accord',
    from: 'Reuters NewsDesk <wire@reuters.com>',
    to: 'editorial@gnn-news.tv',
    date: 'Oct 8, 2026, 11:15 AM',
    internalDate: '1791456900000',
    snippet: 'GENEVA — Delegates from 38 nations have ratified the Geneva Protocol for Automated Broadcast Verification, mandating cryptographic watermarks on news videos...',
    bodyText: `GENEVA (Reuters) — Delegates from 38 nations have ratified the Geneva Protocol for Automated Broadcast Verification today.

The landmark treaty mandates cryptographic watermarks on synthetic broadcast assets while protecting journalist attribution across international wire services.

Key Developments:
1. Real-time provenance verification protocols for live television broadcasts.
2. Standardized metadata headers for automated news scripts.
3. Fast-track fact-checking verification nodes across major Asian and European hubs.

Broadcasters are urged to update studio switcher workflows to conform with the November 2026 guidelines.

— Reuters Wire Service Dispatch`,
    labelIds: ['INBOX', 'IMPORTANT'],
    isRead: false,
    isStarred: true,
    hasAttachments: true,
    attachments: [
      {
        id: 'att-semi-1',
        messageId: 'sample-msg-1',
        filename: 'Geneva_Summit_Accord_Signing_Ceremony.jpg',
        mimeType: 'image/jpeg',
        size: '2.8 MB',
        sizeBytes: 2936012,
        type: 'image',
        url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=85',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=75',
        dimensions: '1920 × 1080',
        description: 'Geneva Ministerial plenary session during the cryptographic watermark treaty ratification.'
      },
      {
        id: 'att-semi-2',
        messageId: 'sample-msg-1',
        filename: 'Silicon_Microarchitecture_Watermark_Scan.jpg',
        mimeType: 'image/jpeg',
        size: '3.4 MB',
        sizeBytes: 3565158,
        type: 'image',
        url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1920&q=85',
        thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=75',
        dimensions: '2400 × 1600',
        description: 'Microscopic inspection of secure silicon enclave validating hardware provenance signatures.'
      },
      {
        id: 'att-semi-3',
        messageId: 'sample-msg-1',
        filename: 'Geneva_Accord_Broadcast_Protocol_2026.pdf',
        mimeType: 'application/pdf',
        size: '1.4 MB',
        sizeBytes: 1468006,
        type: 'document',
        url: '#attachment-doc-geneva-accord',
        description: 'Official 38-page treaty documentation with implementation timetable and studio switch compliance checklists.'
      },
      {
        id: 'att-semi-4',
        messageId: 'sample-msg-1',
        filename: 'Cryptographic_Watermark_SDK_Integration_Guide.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: '890 KB',
        sizeBytes: 911360,
        type: 'document',
        url: '#attachment-doc-watermark-sdk',
        description: 'Technical guidance for FastMCP vMix and OBS master control integration.'
      }
    ]
  },
  {
    id: 'sample-msg-2',
    threadId: 'sample-thread-2',
    subject: 'FIELD REPORT: Dhaka Metro Rail Extension Phase 3 Commences Operations',
    from: 'Tariq Rahman <dhaka.bureau@gnn-news.tv>',
    to: 'newsdesk@gnn-news.tv',
    date: 'Oct 8, 2026, 09:42 AM',
    internalDate: '1791451320000',
    snippet: 'DHAKA — Prime Minister inaugurated the automated electric rail link connecting Kamalapur to Uttara Sector 18 ahead of schedule this morning...',
    bodyText: `GNN Dhaka Bureau Dispatch:

DHAKA — The third phase of the MRT Line-6 extension officially opened to commuters at 8:00 AM local time today. Over 180,000 passengers boarded within the first four operating hours.

B-Roll footage and anchor voiceover teleprompter stems have been uploaded to the GNN Media Repository. High-resolution drone capture over Kamalapur Terminal is available under asset ID: MRT6-PHASE3-DRONE.

Recommended Hook:
"A historic transport milestone in Bangladesh as Dhaka Metro Rail opens its final eastern corridor, cutting intercity transit times by over 70%."

Reporting live from Kamalapur Central Station,
Tariq Rahman | Senior Bureau Correspondent`,
    labelIds: ['INBOX'],
    isRead: true,
    isStarred: true,
    hasAttachments: true,
    attachments: [
      {
        id: 'att-dhaka-1',
        messageId: 'sample-msg-2',
        filename: 'Kamalapur_Central_Metro_Terminal_Aerial.jpg',
        mimeType: 'image/jpeg',
        size: '3.1 MB',
        sizeBytes: 3250585,
        type: 'image',
        url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1920&q=85',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=75',
        dimensions: '2048 × 1365',
        description: 'First high-speed automated electric train departing Kamalapur Terminal Platform 1.'
      },
      {
        id: 'att-dhaka-2',
        messageId: 'sample-msg-2',
        filename: 'MRT_Line6_Commuter_Surge_Station_Floor.jpg',
        mimeType: 'image/jpeg',
        size: '2.5 MB',
        sizeBytes: 2621440,
        type: 'image',
        url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1920&q=85',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=400&q=75',
        dimensions: '1920 × 1280',
        description: 'Commuters boarding the morning rush hour train at Uttara South intersection.'
      },
      {
        id: 'att-dhaka-3',
        messageId: 'sample-msg-2',
        filename: 'Dhaka_MRT6_Phase3_Operational_Timetable.pdf',
        mimeType: 'application/pdf',
        size: '640 KB',
        sizeBytes: 655360,
        type: 'document',
        url: '#attachment-doc-dhaka-timetable',
        description: 'Complete station departure frequency schedule and passenger transit metrics.'
      }
    ]
  },
  {
    id: 'sample-msg-3',
    threadId: 'sample-thread-3',
    subject: 'PRESS INVITATION: Clean Fusion Energy prototype demo scheduled for Friday',
    from: 'MIT Plasma Science Press <media@mit.edu>',
    to: 'science.desk@gnn-news.tv',
    date: 'Oct 7, 2026, 04:30 PM',
    internalDate: '1791389400000',
    snippet: 'CAMBRIDGE, MA — You are cordially invited to attend the live virtual media briefing detailing the sustained 120-second Q>1.4 net energy plasma milestone...',
    bodyText: `Dear GNN Editorial Team,

The Plasma Science and Fusion Center cordially invites GNN News anchors to a private media briefing this Friday at 14:00 UTC.

Researchers will unveil high-temperature superconducting magnet performance figures and discuss commercial grid readiness timelines.

Embargo lifts: Friday, 16:00 UTC.

Press contact: media@mit.edu | Room 26-100`,
    labelIds: ['INBOX'],
    isRead: true,
    isStarred: false,
    hasAttachments: true,
    attachments: [
      {
        id: 'att-fusion-1',
        messageId: 'sample-msg-3',
        filename: 'SPARC_Tokamak_Magnetic_Confinement_Core.jpg',
        mimeType: 'image/jpeg',
        size: '4.2 MB',
        sizeBytes: 4404019,
        type: 'image',
        url: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1920&q=85',
        thumbnailUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=400&q=75',
        dimensions: '2560 × 1440',
        description: 'Vacuum chamber glow during high-field magnetic confinement diagnostics run.'
      },
      {
        id: 'att-fusion-2',
        messageId: 'sample-msg-3',
        filename: 'Superconducting_HTS_Magnet_Assembly_Diagram.png',
        mimeType: 'image/png',
        size: '1.9 MB',
        sizeBytes: 1992294,
        type: 'image',
        url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1920&q=85',
        thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=75',
        dimensions: '1800 × 1200',
        description: 'Schematic cross section of 20-Tesla REBCO tape superconducting magnet coils.'
      },
      {
        id: 'att-fusion-3',
        messageId: 'sample-msg-3',
        filename: 'MIT_Plasma_Science_Media_Briefing_Dossier.pdf',
        mimeType: 'application/pdf',
        size: '2.1 MB',
        sizeBytes: 2202009,
        type: 'document',
        url: '#attachment-doc-fusion-dossier',
        description: 'Comprehensive press briefing dossier, embargo conditions, and researcher bios.'
      }
    ]
  },
  {
    id: 'sample-msg-4',
    threadId: 'sample-thread-4',
    subject: 'CYBER ALERT: Critical CVE-2026-9041 vulnerability detected in satellite downlink protocol',
    from: 'GNN Infosec Watchdog <alerts@gnn-security.org>',
    to: 'engineering@gnn-news.tv',
    date: 'Oct 7, 2026, 02:18 PM',
    internalDate: '1791381480000',
    snippet: 'URGENT: All broadcast control rooms must verify firmware patches on DVB-S2 modulators to mitigate unauthorized frame injection risks...',
    bodyText: `URGENT TECHNICAL NOTICE:

National Cyber Emergency Response has published Advisory 2026-081 regarding telemetry injection risks in legacy vMix satellite decoders.

Required Action:
1. Verify vMix FastMCP bridge firewall rules.
2. Ensure tokenized Bearer authentication is enforced on all remote director endpoints.
3. Switch primary studio feed to SSL/TLS encrypted SRT stream.

Status: Patch applied to GNN Master Control Room.`,
    labelIds: ['INBOX', 'IMPORTANT'],
    isRead: false,
    isStarred: false,
    hasAttachments: true,
    attachments: [
      {
        id: 'att-cyber-1',
        messageId: 'sample-msg-4',
        filename: 'Satellite_Downlink_Packet_Inspection_Capture.png',
        mimeType: 'image/png',
        size: '1.5 MB',
        sizeBytes: 1572864,
        type: 'image',
        url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1920&q=85',
        thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=75',
        dimensions: '1600 × 900',
        description: 'Wireshark packet telemetry highlighting spoofed synchronizer headers on port 8088.'
      },
      {
        id: 'att-cyber-2',
        messageId: 'sample-msg-4',
        filename: 'CERT_Advisory_2026_081_Satellite_Patch.pdf',
        mimeType: 'application/pdf',
        size: '780 KB',
        sizeBytes: 798720,
        type: 'document',
        url: '#attachment-doc-cyber-advisory',
        description: 'Government vulnerability bulletin and mandatory mitigation steps for media relays.'
      }
    ]
  }
];
