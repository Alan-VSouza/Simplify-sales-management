import React, { useEffect, useMemo, useState } from "react";
import { Box, Card, Chip, Grid, Skeleton, Stack, Tooltip as MuiTooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import PercentRoundedIcon from "@mui/icons-material/PercentRounded";
import ShoppingCartCheckoutRoundedIcon from "@mui/icons-material/ShoppingCartCheckoutRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { API_URL } from "../../config/api";
import { ITransaction, PaymentMethod, TransactionType } from "@reducers/transaction/interface";
import { formatCurrency, formatDateTime, formatPercent } from "../../utils/format";
import { brand, chartPalette } from "../../theme";

const paymentLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CreditCard]: "Crédito",
  [PaymentMethod.DebitCard]: "Débito",
  [PaymentMethod.Money]: "Dinheiro",
  [PaymentMethod.Pix]: "Pix",
};

const dayLabel = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
const compactBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact" });

interface Kpi {
  title: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  tone: string;
  negative?: boolean;
}

const KpiCard: React.FC<Kpi> = ({ title, value, hint, icon, tone, negative }) => (
  <Card sx={{ p: { xs: 2, sm: 2.5 }, height: "100%" }}>
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Box
        sx={{
          width: 40,
          height: 40,
          flexShrink: 0,
          borderRadius: "12px",
          display: "grid",
          placeItems: "center",
          bgcolor: alpha(tone, 0.12),
          color: tone,
        }}
      >
        {icon}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, flex: 1 }}>
        {title}
      </Typography>
      <MuiTooltip title={hint} placement="top">
        <InfoOutlinedIcon sx={{ fontSize: 18, color: "text.disabled", cursor: "help", display: { xs: "none", sm: "block" } }} />
      </MuiTooltip>
    </Stack>
    <Typography
      sx={{
        mt: 2,
        fontSize: { xs: 19, sm: 24, md: 26 },
        fontWeight: 800,
        letterSpacing: "-0.03em",
        color: negative ? "error.main" : "text.primary",
      }}
    >
      {value}
    </Typography>
  </Card>
);

