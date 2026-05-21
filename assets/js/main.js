(function () {
  var primaryNavItems = [
    {
      key: "about",
      label: "About",
      href: "#about"
    },
    {
      key: "tools",
      label: "Resources",
      href: "tools/"
    },
    {
      key: "blog",
      label: "Blog",
      href: "blog/"
    },
    {
      key: "contact",
      label: "Contact",
      href: "contact/"
    }
  ];
  var header = document.querySelector("[data-site-header]");

  renderSiteHeader(header);

  var navToggle = header ? header.querySelector(".nav-toggle") : document.querySelector(".nav-toggle");
  var parallaxImages = Array.prototype.slice.call(document.querySelectorAll(".parallax-image"));
  var contactForm = document.querySelector("[data-contact-form]");
  var mortgageCalculator = document.querySelector("[data-mortgage-calculator]");

  document.body.classList.toggle("contact-page", window.location.pathname.indexOf("contact") !== -1);

  function normalizeHeaderRoot(root) {
    var normalized = (root || ".").replace(/\/+$/, "");
    return normalized || ".";
  }

  function buildHeaderHref(root, path) {
    if (path.charAt(0) === "#") {
      return root === "." ? path : root + "/" + path;
    }

    return root + "/" + path;
  }

  function renderSiteHeader(siteHeader) {
    var root;
    var activePage;
    var navLinks;

    if (!siteHeader) {
      return;
    }

    root = normalizeHeaderRoot(siteHeader.getAttribute("data-header-root"));
    activePage = siteHeader.getAttribute("data-active-page") || "";
    navLinks = primaryNavItems.map(function (item) {
      var currentAttribute = item.key === activePage ? ' aria-current="page"' : "";

      return '<a href="' + buildHeaderHref(root, item.href) + '"' + currentAttribute + ">" + item.label + "</a>";
    }).join("");

    siteHeader.innerHTML = ''
      + '<a class="brand" href="' + root + '/" aria-label="Dianna Brang home">'
      + '<span class="brand-mark">DB</span>'
      + '<span>'
      + '<strong>Dianna Brang</strong>'
      + '<small>California Real Estate</small>'
      + '</span>'
      + '</a>'
      + '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">'
      + '<span class="nav-toggle-line"></span>'
      + '<span class="nav-toggle-line"></span>'
      + '<span class="nav-toggle-line"></span>'
      + '<span class="sr-only">Toggle navigation</span>'
      + '</button>'
      + '<nav class="site-nav" id="site-nav" aria-label="Primary navigation">'
      + navLinks
      + '</nav>';
  }

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
    var submitButton = form.querySelector('button[type="submit"]');
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

    if (!window.fetch || !window.FormData) {
      return;
    }

    event.preventDefault();

    if (status) {
      status.classList.remove("is-error", "is-success");
      status.textContent = "Sending your inquiry...";
    }

    if (submitButton) {
      submitButton.disabled = true;
    }

    fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: {
        Accept: "application/json"
      }
    })
      .then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok) {
            throw new Error(data.message || "The form could not be sent.");
          }
          return data;
        });
      })
      .then(function () {
        form.reset();
        if (status) {
          status.classList.add("is-success");
          status.textContent = "Thank you. Your inquiry has been sent, and Dianna will follow up soon.";
        }
      })
      .catch(function () {
        if (status) {
          status.classList.add("is-error");
          status.textContent = "Something went wrong while sending. Please try again in a moment.";
        }
      })
      .finally(function () {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  }

  function getNumericValue(form, name) {
    var field = form.querySelector('[name="' + name + '"]');
    var value = field ? parseFloat(field.value) : 0;

    if (!Number.isFinite(value) || value < 0) {
      return 0;
    }

    return value;
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(Math.max(0, value));
  }

  function updateMortgageCalculator() {
    if (!mortgageCalculator) {
      return;
    }

    var homePrice = getNumericValue(mortgageCalculator, "homePrice");
    var downPayment = getNumericValue(mortgageCalculator, "downPayment");
    var interestRate = getNumericValue(mortgageCalculator, "interestRate");
    var loanTerm = getNumericValue(mortgageCalculator, "loanTerm");
    var propertyTax = getNumericValue(mortgageCalculator, "propertyTax");
    var insurance = getNumericValue(mortgageCalculator, "insurance");
    var hoa = getNumericValue(mortgageCalculator, "hoa");
    var loanAmount = Math.max(0, homePrice - downPayment);
    var monthCount = Math.max(1, loanTerm * 12);
    var monthlyRate = interestRate / 100 / 12;
    var principalAndInterest;
    var monthlyTax = homePrice * (propertyTax / 100) / 12;
    var monthlyExtras = insurance + hoa;
    var total;

    if (monthlyRate > 0) {
      principalAndInterest = loanAmount * (
        monthlyRate * Math.pow(1 + monthlyRate, monthCount)
      ) / (
        Math.pow(1 + monthlyRate, monthCount) - 1
      );
    } else {
      principalAndInterest = loanAmount / monthCount;
    }

    total = principalAndInterest + monthlyTax + monthlyExtras;

    mortgageCalculator.querySelector("[data-payment-total]").textContent = formatCurrency(total);
    mortgageCalculator.querySelector("[data-payment-principal]").textContent = formatCurrency(principalAndInterest);
    mortgageCalculator.querySelector("[data-payment-tax]").textContent = formatCurrency(monthlyTax);
    mortgageCalculator.querySelector("[data-payment-extras]").textContent = formatCurrency(monthlyExtras);
  }

  setHeaderState();
  updateParallax();
  updateMortgageCalculator();

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

  if (mortgageCalculator) {
    mortgageCalculator.addEventListener("input", updateMortgageCalculator);
    mortgageCalculator.addEventListener("submit", function (event) {
      event.preventDefault();
    });
  }
}());
