// Clipboard success and analytics are deliberately independent: a blocked counter
// must never break copying, and a failed copy must never report success.
for (const button of document.querySelectorAll("[data-copy-target]")) {
  button.hidden = false;
  button.addEventListener("click", async () => {
    const target = document.getElementById(button.dataset.copyTarget);
    const status = button
      .closest(".kit-prompt, .kit-email-fallback")
      ?.querySelector("[role=status]");
    if (!target || !status) return;
    button.disabled = true;
    try {
      await navigator.clipboard.writeText(target.textContent.trim());
      status.textContent = "Tersalin. Siap ditempel.";
    } catch {
      status.textContent = "Belum tersalin. Pilih teksnya, lalu salin secara manual.";
      button.disabled = false;
      return;
    }
    button.disabled = false;
    try {
      window.goatcounter?.count({
        path: button.dataset.copyEvent,
        title: "Salin dari Vibe Coding Kit",
        event: true,
      });
    } catch {
      // Analytics is optional, including when blocked by a browser extension.
    }
  });
}
