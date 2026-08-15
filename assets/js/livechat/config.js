const CONFIG = {
  GAS_URL: "https://script.google.com/macros/s/AKfycby2Houyv0o2GEQnNeDqWjGiH05Sy4a0m_8CGWQMZCd1dzu1fVw0IsvJZ7SLGPehCvIjnA/exec",
  TIMINGS: {
    ANIMATIONS: {
      scroll: 300,
      fade: 300,
      quick_feedback: 100,
      transition: 400,
    },
    DELAYS: {
      modal_close: 4000,
      modal_load: 600,
      notification_fadeout: 3000,
      button_reset: 1000,
      spinner_timeout: 2500,
    },
    SESSION: {
      inactivity_timeout: 120000,
      inactivity_warning: 110000,
    }
  },

  RANDOM_AGENT_RANGE: 10000,

  MAX_MESSAGE_LENGTH: 1000,

  ROOM_MESSAGE_PREVIEW_LENGTH: 15,
  ROOM_ID_DISPLAY_LENGTH: 8,
  ROOM_NAME_DISPLAY_LENGTH: 20,

  AGENTS: [
    { name: "@adam", avatar: "/assets/img/livechat/agents/adam.webp", department: "Layanan & Pemesanan" },
    { name: "@diva", avatar: "/assets/img/livechat/agents/diva.webp", department: "Domain & Produk Digital" },
    { name: "@kevin", avatar: "/assets/img/livechat/agents/kevin.webp", department: "Teknis & Dukungan" },
    { name: "@siti", avatar: "/assets/img/livechat/agents/siti.webp", department: "Billing & Payment" }
  ]
};

