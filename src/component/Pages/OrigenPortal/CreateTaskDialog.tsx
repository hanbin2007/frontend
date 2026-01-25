import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store.ts";
import { setCreateDialogOpen, addTask } from "../../../redux/portalSlice.ts";
import { createPortalTask } from "../../../api/portal.ts";
import { getSearchUser } from "../../../api/api.ts";
import { User } from "../../../api/user.ts";

interface CreateTaskDialogProps {
  onSuccess: () => void;
}

const CreateTaskDialog = ({ onSuccess }: CreateTaskDialogProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { createDialogOpen } = useSelector((state: RootState) => state.portal);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignees, setAssignees] = useState<User[]>([]);
  const [userOptions, setUserOptions] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleClose = () => {
    dispatch(setCreateDialogOpen(false));
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setLoading(true);
    try {
      const response = await dispatch(
        createPortalTask({
          title: title.trim(),
          description: description.trim(),
          assignee_ids: assignees.map((u) => u.id),
        }),
      );
      dispatch(addTask(response));
      onSuccess();
      handleClose();
    } catch {
      // Error handled by API layer
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUsers = async (query: string) => {
    // Backend requires at least 2 characters for search
    if (query.trim().length < 2) {
      setUserOptions([]);
      return;
    }

    setSearching(true);
    try {
      const response = await dispatch(getSearchUser(query));
      setUserOptions(response || []);
    } catch {
      setUserOptions([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <Dialog open={createDialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("portal.createTask", "创建任务")}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label={t("portal.taskTitle", "任务标题")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            autoFocus
          />

          <TextField
            label={t("portal.taskDescription", "任务描述")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={4}
          />

          <Autocomplete
            multiple
            options={userOptions}
            value={assignees}
            onChange={(_, value) => setAssignees(value)}
            onInputChange={(_, value) => handleSearchUsers(value)}
            getOptionLabel={(option) => option.nickname || option.email || ""}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            loading={searching}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("portal.assignee", "受托人")}
                placeholder={t("portal.searchUser", "搜索用户...")}
                slotProps={{
                  input: {
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {searching && <CircularProgress size={20} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  },
                }}
              />
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t("common:cancel", "取消")}</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!title.trim() || loading}>
          {loading ? <CircularProgress size={20} /> : t("common:confirm", "确定")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTaskDialog;
