# Hearing Loss & Physical Activity Dashboard

![Python](https://img.shields.io/badge/Python-3.x-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)
![License](https://img.shields.io/badge/License-MIT-green)
![Live](https://img.shields.io/badge/Status-Live-brightgreen)

An interactive web dashboard analyzing the relationship between physical activity and hearing loss outcomes across 16,415 participants from the Hispanic Community Health Study (HCHS/SOL). Built as the sole developer on a five-person team for the USF Hackathon 2026.

**[Live Demo](https://cheerful-sorbet-003f27.netlify.app/#overview)**

![Dashboard screenshot](./hearingpic.png)

## Overview

NHANES/HCHS survey data is large, messy, and not built for the web. This project takes raw participant data and turns it into a clean, explorable dashboard that surfaces patterns between activity levels and hearing health, backed by a machine learning model rather than just descriptive charts.

The core question: does physical activity relate to hearing outcomes in the Hispanic Community Health Study/Study of Latinos (HCHS/SOL), a population largely left out of hearing health research?

## Features

- Interactive, scroll-triggered data visualizations built with vanilla JavaScript
- Custom animated bar charts (no charting library dependency)
- Data pipeline that reduces 693 raw NHANES columns down to 111 analysis-ready variables across 5 domains
- A RandomForest baseline model (300 trees, 80/20 split) predicting hearing outcomes (better-ear PTA) from physical activity and demographic predictors
- Permutation-importance feature selection, narrowing 14 candidate predictors down to a reduced 3-feature model that improved test R² from ~0.08 to ~0.14
- Transparent reporting of model limitations (unweighted analysis, excluded mediators, correlational not causal)
- Lightweight static architecture for fast load times and continuous deployment

## Tech Stack

- **Frontend:** JavaScript, HTML, CSS (IntersectionObserver API for scroll-triggered UI)
- **Data Processing & Modeling:** Python, SQL/SQLite, scikit-learn (RandomForest, permutation importance)
- **Deployment:** Netlify, continuous deployment via GitHub

## Key Finding

In the reduced 3-feature model, better-ear PTA was driven mainly by **age** and **gender**, with a smaller contribution from **employment status**. Physical activity did not survive feature selection, showing little unique predictive signal for hearing in this cohort — a null result reported transparently rather than overstated.

## How It Works

1. `main.py` processes the raw NHANES/HCHS dataset through a four-stage pipeline (raw export → dictionary mapping → missingness review → analytic set), reducing 693 columns to 111 analysis-ready variables across five domains, and structures the data using SQL/SQLite.
2. A RandomForest model (`HCHS_Hearing_PA_FINAL.ipynb`) is trained to predict better-ear PTA (hearing outcome) from physical activity and demographic predictors, using permutation importance to select the strongest features.
3. `script.js` reads the processed data and model output, rendering them into custom, animated visualizations — including bar charts and scroll-triggered components — without relying on external charting libraries like Chart.js.
4. `index.html` and the `css/` folder define the layout and styling of the dashboard.

The project originally used a FastAPI/Java backend, which was later refactored into a static architecture to keep deployment lightweight and enable continuous deployment through Netlify.

## Prerequisites

- Python 3.x
- pip packages: `pandas`, `scikit-learn` 
- A modern web browser 

## Running Locally

```bash
git clone https://github.com/gordonlynda7-cmd/hearing-loss-dashboard.git
cd hearing-loss-dashboard
python main.py
```

Then open `index.html` in your browser.

## Team

Built during USF Hackathon 2026 by a five-person team, with Lynda Gordon as sole developer responsible for the full-stack build, data pipeline, and deployment.

## License

MIT
