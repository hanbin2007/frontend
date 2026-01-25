import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getAdminAnnouncement,
  getGroupList,
  getUserList,
  sendCreateAnnouncement,
  sendUpdateAnnouncement,
} from "../../../api/api";
import { Announcement, GroupEnt, User as UserEnt } from "../../../api/dashboard";
import { useAppDispatch } from "../../../redux/hooks";
import { DenseAutocomplete } from "../../Common/StyledComponents";

export interface AnnouncementEditDialogProps {
  open: boolean;
  onClose: () => void;
  announcementId?: number;
  onSaved?: () => void;
}

const AnnouncementEditDialog = ({ open, onClose, announcementId, onSaved }: AnnouncementEditDialogProps) => {
  const { t } = useTranslation("dashboard");
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isGlobal, setIsGlobal] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [expiresAt, setExpiresAt] = useState("");
  const [targetGroups, setTargetGroups] = useState<number[]>([]);
  const [targetUsers, setTargetUsers] = useState<number[]>([]);

  const [groups, setGroups] = useState<GroupEnt[]>([]);
  const [users, setUsers] = useState<UserEnt[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  const isEditing = announcementId !== undefined && announcementId > 0;

  // Load groups
  useEffect(() => {
    if (open && !isGlobal) {
      setGroupsLoading(true);
      dispatch(
        getGroupList({
          page: 1,
          page_size: 1000,
          order_by: "id",
          order_direction: "asc",
        }),
      )
        .then((res) => {
          setGroups(res.groups);
        })
        .finally(() => {
          setGroupsLoading(false);
        });
    }
  }, [open, isGlobal, dispatch]);

  // Load users if needed
  useEffect(() => {
    if (open && !isGlobal) {
      setUsersLoading(true);
      dispatch(
        getUserList({
          page: 1,
          page_size: 1000,
          order_by: "id",
          order_direction: "asc",
        }),
      )
        .then((res) => {
          setUsers(res.users);
        })
        .finally(() => {
          setUsersLoading(false);
        });
    }
  }, [open, isGlobal, dispatch]);

  // Load existing announcement when editing
  useEffect(() => {
    if (open && isEditing && announcementId) {
      setLoading(true);
      dispatch(getAdminAnnouncement(announcementId))
        .then((res) => {
          setTitle(res.title);
          setContent(res.content);
          setIsGlobal(res.is_global);
          setIsActive(res.is_active);
          setExpiresAt(res.expires_at ? res.expires_at.substring(0, 16) : "");
          setTargetGroups(res.target_groups ?? []);
          setTargetUsers(res.target_users ?? []);
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (open) {
      // Reset form for new announcement
      setTitle("");
      setContent("");
      setIsGlobal(true);
      setIsActive(true);
      setExpiresAt("");
      setTargetGroups([]);
      setTargetUsers([]);
    }
  }, [open, announcementId, isEditing, dispatch]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const data = {
        title,
        content,
        is_global: isGlobal,
        is_active: isActive,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        target_groups: isGlobal ? [] : targetGroups,
        target_users: isGlobal ? [] : targetUsers,
      };

      if (isEditing && announcementId !== undefined) {
        await dispatch(sendUpdateAnnouncement(announcementId, data));
      } else {
        await dispatch(sendCreateAnnouncement(data));
      }
      onSaved?.();
      onClose();
    } finally {
      setSaving(false);
    }
  }, [
    title,
    content,
    isGlobal,
    isActive,
    expiresAt,
    targetGroups,
    targetUsers,
    isEditing,
    announcementId,
    dispatch,
    onSaved,
    onClose,
  ]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditing ? t("announcement.editAnnouncement") : t("announcement.newAnnouncement")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label={t("announcement.title")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            disabled={loading}
          />
          <TextField
            label={t("announcement.content")}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            multiline
            rows={6}
            required
            disabled={loading}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControlLabel
              control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} disabled={loading} />}
              label={t("announcement.active")}
            />
            <FormControlLabel
              control={
                <Checkbox checked={isGlobal} onChange={(e) => setIsGlobal(e.target.checked)} disabled={loading} />
              }
              label={t("announcement.sendToAll")}
            />
          </Box>
          {!isGlobal && (
            <>
              <DenseAutocomplete
                multiple
                options={groups}
                getOptionLabel={(option) => (option as GroupEnt).name}
                value={groups.filter((g) => targetGroups.includes(g.id))}
                onChange={(_, newValue) => setTargetGroups((newValue as GroupEnt[]).map((g) => g.id))}
                loading={groupsLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("announcement.targetGroups")}
                    placeholder={t("announcement.selectGroups")}
                  />
                )}
              />
              <DenseAutocomplete
                multiple
                options={users}
                getOptionLabel={(option) => `${(option as UserEnt).nick} (${(option as UserEnt).email})`}
                value={users.filter((u) => targetUsers.includes(u.id))}
                onChange={(_, newValue) => setTargetUsers((newValue as UserEnt[]).map((u) => u.id))}
                loading={usersLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("announcement.targetUsers")}
                    placeholder={t("announcement.selectUsers")}
                  />
                )}
              />
            </>
          )}
          <TextField
            label={t("announcement.expiresAt")}
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText={t("announcement.expiresAtHint")}
            disabled={loading}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          {t("common:cancel")}
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={saving || loading || !title || !content}>
          {isEditing ? t("application:fileManager.save") : t("announcement.create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AnnouncementEditDialog;
