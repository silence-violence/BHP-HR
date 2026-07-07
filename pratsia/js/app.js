(function () {
  "use strict";

  const FORM_ENDPOINT = "https://formsubmit.co/ajax/elza@pratsia.hr";
  const ALLOWED_EXT = ["pdf", "docx", "jpg", "jpeg"];
  const MAX_FILE_MB = 5;

  const langOrder = ["uk", "ru", "hr"];

  function detectDefaultLang() {
    const saved = localStorage.getItem("pratsia_lang");
    if (saved && UI[saved]) return saved;
    const nav = (navigator.language || "hr").toLowerCase();
    if (nav.startsWith("uk")) return "uk";
    if (nav.startsWith("ru")) return "ru";
    return "hr";
  }

  let currentLang = detectDefaultLang();

  function t(key) {
    return UI[currentLang][key] || UI.hr[key] || key;
  }

  function setLang(lang) {
    currentLang = lang;
    localStorage.setItem("pratsia_lang", lang);
    document.documentElement.lang = lang;
    renderStatic();
    renderCategories();
  }

  function renderStatic() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      el.textContent = t(key);
    });
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === currentLang);
    });
  }

  function fileExt(name) {
    const parts = name.split(".");
    return parts.length > 1 ? parts.pop().toLowerCase() : "";
  }

  function buildForm(job) {
    const formId = `form-${job.id}`;
    const jobTitleHr = job.title.hr;

    const form = document.createElement("form");
    form.className = "apply-form";
    form.id = formId;
    form.noValidate = true;

    form.innerHTML = `
      <h4>${t("job_apply")}</h4>
      <input type="hidden" name="_subject" value="Nova prijava za posao: ${jobTitleHr} — Pratsia">
      <input type="hidden" name="_template" value="table">
      <input type="hidden" name="_captcha" value="false">
      <input type="hidden" name="job_position" value="${jobTitleHr}">
      <input type="text" name="_honey" class="hp-field" tabindex="-1" autocomplete="off">
      <div class="form-row">
        <div class="form-field">
          <label>${t("form_name")} *</label>
          <input type="text" name="name" required>
        </div>
        <div class="form-field">
          <label>${t("form_email")} *</label>
          <input type="email" name="email" required>
        </div>
      </div>
      <div class="form-row">
        <div class="form-field">
          <label>${t("form_phone")} *</label>
          <input type="tel" name="phone" required>
        </div>
        <div class="form-field">
          <label>${t("form_cv")} *</label>
          <div class="file-drop">
            <input type="file" name="cv" accept=".pdf,.docx,.jpg,.jpeg" required>
          </div>
        </div>
      </div>
      <div class="form-field full" style="margin-bottom:12px;">
        <label>${t("form_message")}</label>
        <textarea name="message" rows="3"></textarea>
      </div>
      <div class="form-submit-row">
        <button type="submit" class="btn btn-submit">${t("form_submit")}</button>
        <span class="form-status" role="status"></span>
      </div>
    `;

    form.addEventListener("submit", (e) => handleSubmit(e, form, jobTitleHr));
    return form;
  }

  async function handleSubmit(e, form, jobTitleHr) {
    e.preventDefault();
    const status = form.querySelector(".form-status");
    const submitBtn = form.querySelector(".btn-submit");
    const fileInput = form.querySelector('input[type="file"]');
    const requiredFields = form.querySelectorAll("[required]");

    status.textContent = "";
    status.className = "form-status";

    for (const field of requiredFields) {
      if (!field.value) {
        status.textContent = t("form_required");
        status.classList.add("error");
        field.focus();
        return;
      }
    }

    const file = fileInput.files[0];
    if (file) {
      const ext = fileExt(file.name);
      if (!ALLOWED_EXT.includes(ext)) {
        status.textContent = t("form_error_filetype");
        status.classList.add("error");
        return;
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        status.textContent = t("form_error_filesize");
        status.classList.add("error");
        return;
      }
    }

    submitBtn.disabled = true;
    status.textContent = t("form_sending");

    try {
      const formData = new FormData(form);
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Request failed");
      status.textContent = t("form_success");
      status.className = "form-status success";
      form.reset();
    } catch (err) {
      status.innerHTML = `${t("form_error")} <a href="mailto:elza@pratsia.hr">elza@pratsia.hr</a>`;
      status.className = "form-status error";
    } finally {
      submitBtn.disabled = false;
    }
  }

  function buildJob(job) {
    const wrap = document.createElement("div");
    wrap.className = "job";

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "job-toggle";
    toggle.innerHTML = `<span>${job.title[currentLang]}</span>
      <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
    toggle.addEventListener("click", () => {
      wrap.classList.toggle("open");
    });

    const panel = document.createElement("div");
    panel.className = "job-panel";

    const desc = document.createElement("p");
    desc.className = "job-desc";
    desc.textContent = job.desc[currentLang];

    const reqTitle = document.createElement("div");
    reqTitle.style.fontWeight = "700";
    reqTitle.style.fontSize = "13.5px";
    reqTitle.style.marginBottom = "8px";
    reqTitle.textContent = t("job_requirements");

    const reqList = document.createElement("ul");
    reqList.className = "job-reqs";
    job.reqs[currentLang].forEach((r) => {
      const li = document.createElement("li");
      li.textContent = r;
      reqList.appendChild(li);
    });

    panel.appendChild(desc);
    panel.appendChild(reqTitle);
    panel.appendChild(reqList);
    panel.appendChild(buildForm(job));

    wrap.appendChild(toggle);
    wrap.appendChild(panel);
    return wrap;
  }

  function buildCategoryPill(cat) {
    const a = document.createElement("a");
    a.href = `#cat-${cat.id}`;
    a.className = "cat-pill";
    a.innerHTML = `${ICONS[cat.icon]}<span>${cat.name[currentLang]}</span>`;
    return a;
  }

  function buildCategoryBlock(cat) {
    const section = document.createElement("section");
    section.className = "category-block";
    section.id = `cat-${cat.id}`;

    const title = document.createElement("div");
    title.className = "category-title";
    title.innerHTML = `${ICONS[cat.icon]}<span>${cat.name[currentLang]}</span>`;
    section.appendChild(title);

    cat.jobs.forEach((job) => section.appendChild(buildJob(job)));
    return section;
  }

  function renderCategories() {
    const pillsWrap = document.getElementById("cat-pills");
    const blocksWrap = document.getElementById("cat-blocks");
    pillsWrap.innerHTML = "";
    blocksWrap.innerHTML = "";
    CATEGORIES.forEach((cat) => {
      pillsWrap.appendChild(buildCategoryPill(cat));
      blocksWrap.appendChild(buildCategoryBlock(cat));
    });
  }

  function setupLangSwitch() {
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => setLang(btn.dataset.lang));
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("year").textContent = new Date().getFullYear();
    setupLangSwitch();
    renderStatic();
    renderCategories();
  });
})();
