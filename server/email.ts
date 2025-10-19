import { Resend } from 'resend';

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set');
  }
  return new Resend(apiKey);
}

export async function sendVerificationEmail(to: string, token: string, baseUrl: string) {
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
  
  try {
    const resend = getResend();
    await resend.emails.send({
      from: 'SonchoのAIコミュニティー <onboarding@resend.dev>',
      to,
      subject: 'メールアドレスの確認',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">SonchoのAIコミュニティーへようこそ！</h2>
          <p>アカウント登録ありがとうございます。</p>
          <p>以下のリンクをクリックして、メールアドレスを確認してください：</p>
          <p style="margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              メールアドレスを確認
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            このリンクは24時間有効です。<br>
            もしこのメールに心当たりがない場合は、無視してください。
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return false;
  }
}



export async function sendEmail(options: { to: string; subject: string; html: string }) {
  try {
    const resend = getResend();
    await resend.emails.send({
      from: 'SonchoのAIコミュニティー <onboarding@resend.dev>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

