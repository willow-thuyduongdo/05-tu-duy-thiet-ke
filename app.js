(() => {
  const header = document.getElementById("site-header");
  const progress = document.getElementById("page-progress");
  const navToggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("site-nav");
  const routeSection = document.getElementById("ban-do");
  const journeySection = document.getElementById("diem-dung");
  const mapBoard = document.getElementById("map-board");
  const toast = document.getElementById("toast");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let scrollFrame = 0;
  let toastTimer = 0;

  const updateScrollState = () => {
    scrollFrame = 0;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const amount = scrollable > 0 ? window.scrollY / scrollable : 0;
    progress.style.transform = "scaleX(" + Math.min(1, Math.max(0, amount)) + ")";
    header.classList.toggle("is-solid", window.scrollY > 28);
    if (journeySection) {
      const bounds = journeySection.getBoundingClientRect();
      const immersive = bounds.top < window.innerHeight * 0.72 && bounds.bottom > window.innerHeight * 0.28;
      header.classList.toggle("is-immersive", immersive);
    }
  };

  window.addEventListener("scroll", () => {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollState);
  }, { passive: true });
  window.addEventListener("load", updateScrollState, { once: true });
  window.addEventListener("hashchange", updateScrollState);
  updateScrollState();

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") !== "true";
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Đóng trình đơn" : "Mở trình đơn");
      nav.classList.toggle("is-open", open);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Mở trình đơn");
      });
    });
  }

  if (window.IntersectionObserver) {
    const routeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          routeSection.classList.add("is-visible");
          routeObserver.disconnect();
        }
      });
    }, { threshold: 0.24 });
    routeObserver.observe(routeSection);

    const sectionLinks = Array.from(document.querySelectorAll(".site-nav a[href^='#']"));
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach((link) => {
          if (link.getAttribute("href") === "#" + entry.target.id) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    ["ban-do", "diem-dung", "mo-hinh", "ket-phim"].forEach((id) => {
      const section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
  } else {
    routeSection.classList.add("is-visible");
  }

  if (mapBoard && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    const plane = mapBoard.querySelector(".map-board__paper");
    mapBoard.addEventListener("pointermove", (event) => {
      const bounds = mapBoard.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      const rotateX = 2 - y * 3.8;
      const rotateY = -2 + x * 4.6;
      plane.style.transform = "rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg)";
    });
    mapBoard.addEventListener("pointerleave", () => {
      plane.style.transform = "";
    });
  }

  const tabs = Array.from(document.querySelectorAll("[data-model-tab]"));
  const panels = Array.from(document.querySelectorAll("[data-model-panel]"));
  const rotation = document.getElementById("model-rotation");
  const modelStage = document.getElementById("model-stage");

  const selectModel = (key, moveFocus) => {
    tabs.forEach((tab) => {
      const selected = tab.dataset.modelTab === key;
      tab.classList.toggle("is-active", selected);
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && moveFocus) tab.focus();
    });
    panels.forEach((panel) => {
      const selected = panel.dataset.modelPanel === key;
      panel.hidden = !selected;
      panel.classList.toggle("is-active", selected);
    });
    if (rotation) {
      rotation.value = "-8";
      setModelRotation(-8);
    }
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectModel(tab.dataset.modelTab, false));
    tab.addEventListener("keydown", (event) => {
      let next = index;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else return;
      event.preventDefault();
      selectModel(tabs[next].dataset.modelTab, true);
    });
  });

  function setModelRotation(value) {
    if (modelStage) modelStage.style.setProperty("--yaw", value + "deg");
  }

  if (rotation) {
    rotation.addEventListener("input", () => setModelRotation(rotation.value));
    setModelRotation(rotation.value);
  }

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
  };

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    return copied;
  };

  const shareButton = document.getElementById("share-tour");
  if (shareButton) {
    shareButton.addEventListener("click", async () => {
      const shareData = {
        title: "Hà Nội Xưa — một vòng ký ức",
        text: "Cùng đi chậm qua bảy điểm dừng của Hà Nội xưa.",
        url: window.location.href
      };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (error) {
          if (error && error.name !== "AbortError") showToast("Chưa chia sẻ được. Bạn có thể sao chép đường dẫn trang.");
        }
        return;
      }
      try {
        const copied = await copyText(window.location.href);
        showToast(copied ? "Đã sao chép đường dẫn hành trình." : "Không sao chép được đường dẫn trên thiết bị này.");
      } catch {
        showToast("Chưa sao chép được đường dẫn trên thiết bị này.");
      }
    });
  }
})();
