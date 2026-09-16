// Google Identity Services (GSI) global type declaration
// Used by login/page.tsx and register/page.tsx for Google Sign-In

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: {
          client_id: string;
          callback: (response: { credential: string }) => void;
          auto_select?: boolean;
          cancel_on_tap_outside?: boolean;
        }) => void;
        renderButton: (
          element: HTMLElement,
          config: {
            type?: string;
            theme?: string;
            size?: string;
            shape?: string;
            width?: number;
            text?: string;
          }
        ) => void;
        prompt: () => void;
      };
    };
  };
}
