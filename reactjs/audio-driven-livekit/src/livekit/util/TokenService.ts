// TokenService.ts
import { generateRandomAlphanumeric } from "./util"; // Update this to the correct path
import { AccessToken } from "livekit-server-sdk";
import type { AccessTokenOptions, VideoGrant } from "livekit-server-sdk";
import { TokenResult } from "./types"; // Update this to the correct path

class TokenService {
  private apiKey: string;
  private apiSecret: string;

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  private createToken(userInfo: AccessTokenOptions, grant: VideoGrant): Promise<string> {
    const at = new AccessToken(this.apiKey, this.apiSecret, userInfo);
    at.addGrant(grant);
    return at.toJwt();
  }

  public async generateToken(): Promise<TokenResult> {
    try {
      if (!this.apiKey || !this.apiSecret) {
        throw new Error("Environment variables aren't set up correctly");
      }

      // Generate random room and identity
      const roomName = `room-${generateRandomAlphanumeric(4)}-${generateRandomAlphanumeric(4)}`;
      const identity = `identity-${generateRandomAlphanumeric(4)}`;

      const grant: VideoGrant = {
        room: roomName,
        roomJoin: true,
        canPublish: true,
        canPublishData: true,
        canSubscribe: true,
      };

      // Create token
      const accessToken = await this.createToken({ identity }, grant);
      const result: TokenResult = {
        identity,
        accessToken,
      };

      return result;
    } catch (e) {
      throw new Error((e as Error).message);
    }
  }
}

export default TokenService;
