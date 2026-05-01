import { useEffect, useState } from "react";

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      is_premium?: boolean;
      added_to_attachment_menu?: boolean;
    };
    auth_date: number;
    hash: string;
  };
  version: string;
  platform: string;
  colorScheme: "light" | "dark";
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  isClosingConfirmationEnabled: boolean;
  headerColor: string;
  backgroundColor: string;
  bottomBarColor: string;
  isVerticalSwipesEnabled: boolean;
  isSettingsButtonVisible: () => boolean;
  isMainButtonVisible: () => boolean;
  isBackButtonVisible: () => boolean;
  isBottomSheetVisible: () => boolean;

  ready: () => void;
  expand: () => void;
  close: () => void;
  onEvent: (eventType: string, callback: () => void) => void;
  offEvent: (eventType: string, callback: () => void) => void;
  sendData: (data: string) => void;
  setBackgroundColor: (color: string) => void;
  setHeaderColor: (color: string) => void;
  setBottomBarColor: (color: string) => void;
  setEmojiStatusAccessToken: (token: string) => void;
  requestWriteAccess: () => void;
  requestContactAccess: () => void;
  openLink: (url: string) => void;
  openTelegramLink: (url: string) => void;
  openInvoice: (url: string, callback?: (status: string) => void) => void;
  showPopup: (params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id: string;
      text: string;
      type?: "default" | "ok" | "close" | "cancel" | "destructive";
    }>;
  }) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  showScanQrPopup: (params: { text?: string }, callback?: (data: string) => void) => void;
  closeScanQrPopup: () => void;
  readTextFromClipboard: (callback?: (text: string) => void) => void;
  requestPhoneNumber: () => void;
  requestLocationAccess: () => void;
  shareToStory: (media_url: string, text?: string, widget_link?: string) => void;
  shareURL: (url: string, callback?: (shared: boolean) => void) => void;
  switchInlineQuery: (query: string, choose_chat_types?: string[]) => void;
  switchInlineQueryCurrentChat: (query: string) => void;
  openWebApp: (url: string) => void;
  invokeCustomMethod: (method: string, params?: Record<string, any>, callback?: (result: any) => void) => void;
  addToMenu: (params?: { is_added?: boolean }, callback?: () => void) => void;
  checkWriteAccessPermission: () => void;
  requestWriteAccessPermission: () => void;
  deleteMe: (callback?: () => void) => void;
  isScanQrPopupOpened: () => boolean;
  isWriteAccessAllowed: () => boolean;
  isContactRequestAllowed: () => boolean;
  isPhoneRequestAllowed: () => boolean;
  isLocationRequestAllowed: () => boolean;
  isInvoiceOpened: () => boolean;
  isPopupOpened: () => boolean;
  isQrRequestAllowed: () => boolean;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isProgressVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    setText: (text: string) => void;
    setParams: (params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    enable: () => void;
    disable: () => void;
  };
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  SettingsButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: "light" | "medium" | "heavy") => void;
    notificationOccurred: (type: "error" | "success" | "warning") => void;
    selectionChanged: () => void;
  };
  CloudStorage: {
    getItem: (key: string, callback?: (error: string | null, value?: string) => void) => void;
    setItem: (key: string, value: string, callback?: (error: string | null) => void) => void;
    removeItem: (key: string, callback?: (error: string | null) => void) => void;
    getKeys: (callback?: (error: string | null, keys?: string[]) => void) => void;
  };
  BiometricManager: {
    isAvailable: (callback?: (available: boolean) => void) => void;
    isBiometricIDAvailable: (callback?: (available: boolean) => void) => void;
    authenticate: (params: {
      reason?: string;
      only_biometrics?: boolean;
    }, callback?: (success: boolean) => void) => void;
    update: (callback?: () => void) => void;
  };
  WebApp: {
    isVersionAtLeast: (version: string) => boolean;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export function useTelegramApp() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const app = window.Telegram.WebApp;

      // Initialize the app
      app.ready();

      // Expand the app to full height
      app.expand();

      // Set background color to match our theme
      app.setBackgroundColor("#f3e8ff");

      // Apply theme colors
      if (app.themeParams.bg_color) {
        app.setBackgroundColor(app.themeParams.bg_color);
      }

      setWebApp(app);
      setIsReady(true);

      // Handle back button
      app.BackButton.onClick(() => {
        window.history.back();
      });

      return () => {
        app.BackButton.offClick(() => {
          window.history.back();
        });
      };
    }
  }, []);

  return {
    webApp,
    isReady,
    user: webApp?.initDataUnsafe.user,
    colorScheme: webApp?.colorScheme,
    themeParams: webApp?.themeParams,
  };
}

export function useTelegramMainButton(text: string, onClick: () => void) {
  const { webApp } = useTelegramApp();

  useEffect(() => {
    if (!webApp) return;

    webApp.MainButton.setText(text);
    webApp.MainButton.show();
    webApp.MainButton.onClick(onClick);

    return () => {
      webApp.MainButton.offClick(onClick);
      webApp.MainButton.hide();
    };
  }, [webApp, text, onClick]);
}

export function useTelegramBackButton() {
  const { webApp } = useTelegramApp();

  useEffect(() => {
    if (!webApp) return;

    webApp.BackButton.show();

    return () => {
      webApp.BackButton.hide();
    };
  }, [webApp]);
}
