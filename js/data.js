// ── Project — default; overwritten by loadActiveProject() on gallery pages ────
let project = {
  id: "kirkenes-study",
  name: "Design for fellesskap 2026",
  description: "A mapping of local resources, conditions, and perspectives in the Kirkenes region — exploring questions of political representation, community belonging, and regional development.",
  projectBy: "Einar Sneve Martinussen",
  projectDate: "2025–2026",
  collaborators: "AHO, Sør-Varanger Utvikling",
  editorPassword: "",
  workshopPassword: "",
  createdAt: "01.10.2025"
};

// ── Project management ────────────────────────────────────────────────────────

const SAMPLE_PROJECT_ID = "kirkenes-study";

// getProjects, getProject, saveProject, deleteProject,
// getProjectCards, getAllCards, loadActiveProject
// → all async, defined in db.js

function getActiveProjectId() {
  return new URLSearchParams(window.location.search).get("project")
    || sessionStorage.getItem("whats-active-project")
    || SAMPLE_PROJECT_ID;
}

function getProjectAccess(projectId) {
  return sessionStorage.getItem("whats-access-" + projectId) || null;
}

function setProjectAccess(projectId, level) {
  sessionStorage.setItem("whats-access-" + projectId, level);
  sessionStorage.setItem("whats-active-project", projectId);
}

