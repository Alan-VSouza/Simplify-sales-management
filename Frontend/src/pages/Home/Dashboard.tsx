import React, { useEffect, useState } from "react";
import { Typography,Grid,Card,CardContent,Skeleton,Box,Dialog,DialogTitle,DialogContent,DialogActions,Button, } from "@mui/material";
import { BarChart,Bar,Tooltip,ResponsiveContainer,CartesianGrid,XAxis,YAxis,Legend,Cell,LabelList, } from "recharts";

interface ITransaction {
  id: number;
  type: number;
  totalValue: number;
  totalDiscount: number;
  finalValue: number;
  active: boolean; 
  transactionsItems: {
    productId: number;
    amount: number;
    value: number;
    sellValue: number;
    discount: number;
  }[];
}

const getBarColor = (name: string) => {
  switch (name) {
    case "Renda Bruta":
      return "#4caf50";
    case "Total de Descontos":
      return "#ff9800";
    case "Renda Líquida":
      return "#2196f3";
    case "Lucro Bruto":
      return "#9c27b0";
    case "Total de Compras":
      return "#f44336";
    case "Margem Bruta":
      return "#00bcd4";
    default:
      return "#8884d8";
  }
};

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState({
    grossRevenue: 0,
    totalDiscounts: 0,
    netRevenue: 0,
    grossMargin: 0,
    totalPurchases: 0,
    grossProfit: 0,
  });

  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ title: string; description: string } | null>(
    null
  );

  const descriptions: { [key: string]: string } = {
    "Renda Bruta": "A soma total de vendas antes de qualquer dedução.",
    "Total de Descontos": "Os descontos aplicados às vendas.",
    "Renda Líquida": "Receita líquida após descontos e custos.",
    "Lucro Bruto": "Diferença entre renda líquida e total de compras.",
    "Margem Bruta": "Percentual de lucro bruto sobre a receita.",
    "Total de Compras": "Os custos totais das aquisições.",
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch("https://localhost:7159/api/Transaction");
      if (!response.ok) {
        throw new Error("Erro ao buscar transações");
      }
      const transactions: ITransaction[] = await response.json();
      calculateDashboardData(transactions);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDashboardData = (transactions: ITransaction[]) => {
    let grossRevenue = 0;
    let totalDiscounts = 0;
    let netRevenue = 0;
    let totalPurchases = 0;
    let grossProfit = 0;
    let grossMargin = 0;
    let totalCosts = 0;

    const activeTransactions = transactions.filter((transaction) => transaction.active);

    activeTransactions.forEach((transaction) => {
      if (transaction.type === 1) {
        grossRevenue += transaction.totalValue;
        totalDiscounts += transaction.totalDiscount;
        transaction.transactionsItems.forEach((item) => {
          totalCosts += item.value * item.amount;
        });
      } else if (transaction.type === 0) {
        totalPurchases += transaction.finalValue;
      }
    });

    netRevenue = grossRevenue - totalDiscounts - totalCosts;
    grossProfit = netRevenue - totalPurchases;
    grossMargin = grossRevenue !== 0 ? (grossProfit / grossRevenue) * 100 : 0;

    setDashboardData({ grossRevenue,totalDiscounts,netRevenue,grossMargin,totalPurchases,grossProfit,});
  };

  const dashboardItems = [
    { title: "Renda Bruta", value: dashboardData.grossRevenue },
    { title: "Total de Descontos", value: dashboardData.totalDiscounts },
    { title: "Renda Líquida", value: dashboardData.netRevenue },
    { title: "Lucro Bruto", value: dashboardData.grossProfit },
    { title: "Margem Bruta", value: dashboardData.grossMargin },
    { title: "Total de Compras", value: dashboardData.totalPurchases },
  ];

  const barData = dashboardItems.map((item) => ({
    name: item.title,
    value: item.value,
    fill: getBarColor(item.title),
  }));

  const handleOpenModal = (title: string) => {
    setSelectedItem({ title, description: descriptions[title] });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedItem(null);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <Box sx={{ p: 4, maxWidth: "1200px", mx: "auto" }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "center", mb: 4 }}>
        Dashboard de Indicadores
      </Typography>

      <Grid container spacing={4}>
        {loading
          ? [...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardContent>
                    <Skeleton variant="text" width="60%" height={40} />
                    <Skeleton variant="text" width="80%" height={50} />
                  </CardContent>
                </Card>
              </Grid>
            ))
          : dashboardItems.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  onClick={() => handleOpenModal(item.title)}
                  sx={{
                    cursor: "pointer",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="subtitle1" color="textSecondary">
                      {item.title}
                    </Typography>
                    <Typography variant="h4" sx={{ mt: 1 }}>
                      {item.title === "Margem Bruta"
                        ? `${item.value.toFixed(2)}%`
                        : `R$ ${item.value.toFixed(2)}`}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
      </Grid>

      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>{selectedItem?.title}</DialogTitle>
        <DialogContent>
          <Typography>{selectedItem?.description}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" sx={{ mb: 3, textAlign: "center" }}>
          Gráficos de Indicadores
        </Typography>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value">
              {barData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <LabelList dataKey="value" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default Dashboard;
