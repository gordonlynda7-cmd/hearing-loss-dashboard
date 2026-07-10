// Typewriter effect
function typeText(el, text, speed = 60) {
    el.textContent = '';
    let i = 0;
    function step() {
        if (i < text.length) {
            el.textContent += text.charAt(i);
            i++;
            setTimeout(step, speed);
        }
    }
    step();
}

// Stats (hardcoded, no backend needed for deployment)
let statsData = {
    participants: 16415,
    raw_columns: 693,
    selected_vars: 111,
    domains: 5
};
let statsInView = false;

function tryShowStats() {
    if (statsData && statsInView) {
        document.querySelectorAll('#stats .stat-line').forEach(line => line.classList.add('in-view'));
        typeText(document.getElementById('participants'), String(statsData.participants));
        typeText(document.getElementById('raw_columns'), String(statsData.raw_columns));
        typeText(document.getElementById('selected_vars'), String(statsData.selected_vars));
        typeText(document.getElementById('domains'), String(statsData.domains));
    }
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            statsInView = true;
            tryShowStats();
            statsObserver.unobserve(document.getElementById('stats'));
        }
    });
}, { threshold: 0.3 });
statsObserver.observe(document.getElementById('stats'));

// Domain descriptions, animated bar breakdown (hardcoded, no backend needed)
const domainMeta = {
    hearing_loss: { label: "Hearing Loss", desc: "Placeholder text about hearing loss variables — thresholds, measures, and related audiometric data." },
    health_comorbidities: { label: "Health Comorbidities", desc: "Placeholder text about health comorbidities — conditions that may co-occur with hearing loss." },
    potential_mediators: { label: "Potential Mediators", desc: "Placeholder text about potential mediators — factors that may explain the link between activity and hearing outcomes." },
    sociodemographic: { label: "Sociodemographic", desc: "Placeholder text about sociodemographic variables — age, gender, income, and background factors." },
    physical_activity: { label: "Physical Activity", desc: "Placeholder text about physical activity — recreational and total activity measures." }
};

const domainData = {
    hearing_loss: 38,
    health_comorbidities: 35,
    potential_mediators: 15,
    sociodemographic: 9,
    physical_activity: 8
};

let activeDomainRow = null;

(function () {
    const data = domainData;
    const container = document.getElementById('domainBars');
    const maxVal = Math.max(...Object.values(data));

    Object.entries(data).forEach(([key, count]) => {
        const meta = domainMeta[key] || { label: key, desc: "" };
        const width = (count / maxVal * 100).toFixed(1);

        const row = document.createElement('div');
        row.className = 'signal-bar-row domain-bar-row';
        row.dataset.width = width;
        row.innerHTML = `
            <div class="signal-bar-label">${meta.label}</div>
            <div class="signal-bar-track"><div class="signal-bar-fill"></div></div>
            <div class="signal-bar-value">${count}</div>
        `;
        row.addEventListener('click', () => {
            if (activeDomainRow) activeDomainRow.classList.remove('active');
            row.classList.add('active');
            activeDomainRow = row;

            const panel = document.getElementById('domainInfoPanel');
            panel.innerHTML = `<h3>${meta.label}</h3><p><strong>${count}</strong> variables in this domain.</p><p>${meta.desc}</p>`;
            panel.classList.add('open');
        });
        container.appendChild(row);
    });

    const domainRowObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const rows = document.querySelectorAll('.domain-bar-row');
                rows.forEach((row, i) => {
                    setTimeout(() => {
                        row.classList.add('visible');
                        row.querySelector('.signal-bar-fill').style.width = row.dataset.width + '%';
                    }, i * 150);
                });
                domainRowObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    domainRowObserver.observe(container);
})();

// Title letter animation
const title = document.getElementById('animatedTitle');
const text = title.textContent;
title.textContent = '';

[...text].forEach((char, i) => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.animationDelay = `${i * 0.05}s`;
    span.classList.add('letter');
    title.appendChild(span);
});

// Confetti on load
window.addEventListener('load', () => {
    confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.4 },
        colors: ['#006747', '#CFC493', '#F7F7F5']
    });
});

