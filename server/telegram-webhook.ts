import { Router } from "express";
import { handleBotCommand } from "./telegram";

const router = Router();

/**
 * Telegram webhook endpoint
 * POST /api/telegram/webhook
 */
router.post("/webhook", async (req, res) => {
  try {
    const message = req.body.message;

    if (!message) {
      res.json({ ok: true });
      return;
    }

    // Handle bot commands
    if (message.text?.startsWith("/")) {
      await handleBotCommand(message);
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("[Telegram Webhook] Error:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

export default router;
