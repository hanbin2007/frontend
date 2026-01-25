import { useAppSelector } from "../../redux/hooks.ts";
import PinToSidebar from "../FileManager/Dialogs/PinToSidebar.tsx";
import AnnouncementDialog from "./AnnouncementDialog.tsx";
import AnnouncementDetailDialog from "./AnnouncementDetailDialog.tsx";
import NotificationHistoryDialog from "./NotificationHistoryDialog.tsx";
import BatchDownloadLog from "./BatchDownloadLog.tsx";
import Confirmation from "./Confirmation.tsx";
import SelectOption from "./SelectOption.tsx";
import InboxDrawer from "./InboxDrawer.tsx";
import { useNotificationSSE } from "../../hooks/useNotificationSSE.ts";

const GlobalDialogs = () => {
  const selectOptionOpen = useAppSelector((state) => state.globalState.selectOptionDialogOpen);
  const batchDownloadLogOpen = useAppSelector((state) => state.globalState.batchDownloadLogDialogOpen);
  const announcementOpen = useAppSelector((state) => state.globalState.announcementDialogOpen);
  const inboxDrawerOpen = useAppSelector((state) => state.globalState.inboxDrawerOpen);
  const announcementDetailOpen = useAppSelector((state) => state.globalState.announcementDetailOpen);
  const notificationHistoryOpen = useAppSelector((state) => state.globalState.notificationHistoryOpen);

  // Initialize SSE connection for real-time notifications
  useNotificationSSE();

  return (
    <>
      <Confirmation />
      <PinToSidebar />
      {batchDownloadLogOpen != undefined && <BatchDownloadLog />}
      {selectOptionOpen != undefined && <SelectOption />}
      {announcementOpen && <AnnouncementDialog />}
      {inboxDrawerOpen && <InboxDrawer />}
      {announcementDetailOpen && <AnnouncementDetailDialog />}
      {notificationHistoryOpen && <NotificationHistoryDialog />}
    </>
  );
};

export default GlobalDialogs;
