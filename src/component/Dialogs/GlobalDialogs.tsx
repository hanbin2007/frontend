import { useAppSelector } from "../../redux/hooks.ts";
import PinToSidebar from "../FileManager/Dialogs/PinToSidebar.tsx";
import AnnouncementDialog from "./AnnouncementDialog.tsx";
import BatchDownloadLog from "./BatchDownloadLog.tsx";
import Confirmation from "./Confirmation.tsx";
import SelectOption from "./SelectOption.tsx";

const GlobalDialogs = () => {
  const selectOptionOpen = useAppSelector((state) => state.globalState.selectOptionDialogOpen);
  const batchDownloadLogOpen = useAppSelector((state) => state.globalState.batchDownloadLogDialogOpen);
  const announcementOpen = useAppSelector((state) => state.globalState.announcementDialogOpen);
  return (
    <>
      <Confirmation />
      <PinToSidebar />
      {batchDownloadLogOpen != undefined && <BatchDownloadLog />}
      {selectOptionOpen != undefined && <SelectOption />}
      {announcementOpen && <AnnouncementDialog />}
    </>
  );
};

export default GlobalDialogs;