// Count-up stat animation (Model Results section)
function countUp(el, target, isDecimal) {
    const duration = 1200;
    const start = performance.now();
    function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const value = progress * target;
        el.textContent = isDecimal ? value.toFixed(2) : Math.floor(value).toLocaleString();
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = isDecimal ? target.toFixed(2) : target.toLocaleString();
    }
    requestAnimationFrame(step);
}

const resultsStatsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            document.querySelectorAll('.count-target').forEach(el => {
                const target = parseFloat(el.dataset.target);
                const isDecimal = el.dataset.decimal === 'true';
                countUp(el, target, isDecimal);
            });
            resultsStatsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });
resultsStatsObserver.observe(document.querySelector('.results-stats'));

// Signal Hunt: staggered feature bars + kept/dropped reveal
const featureData = [
    { name: "Age", importance: 0.2320, selected: "kept" },
    { name: "Gender", importance: 0.0700, selected: "kept" },
    { name: "Employment status", importance: 0.0098, selected: "kept" },
    { name: "GPAQ total physical activity", importance: 0.0087, selected: "dropped" },
    { name: "Household income (3-level)", importance: 0.0075, selected: "dropped" },
    { name: "Marital status", importance: 0.0070, selected: "dropped" },
    { name: "Prevalent coronary heart disease", importance: 0.0020, selected: "dropped" },
    { name: "Prevalent stroke / TIA", importance: 0.0012, selected: "dropped" },
    { name: "Hypertension", importance: -0.0002, selected: "dropped" },
    { name: "Current asthma", importance: -0.0022, selected: "dropped" },
    { name: "Ever asthma", importance: -0.0029, selected: "dropped" },
    { name: "Hispanic/Latino heritage", importance: -0.0043, selected: "dropped" },
    { name: "Field center", importance: -0.0092, selected: "dropped" },
    { name: "Race group", importance: -0.0095, selected: "dropped" }
];

function buildSignalBars() {
    const container = document.getElementById('signalBars');
    const maxAbs = Math.max(...featureData.map(f => f.importance));

    featureData.forEach(f => {
        const width = f.importance > 0 ? (f.importance / maxAbs * 100) : 0;
        const row = document.createElement('div');
        row.className = 'signal-bar-row';
        row.dataset.width = width.toFixed(1);
        row.dataset.selected = f.selected;
        row.dataset.name = f.name;
        row.innerHTML = `
            <div class="signal-bar-label">${f.name}</div>
            <div class="signal-bar-track"><div class="signal-bar-fill"></div></div>
            <div class="signal-bar-value">${f.importance.toFixed(4)}</div>
        `;
        container.appendChild(row);
    });
}
buildSignalBars();

function revealBars() {
    const rows = document.querySelectorAll('#signalBars .signal-bar-row');
    rows.forEach((row, i) => {
        setTimeout(() => {
            row.classList.add('visible');
            row.querySelector('.signal-bar-fill').style.width = row.dataset.width + '%';
        }, i * 150);
    });

    const totalTime = rows.length * 150 + 700;
    setTimeout(splitKeptDropped, totalTime);
}

function splitKeptDropped() {
    document.getElementById('signalSubtitle').textContent = "Sorting signal from noise...";

    const rows = document.querySelectorAll('#signalBars .signal-bar-row');
    rows.forEach(row => {
        if (row.dataset.selected === 'kept') {
            row.classList.add('kept');
        } else if (row.dataset.name === 'GPAQ total physical activity') {
            row.classList.add('pulse');
            setTimeout(() => {
                row.classList.remove('pulse');
                row.classList.add('dropped');
            }, 700);
        } else {
            row.classList.add('dropped');
        }
    });

    setTimeout(() => {
        document.getElementById('signalSubtitle').textContent = "3 predictors kept — 11 dropped.";
        typeText(document.getElementById('signalPayoff'), "Physical activity didn't make the cut — age and gender carried the signal.", 30);
    }, 1400);
}

const signalObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            revealBars();
            signalObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });
signalObserver.observe(document.getElementById('signalBars'));

// Scroll-triggered Why It Matters animation
const whyTitle = document.querySelector('.why-title');
const whyText = document.querySelector('.why-text');

const whyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            whyTitle.classList.add('in-view');
            whyText.classList.add('in-view');
            whyObserver.unobserve(whyTitle);
        }
    });
}, { threshold: 0.3 });
whyObserver.observe(whyTitle);

// Scroll-triggered Pipeline cards animation
const pipelineCards = document.querySelectorAll('.pipeline-card');

const pipelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            pipelineCards.forEach(card => card.classList.add('in-view'));
            pipelineObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

if (pipelineCards.length > 0) {
    pipelineObserver.observe(pipelineCards[0]);
}

// Team carousel - fixed 3-slot layout with fade + slide transition, wraps around
const teamMembers = [
    { initials: "LG", name: "Lynda Gordon", role: "Website Developer", desc: "Junior, Computer Science, University of South Florida. Built the full-stack dashboard — FastAPI backend, interactive frontend, and data visualizations." },
    { initials: "AW", name: "Annisha Wazed", role: "Placeholder Role", desc: "Placeholder description — add what Annisha worked on here." },
    { initials: "CC", name: "Christine Chinapoo", role: "Placeholder Role", desc: "Placeholder description — add what Christine worked on here." },
    { initials: "FW", name: "Fiorella Wu Cam", role: "Placeholder Role", desc: "Placeholder description — add what Fiorella worked on here." },
    { initials: "FY", name: "Fuad Yunusov", role: "Placeholder Role", desc: "Placeholder description — add what Fuad worked on here." },
    { initials: "TA", name: "Theresa Alsaindor", role: "Placeholder Role", desc: "Placeholder description — add what Theresa worked on here." }
];

let currentMember = 0;

function cardHTML(member) {
    if (!member) return '<div class="card-content"></div>';
    return `
        <div class="card-content">
            <div class="team-initials">${member.initials}</div>
            <h3>${member.name}</h3>
            <p class="team-role">${member.role}</p>
            <p class="team-desc">${member.desc}</p>
        </div>
    `;
}

function fillSlots() {
    const prevIndex = currentMember - 1;
    const nextIndex = currentMember + 1;

    document.getElementById('prevCard').innerHTML = cardHTML(teamMembers[prevIndex]);
    document.getElementById('activeCard').innerHTML = cardHTML(teamMembers[currentMember]);
    document.getElementById('nextCard').innerHTML = cardHTML(teamMembers[nextIndex]);

    document.getElementById('prevCard').style.visibility = prevIndex >= 0 ? 'visible' : 'hidden';
    document.getElementById('nextCard').style.visibility = nextIndex < teamMembers.length ? 'visible' : 'hidden';

    document.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('active-dot', i === currentMember);
    });
}

function renderCarousel(direction = 0) {
    if (direction === 0) {
        fillSlots();
        return;
    }

    const slots = document.querySelector('.carousel-slots');
    const allContent = document.querySelectorAll('.card-content');

    allContent.forEach(el => el.classList.add('fading'));
    slots.classList.add(direction > 0 ? 'slide-left' : 'slide-right');

    setTimeout(() => {
        fillSlots();
        slots.classList.remove('slide-left', 'slide-right');
    }, 250);
}

function buildDots() {
    const dotsContainer = document.getElementById('carouselDots');
    teamMembers.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        dot.addEventListener('click', () => {
            const dir = i > currentMember ? 1 : -1;
            currentMember = i;
            renderCarousel(dir);
        });
        dotsContainer.appendChild(dot);
    });
}

buildDots();
renderCarousel();

document.getElementById('prevBtn').addEventListener('click', () => {
    currentMember = (currentMember - 1 + teamMembers.length) % teamMembers.length;
    renderCarousel(-1);
});

document.getElementById('nextBtn').addEventListener('click', () => {
    currentMember = (currentMember + 1) % teamMembers.length;
    renderCarousel(1);
});

// Scroll-triggered pop-in for the whole carousel
const teamCarousel = document.querySelector('.team-carousel');

const teamObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            teamCarousel.classList.add('in-view');
            teamObserver.unobserve(teamCarousel);
        }
    });
}, { threshold: 0.3 });
teamObserver.observe(teamCarousel);