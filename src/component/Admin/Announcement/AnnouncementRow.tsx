import { Box, Checkbox, Chip, IconButton, Skeleton, TableRow, Tooltip, Switch } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { sendDeleteAnnouncement, sendUpdateAnnouncement } from "../../../api/api";
import { Announcement } from "../../../api/dashboard";
import { useAppDispatch } from "../../../redux/hooks";
import { confirmOperation } from "../../../redux/thunks/dialog";
import { formatLocalTime } from "../../../util/datetime";
import { NoWrapTableCell, NoWrapTypography } from "../../Common/StyledComponents";
import Delete from "../../Icons/Delete";
import Edit from "@mui/icons-material/Edit";

export interface AnnouncementRowProps {
  announcement?: Announcement;
  loading?: boolean;
  selected?: boolean;
  onSelect?: (id: number) => void;
  onDelete?: () => void;
  onEdit?: (id: number) => void;
  deleting?: boolean;
}

const AnnouncementRow = ({
  announcement,
  loading,
  selected,
  onSelect,
  onDelete,
  onEdit,
  deleting,
}: AnnouncementRowProps) => {
  const { t } = useTranslation("dashboard");
  const dispatch = useAppDispatch();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeLoading, setActiveLoading] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    dispatch(confirmOperation(t("announcement.confirmDelete"))).then(() => {
      if (announcement?.id) {
        setDeleteLoading(true);
        dispatch(sendDeleteAnnouncement(announcement.id))
          .then(() => {
            onDelete?.();
          })
          .finally(() => {
            setDeleteLoading(false);
          });
      }
    });
  };

  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (announcement?.id) {
      onEdit?.(announcement.id);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (announcement?.id) {
      onSelect?.(announcement.id);
    }
  };

  const handleActiveToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (announcement?.id) {
      setActiveLoading(true);
      dispatch(
        sendUpdateAnnouncement(announcement.id, {
          ...announcement,
          is_active: e.target.checked,
        }),
      )
        .then(() => {
          onDelete?.(); // Refresh list
        })
        .finally(() => {
          setActiveLoading(false);
        });
    }
  };

  if (loading) {
    return (
      <TableRow>
        <NoWrapTableCell padding="checkbox">
          <Skeleton variant="rectangular" width={20} height={20} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={50} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={150} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={80} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={100} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={50} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={150} />
        </NoWrapTableCell>
        <NoWrapTableCell>
          <Skeleton variant="text" width={80} />
        </NoWrapTableCell>
      </TableRow>
    );
  }

  const isExpired = announcement?.expires_at && new Date(announcement.expires_at) < new Date();

  return (
    <TableRow
      hover
      key={announcement?.id}
      sx={{ cursor: "pointer", opacity: deleting ? 0.5 : 1 }}
      onClick={() => onEdit?.(announcement?.id ?? 0)}
    >
      <NoWrapTableCell padding="checkbox">
        <Checkbox size="small" checked={selected} onClick={handleCheckboxClick} disabled={deleting} />
      </NoWrapTableCell>
      <NoWrapTableCell>{announcement?.id}</NoWrapTableCell>
      <NoWrapTableCell>
        <NoWrapTypography variant="inherit" sx={{ maxWidth: 300 }}>
          {announcement?.title}
        </NoWrapTypography>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {announcement?.is_global ? (
            <Chip size="small" color="primary" label={t("announcement.global")} />
          ) : (
            <>
              {(announcement?.target_groups?.length ?? 0) > 0 && (
                <Chip
                  size="small"
                  variant="outlined"
                  label={t("announcement.xGroups", { count: announcement?.target_groups?.length })}
                />
              )}
              {(announcement?.target_users?.length ?? 0) > 0 && (
                <Chip
                  size="small"
                  variant="outlined"
                  label={t("announcement.xUsers", { count: announcement?.target_users?.length })}
                />
              )}
            </>
          )}
        </Box>
      </NoWrapTableCell>
      <NoWrapTableCell>
        <Switch
          size="small"
          checked={announcement?.is_active ?? false}
          onChange={handleActiveToggle}
          onClick={(e) => e.stopPropagation()}
          disabled={activeLoading}
        />
      </NoWrapTableCell>
      <NoWrapTableCell>
        {announcement?.expires_at ? (
          <Tooltip title={formatLocalTime(announcement.expires_at)}>
            <Chip
              size="small"
              color={isExpired ? "error" : "default"}
              label={isExpired ? t("announcement.expired") : formatLocalTime(announcement.expires_at)}
            />
          </Tooltip>
        ) : (
          <NoWrapTypography variant="caption" color="text.secondary">
            {t("announcement.noExpiry")}
          </NoWrapTypography>
        )}
      </NoWrapTableCell>
      <NoWrapTableCell>{announcement?.created_at && formatLocalTime(announcement.created_at)}</NoWrapTableCell>
      <NoWrapTableCell>
        <IconButton size="small" onClick={handleEditClick} disabled={deleteLoading}>
          <Edit fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={handleDeleteClick} disabled={deleteLoading}>
          <Delete fontSize="small" />
        </IconButton>
      </NoWrapTableCell>
    </TableRow>
  );
};

export default AnnouncementRow;
