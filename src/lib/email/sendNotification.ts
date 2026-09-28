import nodemailer from 'nodemailer';
import { NotificationType } from '@prisma/client';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env["SMTP_HOST"],
      port: parseInt(process.env["SMTP_PORT"] ?? '587'),
      secure: process.env["SMTP_PORT"] === '465',
      auth: {
        user: process.env["SMTP_USER"],
        pass: process.env["SMTP_PASSWORD"],
      },
    });
  }
  return transporter;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!process.env["SMTP_HOST"] || !process.env["SMTP_USER"]) {
    console.warn('Email not configured, skipping send');
    return false;
  }

  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: process.env["EMAIL_FROM"] ?? 'KCA ICT Helpdesk <helpdesk@kcau.ac.ke>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

function getBaseTemplate(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <tr>
      <td style="background-color: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <!-- Header -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding-bottom: 24px; border-bottom: 1px solid #e2e4e9;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #192C57;">KCA ICT Helpdesk</h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #6b7280;">Advancing Knowledge, Driving Change</p>
            </td>
          </tr>
        </table>

        <!-- Content -->
        ${content}

        <!-- Footer -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e4e9;">
          <tr>
            <td style="font-size: 12px; color: #9ca3af; text-align: center;">
              <p style="margin: 0;">This is an automated message from KCA University ICT Directorate.</p>
              <p style="margin: 8px 0 0;">Please do not reply to this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    OPEN: '#192C57',
    ASSIGNED: '#CBAE2D',
    IN_PROGRESS: '#0693e3',
    RESOLVED: '#00d084',
    CLOSED: '#6b7280',
    REOPENED: '#ff6900',
  };
  return colors[status] ?? '#6b7280';
}