// ── Sample cards — 160 cards for the Kirkenes / Design for fellesskap project ──
// Titles: short topical labels. WIF bodies open with the "What if…" question.
// Body text is kept to ~2–3 sentences to fit the A4 card template.
const SAMPLE_CARDS = [

  // ── What Is? ──────────────────────────────────────────────────────────────

  {
    id:"s-wi-01",projectId:"kirkenes-study",type:"what-is",
    title:"Youth career paths",
    body:"Young people under 35 describe meaningful career development as requiring departure from the region. Work clusters around extractive industry, healthcare, and retail — none connected to a wider professional world. Even those who love the place describe a sense of inevitability about leaving.",
    tags:["Youth","Economy","Migration"],imageUrl:"https://picsum.photos/seed/wi01/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Kystutvikling 2025 fieldwork",author:"Synne",date:"01.10.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-02",projectId:"kirkenes-study",type:"what-is",
    title:"The generation that left",
    body:"Former residents who moved for education or work are largely absent from community life even years later. A small number return in their 30s or 40s, often for family reasons, but describe feeling partly out of place. Return is rarely framed as a professional choice.",
    tags:["Youth","Migration","Community"],imageUrl:"https://picsum.photos/seed/fill100/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Lena",date:"02.10.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-03",projectId:"kirkenes-study",type:"what-is",
    title:"Young women leaving faster",
    body:"A visible gender gap has emerged in outmigration. Young women cite limited opportunities in education management and culture, and describe a social environment that can feel constraining. The gap leaves a demographic imbalance that compounds other challenges.",
    tags:["Youth","Gender","Migration"],imageUrl:"https://picsum.photos/seed/wi03/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Kystutvikling 2025 fieldwork",author:"Ida",date:"03.10.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-04",projectId:"kirkenes-study",type:"what-is",
    title:"Youth awareness without agency",
    body:"Teenagers demonstrate a clear-eyed understanding of the structural forces shaping their hometown — migration, economic dependence, political marginalisation. This awareness does not translate into hope. Many describe feeling like observers of their own situation rather than actors within it.",
    tags:["Youth","Education","Politics"],imageUrl:"https://picsum.photos/seed/fill101/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Lena",date:"05.10.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-05",projectId:"kirkenes-study",type:"what-is",
    title:"Social life goes online",
    body:"Young people spend significant time in online communities that are geographically distributed rather than place-based. Local social spaces — the youth club, the sports hall, the town square — feel less relevant to how they actually connect. This is not experienced as loss so much as normalisation of elsewhere.",
    tags:["Youth","Digital","Community"],imageUrl:"https://picsum.photos/seed/fill102/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Kristoffer",date:"06.10.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-06",projectId:"kirkenes-study",type:"what-is",
    title:"Cross-border trade as daily life",
    body:"Before 2022, travel to the Russian side of the border was a normal part of daily life — cheaper fuel, groceries, authentic social connections. The closure is described not just as economic loss but as severing something socially real. Many families had Russian friends, business contacts, or relatives across the border.",
    tags:["Cross-border","Economy","Community"],imageUrl:"https://picsum.photos/seed/wi06/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Coastal Development 2025 fieldwork",author:"Magnus",date:"07.10.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-07",projectId:"kirkenes-study",type:"what-is",
    title:"The Russian-speaking community",
    body:"Since the war and border closure, Russian-born residents describe a changed social atmosphere — reluctance to speak Russian in public, increased scrutiny, a sense of having been redefined as outsiders. Some have left entirely. Their presence was long a source of local identity; now it is a source of anxiety.",
    tags:["Identity","Migration","Cross-border"],imageUrl:"https://picsum.photos/seed/fill103/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Einar",date:"08.10.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-08",projectId:"kirkenes-study",type:"what-is",
    title:"The economic cost of border closure",
    body:"Small-scale trade, service provision, and labour exchange across the border had become embedded in the local economy over three decades. The closure in 2022 removed economic circuits that were not formally documented and therefore not easily replaced. Many small businesses lost supply chains overnight.",
    tags:["Cross-border","Economy","Politics"],imageUrl:"https://picsum.photos/seed/fill104/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Magnus",date:"09.10.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-09",projectId:"kirkenes-study",type:"what-is",
    title:"Identity built on coexistence",
    body:"Kirkenes has long positioned itself as where Norwegian, Russian, and Sami cultures meet — a source of genuine pride. The severing of the Russian dimension has left a gap in this identity story that has not been filled. The town's distinctiveness was partly built on a relationship that no longer functions.",
    tags:["Identity","Culture","Cross-border"],imageUrl:"https://picsum.photos/seed/fill105/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Synne",date:"10.10.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-10",projectId:"kirkenes-study",type:"what-is",
    title:"Hospital closure as symbolic wound",
    body:"The loss of full hospital services is repeatedly mentioned as a turning point — not just in healthcare access, but as a signal about the region's priority. 'They took our hospital' carries more weight than its literal meaning. It anchors a wider narrative of abandonment by the national government.",
    tags:["Healthcare","Politics","Infrastructure"],imageUrl:"https://picsum.photos/seed/wi10/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Kystutvikling 2025 healthcare analysis",author:"Lena",date:"12.10.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-11",projectId:"kirkenes-study",type:"what-is",
    title:"Medical travel burden",
    body:"Specialist care requires travelling to Tromsø or further — often overnight, sometimes alone. The burden falls disproportionately on elderly residents and those with chronic conditions. The financial and psychological costs are significant and rarely reflected in official statistics.",
    tags:["Healthcare","Transport","Elderly"],imageUrl:"https://picsum.photos/seed/fill106/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Ida",date:"13.10.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-12",projectId:"kirkenes-study",type:"what-is",
    title:"Mental health underserved",
    body:"Waiting times for psychological support run to months. The few local practitioners are at capacity. Younger residents describe mental health struggles going unsupported, and connect this to living in a place with an uncertain future.",
    tags:["Healthcare","Youth","Community"],imageUrl:"https://picsum.photos/seed/fill107/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Kristoffer",date:"14.10.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-13",projectId:"kirkenes-study",type:"what-is",
    title:"Elderly avoiding care",
    body:"Older residents describe postponing or avoiding medical appointments because of transport difficulty. Deferred care leads to worse outcomes, but this is rarely captured in regional health data. Distance acts as a filter that makes the system appear more accessible than it is.",
    tags:["Elderly","Healthcare","Transport"],imageUrl:"https://picsum.photos/seed/fill108/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Synne",date:"15.10.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-14",projectId:"kirkenes-study",type:"what-is",
    title:"Local governance, distant decisions",
    body:"Elected local representatives describe a sense of operating in a space where significant decisions — about infrastructure, industry, investment — are made in Oslo with limited northern input. The formal channels exist, but the effective power to change outcomes feels absent. The municipality plans; the state decides.",
    tags:["Politics","Infrastructure","Community"],imageUrl:"https://picsum.photos/seed/fill109/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Einar",date:"17.10.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-15",projectId:"kirkenes-study",type:"what-is",
    title:"Government as problem and solution",
    body:"Residents consistently criticise national policy for marginalising the north, while simultaneously calling on the national government to fix local challenges. Local capacity to solve problems through local means is not widely believed in. This creates a cycle of dependency that is difficult to break even when local will exists.",
    tags:["Politics","Economy","Community"],imageUrl:"https://picsum.photos/seed/wi15/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Magnus",date:"18.10.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-16",projectId:"kirkenes-study",type:"what-is",
    title:"Youth disengagement from local politics",
    body:"Youth voter turnout in local elections is consistently below the national average. This is not primarily apathy — many young residents have strong opinions about local issues — but a sense that local politics does not offer meaningful choices or influence over what actually matters.",
    tags:["Youth","Politics"],imageUrl:"https://picsum.photos/seed/fill110/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Lena",date:"19.10.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-17",projectId:"kirkenes-study",type:"what-is",
    title:"Municipal mergers and lost proximity",
    body:"A recent round of consolidation absorbed smaller, locally attuned bodies into a larger administrative unit. Those who remember the earlier structure describe losing access to decision-makers who knew the specifics of their area. Scale was gained; proximity was lost.",
    tags:["Politics","Community","Infrastructure"],imageUrl:"https://picsum.photos/seed/fill111/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Kristoffer",date:"20.10.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-18",projectId:"kirkenes-study",type:"what-is",
    title:"Housing market gaps",
    body:"The private housing market offers very limited options in the middle range — cheap older apartments or a small number of newer houses. For families seeking something between these extremes, options are scarce. This narrows the appeal of the area to the demographic most likely to sustain long-term community growth.",
    tags:["Housing","Economy","Community"],imageUrl:"https://picsum.photos/seed/fill112/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Ida",date:"22.10.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-19",projectId:"kirkenes-study",type:"what-is",
    title:"A concentrated rental market",
    body:"A handful of property owners control a significant proportion of available rental stock. This limits competition, keeps rents high relative to local wages, and makes the market resistant to the diversity that would attract different types of residents.",
    tags:["Housing","Economy"],imageUrl:"https://picsum.photos/seed/fill113/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Magnus",date:"23.10.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-20",projectId:"kirkenes-study",type:"what-is",
    title:"Newcomers and the housing market",
    body:"People moving to the town for work report difficulty finding suitable accommodation at short notice. The rental market offers limited options; ownership requires capital and commitment many new arrivals are not ready to make. Several describe the housing situation as a reason they considered leaving again shortly after arriving.",
    tags:["Housing","Migration","Community"],imageUrl:"https://picsum.photos/seed/wi20/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"The Coast as a Host 2025 fieldwork",author:"Synne",date:"24.10.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-21",projectId:"kirkenes-study",type:"what-is",
    title:"Mining-era housing stock",
    body:"Purpose-built housing blocks from the Sydvaranger mine workforce era shape the visual and social landscape — often old, poorly insulated, and difficult to maintain. They carry a historical weight: the company town as social organisation, and questions about who the place was built for and who it serves now.",
    tags:["Housing","History","Mining"],imageUrl:"https://picsum.photos/seed/fill114/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Einar",date:"25.10.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-22",projectId:"kirkenes-study",type:"what-is",
    title:"Pride and quiet doubt",
    body:"Residents hold strong attachments to the region's identity — Arctic landscape, multicultural history, frontier quality of life. Beneath this runs a quieter narrative of doubt about the future. Both things are often expressed by the same person in the same conversation.",
    tags:["Identity","Community","Culture"],imageUrl:"https://picsum.photos/seed/fill115/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Synne",date:"27.10.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-23",projectId:"kirkenes-study",type:"what-is",
    title:"Arctic identity as constraint",
    body:"The unique qualities of Arctic life are genuinely valued — landscape, light, the sense of being somewhere particular. But distinctiveness can function as a limiting frame: the north as special but peripheral, worth visiting but not worth investing in. Pride and marginalisation share the same narrative.",
    tags:["Identity","Culture","Arctic"],imageUrl:"https://picsum.photos/seed/fill116/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Lena",date:"28.10.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-24",projectId:"kirkenes-study",type:"what-is",
    title:"Sami culture in public space",
    body:"The Sami community has a presence in and around Kirkenes, and Sami culture is formally acknowledged in municipal policy. But everyday public life — signs, events, cultural programmes — does not consistently reflect this. Visibility varies strongly by context.",
    tags:["Culture","Identity","Sami"],imageUrl:"https://picsum.photos/seed/fill117/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Ida",date:"29.10.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-25",projectId:"kirkenes-study",type:"what-is",
    title:"Multicultural heritage, contested reality",
    body:"Tourism materials celebrate the Norwegian-Russian-Sami meeting point as a defining characteristic. In daily social life this diversity is more complicated — navigated rather than celebrated, sometimes a source of tension, and increasingly fraught since 2022.",
    tags:["Culture","Identity","Cross-border"],imageUrl:"https://picsum.photos/seed/wi25/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Sàgá cultural mapping project, 2025",author:"Kristoffer",date:"30.10.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-26",projectId:"kirkenes-study",type:"what-is",
    title:"Landscape over institutions",
    body:"Attachment to place among long-term residents is most consistently expressed through the landscape — the fjord, tundra, light. Attachment to institutions — the municipality, schools, political parties — is far weaker. The land belongs; the institutions are contested.",
    tags:["Identity","Community","Arctic"],imageUrl:"https://picsum.photos/seed/fill118/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Einar",date:"01.11.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-27",projectId:"kirkenes-study",type:"what-is",
    title:"Single-industry economic risk",
    body:"Despite diversification efforts, the economic base remains heavily tied to a few large employers in a small number of sectors. When one contracts — as mining has done repeatedly — the effects ripple widely. There is awareness of this vulnerability but limited structural progress in addressing it.",
    tags:["Economy","Mining","Politics"],imageUrl:"https://picsum.photos/seed/fill119/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Magnus",date:"03.11.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-28",projectId:"kirkenes-study",type:"what-is",
    title:"Small business scale problem",
    body:"The catchment area for a local business is small and shrinking. Entrepreneurs describe difficulty reaching the minimum viable customer base for services that would thrive in a larger city. Regional government is supportive in theory but without effective tools for the specific challenges of peripheral markets.",
    tags:["Economy","Community","Infrastructure"],imageUrl:"https://picsum.photos/seed/fill120/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Lena",date:"04.11.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-29",projectId:"kirkenes-study",type:"what-is",
    title:"Remote workers in the community",
    body:"Post-pandemic normalisation of remote work has brought a small number of people who retain jobs elsewhere while living here. These arrivals often bring different expectations and resources. Their integration into community life is uneven — some are active contributors, others remain peripheral.",
    tags:["Work","Migration","Digital"],imageUrl:"https://picsum.photos/seed/wi29/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"The Coast as a Host — Remote belonging, 2025",author:"Kristoffer",date:"05.11.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-30",projectId:"kirkenes-study",type:"what-is",
    title:"Tourism: seasonal and shallow",
    body:"Visitor numbers have grown, particularly around northern lights season and summer. But this has not translated into year-round economic benefit. Infrastructure strains during peak season and sits underused for much of the rest of the year.",
    tags:["Tourism","Economy","Infrastructure"],imageUrl:"https://picsum.photos/seed/fill121/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Ida",date:"07.11.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-31",projectId:"kirkenes-study",type:"what-is",
    title:"Public transport mismatch",
    body:"Bus routes and schedules were set up to serve mining industry shift patterns. As the nature of work has diversified, transport infrastructure has not adapted. People working in healthcare, retail, and service sectors describe options that do not match their hours or destinations.",
    tags:["Transport","Infrastructure","Work"],imageUrl:"https://picsum.photos/seed/fill122/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Magnus",date:"08.11.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-32",projectId:"kirkenes-study",type:"what-is",
    title:"Uneven broadband coverage",
    body:"Connectivity varies significantly between the town centre and surrounding areas. For remote workers and small businesses outside the main settlement, unreliable internet is a practical barrier. It also affects access to health services, education, and public administration that have moved increasingly online.",
    tags:["Digital","Infrastructure","Work"],imageUrl:"https://picsum.photos/seed/fill123/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Synne",date:"10.11.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-33",projectId:"kirkenes-study",type:"what-is",
    title:"Winter road access",
    body:"Ice, snow, and limited daylight reduce practical mobility for a substantial part of the year. This affects access to services, social connection, and economic activity. The adaptation carries a cost — particularly for those who are elderly, caring for children, or without a reliable vehicle.",
    tags:["Transport","Arctic","Infrastructure"],imageUrl:"https://picsum.photos/seed/fill124/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Einar",date:"11.11.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-34",projectId:"kirkenes-study",type:"what-is",
    title:"The airport's untapped potential",
    body:"The local airport provides the primary fast connection to the rest of Norway and beyond. Residents describe it as underdeveloped relative to its potential — limited routes, high prices, and insufficient capacity at peak times. It is simultaneously indispensable and a consistent source of frustration.",
    tags:["Transport","Infrastructure","Economy"],imageUrl:"https://picsum.photos/seed/wi34/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Lena",date:"12.11.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-35",projectId:"kirkenes-study",type:"what-is",
    title:"Ageing volunteer base",
    body:"A significant proportion of community institution volunteers, board members, and informal leaders are in their 60s and 70s. Younger people are not stepping into these roles at the same rate. The social fabric is structurally thin across sports clubs, cultural organisations, and resident associations.",
    tags:["Elderly","Community","Culture"],imageUrl:"https://picsum.photos/seed/fill125/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Kristoffer",date:"14.11.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-36",projectId:"kirkenes-study",type:"what-is",
    title:"Voluntary infrastructure under strain",
    body:"Social functions — from youth activities to care for isolated elderly residents — are provided by volunteer organisations that are fragile, under-resourced, and dependent on a shrinking pool of committed individuals. If these organisations collapse, the state has no immediate replacement.",
    tags:["Community","Elderly","Healthcare"],imageUrl:"https://picsum.photos/seed/fill126/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Ida",date:"15.11.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-37",projectId:"kirkenes-study",type:"what-is",
    title:"The local newspaper as civic forum",
    body:"In the absence of strong civic institutions or a shared town square, the local paper — print and digital — is where local issues are publicly argued out. It is read broadly and taken seriously. Its health and ownership are questions of democratic infrastructure, not just media economics.",
    tags:["Community","Politics","Culture"],imageUrl:"https://picsum.photos/seed/fill127/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Magnus",date:"17.11.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-38",projectId:"kirkenes-study",type:"what-is",
    title:"Sports clubs across social divides",
    body:"Local sports clubs bring together people who might not otherwise interact — crossing age groups, cultural backgrounds, and social classes. They are among the most active volunteer organisations and one of the few spaces where men are more engaged than women.",
    tags:["Community","Sports","Culture"],imageUrl:"https://picsum.photos/seed/wi38/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Møteplasser fieldwork, 2025",author:"Synne",date:"18.11.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-39",projectId:"kirkenes-study",type:"what-is",
    title:"Cultural events: one-off engagement",
    body:"Major festivals attract good attendance and visible enthusiasm. But the same people who attend a festival do not necessarily join an organisation or return the following month. Engagement is event-based rather than structural, and organisations struggle to convert interest into membership.",
    tags:["Culture","Community","Tourism"],imageUrl:"https://picsum.photos/seed/fill128/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Lena",date:"19.11.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-40",projectId:"kirkenes-study",type:"what-is",
    title:"Higher education requires leaving",
    body:"There is no local provision for degree-level education. Anyone pursuing higher education must leave — for Tromsø, Oslo, or elsewhere. This creates a structural outmigration of the most educated cohort at the critical age of 18–22, with no local institution to anchor a graduate population.",
    tags:["Education","Youth","Migration"],imageUrl:"https://picsum.photos/seed/fill129/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Einar",date:"21.11.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-41",projectId:"kirkenes-study",type:"what-is",
    title:"Vocational training as second tier",
    body:"Despite significant labour market demand for skilled trades, vocational pathways are described by students, parents, and teachers as a fall-back rather than a first choice. This perception affects both the quality of students entering these programmes and the prestige attached to skilled trade work.",
    tags:["Education","Work","Youth"],imageUrl:"https://picsum.photos/seed/fill130/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Kristoffer",date:"22.11.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-42",projectId:"kirkenes-study",type:"what-is",
    title:"Teachers and the weight of context",
    body:"Educators report that the structural conditions of the region — visible decline, outmigration of peers, limited professional role models — make it hard to sustain young people's belief that a good life is possible here. This is not about teaching quality but about the weight of context.",
    tags:["Education","Youth","Community"],imageUrl:"https://picsum.photos/seed/fill131/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Ida",date:"24.11.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-43",projectId:"kirkenes-study",type:"what-is",
    title:"Climate and outdoor identity",
    body:"Residents who have lived here for decades describe experiential changes in snow cover, ice conditions, and seasonal patterns. These changes matter not just ecologically but culturally — the outdoor life that defines belonging to this place is becoming less predictable and less available.",
    tags:["Climate","Identity","Arctic"],imageUrl:"https://picsum.photos/seed/wi43/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Coastal Development 2025 — environmental framing",author:"Magnus",date:"25.11.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-44",projectId:"kirkenes-study",type:"what-is",
    title:"Snow-scooter culture under pressure",
    body:"The snow-scooter is a significant practical and cultural tool — used for outdoor access, leisure, and social connection. Growing regulatory pressure and environmental change affecting trail quality are experienced as an infringement on a core part of local life, not a minor inconvenience.",
    tags:["Culture","Climate","Arctic"],imageUrl:"https://picsum.photos/seed/fill132/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Synne",date:"27.11.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-45",projectId:"kirkenes-study",type:"what-is",
    title:"The fjord as underused resource",
    body:"The fjord sits at the centre of the landscape but is not systematically integrated into daily economic or community life. Tourism, fishing, and recreation all have footholds but none are fully developed. Multiple residents describe the fjord as something the community has not yet learned to use on its own terms.",
    tags:["Economy","Community","Arctic"],imageUrl:"https://picsum.photos/seed/fill133/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Einar",date:"28.11.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-46",projectId:"kirkenes-study",type:"what-is",
    title:"Russian language disappearing",
    body:"In previous decades, Russian was a regular presence in the town — in shops, on the street, in social settings. This has largely disappeared since 2022. For long-term residents, the silence is an audible marker of how much has changed that is not captured in economic statistics.",
    tags:["Language","Cross-border","Identity"],imageUrl:"https://picsum.photos/seed/fill134/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Lena",date:"01.12.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-47",projectId:"kirkenes-study",type:"what-is",
    title:"Sami language revival",
    body:"Formal programmes support Sami language learning and use. But the number of fluent speakers is small, intergenerational transmission is uncertain, and everyday social spaces where the language lives are limited. Policy support has not yet translated into a community that sustains the language naturally.",
    tags:["Language","Sami","Culture"],imageUrl:"https://picsum.photos/seed/wi47/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Sàgá cultural mapping project, 2025",author:"Kristoffer",date:"02.12.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-48",projectId:"kirkenes-study",type:"what-is",
    title:"Linguistic diversity and social anxiety",
    body:"The town's multilingual character — Norwegian, Russian, Sami, and several migrant languages — was previously experienced as enriching. Since 2022, the Russian dimension has become politically fraught. Some residents describe a narrowing of what kind of diversity feels comfortable in public life.",
    tags:["Language","Identity","Community"],imageUrl:"https://picsum.photos/seed/fill135/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Ida",date:"04.12.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-49",projectId:"kirkenes-study",type:"what-is",
    title:"Gender gap in migration",
    body:"Women leave at significantly higher rates than men. This creates a demographic skew that compounds: the community loses women's professional contributions, and men face a narrowed social environment. The effects on social cohesion and family formation are substantial and long-term.",
    tags:["Gender","Migration","Community"],imageUrl:"https://picsum.photos/seed/fill136/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Magnus",date:"05.12.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-50",projectId:"kirkenes-study",type:"what-is",
    title:"Employment and gender",
    body:"Sectors that dominate local employment — extractive industry, construction, heavy logistics — skew heavily male. Sectors where more women work — healthcare, education, social services — offer fewer senior roles and have been subject to cuts. This structural mismatch is a key driver of the gender migration gap.",
    tags:["Work","Gender","Economy"],imageUrl:"https://picsum.photos/seed/wi50/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Kystutvikling 2025 — gender and labour",author:"Synne",date:"06.12.2025",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-51",projectId:"kirkenes-study",type:"what-is",
    title:"Military presence in the community",
    body:"The military garrison employs several hundred people and houses rotating families, yet civilian and military social circles rarely overlap. The garrison is largely invisible in community discourse despite its scale. Its infrastructure and networks represent an untapped resource for the wider community.",
    tags:["Community","Infrastructure","Identity"],imageUrl:"https://picsum.photos/seed/wi51/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"The Coast as a Host, 2025 — Grip project",author:"Kristoffer",date:"01.03.2026",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-52",projectId:"kirkenes-study",type:"what-is",
    title:"Dugnad culture under strain",
    body:"The tradition of collective voluntary work remains active but is under strain. A small number of people carry a disproportionate share of voluntary effort, and this group is ageing. Younger residents often cite lack of time or lack of invitation when asked about participation.",
    tags:["Community","Culture","Elderly"],imageUrl:"https://picsum.photos/seed/fill137/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Møteplasser — Dugnadsånd_Varanger concept",author:"Synne",date:"02.03.2026",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-53",projectId:"kirkenes-study",type:"what-is",
    title:"Entering established social networks",
    body:"People who move to the region for work describe the social landscape as friendly but already full. Long-established friendships and family networks dominate, and casual entry points are fewer here. Several newcomers describe a year or more before feeling genuinely connected.",
    tags:["Migration","Community","Housing"],imageUrl:"https://picsum.photos/seed/wi53/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"The Coast as a Host fieldwork, 2025",author:"Lena",date:"03.03.2026",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-54",projectId:"kirkenes-study",type:"what-is",
    title:"Seasonal workers passing through",
    body:"Several industries rely on seasonal workers who arrive for months at a time. These workers contribute economically but rarely participate in community life — they socialise within their own temporary group and leave without forming local connections. Their presence is economically visible but socially thin.",
    tags:["Work","Migration","Community"],imageUrl:"https://picsum.photos/seed/fill138/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Magnus",date:"05.03.2026",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-55",projectId:"kirkenes-study",type:"what-is",
    title:"Thin organising base for culture",
    body:"Concerts, exhibitions, and community events tend to be organised by the same small group of people, working across multiple organisations. Events are well attended — appetite is visible — but the infrastructure to sustain them is very thin and the organiser core is not being renewed.",
    tags:["Culture","Community","Elderly"],imageUrl:"https://picsum.photos/seed/wi55/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Kystutvikling 2025, cultural mapping",author:"Ida",date:"07.03.2026",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-56",projectId:"kirkenes-study",type:"what-is",
    title:"Fishing: livelihood vs identity",
    body:"The fishing industry has contracted significantly — fewer boats, fewer families dependent on it, stricter quotas. At the same time, fishing as an activity and identity marker has grown in cultural significance. The imagery of the fishing boat is more prominent in how the region presents itself than the economic realities suggest.",
    tags:["Economy","Culture","Identity"],imageUrl:"https://picsum.photos/seed/fill139/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Einar",date:"09.03.2026",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-57",projectId:"kirkenes-study",type:"what-is",
    title:"Harbour potential",
    body:"The working harbour is a significant industrial asset, but the surrounding area is underdeveloped in public terms. Waterfront areas that could serve as promenades or gathering points are either inaccessible or purely functional. Residents rarely describe the harbour as a place they go for its own sake.",
    tags:["Infrastructure","Economy","Community"],imageUrl:"https://picsum.photos/seed/wi57/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Sàgá cultural mapping project, 2025",author:"Kristoffer",date:"10.03.2026",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-58",projectId:"kirkenes-study",type:"what-is",
    title:"Entrepreneurship barriers",
    body:"Business support services exist but are generic and distant — designed for a national audience, not calibrated to starting something in a small peripheral market. The combination of small customer base, limited professional networks, and scarce physical workspace makes entrepreneurship unusually difficult here.",
    tags:["Economy","Work","Infrastructure"],imageUrl:"https://picsum.photos/seed/fill140/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Coastal Development — Initiativsonen concept",author:"Synne",date:"12.03.2026",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-59",projectId:"kirkenes-study",type:"what-is",
    title:"Creative industries: informal and precarious",
    body:"A small creative sector — photographers, designers, artists, filmmakers, musicians — exists here, but largely in isolation. Several describe creative income as supplementary not because the work lacks quality but because the conditions for making it economically viable do not exist locally.",
    tags:["Economy","Culture","Work"],imageUrl:"https://picsum.photos/seed/wi59/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Make making work work, Design for Coastal Development 2025",author:"Lena",date:"14.03.2026",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-60",projectId:"kirkenes-study",type:"what-is",
    title:"Remote workers and local assumptions",
    body:"People who moved here from urban centres bring different reference points — for what services should be available, what public space should feel like. These expectations are sometimes a source of friction, but also a form of pressure that long-term residents describe as occasionally useful for surfacing things they had stopped noticing.",
    tags:["Work","Migration","Community"],imageUrl:"https://picsum.photos/seed/fill141/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"The Coast as a Host — Remote belonging project",author:"Magnus",date:"16.03.2026",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-61",projectId:"kirkenes-study",type:"what-is",
    title:"Military families rotating through",
    body:"Military postings last two to four years and families know from the start they will leave. This shapes how much social investment people make. Civilian residents describe military families as friendly but 'passing through'; military partners describe feeling welcome but not quite belonging.",
    tags:["Community","Identity","Migration"],imageUrl:"https://picsum.photos/seed/wi61/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Grip project — The Coast as a Host, 2025",author:"Ida",date:"18.03.2026",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-62",projectId:"kirkenes-study",type:"what-is",
    title:"The Arctic winter as social event",
    body:"The dark, cold months are described ambivalently — difficult and isolating on one hand, a source of community solidarity on the other. Residents who have lived elsewhere describe missing the intensity of the Arctic winter. This quality is largely invisible in how the region is promoted externally.",
    tags:["Arctic","Community","Identity"],imageUrl:"https://picsum.photos/seed/fill142/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Einar",date:"20.03.2026",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-63",projectId:"kirkenes-study",type:"what-is",
    title:"Planning documents and lived reality",
    body:"Municipal and regional plans contain ambitious visions for growth, diversification, and innovation that residents describe as disconnected from lived reality. Plans are produced but not implemented; goals are restated without accounting for what prevented previous goals from being met.",
    tags:["Politics","Infrastructure","Community"],imageUrl:"https://picsum.photos/seed/wi63/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Kystutvikling 2025 policy analysis",author:"Kristoffer",date:"22.03.2026",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-64",projectId:"kirkenes-study",type:"what-is",
    title:"Cultural mediators and diplomats",
    body:"A small number of individuals — often with bilingual or bicultural backgrounds — play a disproportionately large role in mediating between communities, between locals and visitors, and between the region and external institutions. These roles are rarely formal or paid, and their centrality only becomes visible when the person leaves.",
    tags:["Identity","Culture","Community"],imageUrl:"https://picsum.photos/seed/fill143/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Sàgá project, Design for Kystutvikling 2025",author:"Synne",date:"24.03.2026",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-65",projectId:"kirkenes-study",type:"what-is",
    title:"Shopping centre as town square",
    body:"In the absence of a strong traditional town centre, the indoor shopping mall serves as the primary place where residents of different ages and backgrounds encounter each other without specific purpose. It is warm in winter, accessible, and functions socially even for people who are not shopping.",
    tags:["Infrastructure","Community","Youth"],imageUrl:"https://picsum.photos/seed/wi65/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Knutepunktet project, Design for Møteplasser 2025",author:"Lena",date:"26.03.2026",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-66",projectId:"kirkenes-study",type:"what-is",
    title:"Research fatigue",
    body:"The region has been studied by universities, policy institutes, and design schools for decades. Residents describe a pattern: researchers arrive, ask questions, produce reports, and leave. There is genuine warmth toward researchers but also scepticism about whether the next study will make any difference.",
    tags:["Community","Politics","Research"],imageUrl:"https://picsum.photos/seed/fill144/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"The Coast as a Host, 2025 — researcher positionality",author:"Einar",date:"28.03.2026",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-67",projectId:"kirkenes-study",type:"what-is",
    title:"Local knowledge: undocumented",
    body:"Knowledge about the landscape, community history, and practical skills accumulated over generations is held in individuals rather than institutions. When those individuals die or move away, the knowledge goes with them. Nothing formal exists to capture this before it is gone.",
    tags:["Culture","Elderly","Identity"],imageUrl:"https://picsum.photos/seed/wi67/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Sàgá cultural mapping project, 2025",author:"Ida",date:"30.03.2026",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-68",projectId:"kirkenes-study",type:"what-is",
    title:"Women's informal care networks",
    body:"Women — particularly those in their 40s and 50s — describe running informal networks of care: checking on elderly neighbours, coordinating childcare exchanges, facilitating access to services for those who can't navigate systems alone. This work is invisible in economic accounts but load-bearing for the community.",
    tags:["Gender","Community","Healthcare"],imageUrl:"https://picsum.photos/seed/fill145/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Ida",date:"01.04.2026",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-69",projectId:"kirkenes-study",type:"what-is",
    title:"Landscape knowledge being lost",
    body:"Older residents possess detailed knowledge of the Arctic environment — where ice is safe, how weather patterns have shifted, which trails are passable in which seasons. This knowledge is not recorded. As this generation ages and climate change alters conditions, the knowledge is becoming both more valuable and less transmissible.",
    tags:["Arctic","Elderly","Climate"],imageUrl:"https://picsum.photos/seed/wi69/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Sàgá project fieldwork, 2025",author:"Magnus",date:"03.04.2026",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-70",projectId:"kirkenes-study",type:"what-is",
    title:"Digital literacy divide",
    body:"The shift of public services to digital platforms has created a new accessibility barrier. Older residents and some recent migrants describe difficulty navigating systems that assume a level of digital fluency they don't have. The gap is growing and not being actively addressed.",
    tags:["Digital","Elderly","Infrastructure"],imageUrl:"https://picsum.photos/seed/fill146/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Kystutvikling 2025 digital infrastructure",author:"Synne",date:"05.04.2026",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-71",projectId:"kirkenes-study",type:"what-is",
    title:"The fishing boat as social space",
    body:"Boat ownership and access remains widespread, and going out on the water is a regular social activity that crosses age and class lines in ways few other activities do. Conversations on boats are described as uniquely candid. It is a space outside the usual social hierarchies of the community.",
    tags:["Community","Culture","Arctic"],imageUrl:"https://picsum.photos/seed/wi71/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Einar",date:"07.04.2026",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-72",projectId:"kirkenes-study",type:"what-is",
    title:"Community garden connections",
    body:"A small community garden initiative created connections between participants that organisers describe as surprising — between age groups, between Norwegians and migrants, between people who had lived side by side for years without speaking. The initiative is chronically underfunded and at risk of closing.",
    tags:["Community","Culture","Migration"],imageUrl:"https://picsum.photos/seed/fill147/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Heija Varanger initiative, 2025",author:"Lena",date:"09.04.2026",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-73",projectId:"kirkenes-study",type:"what-is",
    title:"The school as meeting place",
    body:"The school and its surrounding activities — pick-up, parent evenings, sports events — is one of the few spaces where people of different generations reliably encounter each other. Teachers describe the school as the community's social infrastructure as much as its educational one. When schools merge or close, this function disappears too.",
    tags:["Education","Community","Youth"],imageUrl:"https://picsum.photos/seed/wi73/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Møteplasser, 2025",author:"Kristoffer",date:"11.04.2026",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-74",projectId:"kirkenes-study",type:"what-is",
    title:"Missing professional peer networks",
    body:"People in professional roles describe a lack of local peers to think with. The cross-sector professional exchange that happens naturally in cities through informal encounters is largely absent here. Professional development, when it happens, requires travelling to seminars elsewhere.",
    tags:["Work","Community","Economy"],imageUrl:"https://picsum.photos/seed/fill148/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Synne",date:"13.04.2026",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-75",projectId:"kirkenes-study",type:"what-is",
    title:"The culture of making do",
    body:"Residents describe a practical resourcefulness — fixing things themselves, using networks of favours, adapting solutions from elsewhere — that they see as characteristic of the region. The same quality can make people reluctant to demand better from systems that could be improved.",
    tags:["Culture","Identity","Community"],imageUrl:"https://picsum.photos/seed/wi75/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"The Coast as a Host — Remote belonging, 2025",author:"Lena",date:"15.04.2026",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-76",projectId:"kirkenes-study",type:"what-is",
    title:"Local food as identity and economy",
    body:"There is growing interest in local food products — reindeer meat, arctic char, cloudberries, wild herbs — among residents and in the tourism market. A small number of producers and restaurants are working with this but without the processing infrastructure, distribution networks, or brand identity to build it into a coherent sector.",
    tags:["Economy","Culture","Tourism"],imageUrl:"https://picsum.photos/seed/fill149/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Heija Varanger concept, Design for Møteplasser 2025",author:"Magnus",date:"17.04.2026",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-77",projectId:"kirkenes-study",type:"what-is",
    title:"New residents, unused skills",
    body:"Several people who have moved from elsewhere describe having skills — in design, technology, finance, cultural production — that they cannot deploy locally. There are no obvious channels through which these capacities connect to local needs. The mismatch is a quiet loss on both sides.",
    tags:["Migration","Work","Community"],imageUrl:"https://picsum.photos/seed/wi77/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Ida",date:"19.04.2026",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-78",projectId:"kirkenes-study",type:"what-is",
    title:"Deferred housing maintenance",
    body:"Many residential buildings — particularly older mining-era stock — require significant maintenance that is not happening. Owners cite cost, difficulty finding local contractors, and uncertainty about long-term investment value in a town whose population may shrink. The cumulative effect is a deteriorating housing stock.",
    tags:["Housing","Economy","Infrastructure"],imageUrl:"https://picsum.photos/seed/fill150/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Einar",date:"21.04.2026",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-79",projectId:"kirkenes-study",type:"what-is",
    title:"Porous public and private life",
    body:"In a town where everyone knows each other, information and opinion move fast. Privacy is limited in ways experienced as warm (community support) and stifling (gossip, social pressure, resistance to unconventional choices). Young people cite the social visibility of small-community life as a factor in their desire to leave.",
    tags:["Community","Identity","Youth"],imageUrl:"https://picsum.photos/seed/wi79/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"The Coast as a Host — Remote belonging",author:"Kristoffer",date:"23.04.2026",linkedInsightIds:[],annotations:[]
  },
  {
    id:"s-wi-80",projectId:"kirkenes-study",type:"what-is",
    title:"Leaving as a rational choice",
    body:"The cultural conversation around outmigration has shifted. Previously described as a source of community concern, it is increasingly accepted — by leavers and stayers alike — as a logical response to structural conditions. This normalisation has reduced both the guilt associated with leaving and the social pressure to stay.",
    tags:["Migration","Youth","Identity"],imageUrl:"https://picsum.photos/seed/fill151/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Kystutvikling 2025 — outmigration analysis",author:"Synne",date:"25.04.2026",linkedInsightIds:[],annotations:[]
  },

  // ── What If? ──────────────────────────────────────────────────────────────

  {
    id:"s-wif-01",projectId:"kirkenes-study",type:"what-if",
    title:"Return grants for former residents",
    body:"What if the municipality offered a financial incentive for former residents to return? The design matters enormously: a grant tied to staying for three years and contributing to a community organisation might work differently from a simple cash payment. Several peripheral regions in Europe have trialled variants of this.",
    tags:["Migration","Youth","Economy"],imageUrl:"https://picsum.photos/seed/wif01/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Kystutvikling 2025 — outmigration strategies",author:"Lena",date:"10.12.2025",
    linkedInsightIds:["s-wi-01","s-wi-02"],annotations:[]
  },
  {
    id:"s-wif-02",projectId:"kirkenes-study",type:"what-if",
    title:"Civic roles for young women",
    body:"What if a new role were created — something between community leadership and professional development — that offered young women a reason to stay that simply didn't exist before? This might be funded by the municipality, a foundation, or the regional development authority.",
    tags:["Youth","Gender","Community"],imageUrl:"https://picsum.photos/seed/fill152/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Ida",date:"11.12.2025",
    linkedInsightIds:["s-wi-03"],annotations:[]
  },
  {
    id:"s-wif-03",projectId:"kirkenes-study",type:"what-if",
    title:"Airport as remote work hub",
    body:"What if the airport anchored a broader offer to mobile professionals — fast connectivity, co-working infrastructure, short-term accommodation, childcare? A cluster of remote workers who have chosen the region could become a new kind of economic actor and a bridge between the community and the wider world.",
    tags:["Work","Digital","Economy"],imageUrl:"https://picsum.photos/seed/fill153/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Kristoffer",date:"12.12.2025",
    linkedInsightIds:["s-wi-29","s-wi-34"],annotations:[]
  },
  {
    id:"s-wif-04",projectId:"kirkenes-study",type:"what-if",
    title:"Digital cross-border exchange",
    body:"What if some of what was lost when the physical border closed could be rebuilt through digital platforms — enabling Russian and Norwegian small businesses to maintain economic relationships without physical crossing? This would require diplomatic creativity but may be technically possible before political conditions change.",
    tags:["Cross-border","Digital","Economy"],imageUrl:"https://picsum.photos/seed/wif04/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Coastal Development 2025 — border economy",author:"Einar",date:"15.12.2025",
    linkedInsightIds:["s-wi-06","s-wi-08"],annotations:[]
  },
  {
    id:"s-wif-05",projectId:"kirkenes-study",type:"what-if",
    title:"Community budget control",
    body:"What if communities in peripheral regions could allocate a percentage of national infrastructure budgets directly, bypassing centralised planning cycles? Local knowledge and lived priorities would shape where investment goes, and accountability would be local rather than administrative.",
    tags:["Politics","Infrastructure","Community"],imageUrl:"https://picsum.photos/seed/fill154/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Synne",date:"16.12.2025",
    linkedInsightIds:["s-wi-14","s-wi-15"],annotations:[]
  },
  {
    id:"s-wif-06",projectId:"kirkenes-study",type:"what-if",
    title:"Mining housing repurposed",
    body:"What if the large-footprint buildings from the mining era were converted into workshops, studios, maker spaces, and affordable live-work units? This could retain the built heritage while addressing needs for space that is neither expensive nor purely residential.",
    tags:["Housing","Mining","Economy"],imageUrl:"https://picsum.photos/seed/fill155/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Magnus",date:"17.12.2025",
    linkedInsightIds:["s-wi-21","s-wi-18"],annotations:[]
  },
  {
    id:"s-wif-07",projectId:"kirkenes-study",type:"what-if",
    title:"Distributed healthcare model",
    body:"What if the energy went into designing a distributed care model rather than fighting to restore a centralised hospital — specialist teleconsultation, local diagnosis hubs, and a mobile specialist team rotating through the region? This might provide better actual coverage than a single building.",
    tags:["Healthcare","Infrastructure","Digital"],imageUrl:"https://picsum.photos/seed/fill156/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Lena",date:"18.12.2025",
    linkedInsightIds:["s-wi-10","s-wi-13"],annotations:[]
  },
  {
    id:"s-wif-08",projectId:"kirkenes-study",type:"what-if",
    title:"Community-owned fjord programme",
    body:"What if a cooperative structure ran boat access, harbour infrastructure, and water-based recreation — owned and governed by the people who use it? The fishing industry has historical models for this kind of cooperative structure that could be adapted to a broader community purpose.",
    tags:["Community","Economy","Arctic"],imageUrl:"https://picsum.photos/seed/wif08/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Coastal Development 2025 — maritime economy",author:"Kristoffer",date:"19.12.2025",
    linkedInsightIds:["s-wi-45"],annotations:[]
  },
  {
    id:"s-wif-09",projectId:"kirkenes-study",type:"what-if",
    title:"Healthcare as living laboratory",
    body:"What if the region's distance from centralised health infrastructure were positioned as an asset — a living laboratory for the healthcare challenges facing northern Europe, funded as such by national health authorities? Rather than a deficit to be fixed, it becomes a context to be designed for.",
    tags:["Healthcare","Innovation","Politics"],imageUrl:"https://picsum.photos/seed/fill157/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Ida",date:"05.01.2026",
    linkedInsightIds:["s-wi-10","s-wi-12"],annotations:[]
  },
  {
    id:"s-wif-10",projectId:"kirkenes-study",type:"what-if",
    title:"Intergenerational mentorship",
    body:"What if older residents with deep local knowledge were paired with younger people deciding whether to stay? The design would matter: it would need to create genuine relationships, not formal meetings. It could address both the succession gap in community organisations and young people's sense that no path exists for them here.",
    tags:["Community","Youth","Elderly"],imageUrl:"https://picsum.photos/seed/fill158/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Magnus",date:"06.01.2026",
    linkedInsightIds:["s-wi-35","s-wi-04"],annotations:[]
  },
  {
    id:"s-wif-11",projectId:"kirkenes-study",type:"what-if",
    title:"Local history in curriculum",
    body:"What if school curriculum included compulsory local history and civic participation? This is not nostalgia education — it is the applied study of how decisions are made, who makes them, and how young people could actually influence them. Grounding students in specific local conditions might build both competence and a different kind of attachment to place.",
    tags:["Education","Politics","Youth"],imageUrl:"https://picsum.photos/seed/fill159/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Synne",date:"08.01.2026",
    linkedInsightIds:["s-wi-04","s-wi-16"],annotations:[]
  },
  {
    id:"s-wif-12",projectId:"kirkenes-study",type:"what-if",
    title:"Remote workers in community life",
    body:"What if new remote workers were matched with local organisations as part of a formal welcome programme? The match would be based on professional skills and personal interests. This could help new arrivals integrate while contributing something they are capable of giving.",
    tags:["Work","Community","Migration"],imageUrl:"https://picsum.photos/seed/wif12/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"The Coast as a Host — Remote belonging, 2025",author:"Einar",date:"09.01.2026",
    linkedInsightIds:["s-wi-29","s-wi-36"],annotations:[]
  },
  {
    id:"s-wif-13",projectId:"kirkenes-study",type:"what-if",
    title:"Resident sortition in local council",
    body:"What if a portion of local council seats were filled by citizen sortition — random selection of citizens in the manner of a jury? It would bring in people who would never stand for election, including young people, recent arrivals, and those who distrust existing parties.",
    tags:["Politics","Community","Youth"],imageUrl:"https://picsum.photos/seed/fill160/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Lena",date:"12.01.2026",
    linkedInsightIds:["s-wi-14","s-wi-16"],annotations:[]
  },
  {
    id:"s-wif-14",projectId:"kirkenes-study",type:"what-if",
    title:"Town centre cooperative",
    body:"What if a resident-owned cooperative took over vacant commercial space in the town centre and managed it for mixed community and commercial use? This could arrest decline and ensure the centre served residents rather than the speculative property market.",
    tags:["Economy","Community","Housing"],imageUrl:"https://picsum.photos/seed/fill161/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Ida",date:"13.01.2026",
    linkedInsightIds:["s-wi-27","s-wi-28"],annotations:[]
  },
  {
    id:"s-wif-15",projectId:"kirkenes-study",type:"what-if",
    title:"Community land trust",
    body:"What if the municipality established a community land trust — holding land in perpetuity and making housing permanently affordable by separating land ownership from building ownership? This could provide affordable homes that do not depend on continuous public subsidy.",
    tags:["Housing","Community","Economy"],imageUrl:"https://picsum.photos/seed/fill162/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Kristoffer",date:"14.01.2026",
    linkedInsightIds:["s-wi-18","s-wi-20"],annotations:[]
  },
  {
    id:"s-wif-16",projectId:"kirkenes-study",type:"what-if",
    title:"Stipend for volunteer roles",
    body:"What if significant volunteer community roles carried a living stipend? Formalising the economic contribution of volunteering could make it possible for people who cannot afford to volunteer to do so. This could widen participation and address the succession crisis in community organisations simultaneously.",
    tags:["Community","Economy","Elderly"],imageUrl:"https://picsum.photos/seed/wif16/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Magnus",date:"16.01.2026",
    linkedInsightIds:["s-wi-36","s-wi-35"],annotations:[]
  },
  {
    id:"s-wif-17",projectId:"kirkenes-study",type:"what-if",
    title:"Barents cultural passport",
    body:"What if there were a credential giving holders access to cultural institutions, events, and community activities across the Norwegian, Russian, and Finnish parts of the Barents region — regardless of physical border status? The political conditions would need to exist; the concept and infrastructure are worth designing now.",
    tags:["Culture","Cross-border","Identity"],imageUrl:"https://picsum.photos/seed/fill163/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Synne",date:"17.01.2026",
    linkedInsightIds:["s-wi-09","s-wi-07"],annotations:[]
  },
  {
    id:"s-wif-18",projectId:"kirkenes-study",type:"what-if",
    title:"Snow-scooter commons",
    body:"What if snow-scooter trails were formally constituted as a commons — with user governance, maintenance responsibilities, and access rules designed by the people who use them? This is a documented model in other Nordic natural resource management contexts.",
    tags:["Culture","Arctic","Community"],imageUrl:"https://picsum.photos/seed/fill164/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Einar",date:"20.01.2026",
    linkedInsightIds:["s-wi-44"],annotations:[]
  },
  {
    id:"s-wif-19",projectId:"kirkenes-study",type:"what-if",
    title:"Arctic micro-university",
    body:"What if the region had a small, intensive higher education institution focused specifically on the Arctic — ecology, governance, culture, engineering? It could anchor a graduate population, generate research relevant to local challenges, and attract students from across the circumpolar world. It would not need to be large to be significant.",
    tags:["Education","Arctic","Economy"],imageUrl:"https://picsum.photos/seed/wif19/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Lena",date:"21.01.2026",
    linkedInsightIds:["s-wi-40","s-wi-01"],annotations:[]
  },
  {
    id:"s-wif-20",projectId:"kirkenes-study",type:"what-if",
    title:"Dual Sami place names",
    body:"What if Sami place names were reinstated everywhere alongside Norwegian ones — on road signs, maps, public buildings, and official documents? Full dual naming would make Sami presence legible in everyday public space rather than confined to cultural events or policy documents.",
    tags:["Sami","Language","Culture"],imageUrl:"https://picsum.photos/seed/fill165/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Ida",date:"22.01.2026",
    linkedInsightIds:["s-wi-24","s-wi-47"],annotations:[]
  },
  {
    id:"s-wif-21",projectId:"kirkenes-study",type:"what-if",
    title:"Citizens' assembly for budget",
    body:"What if a randomly selected assembly of residents — representative of the full population — were given real decision-making authority over a meaningful share of the annual budget? It would bring in perspectives systematically absent from formal political processes, including young people and recent arrivals.",
    tags:["Politics","Community","Economy"],imageUrl:"https://picsum.photos/seed/fill166/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Kristoffer",date:"26.01.2026",
    linkedInsightIds:["s-wi-14","s-wi-17"],annotations:[]
  },
  {
    id:"s-wif-22",projectId:"kirkenes-study",type:"what-if",
    title:"Community-owned newspaper",
    body:"What if the local paper were converted to cooperative ownership — with readers, journalists, and community organisations as members? This model has worked in several Scandinavian media contexts and protects editorial independence without requiring public subsidy.",
    tags:["Community","Culture","Politics"],imageUrl:"https://picsum.photos/seed/fill167/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Magnus",date:"27.01.2026",
    linkedInsightIds:["s-wi-37"],annotations:[]
  },
  {
    id:"s-wif-23",projectId:"kirkenes-study",type:"what-if",
    title:"Welcome package for newcomers",
    body:"What if there were a formal welcome scheme — subsidised housing assistance, introductions to community organisations, a social integration programme? Rather than leaving newcomers to navigate alone, a structured offer could increase the chances that people who move in stay and contribute over time.",
    tags:["Migration","Community","Housing"],imageUrl:"https://picsum.photos/seed/wif23/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Synne",date:"29.01.2026",
    linkedInsightIds:["s-wi-20","s-wi-29"],annotations:[]
  },
  {
    id:"s-wif-24",projectId:"kirkenes-study",type:"what-if",
    title:"Year-round weekly market",
    body:"What if there were a regular weekly market — for local food, craft, and services — that created a social ritual around the town centre? It would provide a platform for small producers and give residents a consistent reason to be in the centre every week.",
    tags:["Economy","Community","Culture"],imageUrl:"https://picsum.photos/seed/fill168/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Einar",date:"03.02.2026",
    linkedInsightIds:["s-wi-30","s-wi-39"],annotations:[]
  },
  {
    id:"s-wif-25",projectId:"kirkenes-study",type:"what-if",
    title:"Broadband as public right",
    body:"What if a legal right to a minimum broadband connection were established — enforceable by the municipality and funded by the state — as electricity access became in an earlier era? This would close the urban-rural digital gap in a single policy move rather than incrementally.",
    tags:["Digital","Infrastructure","Politics"],imageUrl:"https://picsum.photos/seed/fill169/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Lena",date:"05.02.2026",
    linkedInsightIds:["s-wi-32"],annotations:[]
  },
  {
    id:"s-wif-26",projectId:"kirkenes-study",type:"what-if",
    title:"Youth council binding vote",
    body:"What if one specific budget allocation — perhaps relating to public space, education, or culture — were genuinely decided by the youth council each year? This would transform both the educational value and the actual political stakes of participation, moving from consultation to real power.",
    tags:["Youth","Politics","Community"],imageUrl:"https://picsum.photos/seed/fill170/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Ida",date:"09.02.2026",
    linkedInsightIds:["s-wi-16","s-wi-04"],annotations:[]
  },
  {
    id:"s-wif-27",projectId:"kirkenes-study",type:"what-if",
    title:"Nature with legal standing",
    body:"What if the Arctic landscape around Kirkenes had legal personhood — the way rivers and forests have been granted standing in several countries? This could change the terms of development decisions, tourism infrastructure, and resource extraction in ways that current environmental law does not support.",
    tags:["Arctic","Climate","Politics"],imageUrl:"https://picsum.photos/seed/wif27/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Kristoffer",date:"12.02.2026",
    linkedInsightIds:["s-wi-43","s-wi-26"],annotations:[]
  },
  {
    id:"s-wif-28",projectId:"kirkenes-study",type:"what-if",
    title:"Tourism levy for community",
    body:"What if a small levy on visitor accommodation were collected automatically and directed to a community fund governed by resident organisations? This could create a direct link between visitor income and community benefit, and give organisations a stake in tourism's success.",
    tags:["Tourism","Community","Economy"],imageUrl:"https://picsum.photos/seed/fill171/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Magnus",date:"16.02.2026",
    linkedInsightIds:["s-wi-30","s-wi-36"],annotations:[]
  },
  {
    id:"s-wif-29",projectId:"kirkenes-study",type:"what-if",
    title:"Russian cultural institution",
    body:"What if there were a formally recognised community centre for the Russian-speaking population — with space for language classes, cultural events, archiving of cross-border history, and social gatherings? This would acknowledge their presence and provide institutional protection in a context where their belonging has been called into question.",
    tags:["Identity","Culture","Cross-border"],imageUrl:"https://picsum.photos/seed/fill172/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Synne",date:"20.02.2026",
    linkedInsightIds:["s-wi-07","s-wi-48"],annotations:[]
  },
  {
    id:"s-wif-30",projectId:"kirkenes-study",type:"what-if",
    title:"Mental health in community spaces",
    body:"What if some forms of psychological support were moved out of formal healthcare settings and into trusted community spaces — sports clubs, community centres, libraries? This is not a replacement for clinical care but an addition to it, meeting people where they already are.",
    tags:["Healthcare","Community","Youth"],imageUrl:"https://picsum.photos/seed/wif30/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Møteplasser, 2025",author:"Einar",date:"24.02.2026",
    linkedInsightIds:["s-wi-12","s-wi-36"],annotations:[]
  },
  {
    id:"s-wif-31",projectId:"kirkenes-study",type:"what-if",
    title:"Military-civilian shared infrastructure",
    body:"What if the garrison's sports hall, canteen, and event spaces were opened to community use on a managed basis? This could supplement the limited civilian leisure infrastructure while building social connections that currently don't form between military and civilian residents. The Grip project found genuine interest on both sides.",
    tags:["Community","Infrastructure","Identity"],imageUrl:"https://picsum.photos/seed/wif31/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"The Coast as a Host — Grip project, 2025",author:"Kristoffer",date:"26.04.2026",
    linkedInsightIds:["s-wi-51","s-wi-61"],annotations:[]
  },
  {
    id:"s-wif-32",projectId:"kirkenes-study",type:"what-if",
    title:"Mapping the dugnad economy",
    body:"What if voluntary community work were formally mapped and modestly resourced as public infrastructure? Dugnad currently appears in no budget, is tracked in no system, and receives no institutional support. A mapping followed by investment in coordination and recognition could significantly extend the system before it collapses.",
    tags:["Community","Culture","Economy"],imageUrl:"https://picsum.photos/seed/fill173/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Dugnadsånd_Varanger concept, Design for Møteplasser 2025",author:"Synne",date:"27.04.2026",
    linkedInsightIds:["s-wi-52","s-wi-36"],annotations:[]
  },
  {
    id:"s-wif-33",projectId:"kirkenes-study",type:"what-if",
    title:"Harbour as public waterfront",
    body:"What if there were a deliberate programme of public waterfront development — walkways, seating, event infrastructure, food and drink — alongside the working harbour? Several Nordic harbour-towns have done this without displacing industrial function. The key design challenge is sharing space across very different users.",
    tags:["Infrastructure","Community","Economy"],imageUrl:"https://picsum.photos/seed/wif33/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Sàgá project, Heija Varanger concept",author:"Lena",date:"28.04.2026",
    linkedInsightIds:["s-wi-57","s-wi-45"],annotations:[]
  },
  {
    id:"s-wif-34",projectId:"kirkenes-study",type:"what-if",
    title:"Welcome for seasonal workers",
    body:"What if there were a coordinated onboarding programme for seasonal workers — matched to community organisations, offered local knowledge and social connections? This could turn people who are economically present but socially absent into active community participants during their time here. Some might stay longer or return.",
    tags:["Work","Migration","Community"],imageUrl:"https://picsum.photos/seed/fill174/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"The Coast as a Host, 2025",author:"Magnus",date:"29.04.2026",
    linkedInsightIds:["s-wi-54","s-wi-53"],annotations:[]
  },
  {
    id:"s-wif-35",projectId:"kirkenes-study",type:"what-if",
    title:"Local food in public institutions",
    body:"What if schools, hospitals, and the municipality committed to sourcing a defined proportion of their food from local producers? This would create stable year-round demand for producers who currently rely entirely on unpredictable retail and tourism markets — a model that has worked in several Norwegian municipalities.",
    tags:["Economy","Education","Healthcare"],imageUrl:"https://picsum.photos/seed/wif35/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Heija Varanger concept, 2025",author:"Ida",date:"30.04.2026",
    linkedInsightIds:["s-wi-76","s-wi-30"],annotations:[]
  },
  {
    id:"s-wif-36",projectId:"kirkenes-study",type:"what-if",
    title:"Creative workers' guild",
    body:"What if a guild or professional association with collective bargaining capacity were established for the region's creative workers? No one is currently negotiating collective terms with public funders or the tourism industry. Collective representation could establish minimum fees, shared insurance, and joint marketing.",
    tags:["Work","Culture","Economy"],imageUrl:"https://picsum.photos/seed/fill175/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Make making work work, Design for Coastal Development 2025",author:"Einar",date:"01.05.2026",
    linkedInsightIds:["s-wi-59","s-wi-55"],annotations:[]
  },
  {
    id:"s-wif-37",projectId:"kirkenes-study",type:"what-if",
    title:"Living archive of local knowledge",
    body:"What if there were a collaboratively maintained, publicly accessible archive — combining oral recordings, photographs, maps, and written accounts — to capture what is currently held only in individuals? Unlike a museum, this would be a living system, continuously updated by anyone with relevant knowledge. The Sàgá project explored exactly this form.",
    tags:["Culture","Digital","Elderly"],imageUrl:"https://picsum.photos/seed/wif37/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Sàgá digital cultural mapping project, 2025",author:"Kristoffer",date:"02.05.2026",
    linkedInsightIds:["s-wi-67","s-wi-69"],annotations:[]
  },
  {
    id:"s-wif-38",projectId:"kirkenes-study",type:"what-if",
    title:"Remote workers matched to organisations",
    body:"What if new remote workers were offered a structured match with a local community organisation on arrival — not as an obligation but as a facilitated introduction? The match would be based on professional skills and personal interests, helping new arrivals integrate while contributing something meaningful.",
    tags:["Work","Community","Migration"],imageUrl:"https://picsum.photos/seed/fill176/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"The Coast as a Host — Remote belonging, 2025",author:"Synne",date:"03.05.2026",
    linkedInsightIds:["s-wi-60","s-wi-77"],annotations:[]
  },
  {
    id:"s-wif-39",projectId:"kirkenes-study",type:"what-if",
    title:"Embedded digital literacy support",
    body:"What if drop-in digital literacy support were embedded in the library, health centre, and community café — rather than offered as a separate course? Informal, peer-led, and specifically calibrated to the platforms most relevant to daily life here, it would reach people in the places they already go.",
    tags:["Digital","Elderly","Community"],imageUrl:"https://picsum.photos/seed/wif39/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Kystutvikling 2025 digital infrastructure",author:"Lena",date:"04.05.2026",
    linkedInsightIds:["s-wi-70","s-wi-32"],annotations:[]
  },
  {
    id:"s-wif-40",projectId:"kirkenes-study",type:"what-if",
    title:"Participatory design for fishing",
    body:"What if there were a participatory design programme working alongside active fishers — using design research methods to identify real problems and prototype practical solutions? The challenges of fishing have not been addressed by innovation programmes that tend to focus on high-tech sectors.",
    tags:["Economy","Culture","Community"],imageUrl:"https://picsum.photos/seed/fill177/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Coastal Development, 2025 — fieldwork",author:"Magnus",date:"05.05.2026",
    linkedInsightIds:["s-wi-56","s-wi-45"],annotations:[]
  },
  {
    id:"s-wif-41",projectId:"kirkenes-study",type:"what-if",
    title:"Residents co-authoring plans",
    body:"What if plans were co-produced from the start — with resident panels involved in framing the questions, interpreting data, and making priority decisions? Several Nordic municipalities have found this produces plans with significantly stronger public legitimacy and higher implementation rates.",
    tags:["Politics","Community","Infrastructure"],imageUrl:"https://picsum.photos/seed/wif41/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Kystutvikling 2025 governance",author:"Ida",date:"07.05.2026",
    linkedInsightIds:["s-wi-63","s-wi-14"],annotations:[]
  },
  {
    id:"s-wif-42",projectId:"kirkenes-study",type:"what-if",
    title:"Recognised cultural mediators",
    body:"What if the people who currently mediate between communities — translating, interpreting cultural contexts, facilitating introductions — were formally recognised and given modest compensation? Formalising these roles would acknowledge what is already happening and make it more sustainable.",
    tags:["Culture","Identity","Community"],imageUrl:"https://picsum.photos/seed/fill178/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Sàgá project, The Coast as a Host 2025",author:"Einar",date:"09.05.2026",
    linkedInsightIds:["s-wi-64","s-wi-25"],annotations:[]
  },
  {
    id:"s-wif-43",projectId:"kirkenes-study",type:"what-if",
    title:"Community space in the mall",
    body:"What if the mall operator were required to allocate a permanent, rent-free community space — governed by a resident board? The shopping centre is already functioning as a de facto community meeting place. Formalising this would turn an accidental meeting place into an intentional one.",
    tags:["Community","Infrastructure","Politics"],imageUrl:"https://picsum.photos/seed/wif43/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Knutepunktet concept, Design for Møteplasser 2025",author:"Kristoffer",date:"11.05.2026",
    linkedInsightIds:["s-wi-65","s-wi-28"],annotations:[]
  },
  {
    id:"s-wif-44",projectId:"kirkenes-study",type:"what-if",
    title:"Researcher output protocol",
    body:"What if universities, design schools, and policy institutes were asked to commit — as a condition of access — to producing a public output in a format accessible to the community? An exhibition, a public talk, a practical tool, a community workshop. This would begin to rebalance the extractive dynamic of research in peripheral regions.",
    tags:["Research","Community","Politics"],imageUrl:"https://picsum.photos/seed/fill179/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Coastal Development, researcher positionality",author:"Synne",date:"13.05.2026",
    linkedInsightIds:["s-wi-66"],annotations:[]
  },
  {
    id:"s-wif-45",projectId:"kirkenes-study",type:"what-if",
    title:"Resources for informal care networks",
    body:"What if the informal networks of care that women maintain received a small grant scheme and formal recognition? The cost would be a fraction of the formal service capacity it supplements. It would also make visible work that is currently invisible as public infrastructure.",
    tags:["Gender","Community","Healthcare"],imageUrl:"https://picsum.photos/seed/wif45/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Ida",date:"15.05.2026",
    linkedInsightIds:["s-wi-68","s-wi-36"],annotations:[]
  },
  {
    id:"s-wif-46",projectId:"kirkenes-study",type:"what-if",
    title:"Professional mentorship in schools",
    body:"What if students spent half-days alongside local professionals — doctors, engineers, artists, fishers — as a regular part of the school programme? This could give young people a realistic picture of what a working life in the region looks like, and create relationships that rarely form outside family connections.",
    tags:["Education","Youth","Work"],imageUrl:"https://picsum.photos/seed/fill180/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Kystutvikling 2025, youth engagement",author:"Einar",date:"17.05.2026",
    linkedInsightIds:["s-wi-04","s-wi-42"],annotations:[]
  },
  {
    id:"s-wif-47",projectId:"kirkenes-study",type:"what-if",
    title:"Neighbourhood housing cooperative",
    body:"What if neighbours pooled purchasing power for contractors, shared tools and skills, and coordinated scheduled maintenance work? A cooperative model for housing maintenance has been shown to improve both the physical quality of housing and the social cohesion of the neighbourhoods that adopt it.",
    tags:["Housing","Community","Economy"],imageUrl:"https://picsum.photos/seed/wif47/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Kristoffer",date:"19.05.2026",
    linkedInsightIds:["s-wi-78","s-wi-19"],annotations:[]
  },
  {
    id:"s-wif-48",projectId:"kirkenes-study",type:"what-if",
    title:"Shared food production infrastructure",
    body:"What if a community kitchen, cold storage, and distribution cooperative — shared by small local producers — solved the infrastructure gap preventing Arctic food products from reaching institutional buyers, tourism operators, and wider markets? The model requires coordination but has worked in comparable peripheral food geographies.",
    tags:["Economy","Culture","Community"],imageUrl:"https://picsum.photos/seed/fill181/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Heija Varanger concept, 2025",author:"Synne",date:"21.05.2026",
    linkedInsightIds:["s-wi-76"],annotations:[]
  },
  {
    id:"s-wif-49",projectId:"kirkenes-study",type:"what-if",
    title:"Community skills inventory",
    body:"What if there were a simple, resident-maintained register of what people know and can do — professional skills, practical skills, languages, landscape knowledge? Not a marketplace, but a mutual aid tool, managed by a community organisation, allowing people to find each other across the social silos that currently prevent connection.",
    tags:["Community","Work","Digital"],imageUrl:"https://picsum.photos/seed/wif49/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Møteplasser, 2025",author:"Lena",date:"23.05.2026",
    linkedInsightIds:["s-wi-74","s-wi-77"],annotations:[]
  },
  {
    id:"s-wif-50",projectId:"kirkenes-study",type:"what-if",
    title:"Return migration as two-way door",
    body:"What if leaving the region were designed as a two-way door rather than a one-way exit? The infrastructure for leaving is well developed; the infrastructure for staying connected and returning is almost absent. A formal programme — alumni network, return grant, digital community — could preserve the relationship and make future return more likely.",
    tags:["Migration","Youth","Community"],imageUrl:"https://picsum.photos/seed/fill182/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Kystutvikling 2025 — outmigration",author:"Magnus",date:"25.05.2026",
    linkedInsightIds:["s-wi-02","s-wi-80"],annotations:[]
  },
  {
    id:"s-wif-51",projectId:"kirkenes-study",type:"what-if",
    title:"Mapping informal social networks",
    body:"What if the networks of relationship and trust that hold the community together were formally mapped — by residents themselves, charting who they call for what, who they trust, who connects them to others? This could make invisible infrastructure legible to planners and community organisations without commodifying it.",
    tags:["Community","Politics","Research"],imageUrl:"https://picsum.photos/seed/wif51/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Møteplasser methodology, 2025",author:"Ida",date:"27.05.2026",
    linkedInsightIds:["s-wi-52","s-wi-79"],annotations:[]
  },
  {
    id:"s-wif-52",projectId:"kirkenes-study",type:"what-if",
    title:"Designing the Arctic winter",
    body:"What if the months of darkness and cold were socially designed rather than simply endured — with a programme of events, shared rituals, lighting interventions, and indoor infrastructure calibrated to the winter's demands? The Søndagsruta project explored exactly this: regular, low-threshold social excursions making the season an occasion rather than an obstacle.",
    tags:["Arctic","Community","Culture"],imageUrl:"https://picsum.photos/seed/fill183/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Søndagsruta concept, Design for Møteplasser 2025",author:"Einar",date:"29.05.2026",
    linkedInsightIds:["s-wi-62","s-wi-44"],annotations:[]
  },
  {
    id:"s-wif-53",projectId:"kirkenes-study",type:"what-if",
    title:"Tourist infrastructure for residents",
    body:"What if businesses were incentivised — through municipal support — to remain open and offer resident-priced access during the off-season? Hotels, cabins, and excursion providers currently close or reduce to skeleton operations outside peak season. The tourism investment would generate community benefit year-round rather than only during visitor months.",
    tags:["Tourism","Community","Economy"],imageUrl:"https://picsum.photos/seed/wif53/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Heija Varanger initiative, 2025",author:"Kristoffer",date:"01.06.2026",
    linkedInsightIds:["s-wi-30","s-wi-39"],annotations:[]
  },
  {
    id:"s-wif-54",projectId:"kirkenes-study",type:"what-if",
    title:"Community radio programme",
    body:"What if there were a community radio programme — accessible digitally as well as on air — co-produced by a rotating group of residents from different communities within the municipality? The format is proven in comparable Nordic contexts; the challenge here is building the local capacity for regular production.",
    tags:["Community","Culture","Digital"],imageUrl:"https://picsum.photos/seed/fill184/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Synne",date:"03.06.2026",
    linkedInsightIds:["s-wi-37","s-wi-48"],annotations:[]
  },
  {
    id:"s-wif-55",projectId:"kirkenes-study",type:"what-if",
    title:"Distributed community gardens",
    body:"What if the community garden model were distributed across all residential areas with modest start-up support and connection between sites? The single centralised garden has demonstrated social as well as horticultural value — unexpected connections between age groups, nationalities, and neighbours who had never previously spoken.",
    tags:["Community","Culture","Infrastructure"],imageUrl:"https://picsum.photos/seed/wif55/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Møteplasser, 2025",author:"Lena",date:"05.06.2026",
    linkedInsightIds:["s-wi-72"],annotations:[]
  },
  {
    id:"s-wif-56",projectId:"kirkenes-study",type:"what-if",
    title:"Community space in new buildings",
    body:"What if all new public buildings above a certain size were required to include at least one adaptable community space — bookable, accessible outside office hours, managed by a resident organisation? The cost would be absorbed into construction rather than requiring a separate capital programme.",
    tags:["Infrastructure","Community","Politics"],imageUrl:"https://picsum.photos/seed/fill185/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Kystutvikling 2025 governance",author:"Magnus",date:"07.06.2026",
    linkedInsightIds:["s-wi-65","s-wi-73"],annotations:[]
  },
  {
    id:"s-wif-57",projectId:"kirkenes-study",type:"what-if",
    title:"Resident-governed development authority",
    body:"What if the governing board of the regional development authority included a substantial proportion of residents selected by sortition — giving the authority both legitimacy and a mandate to pursue goals that formal politics struggles to sustain? Regional development bodies are typically composed of politicians and appointed experts.",
    tags:["Politics","Community","Economy"],imageUrl:"https://picsum.photos/seed/wif57/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Kystutvikling 2025 governance",author:"Ida",date:"09.06.2026",
    linkedInsightIds:["s-wi-14","s-wi-15"],annotations:[]
  },
  {
    id:"s-wif-58",projectId:"kirkenes-study",type:"what-if",
    title:"Institution and organisation partnerships",
    body:"What if every public institution — the school, the health centre, the municipality — had a formally designated relationship with a community organisation? This could enable resource sharing, reduce duplication, and build the relationships through which community organisations access support they cannot purchase commercially.",
    tags:["Community","Infrastructure","Politics"],imageUrl:"https://picsum.photos/seed/fill186/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Møteplasser, 2025",author:"Einar",date:"11.06.2026",
    linkedInsightIds:["s-wi-36","s-wi-52"],annotations:[]
  },
  {
    id:"s-wif-59",projectId:"kirkenes-study",type:"what-if",
    title:"Knowledge return from the diaspora",
    body:"What if people who grew up here and now work professionally in cities were invited back — for workshops, mentorship programmes, collaborative projects? This is different from asking people to move back: it is a two-way relationship with the diaspora that allows knowledge to flow in both directions.",
    tags:["Migration","Work","Education"],imageUrl:"https://picsum.photos/seed/wif59/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Remote belonging project, The Coast as a Host 2025",author:"Kristoffer",date:"13.06.2026",
    linkedInsightIds:["s-wi-02","s-wi-74"],annotations:[]
  },
  {
    id:"s-wif-60",projectId:"kirkenes-study",type:"what-if",
    title:"Remote professional mentorship",
    body:"What if people who grew up here and now work professionally elsewhere offered time as remote mentors to young people navigating education and career choices? A structured programme — with matching and a commitment of a few hours per month — could provide the professional role model access otherwise almost entirely absent.",
    tags:["Youth","Work","Migration"],imageUrl:"https://picsum.photos/seed/fill187/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Remote belonging concept, The Coast as a Host 2025",author:"Synne",date:"15.06.2026",
    linkedInsightIds:["s-wi-01","s-wi-42"],annotations:[]
  },
  {
    id:"s-wif-61",projectId:"kirkenes-study",type:"what-if",
    title:"Cultural mapping as civic practice",
    body:"What if cultural mapping were constituted as an ongoing civic function — maintained by a small community team, continuously updated by residents, used as the foundation for planning and cultural policy decisions? The Sàgá project demonstrated both the appetite for this and the technical feasibility; the challenge is institutional rather than technical.",
    tags:["Culture","Community","Digital"],imageUrl:"https://picsum.photos/seed/wif61/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Sàgá digital cultural mapping, 2025",author:"Lena",date:"17.06.2026",
    linkedInsightIds:["s-wi-67","s-wi-25"],annotations:[]
  },
  {
    id:"s-wif-62",projectId:"kirkenes-study",type:"what-if",
    title:"Shared small business infrastructure",
    body:"What if a shared business hub — cooperatively owned or municipally subsidised — allowed multiple businesses to share overhead: retail space, storage, office space, accounting, marketing? Several small businesses are running at margins too thin to absorb fixed costs on their own. The model is proven in comparable rural contexts.",
    tags:["Economy","Work","Infrastructure"],imageUrl:"https://picsum.photos/seed/fill188/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Initiativsonen concept, Design for Coastal Development 2025",author:"Magnus",date:"19.06.2026",
    linkedInsightIds:["s-wi-58","s-wi-28"],annotations:[]
  },
  {
    id:"s-wif-63",projectId:"kirkenes-study",type:"what-if",
    title:"Ferry routes for social life",
    body:"What if ferry routes were redesigned around the social geography of the community — where people need to go to see family, access services, participate in activities — rather than around freight and worker movement patterns? The Søndagsruta concept demonstrated that purpose-designed social transportation changes behaviour.",
    tags:["Transport","Community","Infrastructure"],imageUrl:"https://picsum.photos/seed/wif63/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Søndagsruta concept, Design for Møteplasser 2025",author:"Ida",date:"21.06.2026",
    linkedInsightIds:["s-wi-31","s-wi-33"],annotations:[]
  },
  {
    id:"s-wif-64",projectId:"kirkenes-study",type:"what-if",
    title:"Inter-municipal knowledge exchange",
    body:"What if practitioners, community leaders, and elected representatives could spend time in peer municipalities across northern Norway, Finland, and Sweden? Many challenges here are shared by comparable communities. Formalising this exchange could accelerate learning and prevent each community from reinventing solutions already working elsewhere.",
    tags:["Politics","Community","Infrastructure"],imageUrl:"https://picsum.photos/seed/fill189/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Kystutvikling 2025 policy analysis",author:"Einar",date:"23.06.2026",
    linkedInsightIds:["s-wi-14","s-wi-27"],annotations:[]
  },
  {
    id:"s-wif-65",projectId:"kirkenes-study",type:"what-if",
    title:"Health prevention investment",
    body:"What if investment were rebalanced toward prevention — through social connection, physical activity, early intervention, and mental health support — relative to acute care and treatment of established conditions? Even a modest shift could reduce long-term demand on acute services while improving everyday quality of life.",
    tags:["Healthcare","Community","Politics"],imageUrl:"https://picsum.photos/seed/wif65/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Kristoffer",date:"25.06.2026",
    linkedInsightIds:["s-wi-12","s-wi-10"],annotations:[]
  },
  {
    id:"s-wif-66",projectId:"kirkenes-study",type:"what-if",
    title:"Community media production facility",
    body:"What if there were a small, community-operated facility for audio and video production — with affordable access to professional equipment and editing support? It would serve community media, tourism promotion, local business marketing, and cultural documentation without requiring any of these users to shoulder the full fixed cost alone.",
    tags:["Culture","Community","Economy"],imageUrl:"https://picsum.photos/seed/fill190/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Make making work work, Design for Coastal Development 2025",author:"Synne",date:"27.06.2026",
    linkedInsightIds:["s-wi-59","s-wi-37"],annotations:[]
  },
  {
    id:"s-wif-67",projectId:"kirkenes-study",type:"what-if",
    title:"Volunteering in school curriculum",
    body:"What if a volunteering component were embedded in school — not as extra-curricular but as part of the formal timetable, assessed and credited? This could introduce young people to community organisations, build habits of civic participation, and address the succession crisis in volunteer organisations. The design matters: it must feel genuinely meaningful.",
    tags:["Education","Youth","Community"],imageUrl:"https://picsum.photos/seed/wif67/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Dugnadsånd_Varanger concept, 2025",author:"Lena",date:"29.06.2026",
    linkedInsightIds:["s-wi-16","s-wi-52"],annotations:[]
  },
  {
    id:"s-wif-68",projectId:"kirkenes-study",type:"what-if",
    title:"Researcher integration protocol",
    body:"What if a formal protocol, agreed between institutions and the municipality, required researchers to attend a community orientation, share their project publicly, and report back before leaving? University research here generates knowledge about the community without creating much of a relationship with it.",
    tags:["Research","Community","Education"],imageUrl:"https://picsum.photos/seed/fill191/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Coastal Development — researcher positionality",author:"Magnus",date:"01.07.2026",
    linkedInsightIds:["s-wi-66"],annotations:[]
  },
  {
    id:"s-wif-69",projectId:"kirkenes-study",type:"what-if",
    title:"Ecological harbour redesign",
    body:"What if the working harbour coexisted with ecological restoration, biodiversity corridors, and recreational access — designed for this from the start? For Kirkenes, where the fjord is central to identity but largely inaccessible as a daily experience, making the harbour edge a public ecological space could be transformative.",
    tags:["Infrastructure","Arctic","Community"],imageUrl:"https://picsum.photos/seed/wif69/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Sàgá project, 2025 — environmental mapping",author:"Ida",date:"03.07.2026",
    linkedInsightIds:["s-wi-45","s-wi-57"],annotations:[]
  },
  {
    id:"s-wif-70",projectId:"kirkenes-study",type:"what-if",
    title:"Retirement as community contribution",
    body:"What if a structured transition programme connected retirees with community organisations, schools, and businesses in roles calibrated to their capacity and interest? Current retirement models remove people from productive roles without providing new ones, while community organisations face a succession crisis that retirees could help address.",
    tags:["Elderly","Community","Work"],imageUrl:"https://picsum.photos/seed/fill192/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Kystutvikling 2025 — ageing population",author:"Einar",date:"05.07.2026",
    linkedInsightIds:["s-wi-35","s-wi-52"],annotations:[]
  },
  {
    id:"s-wif-71",projectId:"kirkenes-study",type:"what-if",
    title:"Municipal innovation programme",
    body:"What if there were a small, ring-fenced fund and team within the municipality — tasked specifically with piloting experimental approaches to social challenges, evaluating them rigorously, and either scaling what works or closing what doesn't? The team would need political protection, genuine autonomy, and a mandate to fail quickly.",
    tags:["Politics","Community","Economy"],imageUrl:"https://picsum.photos/seed/wif71/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Coastal Development, 2025 — systemic framing",author:"Kristoffer",date:"07.07.2026",
    linkedInsightIds:["s-wi-63","s-wi-15"],annotations:[]
  },
  {
    id:"s-wif-72",projectId:"kirkenes-study",type:"what-if",
    title:"Regional apprenticeship network",
    body:"What if there were a regional apprenticeship network connecting young people directly with employers, with social and professional support around the apprenticeship? Demand for skilled trades significantly exceeds local supply, yet vocational pathways are undervalued and enrolment is insufficient.",
    tags:["Work","Education","Economy"],imageUrl:"https://picsum.photos/seed/fill193/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Coastal Development 2025 — labour market",author:"Synne",date:"09.07.2026",
    linkedInsightIds:["s-wi-41","s-wi-01"],annotations:[]
  },
  {
    id:"s-wif-73",projectId:"kirkenes-study",type:"what-if",
    title:"Cross-municipal facility sharing",
    body:"What if a shared digital booking and exchange platform allowed a gymnasium, specialist diagnostic machine, or professional skill to be used by neighbouring municipalities? Small municipalities independently maintain specialist facilities they each use below capacity. Sharing could significantly extend the reach of each investment without additional capital expenditure.",
    tags:["Digital","Infrastructure","Politics"],imageUrl:"https://picsum.photos/seed/wif73/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Kystutvikling 2025 digital infrastructure",author:"Lena",date:"11.07.2026",
    linkedInsightIds:["s-wi-32","s-wi-70"],annotations:[]
  },
  {
    id:"s-wif-74",projectId:"kirkenes-study",type:"what-if",
    title:"Civic design in school",
    body:"What if there were a formal school elective in local governance and civic design — covering how decisions are made, how to participate, and how to design community solutions? Unlike civics education, this would be practical: students would work on real local challenges and produce proposals that are genuinely considered.",
    tags:["Education","Youth","Politics"],imageUrl:"https://picsum.photos/seed/fill194/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Kystutvikling 2025 — youth engagement",author:"Magnus",date:"13.07.2026",
    linkedInsightIds:["s-wi-04","s-wi-16"],annotations:[]
  },
  {
    id:"s-wif-75",projectId:"kirkenes-study",type:"what-if",
    title:"Rotating events committee",
    body:"What if a rotating committee of residents — with a modest budget, professional event support, and authority to try new things — organised community events? Currently events are organised by the same small exhausted group. A rotating model could both reduce that burden and introduce much greater diversity in what gets programmed. The Heija Varanger concept explored this.",
    tags:["Community","Culture","Politics"],imageUrl:"https://picsum.photos/seed/wif75/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Heija Varanger concept, Design for Møteplasser 2025",author:"Ida",date:"15.07.2026",
    linkedInsightIds:["s-wi-55","s-wi-39"],annotations:[]
  },
  {
    id:"s-wif-76",projectId:"kirkenes-study",type:"what-if",
    title:"Free maker space",
    body:"What if the municipality provided free access to a workshop — with woodworking, metalworking, electronics, and digital fabrication tools? It would support hobbyists and small businesses, reduce the cost of maintaining and repairing things, and provide a space where different residents might work alongside each other.",
    tags:["Community","Economy","Infrastructure"],imageUrl:"https://picsum.photos/seed/fill195/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Make making work work, Design for Coastal Development 2025",author:"Einar",date:"17.07.2026",
    linkedInsightIds:["s-wi-58","s-wi-75"],annotations:[]
  },
  {
    id:"s-wif-77",projectId:"kirkenes-study",type:"what-if",
    title:"Participatory transport design",
    body:"What if public transport routes were redesigned through a participatory process — using ride-sharing data, public travel diaries, and structured community sessions? Current routes reflect historical patterns and administrative decisions made without systematic input from regular users, particularly those without cars.",
    tags:["Transport","Community","Infrastructure"],imageUrl:"https://picsum.photos/seed/wif77/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Søndagsruta concept, Design for Møteplasser 2025",author:"Kristoffer",date:"19.07.2026",
    linkedInsightIds:["s-wi-31","s-wi-13"],annotations:[]
  },
  {
    id:"s-wif-78",projectId:"kirkenes-study",type:"what-if",
    title:"Community emergency network",
    body:"What if trained community volunteers — with defined roles, connected by a simple digital platform, embedded in existing organisations — supplemented formal emergency services? Response times for police, fire, and ambulance are long. A structured community network could improve capacity while building inter-personal connections that make communities resilient in non-emergency times.",
    tags:["Community","Infrastructure","Healthcare"],imageUrl:"https://picsum.photos/seed/fill196/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"",author:"Synne",date:"21.07.2026",
    linkedInsightIds:["s-wi-36","s-wi-68"],annotations:[]
  },
  {
    id:"s-wif-79",projectId:"kirkenes-study",type:"what-if",
    title:"Library as civic hub",
    body:"What if the local library were repositioned as a multi-purpose civic hub — hosting community meetings, offering digital services, providing warm space and social programming, functioning as job centre and community advice point? The library has the physical footprint and public trust to serve this role but lacks the mandate and resource to fulfil it.",
    tags:["Community","Culture","Infrastructure"],imageUrl:"https://picsum.photos/seed/wif79/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Møteplasser, 2025",author:"Lena",date:"23.07.2026",
    linkedInsightIds:["s-wi-65","s-wi-73"],annotations:[]
  },
  {
    id:"s-wif-80",projectId:"kirkenes-study",type:"what-if",
    title:"Resident right to referendums",
    body:"What if residents had a formal right to trigger a binding referendum on specific planning or policy decisions — with a low signature threshold and a simple process? Several Swiss and Scandinavian local governments have implemented this. The key design challenge is keeping the mechanism genuinely accessible to ordinary residents.",
    tags:["Politics","Community","Infrastructure"],imageUrl:"https://picsum.photos/seed/fill197/800/533",imageTransform:{x:0,y:0,scale:1},
    references:"Design for Kystutvikling 2025 governance",author:"Magnus",date:"25.07.2026",
    linkedInsightIds:["s-wi-14","s-wi-17"],annotations:[]
  }

];

