import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ReportSystem {
  id: string;
  name: string;
  description: string | null;
  sector: string;
  ai_act_level: string;
  ai_act_role: string | null;
  status: string;
  is_poc: boolean;
  created_at: string;
  updated_at: string;
  risk_analysis_completed: boolean;
}

export interface ReportObligation {
  id: string;
  obligation_key: string;
  obligation_title: string;
  is_completed: boolean;
  completed_at: string | null;
  evidence_count?: number;
}

export interface ReportRisk {
  id: string;
  status: string;
  probability: string | null;
  impact: string | null;
  residual_risk_score: number | null;
  mitigation_measures: string | null;
  responsible_person: string | null;
  due_date: string | null;
  catalog_risk?: {
    name: string;
    domain: string;
    criticality: string;
  };
}

export interface ReportOrganization {
  name: string;
}

export interface ComplianceReportData {
  system: ReportSystem;
  obligations: ReportObligation[];
  risks: ReportRisk[];
  organization: ReportOrganization;
  generatedAt: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const RISK_LEVEL_LABELS: Record<string, string> = {
  prohibited: 'Prohibido',
  high_risk: 'Alto Riesgo',
  limited_risk: 'Riesgo Limitado',
  minimal_risk: 'Riesgo Mínimo',
  unclassified: 'Sin Clasificar',
};

const AI_ACT_ROLE_LABELS: Record<string, string> = {
  provider: 'Proveedor',
  deployer: 'Usuario (Deployer)',
  distributor: 'Distribuidor',
  importer: 'Importador',
};

const SECTOR_LABELS: Record<string, string> = {
  finance: 'Finanzas',
  healthcare: 'Salud',
  education: 'Educación',
  government: 'Gobierno',
  retail: 'Comercio',
  technology: 'Tecnología',
  entertainment: 'Entretenimiento',
  manufacturing: 'Manufactura',
  transportation: 'Transporte',
  other: 'Otro',
};

const RISK_STATUS_LABELS: Record<string, string> = {
  identified: 'Identificado',
  assessed: 'Evaluado',
  mitigated: 'Mitigado',
  accepted: 'Aceptado',
  not_applicable: 'No aplica',
};

const CRITICALITY_LABELS: Record<string, string> = {
  critical: 'Crítico',
  high: 'Alto',
  medium: 'Medio',
  low: 'Bajo',
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  } catch {
    return iso;
  }
}

// ── Styles ───────────────────────────────────────────────────────────────────

const COLORS = {
  primary: '#1d4ed8',
  primaryLight: '#dbeafe',
  prohibited: '#dc2626',
  prohibitedLight: '#fee2e2',
  highRisk: '#ea580c',
  highRiskLight: '#ffedd5',
  limitedRisk: '#ca8a04',
  limitedRiskLight: '#fef9c3',
  minimalRisk: '#16a34a',
  minimalRiskLight: '#dcfce7',
  unclassified: '#6b7280',
  unclassifiedLight: '#f3f4f6',
  success: '#16a34a',
  warning: '#ca8a04',
  danger: '#dc2626',
  text: '#111827',
  textMuted: '#6b7280',
  border: '#e5e7eb',
  bg: '#f9fafb',
  white: '#ffffff',
};

function levelColor(level: string) {
  switch (level) {
    case 'prohibited': return COLORS.prohibited;
    case 'high_risk': return COLORS.highRisk;
    case 'limited_risk': return COLORS.limitedRisk;
    case 'minimal_risk': return COLORS.minimalRisk;
    default: return COLORS.unclassified;
  }
}

function levelBgColor(level: string) {
  switch (level) {
    case 'prohibited': return COLORS.prohibitedLight;
    case 'high_risk': return COLORS.highRiskLight;
    case 'limited_risk': return COLORS.limitedRiskLight;
    case 'minimal_risk': return COLORS.minimalRiskLight;
    default: return COLORS.unclassifiedLight;
  }
}

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, color: COLORS.text, backgroundColor: COLORS.white, paddingTop: 0, paddingBottom: 40, paddingHorizontal: 0 },
  // Header
  header: { backgroundColor: COLORS.primary, paddingVertical: 24, paddingHorizontal: 36, marginBottom: 0 },
  headerTitle: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: COLORS.white, marginBottom: 4 },
  headerSubtitle: { fontSize: 10, color: '#bfdbfe' },
  // Body wrapper
  body: { paddingHorizontal: 36, paddingTop: 24 },
  // Section
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: COLORS.primary, marginBottom: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: COLORS.primaryLight },
  // Cards
  card: { backgroundColor: COLORS.bg, borderRadius: 6, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  cardRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  // Labels
  label: { fontSize: 8, color: COLORS.textMuted, marginBottom: 2, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 10, color: COLORS.text },
  // Badge
  badge: { borderRadius: 4, paddingVertical: 3, paddingHorizontal: 8, alignSelf: 'flex-start' },
  badgeText: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  // Metrics row
  metricsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  metricCard: { flex: 1, backgroundColor: COLORS.bg, borderRadius: 6, padding: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  metricValue: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: COLORS.primary, marginBottom: 2 },
  metricLabel: { fontSize: 8, color: COLORS.textMuted, textAlign: 'center' },
  // Table
  tableHeader: { flexDirection: 'row', backgroundColor: COLORS.primaryLight, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 4, marginBottom: 2 },
  tableRow: { flexDirection: 'row', paddingVertical: 7, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tableRowAlt: { flexDirection: 'row', paddingVertical: 7, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.bg },
  tableHeaderText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: COLORS.primary },
  tableCellText: { fontSize: 9, color: COLORS.text },
  // Progress
  progressBar: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, marginTop: 4 },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: COLORS.success },
  // Status dots
  dotGreen: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.success, marginRight: 5, marginTop: 1 },
  dotOrange: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.warning, marginRight: 5, marginTop: 1 },
  dotRed: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.danger, marginRight: 5, marginTop: 1 },
  dotGray: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.textMuted, marginRight: 5, marginTop: 1 },
  // Footer
  footer: { position: 'absolute', bottom: 16, left: 36, right: 36, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 8 },
  footerText: { fontSize: 8, color: COLORS.textMuted },
});

