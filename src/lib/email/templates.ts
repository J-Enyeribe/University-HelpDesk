export const emailTemplates = {
  ticketCreated: (data: {
    recipientName: string;
    ticketId: string;
    title: string;
    category: string;
    priority: string;
    ticketUrl: string;
  }) => ({
    subject: `Ticket Submitted: ${data.title} (${data.ticketId})`,
    html: `
      <p>Hi ${data.recipientName},</p>
      <p>Your ticket has been successfully submitted and is now being reviewed by our team.</p>
      <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p><strong>Ticket ID:</strong> ${data.ticketId}</p>
        <p><strong>Title:</strong> ${data.title}</p>
        <p><strong>Category:</strong> ${data.category}</p>
        <p><strong>Priority:</strong> ${data.priority}</p>
        <p><strong>Status:</strong> <span style="background: #192C57; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Open</span></p>
      </div>
      <p><a href="${data.ticketUrl}" style="color: #192C57;">View Ticket →</a></p>
    `,
  }),

  ticketAssigned: (data: {
    recipientName: string;
    ticketId: string;
    title: string;
    technicianName: string;
    ticketUrl: string;
  }) => ({
    subject: `Ticket Assigned: ${data.title} (${data.ticketId})`,
    html: `
      <p>Hi ${data.recipientName},</p>
      <p>Your ticket has been assigned to <strong>${data.technicianName}</strong> who will be handling your issue.</p>
      <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p><strong>Ticket ID:</strong> ${data.ticketId}</p>
        <p><strong>Title:</strong> ${data.title}</p>
        <p><strong>Assigned To:</strong> ${data.technicianName}</p>
      </div>
      <p><a href="${data.ticketUrl}" style="color: #192C57;">View Ticket →</a></p>
    `,
  }),

  statusChanged: (data: {
    recipientName: string;
    ticketId: string;
    title: string;
    newStatus: string;
    resolutionNote?: string;
    ticketUrl: string;
  }) => ({
    subject: `Ticket Status Updated: ${data.title} (${data.ticketId})`,
    html: `
      <p>Hi ${data.recipientName},</p>
      <p>The status of your ticket has been updated to <strong>${data.newStatus.replace('_', ' ')}</strong>.</p>
      <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p><strong>Ticket ID:</strong> ${data.ticketId}</p>
        <p><strong>Title:</strong> ${data.title}</p>
        <p><strong>New Status:</strong> ${data.newStatus.replace('_', ' ')}</p>
      </div>
      ${data.resolutionNote ? `
        <p><strong>Resolution Note:</strong></p>
        <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; border-left: 4px solid #CBAE2D;">
          ${data.resolutionNote}
        </div>
      ` : ''}
      <p><a href="${data.ticketUrl}" style="color: #192C57;">View Ticket →</a></p>
    `,
  }),

  commentAdded: (data: {
    recipientName: string;
    ticketId: string;
    title: string;
    commentAuthor: string;
    commentMessage: string;
    ticketUrl: string;
  }) => ({
    subject: `New Comment on Ticket: ${data.title} (${data.ticketId})`,
    html: `
      <p>Hi ${data.recipientName},</p>
      <p><strong>${data.commentAuthor}</strong> added a comment to your ticket.</p>
      <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p><strong>Ticket ID:</strong> ${data.ticketId}</p>
        <p><strong>Title:</strong> ${data.title}</p>
        <p><strong>Comment by:</strong> ${data.commentAuthor}</p>
        <p>${data.commentMessage}</p>
      </div>
      <p><a href="${data.ticketUrl}" style="color: #192C57;">View Ticket →</a></p>
    `,
  }),
};