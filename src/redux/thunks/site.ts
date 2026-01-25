import { getSiteConfig } from "../../api/api.ts";
import { shouldShowAnnouncement } from "../../component/Dialogs/AnnouncementDialog.tsx";
import SessionManager from "../../session";
import { setAnnouncementDialogOpen } from "../globalStateSlice.ts";
import { applySetting } from "../siteConfigSlice.ts";
import { AppThunk } from "../store.ts";

export function loadSiteConfig(section: string): AppThunk {
  return async (dispatch, _getState) => {
    const siteConfig = await dispatch(getSiteConfig(section));
    dispatch(
      applySetting({
        section: section,
        config: siteConfig,
      }),
    );
    localStorage.setItem(`siteConfigCache_${section}`, JSON.stringify(siteConfig));
  };
}

export function updateSiteConfig(): AppThunk {
  return async (dispatch, getState) => {
    await dispatch(loadSiteConfig("basic"));
    const {
      siteConfig: { basic },
    } = getState();
    if (basic.config.user) {
      SessionManager.updateUserIfExist(basic.config.user);
    }

    // Show announcement for logged-in users on page load
    const currentUser = SessionManager.currentLoginOrNull();
    if (currentUser && shouldShowAnnouncement()) {
      dispatch(setAnnouncementDialogOpen(true));
    }
  };
}