const Panel: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <Card sx={{ p: { xs: 2, md: 3 }, height: "100%" }}>
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6">{title}</Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
    {children}
  </Card>
);

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
    <Typography variant="body2">{text}</Typography>
  </Box>
);

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`${API_URL}/api/Transaction`);
        if (!response.ok) throw new Error("Erro ao buscar transações");
        setTransactions(await response.json());
      } catch (error) {
        console.error("Erro ao carregar transações:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const data = useMemo(() => {
    const active = transactions.filter((t) => t.active);
    const sales = active.filter((t) => t.type === TransactionType.Sell);
    const purchases = active.filter((t) => t.type === TransactionType.Buy);

    let grossRevenue = 0;
    let totalDiscounts = 0;
    let totalCosts = 0;
    sales.forEach((t) => {
      grossRevenue += t.totalValue;
      totalDiscounts += t.totalDiscount;
      // The API stores the product's factory cost in `value` (TransactionService.Create).
      t.transactionsItems.forEach((item) => {
        totalCosts += item.value * item.amount;
      });
    });
    const totalPurchases = purchases.reduce((acc, t) => acc + t.finalValue, 0);
    const netRevenue = grossRevenue - totalDiscounts - totalCosts;
    const grossProfit = netRevenue - totalPurchases;
    const grossMargin = grossRevenue !== 0 ? grossProfit / grossRevenue : 0;

    // Sales per day, oldest first.
    const byDay = new Map<string, { date: Date; total: number }>();
    sales.forEach((t) => {
      const date = new Date(t.transactionAt);
      if (Number.isNaN(date.getTime())) return;
      const key = date.toISOString().slice(0, 10);
      const entry = byDay.get(key) ?? { date, total: 0 };
      entry.total += t.finalValue;
      byDay.set(key, entry);
    });
    const timeline = [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => ({ label: dayLabel.format(v.date), total: Math.round(v.total * 100) / 100 }));

    // Revenue share per payment method.
    const byPayment = new Map<string, number>();
    sales.forEach((t) => {
      const label = paymentLabels[t.paymentMethod] ?? "Outros";
      byPayment.set(label, (byPayment.get(label) ?? 0) + t.finalValue);
    });
    const payments = [...byPayment.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const paymentsTotal = payments.reduce((acc, p) => acc + p.value, 0);

    // Best sellers by revenue.
    const byProduct = new Map<string, { name: string; amount: number; revenue: number }>();
    sales.forEach((t) =>
      t.transactionsItems.forEach((item) => {
        const name = item.product?.name ?? `Produto #${item.productId}`;
        const entry = byProduct.get(name) ?? { name, amount: 0, revenue: 0 };
        entry.amount += item.amount;
        entry.revenue += item.sellValue * item.amount;
        byProduct.set(name, entry);
      })
    );
    const topProducts = [...byProduct.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    const recent = [...active]
      .sort((a, b) => new Date(b.transactionAt).getTime() - new Date(a.transactionAt).getTime())
      .slice(0, 5);

    return {
      grossRevenue,
      totalDiscounts,
      netRevenue,
      grossProfit,
      grossMargin,
      totalPurchases,
      salesCount: sales.length,
      averageTicket: sales.length ? grossRevenue / sales.length : 0,
      timeline,
      payments,
      paymentsTotal,
      topProducts,
      recent,
    };
  }, [transactions]);

  const kpis: Kpi[] = [
    {
      title: "Renda bruta",
      value: formatCurrency(data.grossRevenue),
      hint: "Soma total das vendas antes de qualquer dedução.",
      icon: <TrendingUpRoundedIcon fontSize="small" />,
      tone: chartPalette[0],
    },
    {
      title: "Renda líquida",
      value: formatCurrency(data.netRevenue),
      hint: "Receita após descontos e custo dos produtos vendidos.",
      icon: <PaymentsOutlinedIcon fontSize="small" />,
      tone: chartPalette[3],
      negative: data.netRevenue < 0,
    },
    {
      title: "Lucro bruto",
      value: formatCurrency(data.grossProfit),
      hint: "Renda líquida menos o total de compras.",
      icon: <SavingsOutlinedIcon fontSize="small" />,
      tone: chartPalette[1],
      negative: data.grossProfit < 0,
    },
    {
      title: "Margem bruta",
      value: formatPercent(data.grossMargin),
      hint: "Lucro bruto sobre a renda bruta.",
      icon: <PercentRoundedIcon fontSize="small" />,
      tone: chartPalette[5],
      negative: data.grossMargin < 0,
    },
    {
      title: "Descontos",
      value: formatCurrency(data.totalDiscounts),
      hint: "Descontos aplicados nas vendas.",
      icon: <LocalOfferOutlinedIcon fontSize="small" />,
      tone: chartPalette[2],
    },
    {
      title: "Compras",
      value: formatCurrency(data.totalPurchases),
      hint: "Custo total das compras de mercadoria.",
      icon: <ShoppingCartCheckoutRoundedIcon fontSize="small" />,
      tone: chartPalette[4],
    },
  ];

  if (loading) {
    return (
      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <Skeleton variant="rounded" height={150} sx={{ borderRadius: "16px" }} />
        </Grid>
        {[...Array(6)].map((_, i) => (
          <Grid item xs={12} sm={6} lg={4} key={i}>
            <Skeleton variant="rounded" height={118} sx={{ borderRadius: "16px" }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Card
        sx={{
          p: { xs: 2.5, md: 3.5 },
          border: "none",
          color: "#fff",
          bgcolor: brand.forest,
          backgroundImage: `radial-gradient(90% 140% at 100% 0%, ${alpha(brand.lime, 0.22)} 0%, transparent 55%)`,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="overline" sx={{ color: brand.lime }}>
              Resumo do período
            </Typography>
            <Typography sx={{ fontSize: { xs: 34, md: 44 }, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              {formatCurrency(data.grossRevenue)}
            </Typography>
            <Typography sx={{ color: alpha("#fff", 0.7), mt: 0.5 }}>em vendas registradas</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={{ xs: 3, md: 5 }} justifyContent={{ md: "flex-end" }}>
              {[
                { label: "Vendas", value: String(data.salesCount) },
                { label: "Ticket médio", value: formatCurrency(data.averageTicket) },
                { label: "Margem", value: formatPercent(data.grossMargin) },
              ].map((item) => (
                <Box key={item.label}>
                  <Typography sx={{ color: alpha("#fff", 0.6), fontSize: 13, fontWeight: 600 }}>{item.label}</Typography>
                  <Typography sx={{ fontSize: { xs: 18, md: 22 }, fontWeight: 800 }}>{item.value}</Typography>
                </Box>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Card>

      <Grid container spacing={2.5}>
        {kpis.map((kpi) => (
          <Grid item xs={6} lg={4} key={kpi.title}>
            <KpiCard {...kpi} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <Panel title="Vendas por dia" subtitle="Valor final das vendas ativas">
            {data.timeline.length === 0 ? (
              <EmptyState text="Nenhuma venda registrada ainda." />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data.timeline} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={brand.green} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={brand.green} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={brand.line} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: brand.muted, fontSize: 12 }} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={72}
                    tick={{ fill: brand.muted, fontSize: 12 }}
                    tickFormatter={(v: number) => compactBRL.format(v)}
                  />
                  <Tooltip
                    formatter={(v: number) => [formatCurrency(v), "Vendas"]}
                    contentStyle={{ borderRadius: 12, border: `1px solid ${brand.line}` }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke={brand.green}
                    strokeWidth={2.5}
                    fill="url(#salesFill)"
                    dot={{ r: 3, fill: brand.green }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Panel>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Panel title="Formas de pagamento" subtitle="Participação no faturamento">
            {data.payments.length === 0 ? (
              <EmptyState text="Sem vendas para analisar." />
            ) : (
              <Stack direction={{ xs: "row", lg: "column" }} alignItems="center" spacing={2}>
                <Box sx={{ width: 180, height: 180, flexShrink: 0 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={data.payments} dataKey="value" innerRadius={56} outerRadius={84} paddingAngle={3} stroke="none">
                        {data.payments.map((_, i) => (
                          <Cell key={i} fill={chartPalette[i % chartPalette.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Stack spacing={1} sx={{ width: "100%" }}>
                  {data.payments.map((p, i) => (
                    <Stack key={p.name} direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ width: 10, height: 10, borderRadius: "3px", bgcolor: chartPalette[i % chartPalette.length] }} />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {p.name}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {formatPercent(data.paymentsTotal ? p.value / data.paymentsTotal : 0)}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            )}
          </Panel>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={5}>
          <Panel title="Mais vendidos" subtitle="Por faturamento">
            {data.topProducts.length === 0 ? (
              <EmptyState text="Os produtos vendidos aparecem aqui." />
            ) : (
              <Stack spacing={2}>
                {data.topProducts.map((p, i) => {
                  const share = data.topProducts[0].revenue ? p.revenue / data.topProducts[0].revenue : 0;
                  return (
                    <Box key={p.name}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          <Box component="span" sx={{ color: "text.secondary", mr: 1 }}>
                            {i + 1}
                          </Box>
                          {p.name}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {formatCurrency(p.revenue)}
                        </Typography>
                      </Stack>
                      <Box sx={{ height: 8, borderRadius: 4, bgcolor: brand.canvas, overflow: "hidden" }}>
                        <Box sx={{ width: `${Math.max(share * 100, 4)}%`, height: "100%", borderRadius: 4, bgcolor: brand.green }} />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {p.amount} {p.amount === 1 ? "unidade" : "unidades"}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Panel>
        </Grid>
        <Grid item xs={12} lg={7}>
          <Panel title="Últimas transações">
            {data.recent.length === 0 ? (
              <EmptyState text="Nenhuma transação ainda." />
            ) : (
              <Stack divider={<Box sx={{ borderTop: `1px solid ${brand.line}` }} />}>
                {data.recent.map((t) => {
                  const isSale = t.type === TransactionType.Sell;
                  const tone = isSale ? brand.green : chartPalette[4];
                  return (
                    <Stack key={t.id} direction="row" alignItems="center" spacing={1.5} sx={{ py: 1.25 }}>
                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: "11px",
                          display: "grid",
                          placeItems: "center",
                          fontWeight: 800,
                          fontSize: 14,
                          bgcolor: alpha(tone, 0.12),
                          color: tone,
                        }}
                      >
                        {(t.person?.name ?? "?").charAt(0).toUpperCase()}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography noWrap sx={{ fontWeight: 700, fontSize: 14 }}>
                          {t.person?.name ?? `Transação #${t.id}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(t.transactionAt)} · {paymentLabels[t.paymentMethod] ?? "-"}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={isSale ? "Venda" : "Compra"}
                        sx={{ display: { xs: "none", sm: "inline-flex" }, bgcolor: alpha(tone, 0.1), color: tone }}
                      />
                      <Typography sx={{ fontWeight: 800, minWidth: 96, textAlign: "right", fontSize: 14 }}>
                        {isSale ? "+ " : "- "}
                        {formatCurrency(t.finalValue)}
                      </Typography>
                    </Stack>
                  );
                })}
              </Stack>
            )}
          </Panel>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
