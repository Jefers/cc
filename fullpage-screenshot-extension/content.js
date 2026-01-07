(async () => {
  console.log("📸 Full page screenshot started (freeze fixed headers)");

  document.documentElement.style.scrollBehavior = "auto";
  document.body.style.overflow = "auto";

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const dpr = window.devicePixelRatio || 1;

  const totalHeight = document.documentElement.scrollHeight;
  const viewportHeight = window.innerHeight;

  console.log("DPR:", dpr);
  console.log("Total height:", totalHeight);
  console.log("Viewport height:", viewportHeight);

  function capture() {
    return new Promise(resolve => {
      chrome.runtime.sendMessage({ action: "capture" }, resolve);
    });
  }

  /* ===============================
     Freeze fixed-position elements
     =============================== */
  const fixedElements = [];
  document.querySelectorAll("*").forEach(el => {
    const style = window.getComputedStyle(el);
    if (style.position === "fixed" && style.visibility !== "hidden") {
      fixedElements.push({
        el,
        originalVisibility: el.style.visibility
      });
      el.style.visibility = "hidden";
    }
  });

  console.log("Frozen fixed elements:", fixedElements.length);

  const slices = [];
  let scrollY = 0;

  while (scrollY < totalHeight) {
    window.scrollTo(0, scrollY);
    await sleep(400);

    const imgSrc = await capture();
    slices.push({ src: imgSrc, scrollY });

    scrollY += viewportHeight;
  }

  window.scrollTo(0, 0);

  /* ===============================
     Restore fixed-position elements
     =============================== */
  fixedElements.forEach(({ el, originalVisibility }) => {
    el.style.visibility = originalVisibility;
  });

  console.log("Restored fixed elements");

  /* ===============================
     Stitching
     =============================== */
  const images = await Promise.all(
    slices.map(slice => {
      return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve({ img, scrollY: slice.scrollY });
        img.src = slice.src;
      });
    })
  );

  const canvas = document.createElement("canvas");
  canvas.width = images[0].img.width;
  canvas.height = Math.round(totalHeight * dpr);

  const ctx = canvas.getContext("2d");

  for (let i = 0; i < images.length; i++) {
    const { img, scrollY } = images[i];

    const remainingCSS = totalHeight - scrollY;
    const sliceCSSHeight = Math.min(viewportHeight, remainingCSS);
    const sliceDeviceHeight = Math.round(sliceCSSHeight * dpr);

    console.log(
      `🧩 Drawing slice ${i + 1}`,
      "scrollY:", scrollY,
      "sliceDeviceHeight:", sliceDeviceHeight
    );

    ctx.drawImage(
      img,
      0,
      0,
      img.width,
      sliceDeviceHeight,
      0,
      Math.round(scrollY * dpr),
      img.width,
      sliceDeviceHeight
    );
  }

  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    chrome.runtime.sendMessage({
      action: "download",
      url,
      title: document.title || "full_page_screenshot"
    });
  });

  console.log("✅ Screenshot complete");
})();
