import { Document, Image, Page, renderToBuffer, StyleSheet, Text, View } from "@react-pdf/renderer";

import { formatDateTime, formatPrice, paymentLabels } from "@/components/app/format";
import type { BatchReport } from "@/server/orders";

const ink = "#1a1714";
const muted = "#6b6257";
const hairline = "#d9d2c5";
const asphalt = "#0c0b0a";
const ember = "#d4551f";
const cream = "#f0dfbd";

const statusLabels = { OPEN: "Aberta", CLOSED: "Fechada", CANCELLED: "Cancelada" };

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 54,
    paddingHorizontal: 36,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: ink,
  },
  band: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: asphalt,
    padding: 14,
    borderBottomWidth: 3,
    borderBottomColor: ember,
  },
  logo: { width: 46, height: 46 },
  brand: { marginLeft: 12, flexGrow: 1 },
  brandName: { fontFamily: "Helvetica-Bold", fontSize: 16, color: cream, letterSpacing: 1 },
  brandNote: { marginTop: 3, fontSize: 9, color: cream },
  generated: { fontSize: 9, color: cream, textAlign: "right" },
  intro: { flexDirection: "row", marginTop: 18, marginBottom: 18 },
  photo: { width: 112, height: 140, objectFit: "cover", marginRight: 16 },
  introText: { flexGrow: 1, flexShrink: 1, justifyContent: "center" },
  label: { fontFamily: "Helvetica-Bold", fontSize: 8, color: muted, letterSpacing: 0.8 },
  model: { fontFamily: "Helvetica-Bold", fontSize: 24, marginTop: 4 },
  introLine: { marginTop: 6, fontSize: 11 },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.75,
    borderBottomColor: hairline,
    paddingVertical: 6,
  },
  headRow: {
    flexDirection: "row",
    borderBottomWidth: 1.5,
    borderBottomColor: ink,
    paddingBottom: 5,
    marginBottom: 1,
  },
  colName: { width: "32%", paddingRight: 8 },
  colItems: { width: "34%", paddingRight: 8 },
  colPieces: { width: "8%", textAlign: "right" },
  colValue: { width: "14%", textAlign: "right" },
  colPayment: { width: "12%", textAlign: "right" },
  bold: { fontFamily: "Helvetica-Bold" },
  totals: { marginTop: 22 },
  sectionTitle: { fontFamily: "Helvetica-Bold", fontSize: 12, marginBottom: 8 },
  gridCell: { width: 44, textAlign: "right" },
  gridName: { flexGrow: 1 },
  money: { flexDirection: "row", marginTop: 16 },
  moneyBox: {
    flexGrow: 1,
    flexBasis: 0,
    borderTopWidth: 2,
    borderTopColor: ember,
    paddingTop: 6,
    marginRight: 12,
  },
  moneyValue: { fontFamily: "Helvetica-Bold", fontSize: 16, marginTop: 3 },
  empty: { marginTop: 8, color: muted },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: muted,
  },
});

type BatchReportPdfInput = {
  report: BatchReport;
  generatedAt: Date;
  logoDataUri: string;
  photoDataUri: string | null;
};

function describeItems(items: BatchReport["orders"][number]["items"]) {
  return items.map((item) => `${item.quantity}× ${item.colorName} ${item.size}`).join(", ");
}

