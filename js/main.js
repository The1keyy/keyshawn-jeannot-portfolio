/**
 * Portfolio interactions for docs/home layout
 */
(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  initNavigation();
  initScrollSpy();
  loadProjects();

  function initNavigation() {
    const toggle = document.getElementById("nav-toggle");
    const nav = document.getElementById("primary-nav");
    if (!toggle || !nav) return;

    const closeNav = () => {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      nav.classList.remove("is-open");
      document.body.classList.remove("nav-open");
    };

    const openNav = () => {
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      nav.classList.add("is-open");
      document.body.classList.add("nav-open");
    };

    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      if (expanded) closeNav();
      else openNav();
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeNav());
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) closeNav();
    });
  }

  function initScrollSpy() {
    const links = [...document.querySelectorAll('.primary-nav a[href^="#"]')];
    const sections = [
      ...new Map(
        links
          .map((link) => {
            const href = link.getAttribute("href");
            const section = document.querySelector(href);
            return section ? [href, section] : null;
          })
          .filter(Boolean)
      ).values(),
    ];

    if (!sections.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = `#${entry.target.id}`;
          links.forEach((link) => {
            if (link.getAttribute("href") === id) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
  }

  async function loadProjects() {
    const grid = document.getElementById("project-grid");
    if (!grid) return;

    try {
      const response = await fetch("data/projects.json", { cache: "no-cache" });
      if (!response.ok) throw new Error(`Failed to load projects (${response.status})`);
      const projects = await response.json();
      renderProjects(grid, projects);
      initModal(projects);
    } catch (error) {
      console.error(error);
      grid.innerHTML =
        '<p class="muted">Projects could not be loaded. Serve this folder with a local HTTP server so <code>data/projects.json</code> can be fetched.</p>';
    }
  }

  function renderProjects(grid, projects) {
    const fragment = document.createDocumentFragment();

    projects.forEach((project) => {
      const card = document.createElement("article");
      card.className = "project-card";
      card.id = `project-${project.id}`;

      const media = project.screenshot
        ? `<img class="project-card__shot" src="${escapeAttr(project.screenshot)}" alt="Screenshot of ${escapeAttr(project.title)}" loading="lazy" decoding="async">`
        : "";

      card.innerHTML = `
        ${media}
        <div class="project-card__header">
          <p class="project-card__category">${escapeHtml(project.category)}</p>
          <h3>${escapeHtml(project.title)}</h3>
        </div>
        <div class="project-card__body">
          <p>${escapeHtml(project.summary)}</p>
          <ul class="tags" aria-label="Tools">
            ${project.tools
              .slice(0, 5)
              .map((tool) => `<li>${escapeHtml(tool)}</li>`)
              .join("")}
          </ul>
          <div class="project-card__actions"></div>
        </div>
      `;

      const actions = card.querySelector(".project-card__actions");

      const repo = document.createElement("a");
      repo.className = "btn btn--small btn--secondary";
      repo.href = project.repoUrl;
      repo.target = "_blank";
      repo.rel = "noopener noreferrer";
      repo.textContent = "GitHub";
      actions.appendChild(repo);

      if (project.details) {
        const details = document.createElement("button");
        details.type = "button";
        details.className = "btn btn--small btn--primary";
        details.textContent = "Details";
        details.setAttribute("data-project-id", project.id);
        details.setAttribute("aria-haspopup", "dialog");
        actions.appendChild(details);
      }

      if (project.liveUrl) {
        const live = document.createElement("a");
        live.className = "btn btn--small btn--secondary";
        live.href = project.liveUrl;
        live.target = "_blank";
        live.rel = "noopener noreferrer";
        live.textContent = "Live demo";
        actions.appendChild(live);
      }

      fragment.appendChild(card);
    });

    grid.replaceChildren(fragment);
  }

  function initModal(projects) {
    const modal = document.getElementById("project-modal");
    const body = document.getElementById("modal-body");
    if (!modal || !body) return;

    let lastFocus = null;
    const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));

    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-project-id]");
      if (!trigger) return;
      const project = projectMap[trigger.getAttribute("data-project-id")];
      if (!project) return;
      openModal(project, trigger);
    });

    modal.addEventListener("click", (event) => {
      if (event.target.closest("[data-close-modal]")) closeModal();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) closeModal();
    });

    function openModal(project, trigger) {
      lastFocus = trigger;
      body.innerHTML = buildModalMarkup(project);
      modal.hidden = false;
      document.body.classList.add("modal-open");
      modal.querySelector(".modal__dialog")?.focus();
    }

    function closeModal() {
      modal.hidden = true;
      document.body.classList.remove("modal-open");
      body.innerHTML = "";
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    }
  }

  function buildModalMarkup(project) {
    const d = project.details || {};
    const list = (items = []) =>
      `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;

    const screenshotBlock = project.screenshot
      ? `<div class="modal-shot"><img src="${escapeAttr(project.screenshot)}" alt="Screenshot of ${escapeAttr(project.title)}" loading="lazy" decoding="async"></div>`
      : `<div class="modal-shot"><div class="modal-shot__placeholder">No public screenshot yet. Add a sanitized image path in data/projects.json.</div></div>`;

    return `
      <p class="modal__category">${escapeHtml(project.category)}</p>
      <h2 id="modal-title">${escapeHtml(project.title)}</h2>
      <section class="modal-section"><h3>Overview</h3><p>${escapeHtml(d.overview || project.summary)}</p></section>
      <section class="modal-section"><h3>Business problem</h3><p>${escapeHtml(d.businessProblem || project.objective)}</p></section>
      <section class="modal-section"><h3>Environment</h3><p>${escapeHtml(d.environment || "See repository documentation.")}</p></section>
      <section class="modal-section"><h3>Responsibilities</h3>${list(d.responsibilities || project.workedOn)}</section>
      <section class="modal-section"><h3>Process</h3>${list(d.process || [])}</section>
      <section class="modal-section"><h3>Tools used</h3>${list(project.tools)}</section>
      <section class="modal-section"><h3>Results / lessons learned</h3><p>${escapeHtml(d.results || "")}</p></section>
      <section class="modal-section"><h3>Screenshots</h3>${screenshotBlock}</section>
      <div class="modal-actions">
        <a class="btn btn--primary" href="${escapeAttr(project.repoUrl)}" target="_blank" rel="noopener noreferrer">Open repository</a>
        ${project.liveUrl ? `<a class="btn btn--secondary" href="${escapeAttr(project.liveUrl)}" target="_blank" rel="noopener noreferrer">Live demo</a>` : ""}
        <button type="button" class="btn btn--secondary" data-close-modal>Close</button>
      </div>
    `;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replaceAll("`", "&#96;");
  }
})();
