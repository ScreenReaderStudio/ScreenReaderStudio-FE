declare global {
  interface Window {
    Kakao: {
      isInitialized: () => boolean;
      init: (apiKey: string | undefined) => void;
      Auth: {
        authorize: (options: { redirectUri: string; throughTalk?: boolean }) => void;
      };
    };
  }
}

export {};
