import MailerLite from "@mailerlite/mailerlite-nodejs";

let mailerliteClient: MailerLite | null = null;

/**
 * Get MailerLite client instance
 * Returns null if API key is not configured
 */
export function getMailerLiteClient(): MailerLite | null {
  const apiKey = process.env.MAILERLITE_API_KEY;

  if (!apiKey) {
    console.warn("MAILERLITE_API_KEY not configured. Newsletter subscriptions will be stored locally only.");
    return null;
  }

  if (!mailerliteClient) {
    mailerliteClient = new MailerLite({
      api_key: apiKey,
    });
  }

  return mailerliteClient;
}

/**
 * Get MailerLite group ID from environment variables
 * Returns undefined if not configured
 */
export function getMailerLiteGroupId(): string | undefined {
  return process.env.MAILERLITE_GROUP_ID;
}

/**
 * Add a subscriber to MailerLite
 * @param email - Subscriber email address
 * @param name - Optional subscriber name
 * @param groupId - Optional group ID to add subscriber to
 * @returns MailerLite subscriber ID or null if failed
 */
export async function addSubscriberToMailerLite(
  email: string,
  name?: string,
  groupId?: string
): Promise<string | null> {
  const client = getMailerLiteClient();

  if (!client) {
    return null;
  }

  try {
    // Create or update subscriber
    const params: any = {
      email,
      status: "active",
    };

    if (name) {
      params.fields = { name };
    }

    if (groupId) {
      params.groups = [groupId];
    }

    const response = await client.subscribers.createOrUpdate(params);

    if (response.data && response.data.data && response.data.data.id) {
      console.log(`Successfully synced subscriber to MailerLite: ${email}`);
      return response.data.data.id;
    }

    console.error("Unexpected MailerLite response format:", response);
    return null;
  } catch (error: any) {
    // Log error but don't throw - we want graceful degradation
    console.error("Failed to sync subscriber to MailerLite:", error.message);

    // Check for specific error types
    if (error.response?.status === 429) {
      console.log("Rate limited by MailerLite. Will retry later.");
    } else if (error.response?.status === 401) {
      console.error("Invalid MailerLite API key. Check MAILERLITE_API_KEY environment variable.");
    }

    return null;
  }
}
