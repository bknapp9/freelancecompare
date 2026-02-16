(function() {
  'use strict';

  /* ── Helpers ── */
  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return document.querySelectorAll(sel); }
  function fmt(n) { 
    return n.toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
  }
  function parseNum(v) { return parseFloat(String(v).replace(/[^0-9.]/g, '')) || 0; }

  /* ── Platform Definitions ── */
  let projectType = 'fixed';

  const platforms = [
    {
      name: 'Upwork',
      color: '#14A800',
      abbr: 'Up',
      calc: function(amount) {
        const fee = amount * 0.10;
        const takeHome = amount - fee;
        const notes = [];
        notes.push('Client pays 5% marketplace fee + up to $4.95 initiation fee');
        notes.push('Connects cost: ~$0.60–$5.40 per proposal (4–6 connects)');
        notes.push('Payment: ' + (projectType === 'hourly' ? '10 days after billing' : '5 days after approval'));
        return { fee: fee, takeHome: takeHome, pct: 10, notes: notes };
      }
    },
    {
      name: 'Fiverr',
      color: '#1DBF73',
      abbr: 'Fi',
      calc: function(amount) {
        const fee = amount * 0.20;
        const takeHome = amount - fee;
        const notes = [];
        notes.push('Buyer pays 5.5% service fee');
        if (amount < 75) notes.push('+ $3.50 small order fee (order under $200)');
        notes.push('Payment: 7 days (Top Rated) or 14 days after completion');
        return { fee: fee, takeHome: takeHome, pct: 20, notes: notes };
      }
    },
    {
      name: 'Freelancer.com',
      color: '#0E74BC',
      abbr: 'Fr',
      calc: function(amount) {
        let fee;
        if (projectType === 'fixed') {
          fee = Math.max(amount * 0.10, 5);
        } else {
          fee = amount * 0.10;
        }
        const takeHome = amount - fee;
        const pct = amount > 0 ? (fee / amount * 100) : 0;
        const notes = [];
        if (projectType === 'fixed') notes.push('Fee: 10% or $5, whichever is greater');
        else notes.push('Fee: 10% on hourly projects');
        notes.push('Client pays 3% or $3, whichever is greater');
        notes.push('Withdrawal: $0.25 (PayPal)');
        notes.push('Payment: 15–30 days');
        return { fee: fee, takeHome: takeHome, pct: Math.round(pct * 100) / 100, notes: notes };
      }
    },
    {
      name: 'Contra',
      color: '#6C5CE7',
      abbr: 'Co',
      calc: function(amount) {
        const notes = [];
        notes.push('0% commission — free for freelancers');
        notes.push('Client pays invoice processing fees');
        notes.push('Note: Smaller client pool than major platforms');
        return { fee: 0, takeHome: amount, pct: 0, notes: notes };
      }
    },
    {
      name: 'Toptal',
      color: '#204ECF',
      abbr: 'Tt',
      calc: function(amount) {
        const notes = [];
        notes.push('0% fee — Toptal takes margin from client side');
        notes.push('Very selective: top 3% acceptance rate');
        notes.push('Payment: Biweekly');
        return { fee: 0, takeHome: amount, pct: 0, notes: notes };
      }
    },
    {
      name: 'PeoplePerHour',
      color: '#F7941D',
      abbr: 'PP',
      calc: function(amount) {
        let fee = 0;
        if (amount <= 700) {
          fee = amount * 0.20;
        } else if (amount <= 7000) {
          fee = 700 * 0.20 + (amount - 700) * 0.075;
        } else {
          fee = 700 * 0.20 + 6300 * 0.075 + (amount - 7000) * 0.035;
        }
        const takeHome = amount - fee;
        const pct = amount > 0 ? (fee / amount * 100) : 0;
        const notes = [];
        notes.push('Tiered: 20% first $700, 7.5% to $7k, 3.5% after');
        notes.push('Buyer pays up to 10% service fee');
        notes.push('Withdrawal: Free (bank), fees on PayPal');
        return { fee: fee, takeHome: takeHome, pct: Math.round(pct * 100) / 100, notes: notes };
      }
    },
    {
      name: 'Guru',
      color: '#4A90D9',
      abbr: 'Gu',
      calc: function(amount) {
        const fee = amount * 0.09;
        const takeHome = amount - fee;
        const notes = [];
        notes.push('9% for free members (5% with paid membership)');
        notes.push('Payment timeline varies by SafePay terms');
        return { fee: fee, takeHome: takeHome, pct: 9, notes: notes };
      }
    }
  ];

  /* ── Render Platform Cards ── */
  function renderCards(amount) {
    const grid = $('#cards-grid');
    if (amount <= 0) {
      grid.innerHTML = '<p style="color:var(--gray-400);grid-column:1/-1;text-align:center;padding:40px 0;font-size:1rem;">Enter a project amount above to see the comparison.</p>';
      return;
    }

    const results = platforms.map(function(p) {
      const r = p.calc(amount);
      r.name = p.name;
      r.color = p.color;
      r.abbr = p.abbr;
      return r;
    });

    results.sort(function(a, b) { return b.takeHome - a.takeHome; });
    const bestTH = results[0].takeHome;

    grid.innerHTML = results.map(function(r, i) {
      const keepPct = amount > 0 ? (r.takeHome / amount * 100) : 0;
      const feePct = 100 - keepPct;
      const isBest = r.takeHome === bestTH && r.fee === 0;

      const zeroFee = r.fee === 0;
      const feeTagBg = zeroFee ? 'var(--green-light)' : 'var(--red-light)';
      const feeTagColor = zeroFee ? 'var(--green-dark)' : 'var(--red)';

      return '<div class="platform-card' + (isBest ? ' best' : '') + '">' +
        '<div class="card-header">' +
          '<div class="platform-icon" style="background:' + r.color + '">' + r.abbr + '</div>' +
          '<h3>' + r.name + '</h3>' +
          '<span class="fee-tag" style="background:' + feeTagBg + ';color:' + feeTagColor + '">' +
            (r.fee === 0 ? '0% fee' : r.pct + '% fee') +
          '</span>' +
        '</div>' +
        '<div class="take-home-row">' +
          '<div class="take-home-label">Your take-home</div>' +
          '<div class="take-home-amount">$' + fmt(r.takeHome) + '</div>' +
          '<div class="fee-amount-detail">−$' + fmt(r.fee) + ' in fees</div>' +
        '</div>' +
        '<div class="fee-bar-container">' +
          '<div class="fee-bar-bg"><div class="fee-bar-fill" data-width="' + keepPct.toFixed(1) + '"></div></div>' +
          '<div class="bar-labels"><span class="keep">You keep ' + keepPct.toFixed(1) + '%</span><span class="fees">Fees ' + feePct.toFixed(1) + '%</span></div>' +
        '</div>' +
        '<div class="hidden-costs">' +
          r.notes.map(function(n) { return '<div>' + n + '</div>'; }).join('') +
        '</div>' +
      '</div>';
    }).join('');

    /* Animate bars */
    requestAnimationFrame(function() {
      grid.querySelectorAll('.fee-bar-fill').forEach(function(bar) {
        bar.style.width = bar.dataset.width + '%';
      });
    });
  }

  /* ── Annual Impact ── */
  function calcAnnual() {
    const monthly = parseNum($('#monthly-income').value);
    const projects = parseNum($('#monthly-projects').value) || 1;
    const chart = $('#annual-chart');
    const summary = $('#annual-summary');

    if (monthly <= 0) {
      summary.innerHTML = 'Enter your estimated monthly income above to see the annual fee comparison.';
      chart.innerHTML = '';
      return;
    }

    const perProject = monthly / projects;

    const results = platforms.map(function(p) {
      let monthlyFee = 0;
      for (let i = 0; i < projects; i++) {
        monthlyFee += p.calc(perProject).fee;
      }
      const annualFee = monthlyFee * 12;
      return { name: p.name, color: p.color, annualFee: annualFee };
    });

    results.sort(function(a, b) { return a.annualFee - b.annualFee; });
    const maxFee = results[results.length - 1].annualFee || 1;
    const best = results[0];
    const worst = results[results.length - 1];

    summary.innerHTML = 'On <span class="highlight-green">' + best.name + '</span>, you\'d keep an extra <span class="highlight-green">$' + fmt(worst.annualFee - best.annualFee) + '/year</span> compared to <span class="highlight-red">' + worst.name + '</span>, which costs you <span class="highlight-red">$' + fmt(worst.annualFee) + '/year</span> in fees alone.';

    chart.innerHTML = results.map(function(r) {
      const widthPct = maxFee > 0 ? (r.annualFee / maxFee * 100) : 0;
      const barClass = r.annualFee === 0 ? 'green-bar' : 'red-bar';
      return '<div class="bar-row">' +
        '<div class="bar-label">' + r.name + '</div>' +
        '<div class="bar-track"><div class="bar-fill ' + barClass + '" data-width="' + widthPct.toFixed(1) + '">' +
          (r.annualFee === 0 ? '$0 — Free' : '$' + fmt(r.annualFee)) +
        '</div></div>' +
      '</div>';
    }).join('');

    requestAnimationFrame(function() {
      chart.querySelectorAll('.bar-fill').forEach(function(bar) {
        const w = parseFloat(bar.dataset.width);
        bar.style.width = Math.max(w, 12) + '%';
      });
    });
  }

  /* ── Break-Even ── */
  function calcBreakeven() {
    const target = parseNum($('#be-target').value);
    const container = $('#be-results');

    if (target <= 0) {
      container.innerHTML = '<div class="breakeven-result"><div class="be-label">Enter a target take-home amount</div></div>';
      return;
    }

    const rows = platforms.map(function(p) {
      let gross;
      switch (p.name) {
        case 'Upwork': gross = target / 0.90; break;
        case 'Fiverr': gross = target / 0.80; break;
        case 'Freelancer.com':
          if (projectType === 'fixed') {
            if (target / 0.90 * 0.10 >= 5) gross = target / 0.90;
            else gross = target + 5;
          } else { gross = target / 0.90; }
          break;
        case 'Contra': gross = target; break;
        case 'Toptal': gross = target; break;
        case 'PeoplePerHour':
          if (target <= 700 * 0.80) { gross = target / 0.80; }
          else if (target <= 700 * 0.80 + 6300 * 0.925) { gross = (target - 700 * 0.80) / 0.925 + 700; }
          else { gross = (target - 700 * 0.80 - 6300 * 0.925) / 0.965 + 7000; }
          break;
        case 'Guru': gross = target / 0.91; break;
        default: gross = target;
      }
      return { name: p.name, color: p.color, gross: gross, diff: gross - target };
    });

    rows.sort(function(a, b) { return a.gross - b.gross; });

    container.innerHTML = rows.map(function(r) {
      const extraTag = r.diff > 0.01
        ? '<div class="be-note" style="color:var(--red)">+$' + fmt(r.diff) + ' above target</div>'
        : '<div class="be-note" style="color:var(--green)">No markup needed</div>';
      return '<div class="breakeven-result" style="margin-bottom:10px">' +
        '<div class="be-label">' + r.name + '</div>' +
        '<div class="be-amount" style="font-size:1.3rem;">$' + fmt(r.gross) + '</div>' +
        extraTag +
      '</div>';
    }).join('');
  }

  /* ── Event Bindings ── */
  const amountInput = $('#project-amount');
  amountInput.addEventListener('input', function() { renderCards(parseNum(this.value)); });

  $$('.quick-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      amountInput.value = this.dataset.amount;
      renderCards(parseNum(this.dataset.amount));
    });
  });

  $('#btn-fixed').addEventListener('click', function() {
    projectType = 'fixed';
    this.classList.add('active');
    $('#btn-hourly').classList.remove('active');
    renderCards(parseNum(amountInput.value));
    calcAnnual();
    calcBreakeven();
  });
  $('#btn-hourly').addEventListener('click', function() {
    projectType = 'hourly';
    this.classList.add('active');
    $('#btn-fixed').classList.remove('active');
    renderCards(parseNum(amountInput.value));
    calcAnnual();
    calcBreakeven();
  });

  $('#monthly-income').addEventListener('input', calcAnnual);
  $('#monthly-projects').addEventListener('input', calcAnnual);
  $('#be-target').addEventListener('input', calcBreakeven);

  /* ── FAQ Accordion ── */
  $$('.faq-question').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const item = this.parentElement;
      const wasOpen = item.classList.contains('open');
      $$('.faq-item').forEach(function(i) { i.classList.remove('open'); });
      if (!wasOpen) item.classList.add('open');
    });
  });

  /* ── Mobile Nav Toggle ── */
  $('#mobile-toggle').addEventListener('click', function() {
    $('#main-nav').classList.toggle('open');
  });

  /* ── Sticky Header Shadow ── */
  window.addEventListener('scroll', function() {
    $('#site-header').classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  /* ── Init ── */
  renderCards(0);
  calcBreakeven();

})();
