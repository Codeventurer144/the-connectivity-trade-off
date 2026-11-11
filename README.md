# The Connectivity Trade-Off

**Telecommunications Commercial Intelligence | Nigeria | D3.js**

**Dashboard:** [The Connectivity Trade-Off](https://codeventurer144.github.io/the-connectivity-trade-off/) *(link becomes active after the GitHub Pages site is published).*  
**Research coverage:** 1 June 2024 – 30 September 2026, across datasets with different reporting periods and frequencies.

## Why I built this

I wanted to study a problem that sits at the intersection of telecommunications, consumer spending and commercial decision-making. MTN Nigeria is reporting growth in data usage and revenue, but inflation and changes in household purchasing power can still affect how different customers buy data. I was interested in what those differences might mean for pricing and retention, especially as providers such as Starlink expand their presence in the broadband market.

My aim was to go beyond displaying company performance. I wanted to see how Business Intelligence can help a commercial team ask better questions: when could a price increase reduce demand enough to hurt revenue, which customers are most exposed to affordability pressure, and what evidence would justify a retention or broadband strategy?

## What I did

I studied MTN Nigeria's published financial results, NCC operator and internet service provider statistics, Nigeria's consumer price index, and publicly reported Starlink subscription figures in Kenya. I brought the findings into a six-page interactive dashboard built with **D3.js, JavaScript, HTML and CSS**.

The dashboard explores:

1. **Commercial performance:** Reported service revenue, data revenue, subscribers, consumption and the competitive mobile market.
2. **Affordability:** Inflation, changes in the general price level and a household telecom-budget illustration.
3. **Customer behaviour:** A clearly identified synthetic set of customer segments, used to examine potential spending patterns and inactivity risk.
4. **Pricing scenarios:** An interactive simulator that compares three demand responses to changes in tariffs, inflation and retention activity over 3-, 6- and 12-month periods.
5. **Broadband competition:** Starlink and other Nigerian internet providers, alongside Kenya's published satellite subscription trend.
6. **Commercial decisions:** Potential experiments for customer retention, broadband offers and measuring the effect of network quality on customer behaviour.

For the visuals, I used donut charts, comparison bars, a bubble scatter plot, an inactivity-risk heatmap, time-series charts and interactive pricing curves. The simulator responds immediately when its assumptions change.

## What the analysis can and cannot tell us

The MTN, NCC and inflation figures are observations from public sources, but the customer-level behaviour is **not MTN data**. The synthetic cohort contains 100,000 illustrative customers split into five segments. Its spend, price sensitivities, inactivity rates and retention outcomes are assumptions made for exploring possible commercial scenarios, **not predictions of actual MTN churn**.

I also kept unlike measures separate. MTN's own subscriber definition is not interchangeable with NCC mobile subscription statistics; an ISP subscription does not establish that a mobile operator has lost a customer; and CPI describes a general consumer price index, not historical MTN tariff changes. I deliberately excluded a state-level churn map because suitable verified state-level MTN churn observations were unavailable.

The project is independent research, not an MTN Nigeria product or an internal company dashboard.

## Data and source material

- [MTN Nigeria Q3 2026 earnings release](https://doclib.ngxgroup.com/Financial_NewsDocs/48326_MTN_NIGERIA_COMMUNICATIONS_PLC-MTN_NIGERIA_Q3_2026_EARNINGS_RELEASE_CORPORATE_ACTIONS_OCTOBER_2026.pdf) — nine months ended 30 September 2026, compared with the corresponding 2025 period.
- [Nigerian Communications Commission industry statistics](https://ncc.gov.ng/market-data-reports/industry-statistics) — August 2026 operator subscriptions.
- [NCC internet service provider data](https://ncc.gov.ng/market-data-reports/internet-service-provider-data) — Q2 2026 ISP subscriptions.
- [National Bureau of Statistics CPI data](https://microdata.nigerianstat.gov.ng/index.php/catalog/154/related-materials) — inflation and consumer prices.
- [UN Monthly Bulletin of Statistics](https://unstats.un.org/unsd/mbs/app/DataView.aspx?cid=566&p=A&tid=6&yearfrom=1997&yearto=2099) — NBS rebased CPI series, January 2025–September 2026.
- [Communications Authority of Kenya](https://www.ca.go.ke/statistics) and [published Kenya Starlink series](https://tech-ish.com/2026/09/25/starlink-passes-27000-subscribers-in-kenya-and-holds-99-7-of-satellite-internet/) — comparative context, June 2024–June 2026.

The `data/` folder contains supporting CSVs and a source register. The pricing logic and assumptions are available in `app.js` for examination.

I built this to demonstrate how I approach commercial analytics: starting with a real business question, checking what the available data can support, making assumptions explicit where it cannot, and turning the findings into decisions worth testing.