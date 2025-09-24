import { createUser, updateUser } from '@/lib/actions/user/user-actions';
import { ProfileUpdateForm, UserCreateForm } from '@/models/user/userDTO';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    // Do something with payload
    // For this guide, log payload to console
    const eventType = evt.type;
    if (eventType === 'user.created') {
      const { id, email_addresses, image_url, first_name, last_name } =
        evt.data;
      const user: UserCreateForm = {
        clerkId: id,
        isActive: true,
        email: email_addresses[0].email_address,
        firstName: first_name || '',
        lastName: last_name || '',
        avatarUrl: image_url,
      };
      console.log('🚀 ~ POST ~ user:', user);

      const newUser = await createUser(user);
      console.log('🚀 ~ POST ~ newUser:', newUser);
      if (newUser) {
        const client = await clerkClient();
        await client.users.updateUser(id, {
          externalId: newUser.id,
        });
      }

      return NextResponse.json({ message: 'New user created', user: newUser });
    }
    if (eventType === 'user.updated') {
      const client = await clerkClient();
      const { sessionId } = await auth();
      if (!sessionId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      const token = await client.sessions.getToken(sessionId).toString();

      const {
        external_id: userId,
        email_addresses,
        image_url,
        first_name,
        last_name,
      } = evt.data;
      const updateData: ProfileUpdateForm = {
        email: email_addresses[0].email_address,
        firstName: first_name || '',
        lastName: last_name || '',
        avatarUrl: image_url,
      };
      await updateUser(token as string, userId as string, updateData);

      return NextResponse.json({ message: 'User updated successfully'});


    }

    return new Response('Webhook received', { status: 200 });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error verifying webhook', { status: 400 });
  }
}
