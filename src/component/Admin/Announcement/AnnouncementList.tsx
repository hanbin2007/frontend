import { Delete } from "@mui/icons-material";
import Add from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useQueryState } from "nuqs";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAdminAnnouncements, sendDeleteAnnouncement } from "../../../api/api";
import { AdminListService, Announcement } from "../../../api/dashboard";
import { useAppDispatch } from "../../../redux/hooks";
import { confirmOperation } from "../../../redux/thunks/dialog";
import { NoWrapTableCell, SecondaryButton, StyledTableContainerPaper } from "../../Common/StyledComponents";
import ArrowSync from "../../Icons/ArrowSync";
import PageContainer from "../../Pages/PageContainer";
import PageHeader from "../../Pages/PageHeader";
import TablePagination from "../Common/TablePagination";
import { OrderByQuery, OrderDirectionQuery, PageQuery, PageSizeQuery } from "../StoragePolicy/StoragePolicySetting";
import AnnouncementEditDialog from "./AnnouncementEditDialog";
import AnnouncementRow from "./AnnouncementRow";

const AnnouncementList = () => {
  const { t } = useTranslation("dashboard");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [page, setPage] = useQueryState(PageQuery, { defaultValue: "1" });
  const [pageSize, setPageSize] = useQueryState(PageSizeQuery, {
    defaultValue: "10",
  });
  const [orderBy, setOrderBy] = useQueryState(OrderByQuery, {
    defaultValue: "",
  });
  const [orderDirection, setOrderDirection] = useQueryState(OrderDirectionQuery, { defaultValue: "desc" });

  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<number | undefined>(undefined);

  const pageInt = parseInt(page) ?? 1;
  const pageSizeInt = parseInt(pageSize) ?? 10;

  useEffect(() => {
    fetchAnnouncements();
  }, [page, pageSize, orderBy, orderDirection]);

  const fetchAnnouncements = () => {
    setLoading(true);
    setSelected([]);

    const params: AdminListService = {
      page: pageInt,
      page_size: pageSizeInt,
      order_by: orderBy ?? "",
      order_direction: orderDirection ?? "desc",
    };

    dispatch(getAdminAnnouncements(params))
      .then((res) => {
        setAnnouncements(res.announcements ?? []);
        setPageSize(res.pagination.page_size.toString());
        setCount(res.pagination.total_items ?? 0);
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDelete = () => {
    setDeleteLoading(true);
    dispatch(confirmOperation(t("announcement.confirmBatchDelete", { num: selected.length })))
      .then(async () => {
        for (const id of selected) {
          await dispatch(sendDeleteAnnouncement(id));
        }
        fetchAnnouncements();
      })
      .finally(() => {
        setDeleteLoading(false);
      });
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = announcements.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleSelect = useCallback(
    (id: number) => {
      const selectedIndex = selected.indexOf(id);
      let newSelected: readonly number[] = [];

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, id);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
      }
      setSelected(newSelected);
    },
    [selected],
  );

  const orderById = orderBy === "id" || orderBy === "";
  const direction = orderDirection as "asc" | "desc";
  const onSortClick = (field: string) => () => {
    const alreadySorted = orderBy === field || (field === "id" && orderById);
    setOrderBy(field);
    setOrderDirection(alreadySorted ? (direction === "asc" ? "desc" : "asc") : "asc");
  };

  const handleNewAnnouncement = () => {
    setEditingAnnouncementId(undefined);
    setEditDialogOpen(true);
  };

  const handleEditAnnouncement = (id: number) => {
    setEditingAnnouncementId(id);
    setEditDialogOpen(true);
  };

  return (
    <PageContainer>
      <AnnouncementEditDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        announcementId={editingAnnouncementId}
        onSaved={fetchAnnouncements}
      />
      <Container maxWidth="xl">
        <PageHeader title={t("nav.announcements")} />
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button onClick={handleNewAnnouncement} variant="contained" startIcon={<Add />}>
            {t("announcement.newAnnouncement")}
          </Button>

          <SecondaryButton
            onClick={fetchAnnouncements}
            disabled={loading}
            variant={"contained"}
            startIcon={<ArrowSync />}
          >
            {t("node.refresh")}
          </SecondaryButton>

          {selected.length > 0 && !isMobile && (
            <>
              <Divider orientation="vertical" flexItem />
              <Button
                startIcon={<Delete />}
                variant="contained"
                color="error"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {t("announcement.deleteX", { num: selected.length })}
              </Button>
            </>
          )}
        </Stack>
        {isMobile && selected.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Button
              startIcon={<Delete />}
              variant="contained"
              color="error"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {t("announcement.deleteX", { num: selected.length })}
            </Button>
          </Stack>
        )}
        <TableContainer component={StyledTableContainerPaper} sx={{ mt: 2 }}>
          <Table size="small" stickyHeader sx={{ width: "100%", tableLayout: "fixed" }}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ width: "36px!important" }} width={50}>
                  <Checkbox
                    size="small"
                    indeterminate={selected.length > 0 && selected.length < announcements.length}
                    checked={announcements.length > 0 && selected.length === announcements.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <NoWrapTableCell width={80}>
                  <TableSortLabel
                    active={orderById}
                    direction={orderById ? direction : "asc"}
                    onClick={onSortClick("id")}
                  >
                    {t("group.#")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={300}>{t("announcement.title")}</NoWrapTableCell>
                <NoWrapTableCell width={150}>{t("announcement.target")}</NoWrapTableCell>
                <NoWrapTableCell width={80}>{t("announcement.active")}</NoWrapTableCell>
                <NoWrapTableCell width={120}>{t("announcement.expires")}</NoWrapTableCell>
                <NoWrapTableCell width={150}>
                  <TableSortLabel
                    active={orderBy === "created_at"}
                    direction={orderBy === "created_at" ? direction : "asc"}
                    onClick={onSortClick("created_at")}
                  >
                    {t("share.createdAt")}
                  </TableSortLabel>
                </NoWrapTableCell>
                <NoWrapTableCell width={100}></NoWrapTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading &&
                announcements.map((announcement) => (
                  <AnnouncementRow
                    deleting={deleteLoading}
                    key={announcement.id}
                    announcement={announcement}
                    onDelete={fetchAnnouncements}
                    selected={selected.indexOf(announcement.id) !== -1}
                    onSelect={handleSelect}
                    onEdit={handleEditAnnouncement}
                  />
                ))}
              {loading &&
                announcements.length > 0 &&
                announcements.slice(0, 10).map((a) => <AnnouncementRow key={`loading-${a.id}`} loading={true} />)}
              {loading &&
                announcements.length === 0 &&
                Array.from(Array(10)).map((_, index) => <AnnouncementRow key={`loading-${index}`} loading={true} />)}
            </TableBody>
          </Table>
        </TableContainer>
        {count > 0 && (
          <Box sx={{ mt: 1 }}>
            <TablePagination
              page={pageInt}
              totalItems={count}
              rowsPerPage={pageSizeInt}
              rowsPerPageOptions={[10, 25, 50, 100]}
              onRowsPerPageChange={(value) => setPageSize(value.toString())}
              onChange={(_, value) => setPage(value.toString())}
            />
          </Box>
        )}
      </Container>
    </PageContainer>
  );
};

export default AnnouncementList;