function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function BatchReportDocument({ report, generatedAt, logoDataUri, photoDataUri }: BatchReportPdfInput) {
  const { production } = report;
  const hasOrders = report.orders.length > 0;
  const generatedLabel = formatDateTime(generatedAt);

  return (
    <Document title={`Vestuário ${report.model}`} author="Scrambler RJ" language="pt-BR">
      <Page size="A4" style={styles.page}>
        <View style={styles.band}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- PDF image, not an HTML element */}
          <Image src={logoDataUri} style={styles.logo} />
          <View style={styles.brand}>
            <Text style={styles.brandName}>SCRAMBLER RJ</Text>
            <Text style={styles.brandNote}>Campanha de vestuário</Text>
          </View>
          <Text style={styles.generated}>Gerado em {generatedLabel}</Text>
        </View>

        <View style={styles.intro}>
          {photoDataUri && (
            // eslint-disable-next-line jsx-a11y/alt-text -- PDF image, not an HTML element
            <Image src={photoDataUri} style={styles.photo} />
          )}
          <View style={styles.introText}>
            <Text style={styles.label}>CAMPANHA · {statusLabels[report.status].toUpperCase()}</Text>
            <Text style={styles.model}>{report.model}</Text>
            <Text style={styles.introLine}>{formatPrice(report.unitPriceCents)} por peça</Text>
            <Text style={styles.introLine}>
              {countLabel(report.orders.length, "pedido", "pedidos")} ·{" "}
              {countLabel(production.totalPieces, "peça", "peças")}
            </Text>
          </View>
        </View>

        <View style={styles.headRow} fixed>
          <Text style={[styles.colName, styles.label]}>RIDER</Text>
          <Text style={[styles.colItems, styles.label]}>PEÇAS</Text>
          <Text style={[styles.colPieces, styles.label]}>QTD</Text>
          <Text style={[styles.colValue, styles.label]}>VALOR</Text>
          <Text style={[styles.colPayment, styles.label]}>PAGAMENTO</Text>
        </View>

        {report.orders.map((order) => (
          <View key={order.participantName} style={styles.row} wrap={false}>
            <Text style={styles.colName}>{order.participantName}</Text>
            <Text style={styles.colItems}>{describeItems(order.items)}</Text>
            <Text style={styles.colPieces}>{order.pieces}</Text>
            <Text style={styles.colValue}>{formatPrice(order.totalCents)}</Text>
            <Text style={[styles.colPayment, order.paymentStatus === "PAID" ? styles.bold : {}]}>
              {paymentLabels[order.paymentStatus]}
            </Text>
          </View>
        ))}
        {!hasOrders && <Text style={styles.empty}>Nenhum pedido nesta campanha.</Text>}

        <View style={styles.totals} wrap={false}>
          <Text style={styles.sectionTitle}>Totais para produção</Text>

          <View style={styles.headRow}>
            <Text style={[styles.gridName, styles.label]}>COR</Text>
            {production.sizes.map((size) => (
              <Text key={size} style={[styles.gridCell, styles.label]}>
                {size}
              </Text>
            ))}
            <Text style={[styles.gridCell, styles.label]}>TOTAL</Text>
          </View>
          {production.rows.map((row) => (
            <View key={row.colorId} style={styles.row}>
              <Text style={styles.gridName}>{row.colorName}</Text>
              {row.quantities.map((quantity, index) => (
                <Text key={production.sizes[index]} style={styles.gridCell}>
                  {quantity}
                </Text>
              ))}
              <Text style={[styles.gridCell, styles.bold]}>{row.total}</Text>
            </View>
          ))}
          <View style={styles.row}>
            <Text style={[styles.gridName, styles.bold]}>Total</Text>
            {production.sizeTotals.map((total, index) => (
              <Text key={production.sizes[index]} style={[styles.gridCell, styles.bold]}>
                {total}
              </Text>
            ))}
            <Text style={[styles.gridCell, styles.bold]}>{production.totalPieces}</Text>
          </View>

          <View style={styles.money}>
            <View style={styles.moneyBox}>
              <Text style={styles.label}>PAGO</Text>
              <Text style={styles.moneyValue}>{formatPrice(production.paidCents)}</Text>
            </View>
            <View style={styles.moneyBox}>
              <Text style={styles.label}>PENDENTE</Text>
              <Text style={styles.moneyValue}>{formatPrice(production.pendingCents)}</Text>
            </View>
            <View style={[styles.moneyBox, { marginRight: 0 }]}>
              <Text style={styles.label}>TOTAL DA CAMPANHA</Text>
              <Text style={styles.moneyValue}>{formatPrice(production.totalCents)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>
            Scrambler RJ · {report.model} · {generatedLabel}
          </Text>
          <Text
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}

export function renderBatchReportPdf(input: BatchReportPdfInput) {
  return renderToBuffer(<BatchReportDocument {...input} />);
}