// ── Sub-components ────────────────────────────────────────────────────────────

function RiskLevelBadge({ level }: { level: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: levelBgColor(level) }]}>
      <Text style={[styles.badgeText, { color: levelColor(level) }]}>
        {RISK_LEVEL_LABELS[level] ?? level}
      </Text>
    </View>
  );
}

function StatusDot({ status }: { status: 'completed' | 'pending' | 'warning' | 'neutral' }) {
  const dot = status === 'completed' ? styles.dotGreen
    : status === 'warning' ? styles.dotOrange
    : status === 'pending' ? styles.dotRed
    : styles.dotGray;
  return <View style={dot} />;
}

// ── Main Component ────────────────────────────────────────────────────────────

export function ComplianceReportPDF({ data }: { data: ComplianceReportData }) {
  const { system, obligations, risks, organization, generatedAt } = data;

  const completedObligations = obligations.filter(o => o.is_completed).length;
  const totalObligations = obligations.length;
  const obligationPct = totalObligations > 0 ? Math.round((completedObligations / totalObligations) * 100) : 0;

  const activeRisks = risks.filter(r => r.status !== 'not_applicable');
  const mitigatedRisks = risks.filter(r => r.status === 'mitigated' || r.status === 'accepted').length;
  const openCritical = risks.filter(r => r.status !== 'mitigated' && r.status !== 'accepted' && r.status !== 'not_applicable' && r.catalog_risk?.criticality === 'critical').length;
  const riskPct = activeRisks.length > 0 ? Math.round((mitigatedRisks / activeRisks.length) * 100) : 0;

  return (
    <Document
      title={`Informe de Cumplimiento - ${system.name}`}
      author="CumplIA"
      creator="CumplIA - AI Act Compliance"
      subject="Informe de cumplimiento AI Act"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Informe de Cumplimiento AI Act</Text>
          <Text style={styles.headerSubtitle}>
            {organization.name} · Generado el {formatDate(generatedAt)}
          </Text>
        </View>

        <View style={styles.body}>
          {/* System Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información del Sistema</Text>
            <View style={styles.card}>
              <View style={[styles.cardRow, { marginBottom: 10 }]}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.label}>Nombre del Sistema</Text>
                  <Text style={[styles.value, { fontSize: 13, fontFamily: 'Helvetica-Bold' }]}>{system.name}</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <RiskLevelBadge level={system.ai_act_level} />
                </View>
              </View>
              {system.description && (
                <View style={{ marginBottom: 10 }}>
                  <Text style={styles.label}>Descripción</Text>
                  <Text style={[styles.value, { color: COLORS.textMuted, lineHeight: 1.4 }]}>{system.description}</Text>
                </View>
              )}
              <View style={styles.cardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Sector</Text>
                  <Text style={styles.value}>{SECTOR_LABELS[system.sector] ?? system.sector}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Rol AI Act</Text>
                  <Text style={styles.value}>{AI_ACT_ROLE_LABELS[system.ai_act_role ?? ''] ?? system.ai_act_role ?? '—'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Tipo</Text>
                  <Text style={styles.value}>{system.is_poc ? 'Prueba de Concepto (PoC)' : 'En Producción'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Creado</Text>
                  <Text style={styles.value}>{formatDate(system.created_at)}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Metrics */}
          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: obligationPct === 100 ? COLORS.success : obligationPct >= 50 ? COLORS.warning : COLORS.danger }]}>
                {obligationPct}%
              </Text>
              <Text style={styles.metricLabel}>Obligaciones{'\n'}completadas</Text>
              <Text style={[styles.metricLabel, { marginTop: 2 }]}>{completedObligations}/{totalObligations}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: riskPct >= 80 ? COLORS.success : riskPct >= 50 ? COLORS.warning : COLORS.danger }]}>
                {riskPct}%
              </Text>
              <Text style={styles.metricLabel}>Riesgos{'\n'}mitigados</Text>
              <Text style={[styles.metricLabel, { marginTop: 2 }]}>{mitigatedRisks}/{activeRisks.length}</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: openCritical === 0 ? COLORS.success : COLORS.danger }]}>
                {openCritical}
              </Text>
              <Text style={styles.metricLabel}>Riesgos críticos{'\n'}sin mitigar</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={[styles.metricValue, { color: system.risk_analysis_completed ? COLORS.success : COLORS.warning }]}>
                {system.risk_analysis_completed ? '✓' : '—'}
              </Text>
              <Text style={styles.metricLabel}>Análisis de{'\n'}riesgos completado</Text>
            </View>
          </View>

          {/* Obligations */}
          {obligations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Estado de Obligaciones</Text>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 3 }]}>Obligación</Text>
                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Estado</Text>
                <Text style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'right' }]}>Completada</Text>
              </View>
              {obligations.map((ob, i) => (
                <View key={ob.id} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                  <View style={[{ flex: 3, flexDirection: 'row', alignItems: 'flex-start' }]}>
                    <StatusDot status={ob.is_completed ? 'completed' : 'pending'} />
                    <Text style={styles.tableCellText}>{ob.obligation_title}</Text>
                  </View>
                  <Text style={[styles.tableCellText, { flex: 1, textAlign: 'center', color: ob.is_completed ? COLORS.success : COLORS.danger }]}>
                    {ob.is_completed ? 'Completada' : 'Pendiente'}
                  </Text>
                  <Text style={[styles.tableCellText, { flex: 1.5, textAlign: 'right', color: COLORS.textMuted }]}>
                    {ob.completed_at ? formatDate(ob.completed_at) : '—'}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>CumplIA · Informe AI Act · {organization.name}</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>

      {/* Risks page (if there are risks) */}
      {activeRisks.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Registro de Riesgos</Text>
            <Text style={styles.headerSubtitle}>{system.name} · {organization.name}</Text>
          </View>

          <View style={styles.body}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 3 }]}>Riesgo</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Dominio</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Criticidad</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Estado</Text>
              <Text style={[styles.tableHeaderText, { flex: 0.8, textAlign: 'right' }]}>Score</Text>
            </View>
            {activeRisks.map((risk, i) => {
              const status = risk.status;
              const dotStatus = (status === 'mitigated' || status === 'accepted') ? 'completed'
                : status === 'assessed' ? 'warning' : 'pending';
              return (
                <View key={risk.id} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                  <View style={{ flex: 3, flexDirection: 'row', alignItems: 'flex-start' }}>
                    <StatusDot status={dotStatus} />
                    <Text style={[styles.tableCellText, { flexWrap: 'wrap' }]}>
                      {risk.catalog_risk?.name ?? '—'}
                    </Text>
                  </View>
                  <Text style={[styles.tableCellText, { flex: 1, color: COLORS.textMuted }]}>
                    {risk.catalog_risk?.domain ?? '—'}
                  </Text>
                  <Text style={[styles.tableCellText, { flex: 1, color: risk.catalog_risk?.criticality === 'critical' ? COLORS.danger : COLORS.text }]}>
                    {CRITICALITY_LABELS[risk.catalog_risk?.criticality ?? ''] ?? '—'}
                  </Text>
                  <Text style={[styles.tableCellText, { flex: 1 }]}>
                    {RISK_STATUS_LABELS[status] ?? status}
                  </Text>
                  <Text style={[styles.tableCellText, { flex: 0.8, textAlign: 'right' }]}>
                    {risk.residual_risk_score != null ? `${risk.residual_risk_score}/10` : '—'}
                  </Text>
                </View>
              );
            })}

            {/* Mitigation highlights */}
            {activeRisks.filter(r => r.mitigation_measures && (r.status === 'mitigated' || r.status === 'assessed')).length > 0 && (
              <View style={[styles.section, { marginTop: 20 }]}>
                <Text style={styles.sectionTitle}>Medidas de Mitigación Documentadas</Text>
                {activeRisks
                  .filter(r => r.mitigation_measures && r.status !== 'not_applicable')
                  .slice(0, 8)
                  .map((risk, i) => (
                    <View key={risk.id} style={[styles.card, { marginBottom: 6 }]}>
                      <Text style={[styles.label, { marginBottom: 3 }]}>{risk.catalog_risk?.name ?? 'Riesgo'}</Text>
                      <Text style={[styles.value, { color: COLORS.textMuted, lineHeight: 1.4 }]}>{risk.mitigation_measures}</Text>
                      {risk.responsible_person && (
                        <Text style={[styles.footerText, { marginTop: 4 }]}>Responsable: {risk.responsible_person}</Text>
                      )}
                    </View>
                  ))}
              </View>
            )}
          </View>

          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>CumplIA · Informe AI Act · {organization.name}</Text>
            <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
          </View>
        </Page>
      )}
    </Document>
  );
}
