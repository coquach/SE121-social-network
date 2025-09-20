import { createUser } from '@/lib/actions/user/user-actions';
import { UserForm } from '@/models/user/userDTO';
import { clerkClient } from '@clerk/nextjs/server';
import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    // Do something with payload
    // For this guide, log payload to console
    const eventType = evt.type;
    if (eventType === 'user.created') {
      const { id, email_addresses, image_url, username, first_name, last_name } = evt.data
      const user: UserForm = {
        clerkId: id,
        email: email_addresses[0].email_address,
        username: username!,
        firstName: first_name,
        lastName: last_name,
        avatarUrl: image_url,
      };
      console.log("🚀 ~ POST ~ user:", user)

      const newUser = await createUser(user);
      console.log("🚀 ~ POST ~ newUser:", newUser)
      if (newUser) {
        const client = await clerkClient()
        await client.users.updateUser(id, {
          externalId: newUser.id
        }
        )
      }

      return NextResponse.json({ message: "New user created", user: newUser })

    }
    if (eventType === 'user.updated') {
      
    }

    return new Response('Webhook received', { status: 200 });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error verifying webhook', { status: 400 });
  }
}
