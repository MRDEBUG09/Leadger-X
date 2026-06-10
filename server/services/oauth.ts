import { OAuth2Client } from 'google-auth-library';

const clientID = process.env.GOOGLE_CLIENT_ID;
let oauthClientInstance: OAuth2Client | null = null;

if (clientID && clientID !== "YOUR_GOOGLE_CLIENT_ID") {
  oauthClientInstance = new OAuth2Client(clientID);
}

export interface GoogleAuthProfile {
  email: string;
  name: string;
  picture?: string;
  googleId: string;
}

/**
 * Validates Google JWT tokens and decodes user profiles on the server.
 */
export async function verifyGoogleToken(idToken: string): Promise<GoogleAuthProfile | null> {
  if (!oauthClientInstance) {
    console.warn("⚠️ Google Auth Client ID not set. Fulfilling profile using mock decoding.");
    try {
      // Simulate OAuth token parsing
      const parts = idToken.split('.');
      if (parts.length === 3) {
        const decodedHex = Buffer.from(parts[1], 'base64').toString('utf8');
        const payload = JSON.parse(decodedHex);
        return {
          email: payload.email || "demo.oauth@gmail.com",
          name: payload.name || "OAuth User Suresh",
          picture: payload.picture,
          googleId: payload.sub || "oauth-124124"
        };
      }
    } catch {
      // Fallback fallback
    }
    return {
      email: "prashantmenaria7@gmail.com",
      name: "Suresh Kumar",
      googleId: "google-102930292"
    };
  }

  try {
    const ticket = await oauthClientInstance.verifyIdToken({
      idToken,
      audience: clientID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.sub) {
      return null;
    }
    return {
      email: payload.email,
      name: payload.name || "User",
      picture: payload.picture,
      googleId: payload.sub
    };
  } catch (error) {
    console.error("💥 Google OAuth verify failed:", error);
    return null;
  }
}