// ── Tag colour system ─────────────────────────────────────────────────────────
const TAG_COLORS = [
  { bg: "#F2A7CC", text: "#000000" }, // Soft Rose
  { bg: "#8EB8E0", text: "#000000" }, // Pale Blue
  { bg: "#F5DF6E", text: "#000000" }, // Pale Yellow
  { bg: "#F2A875", text: "#000000" }, // Soft Coral
  { bg: "#7DC49A", text: "#000000" }, // Sage Green
  { bg: "#7ABFBF", text: "#000000" }, // Soft Teal
  { bg: "#C298B5", text: "#000000" }, // Dusty Mauve
  { bg: "#AACDE8", text: "#000000" }, // Pale Periwinkle
  { bg: "#EFCC58", text: "#000000" }, // Pale Sunflower
  { bg: "#EC9098", text: "#000000" }, // Soft Watermelon
  { bg: "#B898CC", text: "#000000" }, // Soft Lavender
  { bg: "#9AD8D5", text: "#000000" }, // Pale Aqua
];

function tagColor(tag) {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0;
  return TAG_COLORS[h % TAG_COLORS.length];
}

function tagStyle(tag) {
  const c = tagColor(tag);
  return `style="--tag-bg:${c.bg};--tag-color:${c.text}"`;
}

