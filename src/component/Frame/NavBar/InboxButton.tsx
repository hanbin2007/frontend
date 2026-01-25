import { Badge, IconButton, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import { setInboxDrawerOpen } from "../../../redux/globalStateSlice.ts";
import MailOutlined from "../../Icons/MailOutlined.tsx";

const InboxButton = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const unreadCount = useAppSelector((state) => state.globalState.inboxUnreadCount);

  const handleClick = () => {
    dispatch(setInboxDrawerOpen(true));
  };

  return (
    <Tooltip title={t("navbar.inbox")}>
      <IconButton size="large" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <MailOutlined />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

export default InboxButton;
