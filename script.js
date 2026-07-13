// Fix: strip any leftover URL hash so the page always loads at the hero
if (window.location.hash) {
    history.replaceState(null, null, window.location.pathname);
    window.scrollTo(0, 0);
}

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

// Stats (hardcoded, works locally and on Netlify)
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

// Domain descriptions (real content, no placeholders)
const domainMeta = {
    hearing_loss: { label: "Hearing Loss", desc: "Proper pure-tone audiometry testing from 500 to 8000 Hz. Subjective measures of hearing handicap and hearing history were also collected, including noise exposure, hearing aid use, and hearing protection use." },
    health_comorbidities: { label: "Health Comorbidities", desc: "Diabetes, hypertension, cardiovascular disease, coronary heart disease, stroke (personal and family history), chronic obstructive pulmonary disease, kidney disease, family history of heart attack, cognition, asthma, depressive symptoms, and BMI." },
    potential_mediators: { label: "Potential Mediators", desc: "Alcohol use, diet scores, and sleep quality." },
    sociodemographic: { label: "Sociodemographic Factors", desc: "Age, sex, Hispanic/Latino heritage, education, income, region, marital status, and employment status." },
    physical_activity: { label: "Physical Activity", desc: "Self-reported activity, measured in minutes per day using the Global Physical Activity Questionnaire (GPAQ), a continuous variable summing activity across occupational, transportation, and recreational contexts." }
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
        typeText(document.getElementById('signalPayoff'), "Physical activity didn't make the cut, age and gender carried the signal.", 30);
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

// Team panel: full-width single view, arrows navigate
const teamMembers = [
    {
        initials: "LG",
        name: "Lynda Gordon",
        role: "Website Developer",
        bio: "Based in Tampa. Junior in <strong>Computer Science</strong> at USF, Class Representative for 2028 and active in <strong>ASME Robotics</strong>. Outside of coursework, she's usually deep in a side project: training <strong>YOLOv8 models</strong>, wiring up <strong>Arduino builds</strong>, or teaching herself whatever AI concept she got curious about that week. Somewhere in between she also teaches kids to code at iD Tech, works Salesforce and support at Macmillan Learning, and keeps IT running at Help Us Grow Foundation. Looking for a <strong>Software Engineering internship for Summer 2027</strong>, Florida or Texas preferred.",
        contribution: "Built the full-stack dashboard as the sole developer, including the <strong>FastAPI backend</strong>, custom animated data visualizations in vanilla HTML, CSS, and JavaScript, and scroll-triggered interactions using <strong>IntersectionObserver</strong>. Deployed live via <strong>Netlify</strong> with continuous deployment from GitHub.",
        socials: [{ label: "LinkedIn", url: "https://www.linkedin.com/in/lynda-g2456/" }]
    },
    {
        initials: "TA",
        name: "Theresa Alsaindor",
        role: "Data Science Researcher",
        bio: "Data science student at the University of South Florida (<strong>B.S. Information Science, Data Science & Analytics</strong>, May 2027), based in Tampa. Works at the intersection of machine learning and public health as a student researcher with USF's <strong>Center for Innovation, Technology and Aging</strong>.",
        contribution: "Helped build a reproducible ML workflow on a <strong>16,000+ participant health cohort (HCHS/SOL)</strong>, cleaning and merging 693 raw columns into a curated analytic dataset, running <strong>Random Forest models</strong>, and using <strong>SHAP and permutation importance</strong> to identify what actually drives hearing loss outcomes.",
        socials: [{ label: "LinkedIn", url: "https://www.linkedin.com/in/theresa-alsaindor-121654328/" }]
    },
    {
        initials: "CC",
        name: "Christine Chinapoo",
        role: "Data Intelligence, M.S. Candidate",
        bio: "From Trinidad and Tobago. B.S. in <strong>Cybersecurity</strong> with a minor in Management Information Systems from the University of Tampa, where she served as <strong>President of the Women in Cybersecurity (WiCyS)</strong> chapter. Worked as a data analyst for about two years before starting her <strong>M.S. in Data Intelligence</strong> at USF. Outside of work and school, she enjoys dancing salsa, training in Muay Thai, kayaking, and spending time outdoors with her mini Goldendoodle, Brownie.",
        contribution: "Expanded and improved the machine learning modeling workflow. Implemented additional regression and ensemble models, including <strong>Linear Regression, Random Forest, Gradient Boosting, XGBoost, and Extra Trees</strong>, for a fuller comparison of predictive performance. Performed <strong>hyperparameter tuning</strong> on the Random Forest model, standardized evaluation across all models, and updated the interpretation of results and conclusions. Also documented the modeling workflow and built visualizations to make the analysis more transparent and reproducible.",
        socials: [{ label: "LinkedIn", url: "https://www.linkedin.com/in/christine-chinapoo/" }]
    },

    {
        initials: "FY",
        name: "Fuad Yunusov",
        role: "Machine Learning Engineer",
        bio: "Master's student in <strong>Computer Engineering</strong> at the University of South Florida, building on a B.S. in the same field from USF. Passionate about applying AI and machine learning to real-world problems, from ensemble models predicting real estate prices with <strong>90%+ accuracy</strong> to on-device ML in mobile apps. Previously worked as a Mobile App Developer Intern at Resilience, Inc., integrating TensorFlow Lite and Core ML into cross-platform apps used by <strong>10,000+ users</strong>.",
        contribution: "Built the core machine learning workflow for the project, including data quality checks and dataset preparation. Developed, validated, and refined the <strong>Random Forest model</strong>, incorporating <strong>feature selection</strong> and <strong>SHAP-based explainability</strong> to identify what actually drives hearing loss outcomes.",
        socials: [{ label: "LinkedIn", url: "https://www.linkedin.com/in/fdyunusov/" }]
    },
];

let currentMember = 0;

function cardHTML(member) {
    const socialsHTML = member.socials.map(s =>
        `<a href="${s.url}" target="_blank" class="team-social-link">${s.label}</a>`
    ).join('');

    return `
        <div class="panel-content">
            <div class="panel-left">
                <div class="team-initials">${member.initials}</div>
                <h3>${member.name}</h3>
                <p class="team-role">${member.role}</p>
                <div class="team-socials">${socialsHTML}</div>
            </div>
            <div class="panel-right">
                <p>${member.bio}</p>
                <h5>Project Contribution</h5>
                <p>${member.contribution}</p>
            </div>
        </div>
    `;
}

function fillSlots() {
    document.getElementById('teamPanel').innerHTML = cardHTML(teamMembers[currentMember]);
    document.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('active-dot', i === currentMember);
    });
}

function renderCarousel(direction = 0) {
    if (direction === 0) {
        fillSlots();
        return;
    }

    const content = document.querySelector('.panel-content');
    if (content) content.classList.add('fading');

    setTimeout(() => {
        fillSlots();
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