export async function sendTicketNotification(
  type: NotificationType,
  recipientEmail: string,
  recipientName: string,
  ticketData: {
    id: string;
    title: string;
    status: string;
    priority: string;
    category: string;
    technicianName?: string;
    resolutionNote?: string;
    commentMessage?: string;
    commentAuthor?: string;
  },
  ticketUrl: string
): Promise<boolean> {
  const statusColor = getStatusColor(ticketData.status);
  const statusLabel = ticketData.status.replace('_', ' ');

  let subject = '';
  let content = '';

  switch (type) {
    case 'TICKET_CREATED':
      subject = `Ticket Submitted: ${ticketData.title} (${ticketData.id})`;
      content = `
        <p style="font-size: 16px; color: #1a1a2e; margin-top: 0;">Hi ${recipientName},</p>
        <p style="font-size: 16px; color: #1a1a2e;">Your ticket has been successfully submitted and is now being reviewed by our team.</p>
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0; background-color: #f8f9fa; border-radius: 8px;">
          <tr>
            <td style="padding: 16px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;"><strong>Ticket ID:</strong> ${ticketData.id}</p>
              <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;"><strong>Title:</strong> ${ticketData.title}</p>
              <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;"><strong>Category:</strong> ${ticketData.category}</p>
              <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;"><strong>Priority:</strong> ${ticketData.priority}</p>
              <p style="margin: 0; font-size: 14px; color: #6b7280;"><strong>Status:</strong> <span style="background-color: ${statusColor}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">${statusLabel}</span></p>
            </td>
          </tr>
        </table>

        <p style="font-size: 16px; color: #1a1a2e;">A technician will be assigned shortly. You'll receive updates as your ticket progresses.</p>
        <p style="font-size: 16px; color: #1a1a2e;"><a href="${ticketUrl}" style="color: #192C57; font-weight: 600;">View Ticket →</a></p>
      `;
      break;

    case 'TICKET_ASSIGNED':
      subject = `Ticket Assigned: ${ticketData.title} (${ticketData.id})`;
      content = `
        <p style="font-size: 16px; color: #1a1a2e; margin-top: 0;">Hi ${recipientName},</p>
        <p style="font-size: 16px; color: #1a1a2e;">Your ticket has been assigned to <strong>${ticketData.technicianName}</strong> who will be handling your issue.</p>
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0; background-color: #f8f9fa; border-radius: 8px;">
          <tr>
            <td style="padding: 16px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;"><strong>Ticket ID:</strong> ${ticketData.id}</p>
              <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;"><strong>Title:</strong> ${ticketData.title}</p>
              <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;"><strong>Assigned To:</strong> ${ticketData.technicianName}</p>
              <p style="margin: 0; font-size: 14px; color: #6b7280;"><strong>Status:</strong> <span style="background-color: ${statusColor}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">${statusLabel}</span></p>
            </td>
          </tr>
        </table>

        <p style="font-size: 16px; color: #1a1a2e;"><a href="${ticketUrl}" style="color: #192C57; font-weight: 600;">View Ticket →</a></p>
      `;
      break;

    case 'TICKET_STATUS_CHANGED':
      subject = `Ticket Status Updated: ${ticketData.title} (${ticketData.id})`;
      content = `
        <p style="font-size: 16px; color: #1a1a2e; margin-top: 0;">Hi ${recipientName},</p>
        <p style="font-size: 16px; color: #1a1a2e;">The status of your ticket has been updated.</p>
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0; background-color: #f8f9fa; border-radius: 8px;">
          <tr>
            <td style="padding: 16px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;"><strong>Ticket ID:</strong> ${ticketData.id}</p>
              <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;"><strong>Title:</strong> ${ticketData.title}</p>
              <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;"><strong>New Status:</strong> <span style="background-color: ${statusColor}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">${statusLabel}</span></p>
            </td>
          </tr>
        </table>

        ${ticketData.resolutionNote ? `
        <p style="font-size: 16px; color: #1a1a2e;"><strong>Resolution Note:</strong></p>
        <p style="font-size: 14px; color: #1a1a2e; background-color: #f8f9fa; padding: 16px; border-radius: 8px; border-left: 4px solid ${statusColor};">${ticketData.resolutionNote}</p>
        ` : ''}

        <p style="font-size: 16px; color: #1a1a2e;"><a href="${ticketUrl}" style="color: #192C57; font-weight: 600;">View Ticket →</a></p>
      `;
      break;

    case 'TICKET_COMMENT_ADDED':
      subject = `New Comment on Ticket: ${ticketData.title} (${ticketData.id})`;
      content = `
        <p style="font-size: 16px; color: #1a1a2e; margin-top: 0;">Hi ${recipientName},</p>
        <p style="font-size: 16px; color: #1a1a2e;"><strong>${ticketData.commentAuthor}</strong> added a comment to your ticket.</p>
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0; background-color: #f8f9fa; border-radius: 8px;">
          <tr>
            <td style="padding: 16px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;"><strong>Ticket ID:</strong> ${ticketData.id}</p>
              <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;"><strong>Title:</strong> ${ticketData.title}</p>
              <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;"><strong>Comment by:</strong> ${ticketData.commentAuthor}</p>
              <p style="margin: 0; font-size: 14px; color: #1a1a2e;">${ticketData.commentMessage}</p>
            </td>
          </tr>
        </table>

        <p style="font-size: 16px; color: #1a1a2e;"><a href="${ticketUrl}" style="color: #192C57; font-weight: 600;">View Ticket →</a></p>
      `;
      break;

    case 'TICKET_REOPENED':
      subject = `Ticket Reopened: ${ticketData.title} (${ticketData.id})`;
      content = `
        <p style="font-size: 16px; color: #1a1a2e; margin-top: 0;">Hi ${recipientName},</p>
        <p style="font-size: 16px; color: #1a1a2e;">Your ticket has been reopened. The technician has been notified and will review the issue again.</p>
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0; background-color: #f8f9fa; border-radius: 8px;">
          <tr>
            <td style="padding: 16px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;"><strong>Ticket ID:</strong> ${ticketData.id}</p>
              <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;"><strong>Title:</strong> ${ticketData.title}</p>
              <p style="margin: 0; font-size: 14px; color: #6b7280;"><strong>Status:</strong> <span style="background-color: ${statusColor}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">${statusLabel}</span></p>
            </td>
          </tr>
        </table>

        <p style="font-size: 16px; color: #1a1a2e;"><a href="${ticketUrl}" style="color: #192C57; font-weight: 600;">View Ticket →</a></p>
      `;
      break;

    case 'TICKET_AUTO_CLOSED':
      subject = `Ticket Auto-Closed: ${ticketData.title} (${ticketData.id})`;
      content = `
        <p style="font-size: 16px; color: #1a1a2e; margin-top: 0;">Hi ${recipientName},</p>
        <p style="font-size: 16px; color: #1a1a2e;">Your ticket has been automatically closed after 7 days with no response. If the issue persists, you can reopen it.</p>
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0; background-color: #f8f9fa; border-radius: 8px;">
          <tr>
            <td style="padding: 16px;">
              <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;"><strong>Ticket ID:</strong> ${ticketData.id}</p>
              <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;"><strong>Title:</strong> ${ticketData.title}</p>
              <p style="margin: 0; font-size: 14px; color: #6b7280;"><strong>Status:</strong> <span style="background-color: ${statusColor}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">${statusLabel}</span></p>
            </td>
          </tr>
        </table>

        <p style="font-size: 16px; color: #1a1a2e;"><a href="${ticketUrl}" style="color: #192C57; font-weight: 600;">View Ticket →</a></p>
      `;
      break;
  }

  const html = getBaseTemplate(content, subject);
  return sendEmail({ to: recipientEmail, subject, html });
}