// ── Date helpers ──────────────────────────────────────────────────────────────
function parseDate(dateStr) {
  const [d, m, y] = dateStr.split(".");
  return new Date(+y, +m - 1, +d).getTime();
}

// ── renderCard: returns a wrapper div with the full-size card inside ──────────
function renderCard(card) {
  const wrapper = document.createElement("div");
  wrapper.className = "card-wrapper";
  wrapper.dataset.id = card.id;

  const el = document.createElement("div");
  el.className = "card" + (card.type === "what-if" ? " card--what-if" : "");

  const typeLabel = card.type === "what-if" ? "WHAT IF?" : "WHAT IS?";

  const tagsHTML = card.tags
    .map(tag => `<span class="tag" ${tagStyle(tag)}>${tag}</span>`)
    .join("");

  let imageHTML;
  if (card.imageUrl) {
    const t = card.imageTransform || { x: 0, y: 0, scale: 1 };
    imageHTML = `<img src="${card.imageUrl}" alt="" style="transform:translate(${t.x}px,${t.y}px) scale(${t.scale})">`;
  } else {
    imageHTML = `<span class="card__image-placeholder">Place image here</span>`;
  }

  el.innerHTML = `
    <header class="card__header">
      <span class="card__header-project">${escHtml(project.name)}</span>
      <span class="card__header-type">${typeLabel}</span>
      <span class="card__header-date">${escHtml(card.date)}</span>
    </header>
    <div class="card__body">
      <div class="card__content">
        <h1 class="card__title">${escHtml(card.title)}</h1>
        <p class="card__description">${escHtml(card.body)}</p>
        <div class="card__tags">${tagsHTML}</div>
      </div>
      <div class="card__image-col">
        <div class="card__image-area">${imageHTML}</div>
        <span class="card__author">${escHtml(card.author)}</span>
      </div>
      <div class="card__references">
        <span class="card__references-text">${escHtml(card.references || "")}</span>
      </div>
    </div>
  `;

  wrapper.appendChild(el);
  return wrapper;
}

