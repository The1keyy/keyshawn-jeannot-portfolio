/**
 * Portfolio interactions:
 * - sticky mobile nav
 * - project cards from data/projects.json
 * - accessible project detail modal
 * - scroll reveal (respects reduced motion)
 */

(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  initNavigation();
  initSmoothScrollPreference();
  initScrollSpy();
  initReveal();
  loadProjects();

  function initNavigation() {
    const toggle = document.getElementById("nav-toggle");
    const nav = document.getElementById("site-nav");
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

  function initSmoothScrollPreference() {
    // Native CSS handles smooth scrolling; this only hard-disables when requested.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.documentElement.style.scrollBehavior = "auto";
    }
  }

  function initScrollSpy() {
    const links = [...document.querySelectorAll('.site-nav a[href^="#"]')];
    const uniqueSections = [
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

    if (!uniqueSections.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = `#${entry.target.id}`;
          links.forEach((link) => {
            const active = link.getAttribute("href") === id;
            if (active) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );

    uniqueSections.forEach((section) => observer.observe(section));
  }

  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach((el) => observer.observe(el));
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
        '<p class="section__lede">Projects could not be loaded. Open this site through a local server so <code>data/projects.json</code> can be fetched.</p>';
    }
  }

  function renderProjects(grid, projects) {
    const fragment = document.createDocumentFragment();

    projects.forEach((project) => {
      const card = document.createElement("article");
      card.className = "project-card reveal";
      card.id = `project-${project.id}`;

      const media = document.createElement("div");
      media.className = "project-card__media";

      if (project.screenshot) {
        const img = document.createElement("img");
        img.src = project.screenshot;
        img.alt = `Screenshot of ${project.title}`;
        img.loading = "lazy";
        img.decoding = "async";
        media.appendChild(img);
      } else {
        const placeholder = document.createElement("div");
        placeholder.className = "project-card__placeholder";
        placeholder.textContent = "Screenshot placeholder — add an image path in data/projects.json";
        media.appendChild(placeholder);
      }

      const body = document.createElement("div");
      body.className = "project-card__body";
      body.innerHTML = `
        <p class="project-card__category">${escapeHtml(project.category)}</p>
        <h3>${escapeHtml(project.title)}</h3>
        <p class="project-card__summary">${escapeHtml(project.summary)}</p>
        <dl class="project-meta">
          <dt>Objective</dt>
          <dd>${escapeHtml(project.objective)}</dd>
          <dt>What I worked on</dt>
          <dd>${escapeHtml(project.workedOn.slice(0, 3).join(" · "))}</dd>
        </dl>
      `;

      const tools = document.createElement("ul");
      tools.className = "project-card__tags";
      tools.setAttribute("aria-label", "Tools and technologies");
      project.tools.slice(0, 6).forEach((tool) => {
        const li = document.createElement("li");
        li.textContent = tool;
        tools.appendChild(li);
      });

      const skills = document.createElement("ul");
      skills.className = "project-card__tags";
      skills.setAttribute("aria-label", "Skills demonstrated");
      project.skills.slice(0, 5).forEach((skill) => {
        const li = document.createElement("li");
        li.textContent = skill;
        skills.appendChild(li);
      });

      const actions = document.createElement("div");
      actions.className = "project-card__actions";

      const repoLink = document.createElement("a");
      repoLink.className = "btn btn--small btn--ghost";
      repoLink.href = project.repoUrl;
      repoLink.target = "_blank";
      repoLink.rel = "noopener noreferrer";
      repoLink.textContent = "GitHub repository";
      actions.appendChild(repoLink);

      if (project.details) {
        const detailBtn = document.createElement("button");
        detailBtn.type = "button";
        detailBtn.className = "btn btn--small btn--outline";
        detailBtn.textContent = "Project details";
        detailBtn.setAttribute("data-project-id", project.id);
        detailBtn.setAttribute("aria-haspopup", "dialog");
        actions.appendChild(detailBtn);
      }

      if (project.liveUrl) {
        const live = document.createElement("a");
        live.className = "btn btn--small btn--text";
        live.href = project.liveUrl;
        live.target = "_blank";
        live.rel = "noopener noreferrer";
        live.textContent = "Live demo";
        actions.appendChild(live);
      }

      body.appendChild(tools);
      body.appendChild(skills);
      body.appendChild(actions);
      card.appendChild(media);
      card.appendChild(body);
      fragment.appendChild(card);
    });

    grid.replaceChildren(fragment);
    initReveal();
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
      const dialog = modal.querySelector(".modal__dialog");
      dialog?.focus();
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
      `<ul class="bullet-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;

    const screenshotBlock = project.screenshot
      ? `<div class="modal-shot"><img src="${escapeAttr(project.screenshot)}" alt="Screenshot of ${escapeAttr(project.title)}" loading="lazy" decoding="async"></div>`
      : `<div class="modal-shot"><div class="modal-shot__placeholder">No public screenshot yet. Add a sanitized image path to this project in <code>data/projects.json</code>.</div></div>`;

    return `
      <p class="modal__category">${escapeHtml(project.category)}</p>
      <h2 id="modal-title">${escapeHtml(project.title)}</h2>

      <section class="modal-section">
        <h3>Overview</h3>
        <p>${escapeHtml(d.overview || project.summary)}</p>
      </section>

      <section class="modal-section">
        <h3>Business problem</h3>
        <p>${escapeHtml(d.businessProblem || project.objective)}</p>
      </section>

      <section class="modal-section">
        <h3>Environment</h3>
        <p>${escapeHtml(d.environment || "See repository documentation for environment details.")}</p>
      </section>

      <section class="modal-section">
        <h3>Responsibilities</h3>
        ${list(d.responsibilities || project.workedOn)}
      </section>

      <section class="modal-section">
        <h3>Process</h3>
        ${list(d.process || [])}
      </section>

      <section class="modal-section">
        <h3>Tools used</h3>
        ${list(project.tools)}
      </section>

      <section class="modal-section">
        <h3>Results / lessons learned</h3>
        <p>${escapeHtml(d.results || "")}</p>
      </section>

      <section class="modal-section">
        <h3>Screenshots</h3>
        ${screenshotBlock}
      </section>

      <div class="modal-actions">
        <a class="btn btn--primary" href="${escapeAttr(project.repoUrl)}" target="_blank" rel="noopener noreferrer">Open repository</a>
        ${
          project.liveUrl
            ? `<a class="btn btn--outline" href="${escapeAttr(project.liveUrl)}" target="_blank" rel="noopener noreferrer">Live demo</a>`
            : ""
        }
        <button type="button" class="btn btn--ghost" data-close-modal>Close</button>
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
