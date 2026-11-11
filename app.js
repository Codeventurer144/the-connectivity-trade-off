/* THE CONNECTIVITY TRADE-OFF
 * Independent telecom commercial-intelligence research dashboard
 * Public figures: MTN Nigeria 9M 2026 report, NCC Aug 2026, NBS CPI/UN MBS,
 * NCC Q2 2026 ISP table, CA Kenya operator returns (reproduced by Tech-ish).
 * Scenario model: synthetic. NOT MTN subscriber-level churn data.
 * Charts are authored in D3.js v7.
 */
'use strict';
const BASE_INFLATION=14.63;
const BLUE=['#174f9e','#3d84d4','#70b0ed','#9bcff1','#c5e3fa'];
const SOURCE={
 mtn:'https://doclib.ngxgroup.com/Financial_NewsDocs/48326_MTN_NIGERIA_COMMUNICATIONS_PLC-MTN_NIGERIA_Q3_2026_EARNINGS_RELEASE_CORPORATE_ACTIONS_OCTOBER_2026.pdf',
 ncc:'https://ncc.gov.ng/market-data-reports/industry-statistics',
 isp:'https://ncc.gov.ng/market-data-reports/internet-service-provider-data',
 nbs:'https://microdata.nigerianstat.gov.ng/index.php/catalog/154/related-materials',
 un:'https://unstats.un.org/unsd/mbs/app/DataView.aspx?cid=566&p=A&tid=6&yearfrom=1997&yearto=2099',
 kenya:'https://tech-ish.com/2026/09/25/starlink-passes-27000-subscribers-in-kenya-and-holds-99-7-of-satellite-internet/',
 cak:'https://www.ca.go.ke/statistics'
};
const D={
 financial:[
  {name:'Data',prior:1977.2,now:2684.4},
  {name:'Voice',prior:1347.6,now:1496.7},
  {name:'Digital',prior:71.2,now:88.3},
  {name:'Fintech',prior:131.6,now:97.5},
  {name:'Other service',prior:180.6,now:219.2}
 ],
 ncc:[{name:'MTN',v:104648077},{name:'Airtel',v:68039310},{name:'Globacom',v:23800850},{name:'T2',v:3613801}],
 cpi:[
  ['Jan 25',110.7],['Feb 25',112.9],['Mar 25',117.3],['Apr 25',119.5],['May 25',121.3],['Jun 25',123.4],['Jul 25',125.8],['Aug 25',126.8],['Sep 25',127.7],['Oct 25',128.9],['Nov 25',130.5],['Dec 25',131.2],
  ['Jan 26',127.4],['Feb 26',129.9],['Mar 26',135.4],['Apr 26',138.3],['May 26',140.7],['Jun 26',143.0],['Jul 26',145.3],['Aug 26',146.3],['Sep 26',146.4]
 ].map((d,i)=>({date:d[0],v:d[1],i})),
 isp:[{name:'Spectranet',v:111384},{name:'Starlink',v:98642},{name:'Swift Networks',v:12567}],
 kenya:[['Jun 24',8063],['Sep 24',16786],['Dec 24',19146],['Mar 25',17066],['Jun 25',17425],['Sep 25',19470],['Dec 25',22282],['Mar 26',24999],['Jun 26',27616]].map((d,i)=>({date:d[0],v:d[1],i}))
};
const SEG=[
 {id:'value',name:'Value prepaid',short:'Value prepaid',n:40000,spend:1600,churn:.060,elastic:1.15,vuln:1.25,usage:2.1,desc:'Small and frequent data bundle purchases'},
 {id:'everyday',name:'Everyday data',short:'Everyday data',n:30000,spend:4100,churn:.037,elastic:.76,vuln:.98,usage:7.4,desc:'Regular prepaid and personal data users'},
 {id:'heavy',name:'Heavy mobile',short:'Heavy mobile',n:15000,spend:9600,churn:.023,elastic:.45,vuln:.68,usage:25.0,desc:'High-usage smartphone and hotspot customers'},
 {id:'home',name:'Home broadband',short:'Home broadband',n:10000,spend:19500,churn:.020,elastic:.38,vuln:.55,usage:95,desc:'Fixed / home internet customers'},
 {id:'sme',name:'SME & enterprise',short:'SME / enterprise',n:5000,spend:36500,churn:.014,elastic:.26,vuln:.40,usage:130,desc:'Smaller business connectivity relationships'}
];
const CASES=[{id:'resilient',name:'Resilient demand',m:.62,r:.60,color:'#78ade8'},{id:'central',name:'Central scenario',m:1,r:1,color:'#2468b5'},{id:'fragile',name:'High sensitivity',m:1.47,r:1.60,color:'#d69b4d'}];
const pages=[
 {id:'overview',name:'Commercial overview',num:'01'},
 {id:'afford',name:'Affordability squeeze',num:'02'},
 {id:'customer',name:'Customer behaviour',num:'03'},
 {id:'simulator',name:'Price–demand lab',num:'04'},
 {id:'competition',name:'Starlink challenge',num:'05'},
 {id:'action',name:'Decisions & sources',num:'06'}
];
const state={page:'overview',sim:{segment:'all',price:15,inflation:14.63,retention:25,months:6},budget:150000,telecom:7500};
const fmt=(n,d=0)=>new Intl.NumberFormat('en-NG',{maximumFractionDigits:d,minimumFractionDigits:d}).format(n);
const pct=(n,d=1)=>`${n>=0?'+':''}${fmt(n,d)}%`;
const naira=(n)=>`₦${fmt(n)}`;
const money=(n)=> n>=1e12?`₦${fmt(n/1e12,2)}tn`:n>=1e9?`₦${fmt(n/1e9,2)}bn`:n>=1e6?`₦${fmt(n/1e6,2)}m`:`₦${fmt(n)}`;
const safe=(s)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const src=(items)=>`<div class="panel-source">SOURCE: ${items.map(([name,url])=>`<a href="${url}" target="_blank" rel="noopener noreferrer">${name} ↗</a>`).join(' · ')}</div>`;
const panel=(title,sub,body,opts={})=>`<section class="panel ${opts.extra||''}"><div class="panel-head"><div><h2 class="panel-title">${title}</h2><p class="panel-sub">${sub}</p></div><div class="head-right">${opts.tag?`<span class="tag ${opts.tagtype||''}">${opts.tag}</span>`:''}<button class="info-btn" aria-label="About ${safe(title)}" data-tip="${safe(opts.tip||sub)}">ⓘ</button></div></div>${body}${opts.source?src(opts.source):''}</section>`;
const kpi=(name,val,note,type='')=>`<article class="kpi"><div class="kpi-label">${name}</div><div class="kpi-value">${val}</div><div class="kpi-note ${type}">${note}</div></article>`;
const headline=(step,title,sub)=>`<div class="eyebrow">${Number(step)}.) ${pages.find(p=>p.num===step).name}</div><h1 class="page-title">${title}</h1><p class="page-sub">${sub}</p>`;
const tag=(name,cls='')=>`<span class="tag ${cls}">${name}</span>`;
const info=(body)=>`<div class="callout">${body}</div>`;
const select=(id,options,value)=>`<select id="${id}" aria-label="${id}">${options.map(o=>`<option value="${o[0]}" ${String(o[0])===String(value)?'selected':''}>${o[1]}</option>`).join('')}</select>`;
const chartBox=(id,min=250)=>`<div class="chart" id="${id}" style="min-height:${min}px"></div>`;
const metric=(label,value)=>`<div class="metric-row"><span>${label}</span><b>${value}</b></div>`;
const statusNotice=`<div class="disclaimer"><span class="status-key actual">OBSERVED</span> Public-source metrics <span class="status-key synthetic">MODELED</span> Synthetic customer scenarios. No private MTN customer data is used.</div>`;
let sidebarIsOpen=false;
function setSidebar(open){
 sidebarIsOpen=Boolean(open);
 document.querySelector('.shell').classList.toggle('nav-collapsed',!sidebarIsOpen);
 document.querySelector('.sidebar').classList.toggle('open',sidebarIsOpen);
 document.getElementById('sidebar').inert=!sidebarIsOpen;
 document.getElementById('menuBtn').setAttribute('aria-expanded',String(sidebarIsOpen));
 document.getElementById('navShade').classList.toggle('visible',sidebarIsOpen);
}
function nav(){document.getElementById('nav').innerHTML=pages.map(p=>`<button class="nav-item ${state.page===p.id?'active':''}" data-page="${p.id}" aria-current="${state.page===p.id?'page':'false'}"><span>${p.name}</span><span class="num">${p.num}</span></button>`).join('');}
function render(){
 nav();
 const views={overview,afford,customer,simulator,competition,action};
 document.getElementById('content').innerHTML=views[state.page]() + statusNotice;
 drawCharts();
}
function goto(page){if(!pages.some(p=>p.id===page))return;state.page=page;if(window.innerWidth<=850)setSidebar(false);location.hash=page;render();window.scrollTo({top:0,behavior:'instant'});}
function overview(){
 let delta=D.financial.reduce((a,d)=>a+d.now-d.prior,0);
 return headline('01','Commercial performance','Strong reported growth provides the context. The commercial question is where affordability or competition could put future demand at risk.')+
 `<div class="kpis">${kpi('Service revenue · 9M 2026','₦4.586tn','+23.7% year on year')}${kpi('Data revenue · 9M 2026','₦2.684tn','+35.8% year on year')}${kpi('Active data users · Sep 2026','57.2m','+12.0% year on year')}${kpi('Usage per active data user','15.3 GB','+16.2% · 9M monthly average')}</div>`+
 `<div class="focus-box"><div><h2>MTN reported higher usage and service revenue</h2><p>MTN's public reporting shows increasing data usage and strong revenue growth. This research tests how future tariff changes and household spending pressure could affect synthetic customer cohorts — not whether MTN has already lost these customers.</p></div><div class="focus-number">+30.1%<div class="focus-tiny">network data traffic YoY</div></div></div>`+
 `<div class="grid2">${panel('Service revenue mix','Share of ₦4,586bn service revenue · 9M 2026',chartBox('revMix',265),{tag:'OBSERVED',tip:'The revenue components are from MTN Nigeria’s published 9M 2026 consolidated income-statement summary, not estimates.',source:[['MTN financial results',SOURCE.mtn]]})}${panel('Revenue drivers','Service revenue by category: 9M 2025 vs 9M 2026 (₦bn)',chartBox('revBars',265),{tag:'OBSERVED',source:[['MTN financial results',SOURCE.mtn]],tip:'Like-for-like nine-month periods. Changes are observed financial amounts, not causal attribution of tariff decisions.'})}</div>`+
 `<div class="grid2 grid-half">${panel('Mobile subscription landscape','NCC operator subscriptions · August 2026',chartBox('marketShare',255),{tag:'NCC DEFINITION',source:[['NCC industry statistics',SOURCE.ncc]],tip:'NCC operational subscriber counts are not identical to MTN’s reported revenue-generating customer definition.'})}${panel('What changed?','Change in service revenue from 9M 2025 to 9M 2026',`<div class="metric-list">${metric('Total change in service revenue',`+₦${fmt(delta,1)}bn`)}${metric('Data revenue increase','+₦707.2bn')}${metric('Voice revenue increase','+₦149.1bn')}${metric('Fintech revenue change','−₦34.1bn')}${metric('MTN home fibre traffic share','≈13% of network data traffic')}</div>${info('<b>Research angle:</b> Price, volume, product mix and customer acquisition can all affect revenue. Published financial totals alone cannot separate every causal driver.')}`,{tag:'OBSERVED',source:[['MTN 9M report',SOURCE.mtn]],tip:'The category changes use reported nine-month revenue for the two corresponding years.'})}</div>`;
}
function afford(){
 const basket=10000*146.4/127.7;
 const baseBasket=10000/146.4*127.7;
 return headline('02','The affordability squeeze','Follow the price level, not just the annual inflation rate. Falling inflation does not mean most prices have returned to earlier levels.')+
 `<div class="kpis">${kpi('Headline inflation · Sep 2026','14.63%','Year on year · NBS','neutral')}${kpi('Food inflation · Sep 2026','19.59%','Year on year · NBS','warn')}${kpi('CPI index · Sep 2026','146.4','2024=100 rebased series','neutral')}${kpi('₦10,000 basket · Sep 2025',money(basket),`Equivalent Sep 2026 cost · modeled from CPI`,'warn')}</div>`+
 `<div class="grid2">${panel('Prices across time','Monthly Nigeria CPI index · January 2025 to September 2026',chartBox('cpiTrend',285),{tag:'OBSERVED',tip:'This is the rebased CPI index reported by the NBS and reproduced in UN monthly statistics. It measures price level, not inflation rate. Do not splice the old 2024 base vintage into this series.',source:[['UN monthly statistics',SOURCE.un],['NBS reports',SOURCE.nbs]]})}${panel('Inflation by measure','September 2026 annual rate, %',chartBox('inflationBars',285),{tag:'OBSERVED',source:[['NBS September CPI',SOURCE.nbs]],tip:'Headline, food and core inflation are separate measures with different baskets and exclusions; they should not be added together.'})}</div>`+
 `<div class="grid2 grid-half">${panel('A fixed budget buys less','Illustrative ₦10,000 basket in September 2025 versus September 2026',`<div class="afford-num">${naira(basket)} <span>in Sep 2026</span></div>${chartBox('basketCompare',185)}<div class="stat-brief">A fixed ₦10,000 in September 2026 buys roughly <strong>${fmt(baseBasket/10000*100,1)}%</strong> of the same CPI-weighted basket it bought a year earlier. This is an index illustration, not a telecom tariff history.</div>`,{tag:'CPI-DERIVED',source:[['UN / NBS CPI',SOURCE.un]],tip:'Apply the ratio of NBS headline CPI indices: 146.4 / 127.7. Not every individual household or bundle price changes at this average rate.'})}${panel('Household connectivity pressure test','Try a hypothetical monthly household budget',`<div class="budget-grid"><label>Monthly household budget <input id="budgetInput" type="number" min="10000" max="10000000" step="5000" value="${state.budget}" /></label><label>Monthly telecom spending <input id="telecomInput" type="number" min="500" max="1000000" step="500" value="${state.telecom}" /></label></div><div id="budgetResult"></div>${info('<b>Why this matters:</b> A household may reduce bundle size, purchase frequency, or other spending before it stops subscribing. Those outcomes are different from churn.')}`,{tag:'ILLUSTRATION',tip:'User-entered budgets are hypothetical, not observed NBS household microdata.'})}</div>`;
}
function customer(){
 return headline('03','Customer behaviour & inactivity','A transparent synthetic cohort, designed to demonstrate the mechanics of segmentation and churn analysis without pretending to possess MTN customer records.')+
 `<div class="kpis">${kpi('Synthetic starting cohort','100,000','Illustrative customers · not MTN records','neutral')}${kpi('Modeled customer segments','5','Prices, usage and risks assumed','neutral')}${kpi('Observed MTN churn data','Not public','No customer-level records used','warn')}${kpi('Primary scenario inputs','Price + CPI','Demand sensitivity and attrition','neutral')}</div>`+
 `<div class="grid2">${panel('Spend vs inactivity risk','Bubble area indicates illustrative segment size · monthly risk',chartBox('scatter',300),{tag:'SYNTHETIC',tagtype:'amber',tip:'All bubbles represent assumption-based customer segments; neither spend levels nor monthly churn rates were measured at MTN.',source:[]})}${panel('Affordability-shock matrix','Hypothetical monthly customer inactivity risk by additional tariff increase',chartBox('riskHeat',310),{tag:'SYNTHETIC',tagtype:'amber',tip:'This heatmap is generated by a simple modeled response to tariff shocks. It is not a fitted MTN churn model and does not imply measured operator churn.'})}</div>`+
 `${panel('Segment design','Use these illustrative segments inside the pricing simulation.',`<div class="table-scroll"><table class="source-table"><thead><tr><th>Segment</th><th>Customers</th><th>Spend / month</th><th>Monthly inactivity</th><th>Price sensitivity</th></tr></thead><tbody>${SEG.map(s=>`<tr><td>${s.name}</td><td>${fmt(s.n)}</td><td>${naira(s.spend)}</td><td>${fmt(s.churn*100,1)}%</td><td>${s.elastic>=.9?'High':s.elastic>=.5?'Moderate':'Low'}</td></tr>`).join('')}</tbody></table></div>${info('<b>Important:</b> These are analytically designed cohorts. Internal MTN data would be necessary to estimate real segments, genuine inactivity and defensible predictive churn rates.')}`,{tag:'SYNTHETIC',tagtype:'amber',tip:'The cohort construction is deliberately explicit and reproducible in app.js; all starting sizes, spend and churn parameters are assumptions.'})}`;
}
function simulator(){
 const s=state.sim;
 return headline('04','Price–demand lab','Test a tariff adjustment against three modeled demand responses. The output shows possible trade-offs, not predicted MTN results.')+
 `<div class="sim-banner"><strong>Model scope</strong><span>Existing synthetic cohort · No new subscriber acquisition · ${s.months}-month cumulative view · 2026 inflation anchor: 14.63%</span></div>`+
 `<div class="sim-layout"><aside class="panel sim-controls"><div class="panel-head"><div><h2 class="panel-title">Set your assumptions</h2><p class="panel-sub">Every input recalculates the scenarios.</p></div>${tag('MODELED','amber')}</div>`+
 `<div class="control"><label for="simSeg">Customer segment</label>${select('simSeg',[['all','All modeled segments'],...SEG.map(g=>[g.id,g.name])],s.segment)}</div>`+
 `<div class="control"><label for="simPrice">Proposed tariff change <strong id="simPriceVal">${pct(s.price,0)}</strong></label><input id="simPrice" type="range" min="-20" max="50" step="1" value="${s.price}"/><div class="slider-minmax"><span>−20%</span><span>+50%</span></div></div>`+
 `<div class="control"><label for="simInflation">Annual inflation scenario <strong id="simInflationVal">${fmt(s.inflation,1)}%</strong></label><input id="simInflation" type="range" min="5" max="35" step="0.5" value="${s.inflation}"/><div class="slider-minmax"><span>5%</span><span>35%</span></div></div>`+
 `<div class="control"><label for="simRetention">Retention intervention <strong id="simRetentionVal">${fmt(s.retention,0)}%</strong></label><input id="simRetention" type="range" min="0" max="100" step="5" value="${s.retention}"/><div class="slider-minmax"><span>No intervention</span><span>Maximum</span></div></div>`+
 `<div class="control"><label for="simMonths">Forecast horizon</label>${select('simMonths',[['3','3 months'],['6','6 months'],['12','12 months']],s.months)}</div>`+
 `<button class="btn" id="resetSim" type="button">↺ Reset assumptions</button><p class="note">Tariff elasticity, inactivity rates, retention effectiveness, campaign costs and demand effects are assumptions. See the methodology on page 6.</p></aside>`+
 `<div class="sim-main"><div id="simCards" class="sim-top"></div>`+
 `${panel('Where does price increase stop helping?','Three demand-response curves · cumulative revenue (net of assumed campaign cost)',chartBox('simCurves',310),{tag:'SCENARIO MODEL',tagtype:'amber',tip:'Price is on the horizontal axis. Three synthetic sensitivity responses are plotted for the selected segment, inflation assumption, intervention and horizon.'})}`+
 `<div class="grid2 grid-half">${panel('Central-case trade-off','Demand and active customers after the selected period',`<div id="simTradeoff"></div>`,{tag:'SCENARIO MODEL',tagtype:'amber',tip:'Revenue combines changes in price, modeled purchases and surviving active customers. It does not include new subscriber acquisition or full network cost.'})}${panel('Break-even principle','The demand decline that a price increase can withstand before gross revenue falls',`<div id="simBreakeven"></div>`,{tag:'MECHANICAL RULE',tip:'For a positive price increase p, gross revenue stays flat if quantity drops by exactly p/(1+p). This ignores churn timing, taxes, fixed costs and different package mix.'})}</div>`+
 `</div></div>`;
}
function competition(){
 return headline('05','The Starlink challenge','Quantify the competitive signal without making the unsupported claim that satellite broadband is already displacing MTN mobile customers.')+
 `<div class="kpis">${kpi('Starlink Nigeria · Q2 2026','98,642','NCC active ISP subscriptions','neutral')}${kpi('Spectranet · Q2 2026','111,384','NCC active ISP subscriptions','neutral')}${kpi('MTN FTTH traffic share','≈13%','Of MTN network data traffic · 9M26','neutral')}${kpi('Starlink Kenya · Jun 2026','27,616','≈1.0% fixed internet market','neutral')}</div>`+
 `<div class="grid2">${panel('Selected Nigeria ISP subscriptions','NCC Q2 2026 · fixed / wireless ISP table, not mobile SIM subscriptions',chartBox('ispBars',280),{tag:'OBSERVED',source:[['NCC ISP data',SOURCE.isp]],tip:'The NCC ISP table reports operator submissions as of a cutoff. These are not directly comparable with the mobile SIM subscription numbers on the overview.'})}${panel('Starlink growth in Kenya','Fixed subscription observations · June 2024–June 2026',chartBox('kenyaLine',280),{tag:'CA-DERIVED',source:[['Published CA-series compilation',SOURCE.kenya],['CA Kenya',SOURCE.cak]],tip:'Kenyan market observations are context only, not a forecast for Nigeria or a causal measure of MTN Nigeria customer substitution.'})}</div>`+
 `<div class="grid2 grid-half">${panel('Most plausible exposure areas','Analytical hypotheses requiring validation',`<div class="exposure-list">${[
 ['Household broadband','Higher','Compare fixed monthly cost, download speed, congestion and reliability.'],
 ['SME & enterprise backup','Higher','Compare downtime cost and resilience value rather than price alone.'],
 ['Heavy mobile / hotspot','Medium','Assess whether shared fixed internet can replace a large data bundle.'],
 ['Low-spend prepaid voice / data','Lower','Upfront device and recurring satellite costs may reduce direct substitution.']
 ].map(([a,b,c])=>`<div class="exposure"><div><strong>${a}</strong><p>${c}</p></div><span class="tag ${b==='Higher'?'amber':b==='Medium'?'':'green'}">${b} hypothesis</span></div>`).join('')}</div>`,{tag:'HYPOTHESES',tagtype:'amber',tip:'Exposure ratings are qualitative hypotheses, not observed subscriber losses.'})}${panel('How to test the threat','Research before inference',`<div class="metric-list">${metric('1 · Segment the addressable market','Home / enterprise')}${metric('2 · Compare total cost','Install + monthly fees')}${metric('3 · Compare quality','Latency, uptime, speed')}${metric('4 · Establish substitution evidence','Surveys / matched cohorts')}${metric('5 · Test commercial response','Home bundles / backup')}</div>${info('<b>Do not conclude:</b> Starlink subscriptions are the same as lost MTN subscribers. Multi-homing, market growth and different customer needs can coexist.')}`,{tag:'RESEARCH PLAN',tip:'Real customer switching estimates would require survey, matched location or operator customer data.'})}</div>`;
}
function action(){
 const cen=forecast(CASES[1],state.sim),base=forecast(CASES[1],{...state.sim,price:0,inflation:BASE_INFLATION,retention:0});
 const change=(cen.net/base.net-1)*100;
 return headline('06','Decisions & research trail','Translate observations into testable commercial actions, while making the boundaries between source data and modeled assumptions explicit.')+
 `<div class="focus-box"><div><h2>Current simulator outcome: ${change>=0?'possible upside':'possible downside'}</h2><p>At ${pct(state.sim.price,0)} tariff adjustment, ${fmt(state.sim.inflation,1)}% inflation, ${fmt(state.sim.retention,0)}% modeled intervention and a ${state.sim.months}-month horizon, the central synthetic case shows ${pct(change,1)} net revenue change versus its no-change baseline. This is not an MTN forecast.</p></div><div class="focus-number">${pct(change,1)}<div class="focus-tiny">model vs baseline</div></div></div>`+
 `<div class="action-grid">${[
 ['01','Protect value-sensitive prepaid','Pilot smaller bundles or loyalty rewards against randomized controls. Measure purchase frequency, net revenue and inactivity.','Demand sensitivity is a hypothesis; no actual customer churn available.'],
 ['02','Expand home broadband intelligence','Segment high-consumption homes and small businesses. Test fibre / fixed wireless offers where suitable infrastructure is available.','MTN reports FTTH at approximately 13% of network data traffic.'],
 ['03','Make quality visible to pricing teams','Link trouble tickets, outage frequency and coverage quality to revenue retention before testing tariff changes.','Quality-driven switching is plausible, not established by public figures.']
 ].map(([n,title,desc,ev])=>`<div class="action"><span class="tag">TEST ${n}</span><h3>${title}</h3><p>${desc}</p><div class="stack-note"><b>Evidence status:</b> ${ev}</div></div>`).join('')}</div>`+
 `<div class="grid2 grid-half">${panel('Research controls','How this project handles conflicting measures',`<div class="metric-list">${metric('MTN subscriber series','MTN reporting definition')}${metric('NCC mobile subscribers','NCC operator returns')}${metric('Financial values','9M26 vs 9M25')}${metric('NBS price index','Rebased series only')}${metric('Modeled churn','Synthetic, not fitted')}${metric('Nigeria state heatmap','Deferred; no valid state churn data')}</div>${info('<b>Why no Nigerian state heatmap yet?</b> Producing state-level “MTN churn” without state-level observations would be misleading. This can be added with verified geography and suitable data.')}`,{tag:'DATA GOVERNANCE',tip:'Disparate regulatory and company customer definitions are presented separately. Synthetic cohorts are never described as observed subscriber-level records.'})}${panel('Model specification','Reproducible, interpretable and deliberately simplified',`<div class="model-spec"><p><strong>Price response:</strong> Purchase volume per active customer changes with a constant-elasticity demand curve, with different scenario multipliers.</p><p><strong>Inactivity:</strong> Monthly attrition is a synthetic segment baseline plus a price/inflation shock. Intervention reduces modeled attrition by up to 55% at full intensity.</p><p><strong>Revenue:</strong> Period revenue sums active customers × segment spend × tariff factor × consumption response, less an illustrative retention campaign cost.</p><p><strong>Exclusions:</strong> New customer acquisition, migration between segments, regulatory response, VAT, network unit costs and package cannibalization.</p></div>`,{tag:'SIMULATED',tagtype:'amber',tip:'No calibration to MTN customer-level churn, experiments or causal estimates. The model is for stress-testing assumptions and inviting better data.'})}</div>`+
 `${panel('Evidence register','Original sources, measurement periods and limitations',`<div class="table-scroll"><table class="source-table"><thead><tr><th>Evidence</th><th>Reference period</th><th>How it is used</th><th>Link</th></tr></thead><tbody>${[
 ['MTN Nigeria earnings','9M 2025 / 9M 2026','Revenue, users, usage and FTTH',SOURCE.mtn],
 ['NCC mobile operator data','August 2026','Operator shares (NCC definition)',SOURCE.ncc],
 ['NCC internet providers','Q2 2026','Starlink and selected fixed ISPs',SOURCE.isp],
 ['NBS inflation publication','September 2026','Headline, food, core inflation',SOURCE.nbs],
 ['UN monthly CPI / NBS','Jan 2025–Sep 2026','Rebased monthly CPI index',SOURCE.un],
 ['Kenya regulator / reporting','Jun 2024–Jun 2026','Satellite comparative context',SOURCE.kenya],
 ['Synthetic scenario model','Illustrative only','Cohort behaviour and tariff forecasts','#']
 ].map(d=>`<tr><td>${d[0]}</td><td>${d[1]}</td><td>${d[2]}</td><td>${d[3]==='#'?'In project':`<a class="source-link" href="${d[3]}" target="_blank" rel="noopener noreferrer">Open source ↗</a>`}</td></tr>`).join('')}</tbody></table></div>`,{tag:'TRACEABLE',tip:'The source register documents where each observed chart comes from. A separate README in the download details the model caveats.'})}`+
 `<div class="download-row"><button id="downloadCohort" class="btn primary">↓ Export synthetic cohort CSV</button><button id="downloadResearch" class="btn">↓ Export public metrics CSV</button><button class="btn" data-page="simulator">← Revisit simulator</button></div>`;
}
// Forecast: deterministic scenario stress-test, not a trained MTN churn model.
function forecast(c,opts){
 const chosen=opts.segment==='all'?SEG:SEG.filter(s=>s.id===opts.segment);
 const priceRatio=Math.max(.01,1+opts.price/100);
 const inflationShock=(opts.inflation-BASE_INFLATION)/100;
 let gross=0,cost=0,activeEnd=0,orig=0,transactions=0,baselineTransactions=0;
 chosen.forEach(s=>{
  let active=s.n;orig+=s.n;
  const vol=Math.min(1.7,Math.max(.25,Math.pow(priceRatio,-s.elastic*c.m)*Math.max(.7,1-inflationShock*s.vuln*.35)));
  let p=s.churn + c.r*s.vuln*(Math.max(0,priceRatio-1)*.07 + Math.max(0,inflationShock)*.048) - .006*Math.max(0,1-priceRatio)*s.vuln;
  p=Math.max(.003,Math.min(.60,p));
  let preserved=p*opts.retention/100*.55;
  let effectiveP=Math.max(.001,p-preserved);
  for(let m=0;m<opts.months;m++){
   gross+=active*s.spend*priceRatio*vol;
   transactions+=active*vol;
   baselineTransactions+=active;
   // Illustrative intervention cost: 4% of active users contacted at max intensity,
   // at a ₦350 unit cost per month; not a real MTN campaign estimate.
   cost+=active*(opts.retention/100)*.04*350;
   active*=1-effectiveP;
  }
  activeEnd+=active;
 });
 return {gross,cost,net:gross-cost,activeEnd,orig,transactions,baselineTransactions};
}
function drawCharts(){
 if(typeof d3==='undefined'){
  document.querySelectorAll('.chart').forEach(el=>el.innerHTML='<p class="fallback">D3.js is required to render this chart. Please connect to the internet, then reload the dashboard.</p>');
 } else {
  try{
  if(state.page==='overview'){drawRevenueMix();drawRevenueBars();drawNccBars();}
  if(state.page==='afford'){drawCpi();drawInflationBars();drawBasket();}
  if(state.page==='customer'){drawScatter();drawHeat();}
  if(state.page==='simulator'){renderSimulatorResults();}
  if(state.page==='competition'){drawISP();drawKenya();}
  }catch(e){console.error('Chart render error',e);}
 }
 if(state.page==='afford')updateBudget();
 if(state.page==='simulator' && typeof d3==='undefined')renderSimulatorResults();
}
function initSvg(id,height=265,m={top:16,right:22,bottom:38,left:42}){
 const root=document.getElementById(id);if(!root||typeof d3==='undefined')return null;
 root.innerHTML='';const width=Math.max(280,root.clientWidth||540);const svg=d3.select(root).append('svg').attr('viewBox',`0 0 ${width} ${height}`).attr('role','img').attr('aria-label',root.closest('.panel')?.querySelector('h2')?.textContent||'Data visualization');
 return {root,svg,width,height,m,W:width-m.left-m.right,H:height-m.top-m.bottom,g:svg.append('g').attr('transform',`translate(${m.left},${m.top})`)};
}
function axes(a,x,y,opts={}){
 let gx=a.g.append('g').attr('class','axis').attr('transform',`translate(0,${a.H})`).call(d3.axisBottom(x).tickFormat(opts.xfmt||((d)=>d)).ticks(opts.xticks||5));
 let gy=a.g.append('g').attr('class','axis').call(d3.axisLeft(y).ticks(5).tickFormat(opts.yfmt||((d)=>d)));
 gx.selectAll('text').attr('font-size',10);gy.selectAll('text').attr('font-size',10);
 a.g.append('g').attr('class','gridline').call(d3.axisLeft(y).tickSize(-a.W).tickFormat('').ticks(5)).lower().selectAll('path').remove();
 return {gx,gy};
}
function barsColor(i){return ['#174f9e','#3d84d4','#79b0e6','#b3d2f1','#d59c56'][i%5];}
function drawRevenueMix(){
 const mobile=(document.getElementById('revMix').clientWidth||540)<430;
 const a=initSvg('revMix',mobile?372:265,{top:10,right:10,bottom:10,left:10});if(!a)return;
 const total=D.financial.reduce((sum,d)=>sum+d.now,0), cx=mobile?a.width/2:Math.min(a.width*.29,150),cy=mobile?108:125,r=mobile?90:97;
 const arc=d3.arc().innerRadius(59).outerRadius(r);
 const pie=d3.pie().sort(null).value(d=>d.now);
 a.svg.append('g').attr('transform',`translate(${cx},${cy})`).selectAll('path').data(pie(D.financial)).enter().append('path').attr('d',arc).attr('fill',(d,i)=>barsColor(i)).attr('stroke','#fff').attr('stroke-width',2).on('mousemove',(ev,d)=>tip(ev,`${d.data.name}: ₦${fmt(d.data.now,1)}bn (${fmt(d.data.now/total*100,1)}%)`)).on('mouseleave',hideTip);
 a.svg.append('text').attr('x',cx).attr('y',cy-4).attr('text-anchor','middle').attr('font-weight',800).attr('font-size',20).attr('fill','#173c6c').text('₦4.59tn');
 a.svg.append('text').attr('x',cx).attr('y',cy+15).attr('text-anchor','middle').attr('font-size',10).attr('fill','#70859d').text('service revenue');
 const start=mobile?30:Math.max(a.width*.54,cx+110);
 const lg=a.svg.append('g').attr('transform',`translate(${start},${mobile?218:48})`);
 D.financial.forEach((d,i)=>{let y=i*(mobile?28:39);lg.append('circle').attr('cx',0).attr('cy',y).attr('r',5).attr('fill',barsColor(i));lg.append('text').attr('x',12).attr('y',y+4).attr('font-size',11).attr('fill','#536c87').text(d.name);lg.append('text').attr('x',mobile?a.width-90:12).attr('y',mobile?y+4:y+17).attr('text-anchor',mobile?'end':'start').attr('font-size',10).attr('fill','#173e73').attr('font-weight',800).text(`${fmt(d.now/total*100,1)}%`);});
}
function drawRevenueBars(){
 const a=initSvg('revBars',265,{top:10,right:15,bottom:53,left:51});if(!a)return;
 const x=d3.scaleBand().domain(D.financial.map(d=>d.name)).range([0,a.W]).padding(.24),sub=d3.scaleBand().domain(['prior','now']).range([0,x.bandwidth()]).padding(.08),y=d3.scaleLinear().domain([0,3000]).range([a.H,0]);
 axes(a,x,y,{yfmt:d=>d===0?'0':`${d/1000}k`});
 a.g.selectAll('g.cat').data(D.financial).join('g').attr('class','cat').attr('transform',d=>`translate(${x(d.name)},0)`).selectAll('rect').data(d=>[{k:'prior',v:d.prior,name:d.name},{k:'now',v:d.now,name:d.name}]).join('rect').attr('x',d=>sub(d.k)).attr('y',d=>y(d.v)).attr('width',sub.bandwidth()).attr('height',d=>a.H-y(d.v)).attr('rx',3).attr('fill',d=>d.k==='now'?'#236abb':'#b5d3f1').on('mousemove',(ev,d)=>tip(ev,`${d.name} · ${d.k==='now'?'9M 2026':'9M 2025'}: ₦${fmt(d.v,1)}bn`)).on('mouseleave',hideTip);
 a.g.selectAll('.axis text').style('font-size','9px');
 if(a.width<520)a.g.select('.axis').selectAll('text').attr('transform','rotate(-30)').style('text-anchor','end');
 a.svg.append('rect').attr('x',a.width-153).attr('y',8).attr('width',9).attr('height',9).attr('fill','#b5d3f1');a.svg.append('text').attr('x',a.width-140).attr('y',16).attr('font-size',10).attr('fill','#607790').text('2025');a.svg.append('rect').attr('x',a.width-89).attr('y',8).attr('width',9).attr('height',9).attr('fill','#236abb');a.svg.append('text').attr('x',a.width-76).attr('y',16).attr('font-size',10).attr('fill','#607790').text('2026');
}
function horizBars(id,data,height=255,maxValue=0){
 const a=initSvg(id,height,{top:10,right:80,bottom:28,left:110});if(!a)return;
 const x=d3.scaleLinear().domain([0,maxValue||d3.max(data,d=>d.v)*1.1]).range([0,a.W]);const y=d3.scaleBand().domain(data.map(d=>d.name)).range([0,a.H]).padding(.3);
 a.g.append('g').attr('class','axis').call(d3.axisLeft(y).tickSize(0)).select('.domain').remove();
 a.g.append('g').attr('class','axis').attr('transform',`translate(0,${a.H})`).call(d3.axisBottom(x).ticks(4).tickFormat(d=>`${fmt(d/1e6,0)}m`));
 a.g.selectAll('rect').data(data).join('rect').attr('x',0).attr('y',d=>y(d.name)).attr('height',y.bandwidth()).attr('rx',5).attr('width',d=>x(d.v)).attr('fill',(d,i)=>barsColor(i));
 a.g.selectAll('text.value').data(data).join('text').attr('class','value').attr('x',d=>x(d.v)+7).attr('y',d=>y(d.name)+y.bandwidth()/2+4).attr('fill','#24538c').attr('font-size',10).attr('font-weight',800).text(d=>fmt(d.v/1e6,2)+'m');
}
function drawNccBars(){const d=D.ncc.map(x=>({...x}));horizBars('marketShare',d,255);}
function drawCpi(){
 const a=initSvg('cpiTrend',285,{top:12,right:25,bottom:45,left:48});if(!a)return;
 const x=d3.scaleLinear().domain([0,D.cpi.length-1]).range([0,a.W]);const y=d3.scaleLinear().domain([104,152]).range([a.H,0]);
 axes(a,x,y,{xfmt:d=>D.cpi[Math.round(d)]?.date||'',xticks:6});
 a.g.append('path').datum(D.cpi).attr('d',d3.line().x(d=>x(d.i)).y(d=>y(d.v)).curve(d3.curveMonotoneX)).attr('fill','none').attr('stroke','#2877c9').attr('stroke-width',3);
 a.g.selectAll('circle').data(D.cpi).enter().append('circle').attr('cx',d=>x(d.i)).attr('cy',d=>y(d.v)).attr('r',3.5).attr('fill','#2162a9').on('mousemove',(ev,d)=>tip(ev,`${d.date} · CPI index ${fmt(d.v,1)}`)).on('mouseleave',hideTip);
 a.g.append('text').attr('x',x(20)-5).attr('y',y(146.4)-11).attr('text-anchor','end').attr('font-size',10).attr('font-weight',800).attr('fill','#174f9e').text('146.4');
}
function drawInflationBars(){
 const a=initSvg('inflationBars',285,{top:14,right:20,bottom:40,left:45});if(!a)return;
 const data=[{name:'Headline',v:14.63},{name:'Food',v:19.59},{name:'Core',v:12.95}];const x=d3.scaleBand().domain(data.map(d=>d.name)).range([0,a.W]).padding(.38),y=d3.scaleLinear().domain([0,24]).range([a.H,0]);axes(a,x,y,{yfmt:d=>`${d}%`});
 a.g.selectAll('rect').data(data).join('rect').attr('x',d=>x(d.name)).attr('y',d=>y(d.v)).attr('width',x.bandwidth()).attr('height',d=>a.H-y(d.v)).attr('rx',5).attr('fill',(d,i)=>barsColor(i));
 a.g.selectAll('text.val').data(data).join('text').attr('class','val').attr('x',d=>x(d.name)+x.bandwidth()/2).attr('y',d=>y(d.v)-10).attr('text-anchor','middle').attr('fill','#1c558d').attr('font-size',12).attr('font-weight',800).text(d=>`${fmt(d.v,2)}%`);
}
function drawBasket(){
 const a=initSvg('basketCompare',185,{top:13,right:18,bottom:24,left:122});if(!a)return;
 const cost=10000*146.4/127.7,data=[{name:'Sep 2025',v:10000},{name:'Sep 2026',v:cost}];const x=d3.scaleLinear().domain([0,13000]).range([0,a.W]),y=d3.scaleBand().domain(data.map(d=>d.name)).range([0,a.H]).padding(.32);
 a.g.append('g').attr('class','axis').call(d3.axisLeft(y).tickSize(0)).select('.domain').remove();a.g.selectAll('rect').data(data).join('rect').attr('x',0).attr('y',d=>y(d.name)).attr('width',d=>x(d.v)).attr('height',y.bandwidth()).attr('rx',4).attr('fill',(d,i)=>i?'#2d78cd':'#b2d1ef');
 a.g.selectAll('text').data(data).join('text').attr('x',d=>Math.min(a.W-85,x(d.v)-10)).attr('y',d=>y(d.name)+y.bandwidth()/2+4).attr('text-anchor','end').attr('font-size',11).attr('font-weight',800).attr('fill','#fff').text(d=>naira(d.v));
}
function drawScatter(){
 const a=initSvg('scatter',300,{top:10,right:30,bottom:50,left:53});if(!a)return;
 const x=d3.scaleLog().domain([1200,50000]).range([0,a.W]),y=d3.scaleLinear().domain([0,8]).range([a.H,0]),size=d3.scaleSqrt().domain([0,40000]).range([8,25]);
 axes(a,x,y,{xfmt:d=>naira(d),yfmt:d=>`${d}%`,xticks:5});
 a.g.selectAll('circle').data(SEG).join('circle').attr('cx',d=>x(d.spend)).attr('cy',d=>y(d.churn*100)).attr('r',d=>size(d.n)).attr('fill',(d,i)=>barsColor(i)).attr('fill-opacity',.82).attr('stroke','#fff').attr('stroke-width',2).on('mousemove',(ev,d)=>tip(ev,`${d.name}<br/>Synthetic customers: ${fmt(d.n)}<br/>Monthly spend: ${naira(d.spend)}<br/>Assumed inactivity: ${fmt(d.churn*100,1)}%`)).on('mouseleave',hideTip);
 a.g.selectAll('text.bubble').data(SEG).join('text').attr('class','bubble').attr('x',d=>x(d.spend)+size(d.n)+4).attr('y',d=>y(d.churn*100)+4).attr('font-size',10).attr('fill','#60768e').text(d=>d.short);
 a.svg.append('text').attr('x',a.width/2).attr('y',a.height-5).attr('text-anchor','middle').attr('font-size',10).attr('fill','#7690a8').text('Assumed spend per month');
}
function drawHeat(){
 const a=initSvg('riskHeat',310,{top:15,right:18,bottom:53,left:120});if(!a)return;
 const shock=[0,10,20,30,40],x=d3.scaleBand().domain(shock).range([0,a.W]).padding(.06),y=d3.scaleBand().domain(SEG.map(s=>s.short)).range([0,a.H]).padding(.07);
 const data=SEG.flatMap(s=>shock.map(p=>({segment:s.short,p,v:Math.min(.6,s.churn+s.vuln*(p/100)*.07)})));
 const color=d3.scaleSequential().domain([.008,.11]).interpolator(d3.interpolateBlues);
 a.g.append('g').attr('class','axis').call(d3.axisLeft(y).tickSize(0)).select('.domain').remove();a.g.append('g').attr('class','axis').attr('transform',`translate(0,${a.H})`).call(d3.axisBottom(x).tickFormat(v=>`+${v}%`).tickSize(0)).select('.domain').remove();
 a.g.selectAll('rect').data(data).join('rect').attr('x',d=>x(d.p)).attr('y',d=>y(d.segment)).attr('width',x.bandwidth()).attr('height',y.bandwidth()).attr('rx',4).attr('fill',d=>color(d.v)).on('mousemove',(ev,d)=>tip(ev,`${d.segment}<br/>+${d.p}% tariff shock<br/>Assumed monthly inactivity ${fmt(d.v*100,1)}%`)).on('mouseleave',hideTip);
 a.g.selectAll('text.cell').data(data).join('text').attr('class','cell').attr('x',d=>x(d.p)+x.bandwidth()/2).attr('y',d=>y(d.segment)+y.bandwidth()/2+4).attr('text-anchor','middle').attr('font-size',10).attr('font-weight',800).attr('fill',d=>d.v>.07?'#fff':'#1a4a7e').text(d=>fmt(d.v*100,1)+'%');
 a.svg.append('text').attr('x',a.width/2).attr('y',a.height-5).attr('text-anchor','middle').attr('font-size',10).attr('fill','#7188a2').text('Additional tariff increase →');
}
function renderSimulatorResults(){
 const s=state.sim,baseline=forecast(CASES[1],{...s,price:0,inflation:BASE_INFLATION,retention:0});
 const results=CASES.map(c=>({...c,...forecast(c,s)}));
 const el=document.getElementById('simCards');if(!el)return;
 el.innerHTML=results.map(d=>`<div class="scenario-card"><div class="name">${d.name}</div><div class="value">${money(d.net)}</div><div class="delta ${d.net>=baseline.net?'positive':'negative'}">${pct((d.net/baseline.net-1)*100,1)} vs baseline</div><div class="small">${fmt(d.activeEnd)} active at horizon · net of illustrative intervention cost</div></div>`).join('');
 if(typeof d3!=='undefined')drawSimCurves();
 const middle=results[1];
 document.getElementById('simTradeoff').innerHTML=`<div class="metric-list">${metric('Baseline cohort revenue',money(baseline.net))}${metric('Central-case revenue',money(middle.net))}${metric('Central-case revenue change',pct((middle.net/baseline.net-1)*100,1))}${metric('Active at end of horizon',fmt(middle.activeEnd))}${metric('Additional inactive vs baseline',fmt(Math.max(0,baseline.activeEnd-middle.activeEnd)))}${metric('Retention campaign cost',money(middle.cost))}</div><div class="stat-brief">Customer inactivity and reduced purchasing are both represented. Revenue is cumulative over the selected horizon.</div>`;
 const price=Math.max(.01,s.price/100),threshold=price>0?100*(price/(1+price)):0;
 document.getElementById('simBreakeven').innerHTML=`${s.price>0?`<div class="break-even">A <strong>+${fmt(s.price,0)}%</strong> price increase can mathematically withstand up to <strong>${fmt(threshold,1)}%</strong> fewer purchases before *gross* revenue declines — holding the mix and other factors fixed.</div>`:`<div class="break-even">For a zero or negative tariff change, the positive-price break-even rule does not apply. Use the scenario curves to compare gains from lower prices with costs.</div>`}<div class="stat-brief"><b>Model limitation:</b> This rule is not the same as the simulated outcome because the simulation also allows monthly inactivity, inflation pressure, changing demand and intervention costs.</div>`;
}
function drawSimCurves(){
 const small=(document.getElementById('simCurves').clientWidth||560)<550;
 const a=initSvg('simCurves',small?350:310,{top:small?55:20,right:18,bottom:46,left:72});if(!a)return;
 const opts=state.sim,baseline=forecast(CASES[1],{...opts,price:0,inflation:BASE_INFLATION,retention:0});
 const px=[-20,-15,-10,-5,0,5,10,15,20,25,30,35,40,45,50];
 const series=CASES.map(c=>({case:c,pts:px.map(p=>({x:p,y:forecast(c,{...opts,price:p}).net/baseline.net*100}))}));
 const all=series.flatMap(d=>d.pts.map(v=>v.y)),y=d3.scaleLinear().domain([Math.max(30,Math.floor((d3.min(all)-6)/10)*10),Math.ceil((d3.max(all)+8)/10)*10]).range([a.H,0]),x=d3.scaleLinear().domain([-20,50]).range([0,a.W]);axes(a,x,y,{xfmt:d=>`${d>0?'+':''}${d}%`,yfmt:d=>`${d}%`,xticks:8});
 a.g.append('line').attr('x1',0).attr('x2',a.W).attr('y1',y(100)).attr('y2',y(100)).attr('stroke','#a3b6cc').attr('stroke-dasharray','5 4');
 a.g.append('line').attr('x1',x(opts.price)).attr('x2',x(opts.price)).attr('y1',0).attr('y2',a.H).attr('stroke','#526b88').attr('stroke-dasharray','4 4');
 series.forEach(s=>{a.g.append('path').datum(s.pts).attr('d',d3.line().x(d=>x(d.x)).y(d=>y(d.y)).curve(d3.curveMonotoneX)).attr('stroke',s.case.color).attr('stroke-width',2.5).attr('fill','none');
 let current=forecast(s.case,opts).net/baseline.net*100;
 a.g.append('circle').attr('cx',x(opts.price)).attr('cy',y(current)).attr('r',5).attr('stroke','#fff').attr('stroke-width',2).attr('fill',s.case.color);
 });
 const lg=a.svg.append('g').attr('transform',`translate(${a.m.left+12},12)`);
 CASES.forEach((d,i)=>{const dx=small?0:i*150,dy=small?i*15:0;lg.append('line').attr('x1',dx).attr('x2',dx+15).attr('y1',dy).attr('y2',dy).attr('stroke',d.color).attr('stroke-width',3);lg.append('text').attr('x',dx+21).attr('y',dy+4).attr('font-size',10).attr('fill','#60758c').text(d.name);});
 a.svg.append('text').attr('x',a.width/2).attr('y',a.height-4).attr('text-anchor','middle').attr('font-size',10).attr('fill','#7188a2').text('Proposed tariff change');
 a.svg.append('text').attr('x',13).attr('y',a.height/2).attr('text-anchor','middle').attr('font-size',10).attr('fill','#7188a2').attr('transform',`rotate(-90,13,${a.height/2})`).text('Net revenue vs baseline');
}
function drawISP(){
 const a=initSvg('ispBars',280,{top:13,right:65,bottom:37,left:128});if(!a)return;
 const x=d3.scaleLinear().domain([0,130000]).range([0,a.W]),y=d3.scaleBand().domain(D.isp.map(d=>d.name)).range([0,a.H]).padding(.34);
 a.g.append('g').attr('class','axis').call(d3.axisLeft(y).tickSize(0)).select('.domain').remove();a.g.append('g').attr('class','axis').attr('transform',`translate(0,${a.H})`).call(d3.axisBottom(x).ticks(4).tickFormat(d=>fmt(d/1000,0)+'k'));
 a.g.selectAll('rect').data(D.isp).join('rect').attr('x',0).attr('y',d=>y(d.name)).attr('width',d=>x(d.v)).attr('height',y.bandwidth()).attr('rx',5).attr('fill',(d,i)=>i===1?'#2b7ace':'#a9caed');
 a.g.selectAll('text.num').data(D.isp).join('text').attr('class','num').attr('x',d=>x(d.v)+7).attr('y',d=>y(d.name)+y.bandwidth()/2+4).attr('font-size',11).attr('font-weight',800).attr('fill','#1e5488').text(d=>fmt(d.v));
}
function drawKenya(){
 const a=initSvg('kenyaLine',280,{top:18,right:28,bottom:52,left:52});if(!a)return;
 const x=d3.scalePoint().domain(D.kenya.map(d=>d.date)).range([0,a.W]).padding(.2),y=d3.scaleLinear().domain([0,32000]).range([a.H,0]);axes(a,x,y,{yfmt:d=>`${d/1000}k`});
 a.g.append('path').datum(D.kenya).attr('d',d3.line().x(d=>x(d.date)).y(d=>y(d.v)).curve(d3.curveMonotoneX)).attr('fill','none').attr('stroke','#2174c9').attr('stroke-width',3);
 a.g.selectAll('circle').data(D.kenya).join('circle').attr('cx',d=>x(d.date)).attr('cy',d=>y(d.v)).attr('r',4).attr('fill','#2174c9').on('mousemove',(ev,d)=>tip(ev,`${d.date}: ${fmt(d.v)} Starlink Kenya fixed subscriptions`)).on('mouseleave',hideTip);
 a.g.selectAll('.axis text').style('font-size','9px');
 a.g.append('text').attr('x',x('Jun 26')-9).attr('y',y(27616)-12).attr('text-anchor','end').attr('fill','#1a5ba0').attr('font-size',11).attr('font-weight',800).text('27,616');
}
function updateBudget(){
 const el=document.getElementById('budgetResult');if(!el)return;
 const budget=Number(state.budget)||1,telecom=Number(state.telecom)||0,share=telecom/budget*100,after=telecom*1.15,afterShare=after/budget*100;
 el.innerHTML=`<div class="budget-result"><div class="budget-label">Share of household budget allocated to connectivity</div><div class="big-figure">${fmt(share,1)}%</div><div class="budget-track"><div style="width:${Math.min(100,share)}%"></div></div><div class="budget-label">With a hypothetical +15% telecom price adjustment</div><div class="budget-values"><b>${naira(after)}</b><span>${fmt(afterShare,1)}% of budget · ${naira(after-telecom)} extra</span></div></div><p class="note">Illustrative household input. Other living costs may change too; this chart isolates the telecom price adjustment.</p>`;
}
function tip(ev,html){const el=document.getElementById('tooltip');el.innerHTML=html;el.style.display='block';moveTip(ev);}
function moveTip(ev){let t=document.getElementById('tooltip');let x=ev.clientX+14,y=ev.clientY+16;if(x>window.innerWidth-240)x=ev.clientX-225;if(y>window.innerHeight-110)y=ev.clientY-100;t.style.left=x+'px';t.style.top=y+'px';}
function hideTip(){document.getElementById('tooltip').style.display='none';}
function exportCSV(rows,name){let csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\r\n');let blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function exportSynthetic(){
 // aggregated cohorts only; 100,000 simulated customers represented by five segment rows
 exportCSV([['segment','synthetic_subscribers','monthly_spend_NGN','monthly_baseline_inactivity_assumption','constant_elasticity','monthly_GB_assumption','data_type'],...SEG.map(s=>[s.name,s.n,s.spend,s.churn,s.elastic,s.usage,'SYNTHETIC'])],'synthetic-segment-assumptions.csv');
}
function exportPublic(){
 exportCSV([['metric','period','value','unit','source_url','data_type'],
 ['Service revenue','9M 2026',4586,'NGN bn',SOURCE.mtn,'OBSERVED'],['Service revenue','9M 2025',3708.2,'NGN bn',SOURCE.mtn,'OBSERVED'],
 ['Data revenue','9M 2026',2684.4,'NGN bn',SOURCE.mtn,'OBSERVED'],['Voice revenue','9M 2026',1496.7,'NGN bn',SOURCE.mtn,'OBSERVED'],
 ['Active data users','Sep 2026',57.2,'million',SOURCE.mtn,'OBSERVED'],['MTN subscribers','Sep 2026',94.7,'million MTN definition',SOURCE.mtn,'OBSERVED'],
 ['NCC MTN subscribers','Aug 2026',104648077,'subscriptions NCC definition',SOURCE.ncc,'OBSERVED'],
 ['Headline inflation','Sep 2026',14.63,'percent YoY',SOURCE.nbs,'OBSERVED'],['Food inflation','Sep 2026',19.59,'percent YoY',SOURCE.nbs,'OBSERVED'],
 ['NCC Starlink ISP','Q2 2026',98642,'ISP subscriptions',SOURCE.isp,'OBSERVED'],
 ...D.cpi.map(d=>['NBS CPI rebased',d.date,d.v,'index 2024=100',SOURCE.un,'OBSERVED'])
 ],'public-metrics-and-sources.csv');
}
function bind(){
 document.getElementById('nav').addEventListener('click',e=>{let btn=e.target.closest('[data-page]');if(btn)goto(btn.dataset.page);});
 document.getElementById('menuBtn').addEventListener('click',()=>setSidebar(!sidebarIsOpen));
 document.getElementById('navShade').addEventListener('click',()=>setSidebar(false));
 // Dismiss the page navigation when someone clicks away from it, on any screen size.
 document.addEventListener('pointerdown',e=>{
  if(sidebarIsOpen&&!document.getElementById('sidebar').contains(e.target)&&!document.getElementById('menuBtn').contains(e.target))setSidebar(false);
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&sidebarIsOpen){setSidebar(false);document.getElementById('menuBtn').focus();}});
 document.getElementById('content').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.page)goto(b.dataset.page);
  if(b.id==='resetSim'){state.sim={segment:'all',price:15,inflation:14.63,retention:25,months:6};render();}
  if(b.id==='downloadCohort')exportSynthetic();
  if(b.id==='downloadResearch')exportPublic();
 });
 document.getElementById('content').addEventListener('input',e=>{
  const id=e.target.id;
  const keys={simSeg:'segment',simPrice:'price',simInflation:'inflation',simRetention:'retention',simMonths:'months'};
  if(keys[id]){
   state.sim[keys[id]]=id==='simSeg'?e.target.value:Number(e.target.value);
   for(const [input,display,units] of [['simPrice','simPriceVal','pct'],['simInflation','simInflationVal','pct'],['simRetention','simRetentionVal','pct']]){
    const out=document.getElementById(display);if(!out)continue;const val=Number(document.getElementById(input).value);out.textContent=units==='pct'?(input==='simPrice'?pct(val,0):`${fmt(val,input==='simInflation'?1:0)}%`):val;
   }
   renderSimulatorResults();
   return;
  }
  if(id==='budgetInput'||id==='telecomInput'){state[id==='budgetInput'?'budget':'telecom']=Math.max(0,Number(e.target.value)||0);updateBudget();}
 });
 const tooltip=document.getElementById('tooltip');
 document.addEventListener('mouseover',e=>{const t=e.target.closest('[data-tip]');if(t)tip(e,safe(t.dataset.tip));});
 document.addEventListener('mousemove',e=>{if(tooltip.style.display==='block')moveTip(e);});
 document.addEventListener('mouseout',e=>{if(e.target.closest('[data-tip]'))hideTip();});
 window.addEventListener('hashchange',()=>{let p=location.hash.slice(1);if(p!==state.page&&pages.some(x=>x.id===p)){state.page=p;render();}});
 let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(drawCharts,130);});
}
const hash=location.hash.slice(1);if(pages.some(p=>p.id===hash))state.page=hash;
setSidebar(window.innerWidth>850);
let wasMobile=window.innerWidth<=850;
window.addEventListener('resize',()=>{
 const isMobile=window.innerWidth<=850;
 if(isMobile!==wasMobile){wasMobile=isMobile;setSidebar(!isMobile);}
});
bind();render();
