import { Document, Page, Text, View } from '@react-pdf/renderer';
import { pdf } from '@react-pdf/renderer';
import { pdfStyles, statusColors, priorityColors } from './PDFStyles';
import { format } from 'date-fns';
import type { RangeReportPDFData } from '@/types/pdf';

export async function generateRangeReportPDF(data: RangeReportPDFData): Promise<Uint8Array> {
  const { dateFrom, dateTo, stats, tickets, generatedAt, generatedBy } = data;

  const doc = (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header */}
        <View style={pdfStyles.header}>
          <View style={pdfStyles.logoSection}>
            <View style={pdfStyles.logo} />
            <View style={pdfStyles.titleBlock}>
              <Text style={pdfStyles.mainTitle}>KCA University</Text>
              <Text style={pdfStyles.subtitle}>ICT Directorate - Periodic Report</Text>
            </View>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={{ fontSize: 10, color: '#6b7280' }}>
              {format(new Date(dateFrom), 'MMM d, yyyy')} - {format(new Date(dateTo), 'MMM d, yyyy')}
            </Text>
          </View>
        </View>

        {/* Summary Stats */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>EXECUTIVE SUMMARY</Text>
          <View style={pdfStyles.statsGrid}>
            <View style={pdfStyles.statCard}>
              <Text style={pdfStyles.statValue}>{stats.totalTickets}</Text>
              <Text style={pdfStyles.statLabel}>Total Tickets</Text>
            </View>
            <View style={pdfStyles.statCard}>
              <Text style={pdfStyles.statValue}>{stats.openTickets + stats.assignedTickets + stats.inProgressTickets}</Text>
              <Text style={pdfStyles.statLabel}>Open / Active</Text>
            </View>
            <View style={pdfStyles.statCard}>
              <Text style={pdfStyles.statValue}>{stats.resolvedTickets + stats.closedTickets}</Text>
              <Text style={pdfStyles.statLabel}>Resolved / Closed</Text>
            </View>
            <View style={pdfStyles.statCard}>
              <Text style={pdfStyles.statValue}>{stats.avgResolutionTimeHours.toFixed(1)}h</Text>
              <Text style={pdfStyles.statLabel}>Avg Resolution Time</Text>
            </View>
          </View>
        </View>

        {/* Tickets by Category */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>TICKETS BY CATEGORY</Text>
          <View style={pdfStyles.table}>
            <View style={pdfStyles.tableHeader}>
              <Text style={{ ...pdfStyles.tableCell, flex: 2 }}>Category</Text>
              <Text style={{ ...pdfStyles.tableCell, flex: 1, textAlign: 'center' }}>Count</Text>
              <Text style={{ ...pdfStyles.tableCell, flex: 1, textAlign: 'center' }}>Percentage</Text>
            </View>
            {Object.entries(stats.ticketsByCategory).map(([category, count]) => (
              <View key={category} style={pdfStyles.tableRow}>
                <Text style={{ ...pdfStyles.tableCell, flex: 2 }}>{category.replace('_', ' ')}</Text>
                <Text style={{ ...pdfStyles.tableCell, flex: 1, textAlign: 'center' }}>{count}</Text>
                <Text style={{ ...pdfStyles.tableCell, flex: 1, textAlign: 'center' }}>
                  {stats.totalTickets > 0 ? ((count / stats.totalTickets) * 100).toFixed(1) : 0}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tickets by Priority */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>TICKETS BY PRIORITY</Text>
          <View style={pdfStyles.table}>
            <View style={pdfStyles.tableHeader}>
              <Text style={{ ...pdfStyles.tableCell, flex: 2 }}>Priority</Text>
              <Text style={{ ...pdfStyles.tableCell, flex: 1, textAlign: 'center' }}>Count</Text>
              <Text style={{ ...pdfStyles.tableCell, flex: 1, textAlign: 'center' }}>Percentage</Text>
            </View>
            {Object.entries(stats.ticketsByPriority).map(([priority, count]) => (
              <View key={priority} style={pdfStyles.tableRow}>
                <Text style={{ ...pdfStyles.tableCell, flex: 2 }}>{priority}</Text>
                <Text style={{ ...pdfStyles.tableCell, flex: 1, textAlign: 'center' }}>{count}</Text>
                <Text style={{ ...pdfStyles.tableCell, flex: 1, textAlign: 'center' }}>
                  {stats.totalTickets > 0 ? ((count / stats.totalTickets) * 100).toFixed(1) : 0}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Technician Performance */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>TECHNICIAN PERFORMANCE</Text>
          <View style={pdfStyles.table}>
            <View style={pdfStyles.tableHeader}>
              <Text style={{ ...pdfStyles.tableCell, flex: 2 }}>Technician</Text>
              <Text style={{ ...pdfStyles.tableCell, flex: 1, textAlign: 'center' }}>Assigned</Text>
              <Text style={{ ...pdfStyles.tableCell, flex: 1, textAlign: 'center' }}>Resolved</Text>
              <Text style={{ ...pdfStyles.tableCell, flex: 1, textAlign: 'center' }}>Avg Resolution (hrs)</Text>
              <Text style={{ ...pdfStyles.tableCell, flex: 1, textAlign: 'center' }}>Resolution Rate</Text>
            </View>
            {stats.ticketsByTechnician.map((tech) => (
              <View key={tech.technician.id} style={pdfStyles.tableRow}>
                <Text style={{ ...pdfStyles.tableCell, flex: 2 }}>{tech.technician.name}</Text>
                <Text style={{ ...pdfStyles.tableCell, flex: 1, textAlign: 'center' }}>{tech.assigned}</Text>
                <Text style={{ ...pdfStyles.tableCell, flex: 1, textAlign: 'center' }}>{tech.resolved}</Text>
                <Text style={{ ...pdfStyles.tableCell, flex: 1, textAlign: 'center' }}>{tech.avgResolutionHours.toFixed(1)}</Text>
                <Text style={{ ...pdfStyles.tableCell, flex: 1, textAlign: 'center' }}>
                  {tech.assigned > 0 ? ((tech.resolved / tech.assigned) * 100).toFixed(1) : 0}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Ticket List */}
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>TICKET DETAILS</Text>
          <View style={pdfStyles.table}>
            <View style={pdfStyles.tableHeader}>
              <Text style={{ ...pdfStyles.tableCell, flex: 1 }}>ID</Text>
              <Text style={{ ...pdfStyles.tableCell, flex: 2 }}>Title</Text>
              <Text style={{ ...pdfStyles.tableCell, flex: 1 }}>Category</Text>
              <Text style={{ ...pdfStyles.tableCell, flex: 1 }}>Priority</Text>
              <Text style={{ ...pdfStyles.tableCell, flex: 1 }}>Status</Text>
              <Text style={{ ...pdfStyles.tableCell, flex: 1 }}>Assigned To</Text>
              <Text style={{ ...pdfStyles.tableCell, flex: 1 }}>Created</Text>
            </View>
            {tickets.slice(0, 50).map((ticket) => (
              <View key={ticket.id} style={pdfStyles.tableRow}>
                <Text style={{ ...pdfStyles.tableCell, flex: 1, fontFamily: 'Courier', fontSize: 8 }}>{ticket.id}</Text>
                <Text style={{ ...pdfStyles.tableCell, flex: 2 }}>{truncate(ticket.title, 40)}</Text>
                <Text style={{ ...pdfStyles.tableCell, flex: 1, fontSize: 8 }}>{ticket.category.replace('_', ' ')}</Text>
                <Text
                  style={{
                    ...pdfStyles.tableCell,
                    flex: 1,
                    textAlign: 'center',
                    backgroundColor: priorityColors[ticket.priority]?.bg || '#6b7280',
                    color: priorityColors[ticket.priority]?.text || '#ffffff',
                    padding: 2,
                    borderRadius: 3,
                    fontSize: 8,
                  }}
                >
                  {ticket.priority}
                </Text>
                <Text
                  style={{
                    ...pdfStyles.tableCell,
                    flex: 1,
                    textAlign: 'center',
                    backgroundColor: statusColors[ticket.status]?.bg || '#6b7280',
                    color: statusColors[ticket.status]?.text || '#ffffff',
                    padding: 2,
                    borderRadius: 3,
                    fontSize: 8,
                  }}
                >
                  {ticket.status.replace('_', ' ')}
                </Text>
                <Text style={{ ...pdfStyles.tableCell, flex: 1, fontSize: 8 }}>{ticket.assignedTo?.name || 'Unassigned'}</Text>
                <Text style={{ ...pdfStyles.tableCell, flex: 1, fontSize: 8 }}>{format(new Date(ticket.createdAt), 'MMM d, yyyy')}</Text>
              </View>
            ))}
            {tickets.length > 50 && (
              <View style={pdfStyles.tableRow}>
                <Text style={{ ...pdfStyles.tableCell, flex: 7, textAlign: 'center', color: '#6b7280' }}>
                  ... and {tickets.length - 50} more tickets (full list available in system)
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={pdfStyles.footer}>
          <Text>Report generated on {format(new Date(generatedAt), 'PPpp')} by {generatedBy.name}</Text>
          <Text>KCA University ICT Directorate | Ruaraka Sub-County, Roysambu Ward, Nairobi County</Text>
          <Text>Advancing Knowledge, Driving Change</Text>
        </View>
      </Page>
    </Document>
  );

  return pdf(doc).toBlob().then((blob: Blob) => blob.arrayBuffer()).then((buffer: ArrayBuffer) => new Uint8Array(buffer));
}

function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length - 3) + '...';
}