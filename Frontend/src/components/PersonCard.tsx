import React from "react";
import { Avatar, Box, Card, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { colorFor } from "./ProductThumb";
import { brand } from "../theme";

interface PersonCardProps {
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  onEdit: () => void;
  onDelete: () => void;
}

const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 2 || /^[A-Z]/.test(word))
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("") || "?";

const Detail: React.FC<{ icon: React.ReactNode; text?: string }> = ({ icon, text }) => (
  <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "text.secondary", minWidth: 0 }}>
    <Box sx={{ display: "flex", "& svg": { fontSize: 17 } }}>{icon}</Box>
    <Typography variant="body2" noWrap>
      {text || "Não informado"}
    </Typography>
  </Stack>
);

/** Contact card shared by the clients and suppliers pages. */
const PersonCard: React.FC<PersonCardProps> = ({ name, email, phone, document, onEdit, onDelete }) => {
  const color = colorFor(name);
  return (
    <Card sx={{ p: 2.5, height: "100%", transition: "box-shadow 0.2s ease", "&:hover": { boxShadow: "0 12px 28px rgba(15,31,23,0.08)" } }}>
      <Stack direction="row" spacing={1.75} alignItems="center">
        <Avatar sx={{ width: 48, height: 48, fontWeight: 800, fontSize: 17, bgcolor: alpha(color, 0.14), color }}>
          {initialsOf(name)}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography noWrap sx={{ fontWeight: 700, fontSize: 16 }}>
            {name}
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: "text.secondary" }}>
            <BadgeOutlinedIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption" noWrap>
              {document || "Sem documento"}
            </Typography>
          </Stack>
        </Box>
        <Tooltip title="Editar">
          <IconButton size="small" onClick={onEdit} aria-label={`Editar ${name}`}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Excluir">
          <IconButton size="small" onClick={onDelete} aria-label={`Excluir ${name}`} sx={{ "&:hover": { color: "error.main" } }}>
            <DeleteOutlineRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      <Stack spacing={1} sx={{ mt: 2, pt: 2, borderTop: `1px solid ${brand.line}` }}>
        <Detail icon={<MailOutlineRoundedIcon />} text={email} />
        <Detail icon={<PhoneOutlinedIcon />} text={phone} />
      </Stack>
    </Card>
  );
};

export default PersonCard;
