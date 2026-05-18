(function () {
  var header = document.querySelector("[data-site-header]");
  var navToggle = document.querySelector(".nav-toggle");
  var parallaxImages = Array.prototype.slice.call(document.querySelectorAll(".parallax-image"));
  var contactForm = document.querySelector("[data-contact-form]");

  document.body.classList.toggle("contact-page", window.location.pathname.indexOf("contact") !== -1);

  function setHeaderState() {
    if (!header) {
      return;
    }

    header.classList.toggle("is-scrolled", window.scrollY > 18);
  }

  function setNav(open) {
    if (!header || !navToggle) {
      return;
    }

    header.classList.toggle("nav-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  }

  function updateParallax() {
    var canMove = window.matchMedia("(min-width: 641px) and (prefers-reduced-motion: no-preference)").matches;

    parallaxImages.forEach(function (image) {
      if (!canMove) {
        image.style.setProperty("--parallax-y", "0px");
        return;
      }

      var rect = image.parentElement.getBoundingClientRect();
      var viewport = window.innerHeight || document.documentElement.clientHeight;
      var speed = parseFloat(image.getAttribute("data-speed") || "0.15");
      var offset = (rect.top + rect.height / 2 - viewport / 2) * speed;
      image.style.setProperty("--parallax-y", offset.toFixed(2) + "px");
    });
  }

  function markInvalid(field, invalid) {
    field.classList.toggle("field-error", invalid);
    field.setAttribute("aria-invalid", invalid ? "true" : "false");
  }

  function validateForm(form) {
    var fields = Array.prototype.slice.call(form.querySelectorAll("input, select, textarea"));
    var isValid = true;

    fields.forEach(function (field) {
      var invalid = false;

      if (field.hasAttribute("required") && !field.value.trim()) {
        invalid = true;
      }

      if (field.type === "email" && field.value.trim()) {
        invalid = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
      }

      markInvalid(field, invalid);
      isValid = isValid && !invalid;
    });

    return isValid;
  }

  // Future integration point: replace this static handler with a fetch() call
  // to a form service endpoint when Dianna's delivery destination is ready.
  function handleContactSubmit(event) {
    event.preventDefault();

    var form = event.currentTarget;
    var status = form.querySelector("[data-form-status]");
    var firstInvalid;

    if (!validateForm(form)) {
      firstInvalid = form.querySelector(".field-error");
      if (firstInvalid) {
        firstInvalid.focus();
      }
      if (status) {
        status.textContent = "Please complete the highlighted fields before preparing the inquiry.";
      }
      return;
    }

    if (status) {
      status.textContent = "Inquiry prepared. A future form endpoint can send this directly to Dianna.";
    }
  }

  setHeaderState();
  updateParallax();

  window.addEventListener("scroll", function () {
    window.requestAnimationFrame(function () {
      setHeaderState();
      updateParallax();
    });
  }, { passive: true });

  window.addEventListener("resize", function () {
    window.requestAnimationFrame(updateParallax);
  });

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      setNav(!header.classList.contains("nav-open"));
    });
  }

  document.addEventListener("click", function (event) {
    if (!header || !header.classList.contains("nav-open")) {
      return;
    }

    if (!header.contains(event.target)) {
      setNav(false);
    }
  });

  Array.prototype.slice.call(document.querySelectorAll(".site-nav a")).forEach(function (link) {
    link.addEventListener("click", function () {
      setNav(false);
    });
  });

  if (contactForm) {
    contactForm.addEventListener("submit", handleContactSubmit);
    contactForm.addEventListener("input", function (event) {
      if (event.target.matches("input, select, textarea")) {
        markInvalid(event.target, false);
      }
    });
  }
}());
