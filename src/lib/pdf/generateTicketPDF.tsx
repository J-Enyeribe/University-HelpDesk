import { Document, Page, Text, View } from '@react-pdf/renderer';
import { pdf } from '@react-pdf/renderer';
import { pdfStyles, statusColors, priorityColors } from './PDFStyles';
import { format } from 'date-fns';
import type { TicketPDFData } from '@/types/pdf';

export async function generateTicketPDF(data: TicketPDFData): Promise<Uint8Array> {
  const { ticket, generatedAt, generatedBy } = data;

  const doc = (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <View style={pdfStyles.header}>
          <View style={pdfStyles.logoSection}>
            <View style={pdfStyles.logo} />
            <View style={pdfStyles.titleBlock}>
              <Text style={pdfStyles.mainTitle}>KCA University</Text>
              <Text style={pdfStyles.subtitle}>ICT Directorate - Resolution Summary</Text>
            </View>
          </View>
          <Text style={pdfStyles.ticketId}>{ticket.id}</Text>
        </View>

        {/* Ticket Info */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>TICKET INFORMATION</Text>
          <View style={pdfStyles.fieldRow}>
            <Text style={pdfStyles.fieldLabel}>Title:</Text>
            <Text style={pdfStyles.fieldValue}>{ticket.title}</Text>
          </View>
          <View style={pdfStyles.fieldRow}>
            <Text style={pdfStyles.fieldLabel}>Category:</Text>
            <Text style={pdfStyles.fieldValue}>{ticket.category.replace('_', ' ')}</Text>
          </View>
          <View style={pdfStyles.fieldRow}>
            <Text style={pdfStyles.fieldLabel}>Priority:</Text>
            <View>
              <Text
                style={[
                  pdfStyles.priorityBadge,
                  { backgroundColor: priorityColors[ticket.priority]?.bg || '#6b7280', color: priorityColors[ticket.priority]?.text || '#ffffff' },
                ]}
              >
                {ticket.priority}
              </Text>
            </View>
          </View>
          <View style={pdfStyles.fieldRow}>
            <Text style={pdfStyles.fieldLabel}>Status:</Text>
            <View>
              <Text
                style={[
                  pdfStyles.statusBadge,
                  { backgroundColor: statusColors[ticket.status]?.bg || '#6b7280', color: statusColors[ticket.status]?.text || '#ffffff' },
                ]}
              >
                {ticket.status.replace('_', ' ')}
              </Text>
            </View>
          </View>
          <View style={pdfStyles.fieldRow}>
            <Text style={pdfStyles.fieldLabel}>Reported By:</Text>
            <Text style={pdfStyles.fieldValue}>{ticket.createdBy.name} ({ticket.createdBy.email})</Text>
          </View>
          {ticket.assignedTo && (
            <View style={pdfStyles.fieldRow}>
              <Text style={pdfStyles.fieldLabel}>Assigned To:</Text>
              <Text style={pdfStyles.fieldValue}>{ticket.assignedTo.name} ({ticket.assignedTo.email})</Text>
            </View>
          )}
          {ticket.deviceInfo && (
            <View style={pdfStyles.fieldRow}>
              <Text style={pdfStyles.fieldLabel}>Device:</Text>
              <Text style={pdfStyles.fieldValue}>{ticket.deviceInfo}</Text>
            </View>
          )}
          {ticket.location && (
            <View style={pdfStyles.fieldRow}>
              <Text style={pdfStyles.fieldLabel}>Location:</Text>
              <Text style={pdfStyles.fieldValue}>{ticket.location}</Text>
            </View>
          )}
          <View style={pdfStyles.fieldRow}>
            <Text style={pdfStyles.fieldLabel}>Created:</Text>
            <Text style={pdfStyles.fieldValue}>{format(new Date(ticket.createdAt), 'PPpp')}</Text>
          </View>
          {ticket.resolvedAt && (
            <View style={pdfStyles.fieldRow}>
              <Text style={pdfStyles.fieldLabel}>Resolved:</Text>
              <Text style={pdfStyles.fieldValue}>{format(new Date(ticket.resolvedAt), 'PPpp')}</Text>
            </View>
          )}
          {ticket.closedAt && (
            <View style={pdfStyles.fieldRow}>
              <Text style={pdfStyles.fieldLabel}>Closed:</Text>
              <Text style={pdfStyles.fieldValue}>{format(new Date(ticket.closedAt), 'PPpp')}</Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>DESCRIPTION</Text>
          <Text style={pdfStyles.description}>{ticket.description}</Text>
        </View>

        {/* Timeline / Status History */}
        {ticket.logs.length > 0 && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>STATUS TIMELINE</Text>
            <View style={pdfStyles.timeline}>
              {ticket.logs.map((log, index) => (
                <View key={log.id} style={pdfStyles.timelineItem}>
                  <View
                    style={[
                      pdfStyles.timelineDot,
                      { backgroundColor: statusColors[log.newStatus]?.bg || '#6b7280' },
                    ]}
                  />
                  <View style={pdfStyles.timelineContent}>
                    <Text style={pdfStyles.timelineTime}>
                      {format(new Date(log.timestamp), 'PPpp')}
                    </Text>
                    <Text style={pdfStyles.timelineStatus}>
                      {log.oldStatus ? `${log.oldStatus.replace('_', ' ')} → ${log.newStatus.replace('_', ' ')}` : log.newStatus.replace('_', ' ')}
                    </Text>
                    {log.note && <Text style={pdfStyles.timelineNote}>{log.note}</Text>}
                    <Text style={pdfStyles.timelineTime}>By: {log.changedBy?.name ?? 'Unknown'}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Comments */}
        {ticket.comments.length > 0 && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>COMMENTS & COMMUNICATION</Text>
            {ticket.comments.map((comment) => (
              <View key={comment.id} style={pdfStyles.comment}>
                <View style={pdfStyles.commentHeader}>
                  <Text style={pdfStyles.commentAuthor}>
                    {comment.user?.name ?? 'Unknown'} {comment.isInternal ? '(Internal)' : ''}
                  </Text>
                  <Text style={pdfStyles.commentTime}>
                    {format(new Date(comment.createdAt), 'PPpp')}
                  </Text>
                </View>
                <Text style={pdfStyles.commentMessage}>{comment.message}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={pdfStyles.footer}>
          <Text>Generated on {format(new Date(generatedAt), 'PPpp')} by {generatedBy.name}</Text>
          <Text>KCA University ICT Directorate | Ruaraka Sub-County, Roysambu Ward, Nairobi County</Text>
          <Text>Advancing Knowledge, Driving Change</Text>
        </View>

        {/* Signature Lines */}
        <View style={{ marginTop: 40, flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <View style={pdfStyles.signatureLine} />
            <Text style={pdfStyles.signatureLabel}>Student Signature / Date</Text>
          </View>
          <View>
            <View style={pdfStyles.signatureLine} />
            <Text style={pdfStyles.signatureLabel}>Technician Signature / Date</Text>
          </View>
          <View>
            <View style={pdfStyles.signatureLine} />
            <Text style={pdfStyles.signatureLabel}>Director Signature / Date</Text>
          </View>
        </View>
      </Page>
    </Document>
  );

  return pdf(doc).toBlob().then((blob: Blob) => blob.arrayBuffer()).then((buffer: ArrayBuffer) => new Uint8Array(buffer));
}