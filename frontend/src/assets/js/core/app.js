(function ($) {
  "use strict";


  /*--------------------------------------------------------------
    RegisterPlugin, ScrollTrigger, SplitText
  --------------------------------------------------------------*/
  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.config({
    nullTargetWarn: false,
    trialWarn: false
  });




  // Preloader
  $(window).on('load', function (event) {
    $('.js-preloader').delay(200).fadeOut(300);
  });





  // AOS Animation
  if ($("[data-aos]").length) {
    AOS.init({
      duration: '1200',
      disable: 'false',
      easing: 'ease',
      mirror: true
    });
  }




  // Brand One Carousel
  if ($(".brand-one__carousel").length > 0) {
    const swiper = new Swiper('.brand-one__carousel', {
      "slidesPerView": 5,
      "spaceBetween": 0,
      "speed": 2000,
      "loop": true,
      "pagination": {
        "el": "#swiper-dot-style1",
        "type": "bullets",
        "clickable": true
      },

      "navigation": {
        "nextEl": "#swiper-button-prev1",
        "prevEl": "#swiper-button-next1"
      },
      "autoplay": {
        "delay": 8000
      },
      "breakpoints": {
        "0": {
          "spaceBetween": 0,
          "slidesPerView": 1
        },
        "375": {
          "spaceBetween": 0,
          "slidesPerView": 1
        },
        "575": {
          "spaceBetween": 0,
          "slidesPerView": 1
        },
        "768": {
          "spaceBetween": 30,
          "slidesPerView": 3
        },
        "992": {
          "spaceBetween": 30,
          "slidesPerView": 4
        },
        "1200": {
          "spaceBetween": 30,
          "slidesPerView": 5
        },
        "1320": {
          "spaceBetween": 30,
          "slidesPerView": 5
        }
      },
    });
  }

  // Testimonial One
  if ($(".testimonial-one__carousel").length > 0) {
    const swiper = new Swiper('.testimonial-one__carousel', {
      "slidesPerView": 1,
      "spaceBetween": 0,
      "speed": 2000,
      "loop": true,
      "pagination": {
        "el": ".swiper-dot-style1",
        "type": "bullets",
        "clickable": true
      },

      "navigation": {
        "nextEl": ".swiper-button-prev1",
        "prevEl": ".swiper-button-next1"
      },
      "autoplay": {
        "delay": 8000
      },
      "breakpoints": {
        "0": {
          "spaceBetween": 0,
          "slidesPerView": 1
        },
        "375": {
          "spaceBetween": 0,
          "slidesPerView": 1
        },
        "575": {
          "spaceBetween": 10,
          "slidesPerView": 1
        },
        "768": {
          "spaceBetween": 30,
          "slidesPerView": 1
        },
        "992": {
          "spaceBetween": 30,
          "slidesPerView": 1
        },
        "1200": {
          "spaceBetween": 30,
          "slidesPerView": 1
        },
        "1320": {
          "spaceBetween": 30,
          "slidesPerView": 1
        }
      },
    });
  }


  // Brand Two Carousel
  if ($(".brand-two__carousel").length > 0) {
    const swiper = new Swiper('.brand-two__carousel', {
      "slidesPerView": 5,
      "spaceBetween": 0,
      "speed": 2000,
      "loop": true,
      "pagination": {
        "el": "#swiper-dot-style1",
        "type": "bullets",
        "clickable": true
      },

      "navigation": {
        "nextEl": "#swiper-button-prev1",
        "prevEl": "#swiper-button-next1"
      },
      "autoplay": {
        "delay": 8000
      },
      "breakpoints": {
        "0": {
          "spaceBetween": 0,
          "slidesPerView": 1
        },
        "375": {
          "spaceBetween": 0,
          "slidesPerView": 1
        },
        "575": {
          "spaceBetween": 0,
          "slidesPerView": 1
        },
        "768": {
          "spaceBetween": 10,
          "slidesPerView": 3
        },
        "992": {
          "spaceBetween": 10,
          "slidesPerView": 4
        },
        "1200": {
          "spaceBetween": 10,
          "slidesPerView": 5
        },
        "1320": {
          "spaceBetween": 10,
          "slidesPerView": 5
        }
      },
    });
  }

  // Testimonial Two
  if ($(".testimonial-two__carousel").length > 0) {
    const swiper = new Swiper('.testimonial-two__carousel', {
      "slidesPerView": 3,
      "spaceBetween": 0,
      "speed": 2000,
      "loop": true,
      "pagination": {
        "el": ".swiper-dot-style1",
        "type": "bullets",
        "clickable": true
      },

      "navigation": {
        "nextEl": ".swiper-button-prev1",
        "prevEl": ".swiper-button-next1"
      },
      "autoplay": {
        "delay": 8000
      },
      "breakpoints": {
        "0": {
          "spaceBetween": 0,
          "slidesPerView": 1
        },
        "375": {
          "spaceBetween": 0,
          "slidesPerView": 1
        },
        "575": {
          "spaceBetween": 10,
          "slidesPerView": 1
        },
        "768": {
          "spaceBetween": 30,
          "slidesPerView": 2
        },
        "992": {
          "spaceBetween": 30,
          "slidesPerView": 3
        },
        "1200": {
          "spaceBetween": 30,
          "slidesPerView": 3
        },
        "1320": {
          "spaceBetween": 30,
          "slidesPerView": 3
        }
      },
    });
  }



  function hoverTab2() {
    $('.cs-hover_tab-2 h3 a').hover(function () {
      $(this)
        .parents('.cs-hover_tab-2')
        .addClass('active')
        .siblings()
        .removeClass('active');
    });
  }


  /*--------------------------------------------------------------
    Dynamic Background
  --------------------------------------------------------------*/
  function dynamicBackground() {
    $('[data-src]').each(function () {
      var src = $(this).attr('data-src');
      $(this).css({
        'background-image': 'url(' + src + ')',
      });
    });
  }

  // Portfolio Three
  if ($(".portfolio-three__carousel").length > 0) {
    const swiper = new Swiper('.portfolio-three__carousel', {
      "slidesPerView": 3,
      "spaceBetween": 0,
      "speed": 600,
      "loop": true,
      "pagination": {
        "el": ".swiper-dot-style1",
        "type": "bullets",
        "clickable": true
      },

      "navigation": {
        "nextEl": ".swiper-button-prev1",
        "prevEl": ".swiper-button-next1"
      },
      "autoplay": {
        "delay": 8000
      },
      "breakpoints": {
        "0": {
          "spaceBetween": 0,
          "slidesPerView": 1
        },
        "375": {
          "spaceBetween": 0,
          "slidesPerView": 1
        },
        "575": {
          "spaceBetween": 10,
          "slidesPerView": 1
        },
        "768": {
          "spaceBetween": 30,
          "slidesPerView": 2
        },
        "992": {
          "spaceBetween": 60,
          "slidesPerView": 3
        },
        "1200": {
          "spaceBetween": 60,
          "slidesPerView": 3
        },
        "1320": {
          "spaceBetween": 60,
          "slidesPerView": 3
        }
      },
    });
  }



  // Testimonial Three
  if ($(".testimonial-three__carousel").length > 0) {
    const swiper = new Swiper('.testimonial-three__carousel', {
      "slidesPerView": 1,
      "spaceBetween": 0,
      "speed": 2000,
      "loop": true,
      "pagination": {
        "el": ".swiper-dot-style1",
        "type": "bullets",
        "clickable": true
      },

      "navigation": {
        "nextEl": ".swiper-button-prev1",
        "prevEl": ".swiper-button-next1"
      },
      "autoplay": {
        "delay": 8000
      },
      "breakpoints": {
        "0": {
          "spaceBetween": 0,
          "slidesPerView": 1
        },
        "375": {
          "spaceBetween": 0,
          "slidesPerView": 1
        },
        "575": {
          "spaceBetween": 10,
          "slidesPerView": 1
        },
        "768": {
          "spaceBetween": 30,
          "slidesPerView": 1
        },
        "992": {
          "spaceBetween": 30,
          "slidesPerView": 1
        },
        "1200": {
          "spaceBetween": 30,
          "slidesPerView": 1
        },
        "1320": {
          "spaceBetween": 30,
          "slidesPerView": 1
        }
      },
    });
  }



  // Blog Carousel Page Carousel
  if ($(".blog-carousel-page__carousel").length > 0) {
    const swiper = new Swiper('.blog-carousel-page__carousel', {
      "slidesPerView": 3,
      "spaceBetween": 0,
      "speed": 600,
      "loop": true,
      "pagination": {
        "el": ".swiper-dot-style1",
        "type": "bullets",
        "clickable": true
      },

      "navigation": {
        "nextEl": ".swiper-button-prev1",
        "prevEl": ".swiper-button-next1"
      },
      "autoplay": {
        "delay": 8000
      },
      "breakpoints": {
        "0": {
          "spaceBetween": 0,
          "slidesPerView": 1
        },
        "375": {
          "spaceBetween": 0,
          "slidesPerView": 1
        },
        "575": {
          "spaceBetween": 10,
          "slidesPerView": 1
        },
        "768": {
          "spaceBetween": 20,
          "slidesPerView": 2
        },
        "992": {
          "spaceBetween": 30,
          "slidesPerView": 3
        },
        "1200": {
          "spaceBetween": 30,
          "slidesPerView": 3
        },
        "1320": {
          "spaceBetween": 30,
          "slidesPerView": 3
        }
      },
    });
  }



  // Portfolio Carousel Page Carousel
  if ($(".portfolio-carousel-page__carousel").length > 0) {
    const swiper = new Swiper('.portfolio-carousel-page__carousel', {
      "slidesPerView": 3,
      "spaceBetween": 0,
      "speed": 600,
      "loop": true,
      "pagination": {
        "el": ".swiper-dot-style1",
        "type": "bullets",
        "clickable": true
      },

      "navigation": {
        "nextEl": ".swiper-button-prev1",
        "prevEl": ".swiper-button-next1"
      },
      "autoplay": {
        "delay": 8000
      },
      "breakpoints": {
        "0": {
          "spaceBetween": 0,
          "slidesPerView": 1
        },
        "375": {
          "spaceBetween": 0,
          "slidesPerView": 1
        },
        "575": {
          "spaceBetween": 10,
          "slidesPerView": 1
        },
        "768": {
          "spaceBetween": 30,
          "slidesPerView": 2
        },
        "992": {
          "spaceBetween": 30,
          "slidesPerView": 2
        },
        "1200": {
          "spaceBetween": 60,
          "slidesPerView": 2
        },
        "1320": {
          "spaceBetween": 60,
          "slidesPerView": 2
        }
      },
    });
  }





  // Services Carousel Page Carousel
  if ($(".services-carousel-page__carousel").length > 0) {
    const swiper = new Swiper('.services-carousel-page__carousel', {
      "slidesPerView": 3,
      "spaceBetween": 0,
      "speed": 600,
      "loop": true,
      "pagination": {
        "el": ".swiper-dot-style1",
        "type": "bullets",
        "clickable": true
      },

      "navigation": {
        "nextEl": ".swiper-button-prev1",
        "prevEl": ".swiper-button-next1"
      },
      "autoplay": {
        "delay": 8000
      },
      "breakpoints": {
        "0": {
          "spaceBetween": 0,
          "slidesPerView": 1
        },
        "375": {
          "spaceBetween": 0,
          "slidesPerView": 1
        },
        "575": {
          "spaceBetween": 10,
          "slidesPerView": 1
        },
        "768": {
          "spaceBetween": 30,
          "slidesPerView": 2
        },
        "992": {
          "spaceBetween": 30,
          "slidesPerView": 3
        },
        "1200": {
          "spaceBetween": 30,
          "slidesPerView": 3
        },
        "1320": {
          "spaceBetween": 30,
          "slidesPerView": 3
        }
      },
    });
  }





  // Team Carousel Page Carousel
  if ($(".team-carousel-page__carousel").length > 0) {
    const swiper = new Swiper('.team-carousel-page__carousel', {
      "slidesPerView": 4,
      "spaceBetween": 0,
      "speed": 600,
      "loop": true,
      "pagination": {
        "el": ".swiper-dot-style1",
        "type": "bullets",
        "clickable": true
      },

      "navigation": {
        "nextEl": ".swiper-button-prev1",
        "prevEl": ".swiper-button-next1"
      },
      "autoplay": {
        "delay": 8000
      },
      "breakpoints": {
        "0": {
          "spaceBetween": 0,
          "slidesPerView": 1
        },
        "375": {
          "spaceBetween": 0,
          "slidesPerView": 1
        },
        "575": {
          "spaceBetween": 10,
          "slidesPerView": 1
        },
        "768": {
          "spaceBetween": 30,
          "slidesPerView": 2
        },
        "992": {
          "spaceBetween": 30,
          "slidesPerView": 3
        },
        "1200": {
          "spaceBetween": 30,
          "slidesPerView": 4
        },
        "1320": {
          "spaceBetween": 30,
          "slidesPerView": 4
        }
      },
    });
  }





  if ($('#switch-toggle-tab').length) {
    var toggleSwitch = $('#switch-toggle-tab label.switch');
    var TabTitle = $('#switch-toggle-tab li');
    var monthTabTitle = $('#switch-toggle-tab li.month');
    var yearTabTitle = $('#switch-toggle-tab li.year');
    var monthTabContent = $('#month');
    var yearTabContent = $('#year');
    // hidden show deafult;
    monthTabContent.fadeIn();
    yearTabContent.fadeOut();

    function toggleHandle() {
      if (toggleSwitch.hasClass('on')) {
        yearTabContent.fadeOut();
        monthTabContent.fadeIn();
        monthTabTitle.addClass('active');
        yearTabTitle.removeClass('active');
      } else {
        monthTabContent.fadeOut();
        yearTabContent.fadeIn();
        yearTabTitle.addClass('active');
        monthTabTitle.removeClass('active');
      }
    };
    monthTabTitle.on('click', function () {
      toggleSwitch.addClass('on').removeClass('off');
      toggleHandle();
      return false;
    });
    yearTabTitle.on('click', function () {
      toggleSwitch.addClass('off').removeClass('on');
      toggleHandle();
      return false;
    });
    toggleSwitch.on('click', function () {
      toggleSwitch.toggleClass('on off');
      toggleHandle();
    });
  }




  if ($(".marquee_mode").length) {
    $('.marquee_mode').marquee({
      speed: 30,
      gap: 0,
      delayBeforeStart: 0,
      direction: 'left',
      duplicated: true,
      pauseOnHover: true,
      startVisible: true,
    });
  }
  if ($(".marquee_mode-2").length) {
    $('.marquee_mode-2').marquee({
      speed: 30,
      gap: 0,
      delayBeforeStart: 0,
      direction: 'left',
      duplicated: true,
      pauseOnHover: true,
      startVisible: true,
    });
  }


  // custom coursor
  if ($(".custom-cursor").length) {

    var cursor = document.querySelector('.custom-cursor__cursor');
    var cursorinner = document.querySelector('.custom-cursor__cursor-two');
    var a = document.querySelectorAll('a');

    document.addEventListener('mousemove', function (e) {
      var x = e.clientX;
      var y = e.clientY;
      cursor.style.transform = `translate3d(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%), 0)`
    });

    document.addEventListener('mousemove', function (e) {
      var x = e.clientX;
      var y = e.clientY;
      cursorinner.style.left = x + 'px';
      cursorinner.style.top = y + 'px';
    });

    document.addEventListener('mousedown', function () {
      cursor.classList.add('click');
      cursorinner.classList.add('custom-cursor__innerhover')
    });

    document.addEventListener('mouseup', function () {
      cursor.classList.remove('click')
      cursorinner.classList.remove('custom-cursor__innerhover')
    });

    a.forEach(item => {
      item.addEventListener('mouseover', () => {
        cursor.classList.add('custom-cursor__hover');
      });
      item.addEventListener('mouseleave', () => {
        cursor.classList.remove('custom-cursor__hover');
      });
    })
  }


  //Progress Count Bar
  if ($(".count-bar").length) {
    $(".count-bar").appear(
      function () {
        var el = $(this);
        var percent = el.data("percent");
        $(el).css("width", percent).addClass("counted");
      }, {
        accY: -50
      }
    );
  }


  //Fact Counter + Text Count
  if ($(".count-box").length) {
    $(".count-box").appear(
      function () {
        var $t = $(this),
          n = $t.find(".count-text").attr("data-stop"),
          r = parseInt($t.find(".count-text").attr("data-speed"), 10);

        if (!$t.hasClass("counted")) {
          $t.addClass("counted");
          $({
            countNum: $t.find(".count-text").text()
          }).animate({
            countNum: n
          }, {
            duration: r,
            easing: "linear",
            step: function () {
              $t.find(".count-text").text(Math.floor(this.countNum));
            },
            complete: function () {
              $t.find(".count-text").text(this.countNum);
            }
          });
        }
      }, {
        accY: 0
      }
    );
  }



  // Accrodion
  if ($(".accrodion-grp").length) {
    var accrodionGrp = $(".accrodion-grp");
    accrodionGrp.each(function () {
      var accrodionName = $(this).data("grp-name");
      var Self = $(this);
      var accordion = Self.find(".accrodion");
      Self.addClass(accrodionName);
      Self.find(".accrodion .accrodion-content").hide();
      Self.find(".accrodion.active").find(".accrodion-content").show();
      accordion.each(function () {
        $(this)
          .find(".accrodion-title")
          .on("click", function () {
            if ($(this).parent().hasClass("active") === false) {
              $(".accrodion-grp." + accrodionName)
                .find(".accrodion")
                .removeClass("active");
              $(".accrodion-grp." + accrodionName)
                .find(".accrodion")
                .find(".accrodion-content")
                .slideUp();
              $(this).parent().addClass("active");
              $(this).parent().find(".accrodion-content").slideDown();
            }
          });
      });
    });
  }



  $(".contact-form-validated").each(function () {
    $(this).validate({
      rules: {
        email: {
          required: true,
          email: true
        }
      },
      submitHandler: function (form) {
        $.post(
          $(form).attr("action"),
          $(form).serialize(),
          function (response) {
            $(form).find(".result").html(response);
            $(form).find('input[type="text"], input[type="email"], textarea').val("");
          }
        );
        return false;
      }
    });
  });



  if ($(".video-popup").length) {
    $(".video-popup").magnificPopup({
      type: "iframe",
      mainClass: "mfp-fade",
      removalDelay: 160,
      preloader: true,

      fixedContentPos: false
    });
  }

  if ($(".img-popup").length) {
    var groups = {};
    $(".img-popup").each(function () {
      var id = parseInt($(this).attr("data-group"), 10);

      if (!groups[id]) {
        groups[id] = [];
      }

      groups[id].push(this);
    });

    $.each(groups, function () {
      $(this).magnificPopup({
        type: "image",
        closeOnContentClick: true,
        closeBtnInside: false,
        gallery: {
          enabled: true
        }
      });
    });
  }




  //Chat Popup
  if ($('#chat-popup').length) {

    //Show Popup
    $('.chat-toggler').on('click', function () {
      $('#chat-popup').addClass('popup-visible');
    });
    $(document).keydown(function (e) {
      if (e.keyCode === 27) {
        $('#chat-popup').removeClass('popup-visible');
      }
    });
    //Hide Popup
    $('.close-chat,.chat-popup .overlay-layer').on('click', function () {
      $('#chat-popup').removeClass('popup-visible');
    });
  }


  function dynamicCurrentMenuClass(selector) {
    let fileName = window.location.pathname.split("/").pop() || ""; // Default to index.html if no file name


    // Remove existing 'current' classes to avoid duplicates
    selector.find("li").removeClass("current");

    // Iterate through all <li> elements, including nested ones
    selector.find("li").each(function () {
      let anchor = $(this).find("a").first(); // Get the first <a> in the <li>
      if (anchor.length && anchor.attr("href") === fileName) {
        $(this).addClass("current"); // Add 'current' to the matching <li>
        // Add 'current' to parent <li> if it exists (for dropdowns)
        let parentLi = $(this).closest("li.dropdown");
        if (parentLi.length) {
          parentLi.addClass("current");
        }
      }
    });

    // If no match is found, add 'current' to the first top-level <li> (Home)
    if (!selector.find("li.current").length) {
      selector.children("li").first().addClass("current");
    }
  }

  // Run the function if the main menu exists
  if ($(".main-menu__list").length) {
    let mainNavUL = $(".main-menu__list");
    dynamicCurrentMenuClass(mainNavUL);
  }


  if ($(".main-menu__list").length && $(".mobile-nav__container").length) {
    let navContent = document.querySelector(".main-menu__list").outerHTML;
    let mobileNavContainer = document.querySelector(".mobile-nav__container");
    mobileNavContainer.innerHTML = navContent;
  }
  if ($(".sticky-header__content").length) {
    let navContent = document.querySelector(".main-menu").innerHTML;
    let mobileNavContainer = document.querySelector(".sticky-header__content");
    mobileNavContainer.innerHTML = navContent;
  }

  if ($(".mobile-nav__container .main-menu__list").length) {
    let dropdownAnchor = $(
      ".mobile-nav__container .main-menu__list .dropdown > a"
    );
    dropdownAnchor.each(function () {
      let self = $(this);
      let toggleBtn = document.createElement("BUTTON");
      toggleBtn.setAttribute("aria-label", "dropdown toggler");
      toggleBtn.innerHTML = "<i class='fa fa-angle-down'></i>";
      self.append(function () {
        return toggleBtn;
      });
      self.find("button").on("click", function (e) {
        e.preventDefault();
        let self = $(this);
        self.toggleClass("expanded");
        self.parent().toggleClass("expanded");
        self.parent().parent().children("ul").slideToggle();
      });
    });
  }

  if ($(".mobile-nav__toggler").length) {
    $(".mobile-nav__toggler").on("click", function (e) {
      e.preventDefault();
      $(".mobile-nav__wrapper").toggleClass("expanded");
      $("body").toggleClass("locked");
    });
  }



  //Header Search
  if ($('.searcher-toggler-box').length) {
    $('.searcher-toggler-box').on('click', function (e) {
      e.preventDefault();
      $('body').addClass('search-active');
    });


    $('.close-search').on('click', function () {
      $('body').removeClass('search-active');
    });


    $('.search-popup .color-layer').on('click', function () {
      $('body').removeClass('search-active');
    });

  }




  if ($(".odometer").length) {
    var odo = $(".odometer");
    odo.each(function () {
      $(this).appear(function () {
        var countNumber = $(this).attr("data-count");
        $(this).html(countNumber);
      });
    });
  }

  if ($(".dynamic-year").length) {
    let date = new Date();
    $(".dynamic-year").html(date.getFullYear());
  }


  if ($(".tabs-box").length) {
    $(".tabs-box .tab-buttons .tab-btn").on("click", function (e) {
      e.preventDefault();
      var target = $($(this).attr("data-tab"));

      if ($(target).is(":visible")) {
        return false;
      } else {
        target
          .parents(".tabs-box")
          .find(".tab-buttons")
          .find(".tab-btn")
          .removeClass("active-btn");
        $(this).addClass("active-btn");
        target
          .parents(".tabs-box")
          .find(".tabs-content")
          .find(".tab")
          .fadeOut(0);
        target
          .parents(".tabs-box")
          .find(".tabs-content")
          .find(".tab")
          .removeClass("active-tab");
        $(target).fadeIn(300);
        $(target).addClass("active-tab");
      }
    });
  }


  function SmoothMenuScroll() {
    var anchor = $(".scrollToLink");
    if (anchor.length) {
      anchor.children("a").bind("click", function (event) {
        if ($(window).scrollTop() > 10) {
          var headerH = "90";
        } else {
          var headerH = "90";
        }
        var target = $(this);
        $("html, body")
          .stop()
          .animate({
              scrollTop: $(target.attr("href")).offset().top - headerH + "px"
            },
            200,
            "easeInOutExpo"
          );
        anchor.removeClass("current");
        anchor.removeClass("current-menu-ancestor");
        anchor.removeClass("current_page_item");
        anchor.removeClass("current-menu-parent");
        target.parent().addClass("current");
        event.preventDefault();
      });
    }
  }
  SmoothMenuScroll();

  function OnePageMenuScroll() {
    var windscroll = $(window).scrollTop();
    if (windscroll >= 117) {
      var menuAnchor = $(".one-page-scroll-menu .scrollToLink").children("a");
      menuAnchor.each(function () {
        var sections = $(this).attr("href");
        $(sections).each(function () {
          if ($(this).offset().top <= windscroll + 100) {
            var Sectionid = $(sections).attr("id");
            $(".one-page-scroll-menu").find("li").removeClass("current");
            $(".one-page-scroll-menu").find("li").removeClass("current-menu-ancestor");
            $(".one-page-scroll-menu").find("li").removeClass("current_page_item");
            $(".one-page-scroll-menu").find("li").removeClass("current-menu-parent");
            $(".one-page-scroll-menu")
              .find("a[href*=\\#" + Sectionid + "]")
              .parent()
              .addClass("current");
          }
        });
      });
    } else {
      $(".one-page-scroll-menu li.current").removeClass("current");
      $(".one-page-scroll-menu li:first").addClass("current");
    }
  }




  /*-- Handle Scrollbar --*/
  function handleScrollbar() {
    const bodyHeight = $("body").height();
    const scrollPos = $(window).innerHeight() + $(window).scrollTop();
    let percentage = (scrollPos / bodyHeight) * 100;
    if (percentage > 100) {
      percentage = 100;
    }
    $(".scroll-to-top .scroll-to-top__inner").css("width", percentage + "%");
  }




  // Animation gsap 
  function title_animation() {
    var tg_var = jQuery('.sec-title-animation');
    if (!tg_var.length) {
      return;
    }
    const quotes = document.querySelectorAll(".sec-title-animation .title-animation");

    quotes.forEach(quote => {

      //Reset if needed
      if (quote.animation) {
        quote.animation.progress(1).kill();
        quote.split.revert();
      }

      var getclass = quote.closest('.sec-title-animation').className;
      var animation = getclass.split('animation-');
      if (animation[1] == "style4") return

      quote.split = new SplitText(quote, {
        type: "lines,words,chars",
        linesClass: "split-line"
      });
      gsap.set(quote, {
        perspective: 400
      });

      if (animation[1] == "style1") {
        gsap.set(quote.split.chars, {
          opacity: 0,
          y: "90%",
          rotateX: "-40deg"
        });
      }
      if (animation[1] == "style2") {
        gsap.set(quote.split.chars, {
          opacity: 0,
          x: "50"
        });
      }
      if (animation[1] == "style3") {
        gsap.set(quote.split.chars, {
          opacity: 0,
        });
      }
      quote.animation = gsap.to(quote.split.chars, {
        scrollTrigger: {
          trigger: quote,
          start: "top 90%",
        },
        x: "0",
        y: "0",
        rotateX: "0",
        opacity: 1,
        duration: 1,
        ease: Back.easeOut,
        stagger: .02
      });
    });
  }
  ScrollTrigger.addEventListener("refresh", title_animation);






  // window load event
  $(window).on("load", function () {

    title_animation();
    hoverTab2();
    dynamicBackground();




    if ($('.curved-circle').length) {
      $('.curved-circle').circleType({
        position: 'absolute',
        dir: 1,
        radius: 70,
        forceHeight: true,
        forceWidth: true
      });
    }


    if ($('.curved-circle-2').length) {
      $('.curved-circle-2').circleType({
        position: 'absolute',
        dir: 1,
        radius: 67,
        forceHeight: true,
        forceWidth: true
      });
    }

    if ($('.curved-circle-3').length) {
      $('.curved-circle-3').circleType({
        position: 'absolute',
        dir: 1,
        radius: 53,
        forceHeight: true,
        forceWidth: true
      });
    }






















  });


  // window scroll event

  $(window).on("scroll", function () {
    if ($(".stricked-menu").length) {
      var headerScrollPos = 300;
      var stricky = $(".stricked-menu");
      if ($(window).scrollTop() > headerScrollPos) {
        stricky.addClass("stricky-fixed");
      } else if ($(this).scrollTop() <= headerScrollPos) {
        stricky.removeClass("stricky-fixed");
      }
    }

    OnePageMenuScroll();

  });

  $(window).on("scroll", function () {
    handleScrollbar();
    if ($(".sticky-header--one-page").length) {
      var headerScrollPos = 130;
      var stricky = $(".sticky-header--one-page");
      if ($(window).scrollTop() > headerScrollPos) {
        stricky.addClass("active");
      } else if ($(this).scrollTop() <= headerScrollPos) {
        stricky.removeClass("active");
      }
    }

    var scrollToTopBtn = ".scroll-to-top";
    if (scrollToTopBtn.length) {
      if ($(window).scrollTop() > 500) {
        $(scrollToTopBtn).addClass("show");
      } else {
        $(scrollToTopBtn).removeClass("show");
      }
    }
  });



  $('select:not(.ignore)').niceSelect();







})(jQuery);