// ── scaleCard: scale a single card-wrapper's inner .card to fill the wrapper ──
function scaleCard(wrapper) {
  const scale = wrapper.offsetWidth / 900;
  wrapper.querySelector(".card").style.transform = `scale(${scale})`;
}

// ── Date formatter ────────────────────────────────────────────────────────────
function todayFormatted() {
  const d = new Date();
  return [
    String(d.getDate()).padStart(2, "0"),
    String(d.getMonth() + 1).padStart(2, "0"),
    d.getFullYear()
  ].join(".");
}

// ── Minimal HTML escaping for user-generated content in innerHTML ─────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Shared project header init ─────────────────────────────────────────────────
// Call after projectId and activeMode are known. opts: { projectName, isEditor, showExport }
function initProjectHeader(projectId, activeMode, opts = {}) {
  const { projectName = "", isEditor = false, showExport = false } = opts;

  // Left: home link text + href
  const homeEl = document.getElementById("header-logo");
  const nameEl = document.getElementById("header-project-name");
  if (nameEl) nameEl.textContent = projectName;
  if (homeEl) homeEl.href = `gallery.html?project=${projectId}`;

  // Nav hrefs
  const set = (id, url) => { const el = document.getElementById(id); if (el) el.href = url; };
  set("nav-what-is",  `gallery.html?project=${projectId}&type=what-is`);
  set("nav-what-if",  `gallery.html?project=${projectId}&type=what-if`);
  set("nav-analysis", `analysis.html?project=${projectId}`);
  set("nav-print",    `print.html?project=${projectId}`);

  // Active state
  const modeMap = { "what-is": "nav-what-is", "what-if": "nav-what-if", "analysis": "nav-analysis", "print": "nav-print" };
  const activeId = modeMap[activeMode];
  document.querySelectorAll(".site-nav .nav-link[id]").forEach(link => {
    link.classList.toggle("nav-link--active", link.id === activeId);
  });

  // Dropdown toggle
  const moreBtn  = document.getElementById("nav-more-btn");
  const moreMenu = document.getElementById("nav-more-menu");
  if (moreBtn && moreMenu) {
    moreBtn.addEventListener("click", e => {
      e.stopPropagation();
      const isOpen = moreMenu.classList.toggle("is-open");
      moreBtn.setAttribute("aria-expanded", String(isOpen));
    });
    document.addEventListener("click", () => {
      moreMenu.classList.remove("is-open");
      moreBtn.setAttribute("aria-expanded", "false");
    });
  }

  // Export/import visibility (gallery only, editors only for import)
  const exportBtn    = document.getElementById("btn-export-json");
  const importLabel  = document.getElementById("nav-import-label");
  const importStatus = document.getElementById("import-status");
  if (exportBtn)    exportBtn.style.display    = showExport ? "" : "none";
  if (importLabel)  importLabel.style.display  = (showExport && isEditor) ? "" : "none";
  if (importStatus) importStatus.style.display = showExport ? "" : "none";
}
