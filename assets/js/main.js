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
    if (!field) {
      return;
    }

    field.classList.toggle("field-error", invalid);
    field.setAttribute("aria-invalid", invalid ? "true" : "false");
  }

  function validateForm(form) {
    var fields = Array.prototype.slice.call(form.querySelectorAll("input, select, textarea"));
    var emailField = form.querySelector('[name="email"]');
    var phoneField = form.querySelector('[name="phone"]');
    var hasContactMethod = Boolean(
      (emailField && emailField.value.trim()) || (phoneField && phoneField.value.trim())
    );
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

    if (!hasContactMethod) {
      if (emailField) {
        markInvalid(emailField, true);
      }
      if (phoneField) {
        markInvalid(phoneField, true);
      }
      isValid = false;
    }

    return isValid;
  }

  function handleContactSubmit(event) {
    var form = event.currentTarget;
    var status = form.querySelector("[data-form-status]");
    var firstInvalid;

    if (!validateForm(form)) {
      event.preventDefault();
      firstInvalid = form.querySelector(".field-error");
      if (firstInvalid) {
        firstInvalid.focus();
      }
      if (status) {
        status.textContent = "Please include your name and either an email address or phone number.";
      }
      return;
    }

    if (status) {
      status.textContent = "Sending your inquiry...";
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
      if (event.target.matches('[name="email"], [name="phone"]')) {
        var emailField = contactForm.querySelector('[name="email"]');
        var phoneField = contactForm.querySelector('[name="phone"]');
        if ((emailField && emailField.value.trim()) || (phoneField && phoneField.value.trim())) {
          markInvalid(emailField, false);
          markInvalid(phoneField, false);
        }
      }
    });
  }
}());
