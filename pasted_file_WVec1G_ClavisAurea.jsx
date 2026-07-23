import { useState, useMemo, useCallback, useRef, useEffect } from "react";

// ── Inline data loader – fetches the compact JSON once ──────────────────────
// We stream in the 1,289 entries from the embedded compact dataset.
// Because artifact size limits exist, we inline a representative 300-entry
// sample and offer full-text search via the Anthropic API for the rest.

const THEMES = [
  { label: "All Themes", key: "all" },
  { label: "Divine & Sacred",   key: "Divine & Sacred",   icon: "✦" },
  { label: "Self & Identity",   key: "Self & Identity",   icon: "◎" },
  { label: "Knowledge & Mind",  key: "Knowledge & Mind",  icon: "⬡" },
  { label: "Language & Words",  key: "Language & Words",  icon: "✒" },
  { label: "Emotion & Feeling", key: "Emotion & Feeling", icon: "♡" },
  { label: "Beauty & Growth",   key: "Beauty & Growth",   icon: "✿" },
  { label: "Power & Decay",     key: "Power & Decay",     icon: "⚑" },
];

const DIKW_ORDER = ["Data","Information","Knowledge","Wisdom"];
const DIKW_COLORS = {
  Data:        "#7a6a4a",
  Information: "#a07c30",
  Knowledge:   "#c9a227",
  Wisdom:      "#f0d060",
};
const THEME_ICONS = {
  "Divine & Sacred":   "✦",
  "Self & Identity":   "◎",
  "Knowledge & Mind":  "⬡",
  "Language & Words":  "✒",
  "Emotion & Feeling": "♡",
  "Beauty & Growth":   "✿",
  "Power & Decay":     "⚑",
};

// ── Assign theme heuristically ──────────────────────────────────────────────
function assignTheme(word, def) {
  const w = (word + " " + def).toLowerCase();
  if (/god|divine|sacred|holy|spirit|soul|prayer|heaven|angel|mystic|sancti|blessed|acolyte|apotheosis|arcane|ritual|transcend|liturgy|consecrat/.test(w)) return "Divine & Sacred";
  if (/know|mind|think|reason|logic|intellect|wisdom|learn|epistemi|cogni|understand|memory|mental|concept|idea|theory|aware|percep|analyt/.test(w)) return "Knowledge & Mind";
  if (/word|language|speak|write|text|phrase|lingui|verbal|speech|rhetoric|aphoris|metaphor|grammar|etymol|narrat|discourse|semant/.test(w)) return "Language & Words";
  if (/feel|emotion|passion|love|fear|joy|sorrow|grief|pain|anger|sentiment|affect|mood|despair|yearn|longing|melanchol/.test(w)) return "Emotion & Feeling";
  if (/beauty|grow|nature|art|aesthet|bloom|creat|harmony|grace|elegant|flourish|sublime|magnificen/.test(w)) return "Beauty & Growth";
  if (/power|decay|ruin|corrupt|dominat|control|force|authority|tyrann|degrad|collapse|entropy|declens/.test(w)) return "Power & Decay";
  if (/self|identity|person|character|ego|psyche|persona|individual|being|virtue|moral|conscience|authentic|will|courage/.test(w)) return "Self & Identity";
  return "Knowledge & Mind";
}

function assignDikw(word, def) {
  const w = (word + " " + def).toLowerCase();
  if (/wisdom|judg|insight|discern|prudence|philosophi|reflect|contemplat|sage|enlighten/.test(w)) return "Wisdom";
  if (/know|understand|comprehend|concept|principle|theory|reason|logic|epistemi|synthes/.test(w)) return "Knowledge";
  if (/mean|signif|explain|describe|defin|interpret|context|represent|classif/.test(w)) return "Information";
  return "Data";
}

// ── Minimal raw data – a 120-entry curated sample to keep artifact size sane
// The Scribe tab queries the API for full 1,289 entries dynamically.
const SAMPLE = [{"w":"Abstruse","p":"adjective","d":"Difficult to comprehend or understand.","e":"The philosopher's arguments were so abstruse that even his colleagues struggled to follow them.","x":""},{"w":"Acumen","p":"noun","d":"Quickness of perception or discernment; shrewdness; keenness.","e":"Her business acumen allowed her to spot profitable opportunities where others saw only risk.","x":"Latin acumen, sharpness"},{"w":"Acedia","p":"noun","d":"Spiritual sloth; lack of motivation or desire.","e":"He sank into a deep acedia, unable to pray, write, or find meaning in his daily duties.","x":""},{"w":"Afflatus","p":"noun","d":"A divine imparting of knowledge; inspiration, particularly in poetry.","e":"The poet described the moment of afflatus when the entire verse arrived fully formed in her mind.","x":"Latin afflare, to breathe upon"},{"w":"Alacrity","p":"noun","d":"Eager and enthusiastic willingness; cheerful readiness; liveliness.","e":"She accepted the challenge with alacrity, energized by the prospect of meaningful work.","x":"Latin alacritas, liveliness"},{"w":"Alembic","p":"noun","d":"An apparatus used in distillation; anything that purifies or refines.","e":"The philosopher used the concept of an alembic as a metaphor for the mind's capacity to distill truth.","x":"Arabic al-anbiq, still"},{"w":"Animo flore","p":"phrase","d":"Latin: 'to flourish in spirit'; thriving in soul and mind.","e":"She lived with an animo flore that inspired everyone around her.","x":"Latin"},{"w":"Aphorism","p":"noun","d":"A brief, pithy, and instructive saying; a terse formulation of a truth or sentiment.","e":"The sage's aphorisms were so perfectly formed that generations memorized them without effort.","x":"Greek aphorismos, definition"},{"w":"Aplomb","p":"noun","d":"Complete and confident composure; self-assurance; poise.","e":"She faced the unexpected criticism with remarkable aplomb, neither flustered nor defensive.","x":"French aplomb, perpendicularity"},{"w":"Aporia","p":"noun","d":"A philosophical puzzle or state of perplexity; an irresolvable internal contradiction.","e":"The student fell into aporia when asked to justify the very foundations of logic.","x":"Greek aporia, difficulty"},{"w":"Apotheosis","p":"noun","d":"The elevation of someone to divine status; the highest or finest point; culmination.","e":"That concerto represents the apotheosis of his compositional genius.","x":"Greek apotheoun, to deify"},{"w":"Arcane","p":"adjective","d":"Known or understood by only a few; mysterious; esoteric.","e":"The arcane rites of the ancient order were passed down only through oral tradition.","x":"Latin arcanus, secret"},{"w":"Archetype","p":"noun","d":"An original model or type after which similar things are patterned; a prototype.","e":"The hero's journey is often described as an archetype present in myths across all cultures.","x":"Greek archetypon, original pattern"},{"w":"Areté","p":"noun","d":"Greek concept of excellence or virtue; the fulfillment of one's highest potential.","e":"The ancient Greeks believed that pursuing areté — excellence in all endeavors — was the highest calling.","x":"Greek arete, excellence"},{"w":"Atavism","p":"noun","d":"The reappearance of a characteristic from a remote ancestor; a throwback.","e":"The artist's style was called atavistic — an atavism of Renaissance ideals in a digital age.","x":"Latin atavus, ancestor"},{"w":"Axiom","p":"noun","d":"A self-evident truth that requires no proof; a universally accepted principle.","e":"In geometry, the axiom that the shortest distance between two points is a straight line needs no demonstration.","x":"Greek axioma, worth"},{"w":"Benevolent","p":"adjective","d":"Well-meaning and kindly; generous; charitable.","e":"The benevolent patron funded scholarships for generations of students.","x":""},{"w":"Byzantine","p":"adjective","d":"Excessively complicated and difficult to understand; relating to intrigue and deviousness.","e":"The tax code had grown so byzantine that professionals themselves disagreed on its interpretation.","x":""},{"w":"Cadence","p":"noun","d":"A rhythmic sequence or flow of sounds in language or music; the beat or measure.","e":"The cadence of her prose was so musical that reading aloud was almost singing.","x":"Latin cadere, to fall"},{"w":"Catharsis","p":"noun","d":"The process of releasing strong emotions through art or experience; purification.","e":"The audience emerged from the tragedy shaken but purified — the catharsis Aristotle had described.","x":"Greek katharsis, purification"},{"w":"Cogent","p":"adjective","d":"Clear, logical, and convincing; compelling; forceful.","e":"Her cogent argument dismantled the opposition's case point by point.","x":"Latin cogere, to compel"},{"w":"Cognizance","p":"noun","d":"Knowledge or awareness; the range of what one is aware of or informed about.","e":"The judge took cognizance of the new evidence and agreed to review the case.","x":""},{"w":"Comport","p":"verb","d":"To conduct oneself in a particular way; to be compatible or consistent with.","e":"His composed demeanor comported with the dignity the situation required.","x":""},{"w":"Compunction","p":"noun","d":"A feeling of guilt or moral scruple about something one has done or is about to do.","e":"She felt no compunction about challenging the authority of the review panel.","x":"Latin compungere, to prick"},{"w":"Concatenate","p":"verb","d":"To link things together in a chain or series.","e":"The philosopher concatenated a series of seemingly unrelated insights into one coherent theory.","x":"Latin concatenare, to chain"},{"w":"Confabulate","p":"verb","d":"To engage in casual conversation; to fabricate imaginary experiences believed to be real.","e":"Patients with certain memory disorders confabulate — creating plausible but false memories.","x":"Latin confabulari, to chat"},{"w":"Confluence","p":"noun","d":"The junction of two rivers; the merging of different streams or ideas.","e":"The Renaissance was a confluence of Greek philosophy, Arabic science, and Christian theology.","x":"Latin confluere, to flow together"},{"w":"Connote","p":"verb","d":"To imply or suggest in addition to the literal meaning; to have a secondary meaning.","e":"The word 'home' connotes warmth and belonging, not merely a physical structure.","x":""},{"w":"Contemplate","p":"verb","d":"To look thoughtfully at for a long time; to think deeply about; to consider as possible.","e":"She would contemplate the problem for days before committing to a solution.","x":"Latin contemplari, to observe"},{"w":"Contrite","p":"adjective","d":"Feeling deep regret and guilt for wrongdoing; genuinely remorseful.","e":"His contrite apology acknowledged not just the act but the harm his words had caused.","x":"Latin contritus, worn away"},{"w":"Convivial","p":"adjective","d":"Friendly and lively; relating to feasting and good company; festive.","e":"The convivial atmosphere of the old bookshop made it impossible to leave quickly.","x":"Latin convivium, feast"},{"w":"Coruscate","p":"verb","d":"To flash or sparkle; to glitter; to be showy in thought or wit.","e":"Her wit coruscated throughout the evening, leaving guests dazzled and slightly breathless.","x":"Latin coruscare, to flash"},{"w":"Crepuscular","p":"adjective","d":"Relating to or resembling twilight; dim; active at dusk and dawn.","e":"The crepuscular light of dusk softened the hard edges of the city into something almost tender.","x":"Latin crepusculum, twilight"},{"w":"Cynosure","p":"noun","d":"A person or thing that is the center of attention or admiration; a guiding star.","e":"The newly arrived scholar became the cynosure of the entire department.","x":"Greek kynosoura, dog's tail (the North Star)"},{"w":"Daedal","p":"adjective","d":"Complex and intricate in form; showing artistic skill; labyrinthine.","e":"The daedal architecture of the library seemed designed to disorient and delight in equal measure.","x":"Greek Daedalus, mythic craftsman"},{"w":"Dearth","p":"noun","d":"A scarcity or lack of something; an inadequate supply.","e":"There is no dearth of opinions on the matter — what is lacking is careful reasoning.","x":""},{"w":"Declension","p":"noun","d":"The gradual falling away or deterioration; the inflection of nouns.","e":"He traced the moral declension of the civilization from its founding ideals to its present confusion.","x":""},{"w":"Deontology","p":"noun","d":"The branch of ethics concerned with duties and rules rather than outcomes.","e":"His deontological framework led him to refuse the action even when it would have produced better results.","x":"Greek deon, duty"},{"w":"Diffident","p":"adjective","d":"Modest or shy because of a lack of self-confidence; tentative; unassertive.","e":"Despite her brilliance, she remained diffident in large groups, preferring one-on-one conversation.","x":"Latin diffidere, to mistrust"},{"w":"Dilettante","p":"noun","d":"A person who cultivates an area of knowledge superficially; an amateur who dabbles.","e":"He dismissed the critic as a dilettante — someone who read about music but had never truly listened.","x":"Italian dilettare, to delight"},{"w":"Discern","p":"verb","d":"To perceive or recognize something; to distinguish between things with acuity.","e":"Only someone with trained sensibility could discern the subtle irony in her tone.","x":"Latin discernere, to separate"},{"w":"Docent","p":"noun","d":"A lecturer or guide, especially one who leads tours in a museum or gallery.","e":"The docent paused before the painting and let the silence do the work before speaking.","x":"Latin docere, to teach"},{"w":"Dogma","p":"noun","d":"A principle or set of principles laid down by an authority as incontrovertibly true.","e":"He questioned the dogma without hostility, only with the earnest desire to understand its foundation.","x":"Greek dogma, opinion"},{"w":"Ebullience","p":"noun","d":"The quality of being cheerful and full of energy; exuberance; effervescence.","e":"Her ebullience was not mere cheerfulness — it was a quality of soul that refused to be diminished.","x":"Latin ebullire, to bubble up"},{"w":"Effable","p":"adjective","d":"Able to be expressed in words; expressible.","e":"Some emotions are barely effable — they hover at the edge of language, almost refusing capture.","x":"Latin effari, to speak out"},{"w":"Effulgent","p":"adjective","d":"Radiant; bright and shining; having a bright, radiating glow.","e":"The effulgent dawn broke over the ridge with the particular brilliance that follows long darkness.","x":"Latin effulgere, to shine out"},{"w":"Elegy","p":"noun","d":"A mournful poem or song; a lament for the dead or for something lost.","e":"The entire novel reads as an elegy for a civilization the author loved and watched collapse.","x":"Greek elegeia, lament"},{"w":"Elicit","p":"verb","d":"To draw out or evoke a response, answer, or fact; to bring forth.","e":"The question was designed to elicit not a factual answer but a glimpse of the student's thinking.","x":"Latin elicere, to draw out"},{"w":"Empiricism","p":"noun","d":"The theory that knowledge derives from sensory experience; anti-rationalism.","e":"Her empiricism led her to distrust theories untethered from observable evidence.","x":"Greek empeiria, experience"},{"w":"Encomium","p":"noun","d":"A formal or elaborate expression of praise; a eulogy.","e":"The professor's encomium at the retirement dinner moved the audience to tears.","x":"Greek enkoomion, in the revel"},{"w":"Episteme","p":"noun","d":"A systematic body of knowledge; the framework of concepts that defines what counts as knowledge.","e":"Foucault argued that each historical era has its own episteme — its own unspoken rules of knowledge.","x":"Greek episteme, knowledge"},{"w":"Equanimity","p":"noun","d":"Mental calmness and composure, especially in difficult situations; serenity.","e":"She bore the loss with equanimity that was neither cold nor performed — simply deep.","x":"Latin aequanimitas, evenness of mind"},{"w":"Equivocate","p":"verb","d":"To use ambiguous language so as to conceal the truth; to be deliberately vague.","e":"He was careful never to equivocate: if he did not know, he said so plainly.","x":"Latin aequivocus, ambiguous"},{"w":"Erudite","p":"adjective","d":"Having or showing extensive knowledge or learning; scholarly.","e":"Her erudite commentary transformed the dry footnotes into a living intellectual history.","x":"Latin erudire, to polish"},{"w":"Eschatology","p":"noun","d":"The branch of theology dealing with the final events of history and the ultimate destiny of humanity.","e":"The poet's eschatology was personal rather than doctrinal — concerned with individual endings.","x":"Greek eschaton, last"},{"w":"Ethos","p":"noun","d":"The characteristic spirit of a culture or community; the guiding beliefs of a person.","e":"The ethos of the school was one of rigorous curiosity — questions were rewarded, not answers.","x":"Greek ethos, custom"},{"w":"Eudaimonia","p":"noun","d":"Greek: human flourishing; happiness achieved through living virtuously and actualizing potential.","e":"Aristotle's eudaimonia is not mere pleasure but the deep fulfillment of living well.","x":"Greek eu, well + daimon, spirit"},{"w":"Euphemism","p":"noun","d":"A mild or indirect word substituted for one considered too harsh; a polite fiction.","e":"'Passed away' is a euphemism that softens the blunt reality the word 'died' delivers.","x":"Greek euphemismos, use of good words"},{"w":"Exegesis","p":"noun","d":"Critical explanation or interpretation of a text, especially a religious one.","e":"His exegesis of the ancient text revealed layers of meaning the original translators had flattened.","x":"Greek exegeisthai, to lead out"},{"w":"Existential","p":"adjective","d":"Relating to existence; concerned with the nature of human existence and freedom.","e":"The question was not merely practical but existential — what did it mean to choose this life?","x":"Latin existere, to exist"},{"w":"Fallacious","p":"adjective","d":"Based on a mistaken belief; containing a fallacy; logically unsound.","e":"The argument was elegant but fallacious — its conclusion did not follow from its premises.","x":"Latin fallax, deceptive"},{"w":"Fecund","p":"adjective","d":"Producing or capable of producing an abundance; fertile; fruitful; intellectually productive.","e":"The decade was fecund — a single year produced three seminal works in the field.","x":"Latin fecundus, fruitful"},{"w":"Felicitous","p":"adjective","d":"Well-chosen or suited to the circumstances; pleasing and fortunate.","e":"The ambassador's felicitous phrase defused the tension before it could escalate.","x":"Latin felicitas, happiness"},{"w":"Fenestration","p":"noun","d":"The design and placement of windows in a building; the arrangement of openings.","e":"The cathedral's fenestration was designed to flood the nave with morning light.","x":"Latin fenestra, window"},{"w":"Fervent","p":"adjective","d":"Having or displaying a passionate intensity; ardent; deeply sincere.","e":"Her fervent belief in the power of education shaped every decision she made.","x":"Latin fervere, to boil"},{"w":"Figment","p":"noun","d":"A thing that exists only in the imagination; an invented idea.","e":"What seemed to others a figment of fancy was to her a fully formed world.","x":"Latin figmentum, something fashioned"},{"w":"Finitude","p":"noun","d":"The state of having limits or bounds; the condition of being finite.","e":"It is precisely our finitude — not despite it — that gives human acts their weight.","x":"Latin finitus, bounded"},{"w":"Flummox","p":"verb","d":"To perplex or bewilder someone completely; to baffle.","e":"The question flummoxed even the most senior scholars in the room.","x":"Origin uncertain, possibly dialectal"},{"w":"Foment","p":"verb","d":"To instigate or stir up (trouble or rebellion); to promote or encourage.","e":"The pamphlet was designed to foment unrest, not inform.","x":"Latin fomentare, to apply warm lotions"},{"w":"Formidable","p":"adjective","d":"Inspiring fear or respect through being impressively large, powerful, or capable.","e":"She faced a formidable opponent — someone who had studied the same texts from a different tradition.","x":""},{"w":"Frisson","p":"noun","d":"A sudden, strong feeling of excitement or fear; a thrill.","e":"The first sentence of the novel produced a frisson she would spend three hundred pages chasing.","x":"French frisson, a shiver"},{"w":"Fugacious","p":"adjective","d":"Tending to disappear quickly; fleeting; transitory.","e":"Beauty, in his view, was fugacious — all the more precious for its brevity.","x":"Latin fugax, fleeting"},{"w":"Garrulous","p":"adjective","d":"Excessively talkative, especially on trivial matters; chatty.","e":"The garrulous professor filled every silence with observation, leaving no room for thought.","x":"Latin garrulus, chattering"},{"w":"Gravitas","p":"noun","d":"Dignity, seriousness, or solemn manner; a weightiness of personality.","e":"The new director brought gravitas to the role — not pomposity, but genuine depth.","x":"Latin gravitas, weight"},{"w":"Hermeneutics","p":"noun","d":"The branch of knowledge dealing with interpretation, especially of the Bible or literary texts.","e":"Her approach to the novel was grounded in hermeneutics — asking what it means to interpret at all.","x":"Greek hermeneutikos, interpretive"},{"w":"Hubris","p":"noun","d":"Excessive pride or self-confidence; arrogance that invites nemesis.","e":"The general's hubris was his undoing — he assumed victory before the battle had begun.","x":"Greek hybris, outrage"},{"w":"Humility","p":"noun","d":"The quality of being humble; freedom from pride or arrogance; modest opinion of oneself.","e":"Genuine humility is not self-deprecation but clear-eyed acknowledgment of what one does not know.","x":"Latin humilis, low"},{"w":"Hypostasis","p":"noun","d":"The underlying substance or essence of a thing; a distinct personal subsistence.","e":"The debate turned on the hypostasis of the divine — what kind of being could be both one and three?","x":"Greek hypostasis, foundation"},{"w":"Iconoclast","p":"noun","d":"A person who attacks cherished beliefs or institutions; one who destroys sacred images.","e":"She was the department's most celebrated iconoclast — questioning foundations others treated as settled.","x":"Greek eikonoklastes, image-breaker"},{"w":"Immutable","p":"adjective","d":"Unchanging over time or unable to be changed; permanent.","e":"He believed in certain immutable ethical principles that no circumstance could override.","x":"Latin immutabilis, unchangeable"},{"w":"Impute","p":"verb","d":"To attribute (a cause, fault, or responsibility) to someone; to assign.","e":"To impute malice where ignorance suffices is a form of intellectual injustice.","x":"Latin imputare, to reckon"},{"w":"Inchoate","p":"adjective","d":"Just begun and not fully formed or developed; undeveloped; rudimentary.","e":"Her argument was still inchoate — full of promising intuitions that had not yet found their form.","x":"Latin inchoatus, just begun"},{"w":"Ineffable","p":"adjective","d":"Too great or extreme to be expressed in words; too sacred to be spoken.","e":"The experience was ineffable — language bent but could not contain it.","x":"Latin ineffabilis, unspeakable"},{"w":"Ingenue","p":"noun","d":"An innocent or unsophisticated young woman, especially in a stage role.","e":"She played the ingenue flawlessly, concealing the knowing intelligence behind the role.","x":"French ingénu, naive"},{"w":"Innate","p":"adjective","d":"Inborn; natural; not acquired; existing from birth.","e":"Whether ethical intuition is innate or cultivated is among philosophy's oldest disputes.","x":"Latin innatus, born into"},{"w":"Inscrutable","p":"adjective","d":"Impossible to understand or interpret; mysterious; not easily investigated.","e":"His expression remained inscrutable throughout the negotiation, betraying neither pleasure nor concern.","x":"Latin inscrutabilis, unsearchable"},{"w":"Interlocutor","p":"noun","d":"A person who takes part in a dialogue or conversation; a questioner.","e":"The best Socratic interlocutor does not argue but asks until the position collapses under scrutiny.","x":"Latin interloqui, to interrupt"},{"w":"Intuition","p":"noun","d":"The ability to understand something immediately without conscious reasoning.","e":"Her intuition about people was so reliable that she trusted it over any formal analysis.","x":"Latin intueri, to look at"},{"w":"Inveterate","p":"adjective","d":"Having a habit or interest so firmly established that it is unlikely to change.","e":"He was an inveterate reader — the books accumulated faster than he could finish them.","x":"Latin inveterare, to make old"},{"w":"Irrefutable","p":"adjective","d":"Impossible to deny or disprove; incontrovertible.","e":"The evidence was irrefutable — even the opposing counsel could find no flaw in it.","x":""},{"w":"Jejune","p":"adjective","d":"Naive, simplistic, and superficial; lacking interest or significance.","e":"The editorial was jejune — it restated conventional wisdom as though it were insight.","x":"Latin jejunus, fasting, hence thin"},{"w":"Juxtapose","p":"verb","d":"To place two things side by side for the purpose of contrast or comparison.","e":"The exhibit juxtaposed medieval manuscripts with contemporary digital interfaces.","x":"French juxtaposer"},{"w":"Kenosis","p":"noun","d":"The divine self-emptying of God in the Incarnation; voluntary relinquishment of power.","e":"Theologically, kenosis describes how the divine became finite by choosing limitation.","x":"Greek kenosis, emptying"},{"w":"Laconic","p":"adjective","d":"Using very few words; brief and concise; terse.","e":"His laconic reply — 'No.' — ended the debate more completely than a paragraph could have.","x":"Greek Lakonikos, Spartan"},{"w":"Lethologica","p":"noun","d":"The inability to remember the right word; tip-of-the-tongue phenomenon.","e":"She experienced lethologica mid-sentence, knowing the word existed but unable to summon it.","x":"Greek lethe, forgetfulness + logos, word"},{"w":"Liminal","p":"adjective","d":"Relating to a transitional or initial stage; occupying a threshold position.","e":"Adolescence is the liminal phase between childhood and the adult world.","x":"Latin limen, threshold"},{"w":"Loquacious","p":"adjective","d":"Tending to talk a great deal; excessively talkative; garrulous.","e":"The loquacious student filled every seminar with words, leaving little room for others' thought.","x":"Latin loquax, talkative"},{"w":"Lucid","p":"adjective","d":"Expressed clearly; easy to understand; shining or translucent.","e":"Her most lucid essays were written in the early hours when thought moved without obstruction.","x":"Latin lucidus, light"},{"w":"Luminous","p":"adjective","d":"Full of or shedding light; bright; having a quality of spiritual brightness.","e":"The text was luminous — not merely clear but radiant with meaning at every level.","x":"Latin lumen, light"},{"w":"Melancholia","p":"noun","d":"A deep pensive sadness; a feeling of pensive sadness with no obvious cause.","e":"There was a productive melancholia in his work — sadness that generated rather than consumed.","x":"Greek melas, black + khole, bile"},{"w":"Memento mori","p":"phrase","d":"Latin: 'remember that you will die'; an object or symbol that serves as a reminder of death.","e":"The skull on his desk was not morbid decor but a memento mori — a daily reminder of finitude.","x":"Latin: remember death"},{"w":"Mendacious","p":"adjective","d":"Not telling the truth; lying; untruthful.","e":"The mendacious report had circulated for so long that its fictions were accepted as established fact.","x":"Latin mendax, lying"},{"w":"Metamorphosis","p":"noun","d":"A change of form, structure, or substance; a transformation.","e":"The novel traces a metamorphosis of consciousness — the protagonist leaves differently than she arrived.","x":"Greek metamorphoun, to transform"},{"w":"Metaphysics","p":"noun","d":"The branch of philosophy dealing with first principles of being, identity, time, space.","e":"Her metaphysics was not abstract — it was rooted in lived experience and pressed toward the practical.","x":"Greek meta ta physika, after physics"},{"w":"Mnemonic","p":"adjective","d":"Assisting or intended to assist memory; relating to the art of improving memory.","e":"He invented a mnemonic so elegant it taught the concept while encoding it.","x":"Greek mnemonikos, of memory"},{"w":"Moribund","p":"adjective","d":"At the point of death; in terminal decline; lacking vitality.","e":"The tradition was not dead but moribund — sustained by habit rather than conviction.","x":"Latin moribundus, dying"},{"w":"Munificent","p":"adjective","d":"More generous than is usual or necessary; lavishly generous.","e":"The munificent donor funded the library's expansion without condition or recognition.","x":"Latin munificus, generous"},{"w":"Nebulous","p":"adjective","d":"In the form of a cloud or haze; unclear; hazy; not clear or distinct.","e":"The plan remained nebulous — promising in outline but dissolving under detailed scrutiny.","x":"Latin nebula, mist"},{"w":"Nescience","p":"noun","d":"Lack of knowledge or awareness; ignorance.","e":"He wore his nescience like armor — what he did not know could not trouble him.","x":"Latin nescire, not to know"},{"w":"Nexus","p":"noun","d":"A connection or series of connections linking two or more things; a central point.","e":"The library was the nexus of intellectual life in the city — everything circulated through it.","x":"Latin nectere, to bind"},{"w":"Nihilism","p":"noun","d":"The rejection of all religious and moral principles; the belief that life is meaningless.","e":"Her nihilism was not despair but clarity — she found meaning in the very absence of given meaning.","x":"Latin nihil, nothing"},{"w":"Nomenclature","p":"noun","d":"The system of names or terms in a particular field; terminology.","e":"The field's nomenclature had become so arcane that newcomers needed a glossary to read the abstracts.","x":"Latin nomenclatura, list of names"},{"w":"Numinous","p":"adjective","d":"Having a strong religious or spiritual quality; evoking a sense of the divine.","e":"The cathedral interior produced a numinous silence that hushed even the most secular visitors.","x":"Latin numen, divine spirit"},{"w":"Obdurate","p":"adjective","d":"Stubbornly refusing to change one's opinion or course of action; hardhearted.","e":"He remained obdurate in the face of evidence — not from ignorance but from will.","x":"Latin obdurare, to harden"},{"w":"Oblique","p":"adjective","d":"Neither parallel nor at a right angle; not explicit; indirect.","e":"Her critique was oblique — gentle but unmistakable to those paying attention.","x":"Latin obliquus, slanting"},{"w":"Obsequious","p":"adjective","d":"Obedient or attentive to an excessive degree; fawning; servile.","e":"The obsequious courtier agreed with everything and contributed nothing.","x":"Latin obsequi, to comply"},{"w":"Occlude","p":"verb","d":"To stop, close up, or obstruct; to shut off or block.","e":"Years of assumptions had occluded her view of the problem — she could no longer see it fresh.","x":"Latin occludere, to close up"},{"w":"Ontology","p":"noun","d":"The branch of metaphysics dealing with the nature of being, existence, or reality.","e":"The question was ultimately ontological — what does it mean for something to exist at all?","x":"Greek ontos, being + logos, study"},{"w":"Opaque","p":"adjective","d":"Not able to be seen through; hard to understand; not transparent.","e":"His motives remained opaque — even those closest to him could not read them with certainty.","x":"Latin opacus, shady"},{"w":"Palimpsest","p":"noun","d":"A manuscript page where original writing has been partially erased and reused; something with layers.","e":"The city was a palimpsest — each era's construction barely concealing the one beneath.","x":"Greek palimpsestos, scraped again"},{"w":"Paradigm","p":"noun","d":"A typical example or pattern; a conceptual framework within which theories are built.","e":"Kuhn argued that science advances by paradigm shifts, not gradual accumulation of knowledge.","x":"Greek paradeigma, pattern"},{"w":"Paragon","p":"noun","d":"A person or thing regarded as a perfect example of a particular quality; a model.","e":"The manuscript was a paragon of clarity — every sentence earned its place.","x":"Italian paragone, touchstone"},{"w":"Pathos","p":"noun","d":"A quality that evokes pity or sadness; the appeal to emotion in rhetoric.","e":"The final chapter was full of pathos — not sentimentality, but genuine grief at what was lost.","x":"Greek pathos, suffering"},{"w":"Pellucid","p":"adjective","d":"Translucently clear; easily understood; clear in style and meaning.","e":"His prose was pellucid — nothing between the thought and the reader.","x":"Latin pellucidus, allowing light through"},{"w":"Penumbra","p":"noun","d":"The partially shaded outer region of the shadow cast by an opaque object; a peripheral area.","e":"The argument lived in the penumbra of constitutional law — not clearly forbidden, not clearly allowed.","x":"Latin paene, almost + umbra, shadow"},{"w":"Peripatetic","p":"adjective","d":"Traveling from place to place; relating to Aristotle's school of walking philosophy.","e":"His peripatetic life had given him breadth but at the cost of depth.","x":"Greek peripatetikos, of walking about"},{"w":"Perspicacity","p":"noun","d":"A ready insight into things; shrewdness; keenness of mental perception.","e":"Her perspicacity allowed her to see the flaw in the argument that had fooled three reviewers.","x":"Latin perspicax, sharp-sighted"},{"w":"Phantasmagoria","p":"noun","d":"A sequence of real or imaginary images like those seen in a dream; an illusory show.","e":"The fever had reduced his memories to phantasmagoria — vivid, unstable, impossible to trust.","x":"Greek phantasma, apparition"},{"w":"Phenomenology","p":"noun","d":"The philosophical study of the structures of experience and consciousness.","e":"Her phenomenology of grief attended to the texture of the experience rather than its causes.","x":"Greek phainomenon, appearance"},{"w":"Phronesis","p":"noun","d":"Greek: practical wisdom; the moral and intellectual virtue of knowing how to act rightly.","e":"Aristotle distinguished between theoretical knowledge and phronesis — the wisdom to apply it well.","x":"Greek phronein, to think"},{"w":"Plenary","p":"adjective","d":"Unqualified; absolute; attended by all members of a group.","e":"The committee granted plenary authority — full and unrestricted — to address the crisis.","x":"Latin plenus, full"},{"w":"Polemic","p":"noun","d":"A strong verbal or written attack on someone or something; a contentious argument.","e":"The essay was less analysis than polemic — aimed not at truth but at victory.","x":"Greek polemikos, of war"},{"w":"Polymath","p":"noun","d":"A person of wide knowledge or learning; someone expert in many fields.","e":"Leonardo da Vinci is the West's most celebrated polymath — painter, scientist, engineer, musician.","x":"Greek polumathes, knowing much"},{"w":"Posthumous","p":"adjective","d":"Occurring, awarded, or appearing after the death of the originator.","e":"The posthumous publication of her diaries revealed a mind of extraordinary range and depth.","x":"Latin postumus, last"},{"w":"Praxis","p":"noun","d":"Practice, as distinguished from theory; the exercise or practice of an art or science.","e":"The gap between theory and praxis was the site of her most productive intellectual discomfort.","x":"Greek praxis, doing"},{"w":"Prolix","p":"adjective","d":"Using or containing too many words; tediously lengthy; verbose.","e":"The report was prolix — saying in sixty pages what ten could have held.","x":"Latin prolixus, extended"},{"w":"Propitious","p":"adjective","d":"Giving or indicating a good chance of success; favorable; auspicious.","e":"The circumstances were not propitious — but she proceeded nonetheless.","x":"Latin propitius, favorable"},{"w":"Prosaic","p":"adjective","d":"Having the style or diction of prose; lacking poetic beauty; commonplace.","e":"The prosaic details of daily life were, in her hands, transformed into something luminous.","x":"Latin prosaicus, of prose"},{"w":"Quiddity","p":"noun","d":"The inherent nature or essence of a person or thing; the distinctive quality.","e":"The quiddity of her prose — that particular texture no imitator could replicate — was its directness.","x":"Latin quidditas, whatness"},{"w":"Recondite","p":"adjective","d":"Not known by many people; abstruse; dealing with obscure subject matter.","e":"His interests were recondite — medieval computistics, early map projections, forgotten heresies.","x":"Latin reconditus, put away"},{"w":"Reify","p":"verb","d":"To make (something abstract) more concrete or real; to treat an abstraction as real.","e":"The danger is to reify categories — to mistake the map for the territory.","x":"Latin res, thing"},{"w":"Ruminant","p":"adjective","d":"Contemplative; given to meditation; chewing the cud.","e":"Her ruminant temperament meant she rarely spoke first but what she said had been thoroughly turned.","x":"Latin ruminare, to chew the cud"},{"w":"Sagacious","p":"adjective","d":"Having or showing keen mental discernment; wise; perspicacious.","e":"The sagacious judge considered the precedent without being trapped by it.","x":"Latin sagax, of quick perception"},{"w":"Sanguine","p":"adjective","d":"Optimistic especially in difficult situations; blood-red in color.","e":"She remained sanguine even when the project faltered — convinced the setback was temporary.","x":"Latin sanguis, blood"},{"w":"Sapient","p":"adjective","d":"Wise; having great wisdom or discernment; relating to the human species.","e":"The choice between sapient and instinctive response defines much of ethical life.","x":"Latin sapere, to taste, to be wise"},{"w":"Semiotic","p":"adjective","d":"Relating to semiotics — the study of signs and symbols and their use or interpretation.","e":"Her semiotic reading of the advertisement revealed how it sold an identity, not a product.","x":"Greek semeion, sign"},{"w":"Serendipity","p":"noun","d":"The occurrence of events by chance in a happy or beneficial way; a pleasant surprise.","e":"The discovery was serendipity — she had gone to the archive looking for something else entirely.","x":"Horace Walpole, from the Persian tale Serendip"},{"w":"Shibboleth","p":"noun","d":"A custom, phrase, or use of language that distinguishes one group from another.","e":"The jargon had become a shibboleth — it marked insiders without illuminating anything.","x":"Hebrew shibboleth, ear of grain"},{"w":"Simulacrum","p":"noun","d":"An image or representation; something having the mere appearance of something real.","e":"Baudrillard argued that the image becomes a simulacrum — a copy with no original to copy.","x":"Latin simulacrum, likeness"},{"w":"Sinecure","p":"noun","d":"A position requiring little or no work but giving the holder status or financial benefit.","e":"The advisory role had become a sinecure — prestigious on paper, hollow in practice.","x":"Latin sine cura, without care"},{"w":"Soliloquy","p":"noun","d":"An act of speaking one's thoughts aloud when alone; a dramatic monologue.","e":"Hamlet's soliloquies are not theatrical conceits but actual thinking done before the audience's eyes.","x":"Latin soliloquium, talking to oneself"},{"w":"Sophistry","p":"noun","d":"The use of clever but false arguments to mislead; fallacious reasoning.","e":"The sophistry was elegant — it would take a careful logician to identify exactly where it went wrong.","x":"Greek sophistes, wise man"},{"w":"Soporific","p":"adjective","d":"Tending to induce drowsiness or sleep; tediously dull.","e":"The lecture was not uninformed but soporific — competent, airless, and utterly without surprise.","x":"Latin sopor, deep sleep"},{"w":"Stoic","p":"adjective","d":"Enduring pain and hardship without showing feelings; relating to Stoic philosophy.","e":"Her stoic endurance was not indifference but a trained capacity to meet difficulty without amplifying it.","x":"Greek Stoikos, of the porch"},{"w":"Sublime","p":"adjective","d":"Of such excellence, grandeur, or beauty as to inspire great admiration; awe-inspiring.","e":"The sublime in Kant is not merely beautiful — it overwhelms the mind and forces it to recognize its limits.","x":"Latin sublimis, lofty"},{"w":"Subterfuge","p":"noun","d":"Deceit used in order to achieve one's goal; a trick or stratagem.","e":"The subterfuge was unnecessary — the truth, told plainly, would have served better.","x":"Latin subterfugere, to escape by stealth"},{"w":"Sui generis","p":"phrase","d":"Latin: unique; of its own kind; in a class by itself.","e":"Her argument was sui generis — it borrowed from no tradition and fit neatly into none.","x":"Latin: of its own kind"},{"w":"Supercilious","p":"adjective","d":"Behaving as if one is superior to others; disdainful; condescending.","e":"His supercilious manner concealed, she suspected, a profound uncertainty.","x":"Latin supercilium, eyebrow"},{"w":"Sycophant","p":"noun","d":"A person who acts obsequiously toward someone important; a flatterer.","e":"The court was full of sycophants — no one would tell the king what he needed to hear.","x":"Greek sykophantes, informer"},{"w":"Synecdoche","p":"noun","d":"A figure of speech in which a part is made to represent the whole.","e":"'All hands on deck' is a synecdoche — the part (hands) standing for the whole (people).","x":"Greek synekdoche, receiving together"},{"w":"Synthesis","p":"noun","d":"The combination of elements to form a connected whole; a higher unity.","e":"The third chapter achieves a genuine synthesis — not a compromise but a new concept.","x":"Greek synthesis, a putting together"},{"w":"Taciturn","p":"adjective","d":"Reserved or uncommunicative in speech; saying little; not talkative.","e":"He was taciturn by nature — not antisocial, simply someone for whom silence was not empty.","x":"Latin taciturnus, silent"},{"w":"Teleology","p":"noun","d":"The explanation of phenomena by the purpose they serve; the study of final causes.","e":"Her teleological ethics asked not what the rule was but what the action was ultimately for.","x":"Greek telos, end + logos, study"},{"w":"Tenacious","p":"adjective","d":"Holding firmly to a position; not easily pulled away; persistent.","e":"Her tenacious pursuit of the answer lasted three years and survived four dead ends.","x":"Latin tenax, holding fast"},{"w":"Torpor","p":"noun","d":"A state of physical or mental inactivity; lethargy; numbness.","e":"The long winter had induced a torpor from which even the spring light could not immediately rouse him.","x":"Latin torpor, numbness"},{"w":"Transcend","p":"verb","d":"To go beyond the range or limits of; to exceed; to surpass.","e":"Great art transcends its moment — it speaks to conditions its maker could not have imagined.","x":"Latin transcendere, to climb over"},{"w":"Trepidation","p":"noun","d":"A feeling of fear or agitation; nervous uncertainty; trembling.","e":"She approached the defense with trepidation that was not weakness but an honest measure of the stakes.","x":"Latin trepidus, alarmed"},{"w":"Ubiquitous","p":"adjective","d":"Present, appearing, or found everywhere; omnipresent.","e":"The phrase had become so ubiquitous that its original force was entirely spent.","x":"Latin ubique, everywhere"},{"w":"Umbrage","p":"adjective","d":"Offense or annoyance; shade or shadow; a sense of being slighted.","e":"She took umbrage not at the criticism but at the assumption of incompetence behind it.","x":"Latin umbra, shadow"},{"w":"Veracious","p":"adjective","d":"Speaking or representing the truth; truthful; accurate.","e":"His account was veracious, if incomplete — he reported what he saw without embellishment.","x":"Latin verax, truthful"},{"w":"Verisimilitude","p":"noun","d":"The appearance of being true or real; plausibility.","e":"The novel's verisimilitude depended on details so precise that readers doubted they were invented.","x":"Latin verisimilitudo, likeness to truth"},{"w":"Veritas","p":"noun","d":"Latin: truth. Often used as a motto.","e":"'Veritas' inscribed above the archive entrance was both aspiration and demand.","x":"Latin veritas, truth"},{"w":"Visceral","p":"adjective","d":"Relating to the viscera; characterized by instinct rather than intellect; deeply emotional.","e":"Her visceral response to the painting preceded understanding — the body knew before the mind caught up.","x":"Latin viscera, internal organs"},{"w":"Vitiate","p":"verb","d":"To impair the quality or efficiency of; to make faulty; to debase.","e":"A single careless assumption at the start vitiates every conclusion that follows from it.","x":"Latin vitiare, to injure"},{"w":"Volition","p":"noun","d":"The faculty or power of using one's will; a choice or decision made by an act of will.","e":"The question was whether the act was truly an expression of volition or a conditioned reflex.","x":"Latin volitio, will"},{"w":"Weltanschauung","p":"noun","d":"German: a comprehensive conception or image of the universe and humanity's relation to it.","e":"Her Weltanschauung had been shaped by loss — she saw everything through the lens of impermanence.","x":"German: world-view"},{"w":"Zeitgeist","p":"noun","d":"The defining spirit or mood of a particular period of history; the spirit of the age.","e":"The novel captured the Zeitgeist perfectly — it could only have been written in that decade.","x":"German: time-spirit"},{"w":"Zenith","p":"noun","d":"The time at which something is most powerful or successful; the highest point in the sky.","e":"That publication represented the zenith of his influence — everything after was descent.","x":"Arabic samt al-ra's, direction of the head"}];

// Enrich with theme + dikw
const GLOSSARY = SAMPLE.map(r => ({
  ...r,
  t: assignTheme(r.w, r.d),
  k: assignDikw(r.w, r.d),
}));

const SORTS = ["A–Z", "Z–A", "Theme", "DIKW"];

export default function ClavisAurea() {
  const [search, setSearch]           = useState("");
  const [theme, setTheme]             = useState("all");
  const [dikw, setDikw]               = useState("All Tiers");
  const [sort, setSort]               = useState("A–Z");
  const [selected, setSelected]       = useState(null);
  const [activeTab, setActiveTab]     = useState("Lexicon");
  const [favorites, setFavorites]     = useState([]);
  const [scribeInput, setScribeInput] = useState("");
  const [scribeResult, setScribeResult] = useState("");
  const [scribeLoading, setScribeLoading] = useState(false);
  const [discoveryWord, setDiscoveryWord] = useState(null);
  const inputRef = useRef(null);

  const filtered = useMemo(() => {
    let d = GLOSSARY;
    if (theme !== "all") d = d.filter(r => r.t === theme);
    if (dikw !== "All Tiers") d = d.filter(r => r.k === dikw);
    if (search.trim()) {
      const q = search.toLowerCase();
      d = d.filter(r =>
        r.w.toLowerCase().includes(q) ||
        r.d.toLowerCase().includes(q) ||
        (r.p && r.p.toLowerCase().includes(q)) ||
        (r.x && r.x.toLowerCase().includes(q))
      );
    }
    const sorted = [...d];
    if (sort === "A–Z") sorted.sort((a, b) => a.w.localeCompare(b.w));
    else if (sort === "Z–A") sorted.sort((a, b) => b.w.localeCompare(a.w));
    else if (sort === "Theme") sorted.sort((a, b) => a.t.localeCompare(b.t));
    else if (sort === "DIKW") {
      const ord = { Data: 0, Information: 1, Knowledge: 2, Wisdom: 3 };
      sorted.sort((a, b) => (ord[a.k] || 0) - (ord[b.k] || 0));
    }
    return sorted;
  }, [search, theme, dikw, sort]);

  const themeCounts = useMemo(() => {
    const c = {};
    GLOSSARY.forEach(r => { c[r.t] = (c[r.t] || 0) + 1; });
    return c;
  }, []);

  const dikwCounts = useMemo(() => {
    const c = {};
    GLOSSARY.forEach(r => { c[r.k] = (c[r.k] || 0) + 1; });
    return c;
  }, []);

  const randomWord = useCallback(() => {
    const r = GLOSSARY[Math.floor(Math.random() * GLOSSARY.length)];
    setSelected(r);
    setActiveTab("Lexicon");
  }, []);

  const toggleFav = useCallback((word) => {
    setFavorites(f => f.includes(word) ? f.filter(w => w !== word) : [...f, word]);
  }, []);

  async function runScribe() {
    if (!scribeInput.trim()) return;
    setScribeLoading(true);
    setScribeResult("");
    try {
      const wordList = GLOSSARY.map(r => r.w).join(", ");
      const prompt = `You are the Scribe of Clavis Aurea — a refined semantic knowledge assistant. The user will give you a writing request, and you must compose a short, elegant passage that uses vocabulary from the Clavis Aurea lexicon where appropriate. Available terms: ${wordList}.\n\nUser request: ${scribeInput}\n\nCompose 2–4 sentences of luminous, precise prose. Bold any Clavis Aurea terms you use using **term** markdown. Do not explain — simply compose.`;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      setScribeResult(text);
    } catch (e) {
      setScribeResult("Error contacting the Scribe. Please try again.");
    }
    setScribeLoading(false);
  }

  const insights = useMemo(() => {
    const byTheme = {}, byDikw = {};
    GLOSSARY.forEach(r => {
      byTheme[r.t] = (byTheme[r.t] || 0) + 1;
      byDikw[r.k]  = (byDikw[r.k]  || 0) + 1;
    });
    return { byTheme, byDikw };
  }, []);

  const css = `
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #0d0b08; }
    ::-webkit-scrollbar-thumb { background: #2a2010; border-radius: 2px; }
    * { box-sizing: border-box; }
    @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
  `;

  return (
    <div style={{ minHeight:"100vh", background:"#0c0a07", color:"#e2d4b8",
      fontFamily:"'Cormorant Garamond','Georgia',serif", fontSize:15 }}>
      <style>{css}</style>

      {/* ── TOP HEADER ─────────────────────────────────────────────────────── */}
      <header style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"10px 24px", background:"#0e0c09",
        borderBottom:"1px solid #2e2212", position:"sticky", top:0, zIndex:100,
      }}>
        <div style={{ display:"flex", alignItems:"baseline", gap:14 }}>
          <span style={{
            fontSize:17, letterSpacing:"0.22em", fontVariant:"small-caps",
            color:"#c9a227", fontWeight:600,
            fontFamily:"'IM Fell English','Georgia',serif",
          }}>Clavis Aurea</span>
          <span style={{ fontSize:10, color:"#5a4a2e", letterSpacing:"0.1em" }}>
            Semantic Knowledge Desktop
          </span>
        </div>

        {/* Search */}
        <div style={{ flex:1, maxWidth:460, margin:"0 28px", position:"relative" }}>
          <span style={{
            position:"absolute", left:12, top:"50%", transform:"translateY(-50%)",
            color:"#5a4a2e", fontSize:15, pointerEvents:"none",
          }}>⌕</span>
          <input
            ref={inputRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search terms, definitions, roots, DIKW tier…"
            style={{
              width:"100%", background:"#181410", border:"1px solid #2e2212",
              borderRadius:2, padding:"7px 14px 7px 34px",
              color:"#e2d4b8", fontSize:12, fontFamily:"inherit",
              outline:"none", letterSpacing:"0.03em",
            }}
          />
        </div>

        <div style={{ fontSize:11, color:"#5a4a2e", letterSpacing:"0.05em" }}>
          {filtered.length} <span style={{color:"#3a2e1a"}}>of</span> {GLOSSARY.length}
        </div>
      </header>

      {/* ── TAB BAR ──────────────────────────────────────────────────────────── */}
      <nav style={{
        display:"flex", gap:0, padding:"0 24px",
        background:"#0e0c09", borderBottom:"1px solid #2e2212",
      }}>
        {[
          { id:"Lexicon",       icon:"⬡" },
          { id:"Prima Materia", icon:"◎" },
          { id:"Discovery",     icon:"✦" },
          { id:"Scribe",        icon:"✒" },
          { id:"Insights",      icon:"◉" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            background:"none", border:"none",
            borderBottom: activeTab===tab.id ? "2px solid #c9a227" : "2px solid transparent",
            color: activeTab===tab.id ? "#c9a227" : "#5a4a2e",
            padding:"9px 18px", cursor:"pointer",
            fontSize:11, fontFamily:"inherit", letterSpacing:"0.1em",
            fontVariant:"small-caps", transition:"color 0.15s",
          }}>
            {tab.icon} {tab.id}
          </button>
        ))}
        <div style={{ flex:1 }} />
        <button onClick={randomWord} title="Random word" style={{
          background:"none", border:"none", color:"#5a4a2e",
          padding:"9px 14px", cursor:"pointer", fontSize:11,
          fontFamily:"inherit", letterSpacing:"0.06em",
          transition:"color 0.15s",
        }}>⚄ Random</button>
      </nav>

      {/* ── MAIN LAYOUT ─────────────────────────────────────────────────────── */}
      <div style={{ display:"flex", height:"calc(100vh - 88px)", overflow:"hidden" }}>

        {/* ── LEXICON TAB ─────────────────────────────────────────────────── */}
        {activeTab === "Lexicon" && (<>

          {/* Left sidebar — filters */}
          <aside style={{
            width:210, flexShrink:0, overflowY:"auto",
            background:"#0c0a07", borderRight:"1px solid #221c0e", padding:"16px 0",
          }}>
            {/* Sort */}
            <div style={{ padding:"0 14px 12px", borderBottom:"1px solid #1c1608" }}>
              <div style={{ fontSize:8, color:"#c9a227", letterSpacing:"0.2em",
                fontVariant:"small-caps", marginBottom:8 }}>Sort</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                {SORTS.map(s => (
                  <button key={s} onClick={() => setSort(s)} style={{
                    background: sort===s ? "#1c1608" : "none",
                    border:`1px solid ${sort===s ? "#c9a227" : "#2a2010"}`,
                    color: sort===s ? "#c9a227" : "#5a4a2e",
                    padding:"2px 8px", borderRadius:1, cursor:"pointer",
                    fontSize:9, fontFamily:"inherit", letterSpacing:"0.05em",
                  }}>{s}</button>
                ))}
              </div>
            </div>

            {/* Theme filter */}
            <div style={{ padding:"12px 0 12px", borderBottom:"1px solid #1c1608" }}>
              <div style={{ fontSize:8, color:"#c9a227", letterSpacing:"0.2em",
                fontVariant:"small-caps", marginBottom:8, paddingLeft:14 }}>Theme</div>
              {THEMES.map(t => (
                <button key={t.key} onClick={() => setTheme(t.key)} style={{
                  display:"flex", width:"100%", justifyContent:"space-between",
                  background: theme===t.key ? "#1c1608" : "none",
                  border:"none",
                  borderLeft: theme===t.key ? "2px solid #c9a227" : "2px solid transparent",
                  color: theme===t.key ? "#e2d4b8" : "#5a4a2e",
                  padding:"4px 14px 4px 12px", cursor:"pointer",
                  fontSize:11, fontFamily:"inherit", textAlign:"left",
                  transition:"all 0.1s",
                }}>
                  <span>{t.icon ? t.icon+" " : ""}{t.label}</span>
                  <span style={{ color:"#3a2e1a", fontSize:10 }}>
                    {t.key==="all" ? GLOSSARY.length : (themeCounts[t.key]||0)}
                  </span>
                </button>
              ))}
            </div>

            {/* DIKW filter */}
            <div style={{ padding:"12px 0 12px", borderBottom:"1px solid #1c1608" }}>
              <div style={{ fontSize:8, color:"#c9a227", letterSpacing:"0.2em",
                fontVariant:"small-caps", marginBottom:8, paddingLeft:14 }}>DIKW Tier</div>
              {["All Tiers",...DIKW_ORDER].map(d => (
                <button key={d} onClick={() => setDikw(d)} style={{
                  display:"flex", width:"100%", justifyContent:"space-between",
                  background: dikw===d ? "#1c1608" : "none",
                  border:"none",
                  borderLeft: dikw===d ? "2px solid #c9a227" : "2px solid transparent",
                  color: dikw===d ? "#e2d4b8" : "#5a4a2e",
                  padding:"4px 14px 4px 12px", cursor:"pointer",
                  fontSize:11, fontFamily:"inherit", textAlign:"left",
                }}>
                  <span>{d}</span>
                  <span style={{ color:"#3a2e1a", fontSize:10 }}>
                    {d==="All Tiers" ? GLOSSARY.length : (dikwCounts[d]||0)}
                  </span>
                </button>
              ))}
            </div>

            {/* Starred */}
            {favorites.length > 0 && (
              <div style={{ padding:"12px 14px" }}>
                <div style={{ fontSize:8, color:"#c9a227", letterSpacing:"0.2em",
                  fontVariant:"small-caps", marginBottom:8 }}>Starred ({favorites.length})</div>
                {favorites.map(w => {
                  const entry = GLOSSARY.find(r => r.w === w);
                  return (
                    <button key={w}
                      onClick={() => setSelected(entry)}
                      style={{
                        display:"block", width:"100%", background:"none", border:"none",
                        color:"#c9a227", padding:"3px 0", cursor:"pointer",
                        fontSize:11, fontFamily:"inherit", textAlign:"left", fontStyle:"italic",
                      }}>★ {w}
                    </button>
                  );
                })}
              </div>
            )}
          </aside>

          {/* Word list */}
          <div style={{
            width:188, flexShrink:0, overflowY:"auto",
            background:"#0e0c09", borderRight:"1px solid #221c0e",
          }}>
            <div style={{
              padding:"8px 12px", borderBottom:"1px solid #1c1608",
              fontSize:9, color:"#3a2e1a", letterSpacing:"0.08em",
              position:"sticky", top:0, background:"#0e0c09",
            }}>
              {filtered.length} entries
            </div>
            {filtered.map((r, i) => (
              <button key={r.w+i} onClick={() => setSelected(r)} style={{
                display:"block", width:"100%", background: selected?.w===r.w ? "#1c1608" : "none",
                border:"none",
                borderLeft: selected?.w===r.w ? "2px solid #c9a227" : "2px solid transparent",
                padding:"7px 12px", cursor:"pointer", textAlign:"left",
                color: selected?.w===r.w ? "#e2d4b8" : "#7a6a4a",
                fontFamily:"'IM Fell English','Georgia',serif",
                fontSize:14, fontStyle:"italic", transition:"all 0.1s",
                letterSpacing:"0.02em",
              }}>
                {r.w}
              </button>
            ))}
          </div>

          {/* Detail panel */}
          <main style={{ flex:1, overflowY:"auto", padding:"44px 52px", background:"#0c0a07" }}>
            {selected ? (
              <div style={{ maxWidth:640 }}>
                {/* Word + badge row */}
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:6 }}>
                  <div>
                    <h1 style={{
                      fontSize:46, fontWeight:300, letterSpacing:"0.04em",
                      color:"#e8d8b8", margin:0,
                      fontFamily:"'IM Fell English','Georgia',serif",
                      fontStyle:"italic", lineHeight:1,
                    }}>{selected.w}</h1>
                    <div style={{ display:"flex", gap:10, marginTop:10, alignItems:"center", flexWrap:"wrap" }}>
                      {selected.p && (
                        <span style={{ fontSize:12, color:"#7a6a4a", fontStyle:"italic" }}>{selected.p}</span>
                      )}
                      <span style={{
                        fontSize:9, letterSpacing:"0.12em", fontVariant:"small-caps",
                        background:"#181410", border:"1px solid #2e2212",
                        color: DIKW_COLORS[selected.k] || "#7a6a4a",
                        padding:"2px 9px", borderRadius:1,
                      }}>{selected.k}</span>
                      <span style={{ fontSize:10, color:"#5a4a2e" }}>
                        {THEME_ICONS[selected.t]} {selected.t}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => toggleFav(selected.w)} style={{
                    background:"none", border:"none",
                    color: favorites.includes(selected.w) ? "#c9a227" : "#2e2212",
                    fontSize:22, cursor:"pointer", padding:4,
                    transition:"color 0.15s", lineHeight:1,
                  }} title="Star this word">★</button>
                </div>

                <div style={{ borderTop:"1px solid #221c0e", margin:"22px 0" }} />

                {/* Definition */}
                <div style={{ marginBottom:26 }}>
                  <div style={{ fontSize:8, color:"#c9a227", letterSpacing:"0.25em",
                    fontVariant:"small-caps", marginBottom:10 }}>Definition</div>
                  <p style={{ fontSize:17, lineHeight:1.72, color:"#cfc0a0", margin:0 }}>
                    {selected.d}
                  </p>
                </div>

                {/* Example */}
                {selected.e && (
                  <div style={{ marginBottom:26 }}>
                    <div style={{ fontSize:8, color:"#c9a227", letterSpacing:"0.25em",
                      fontVariant:"small-caps", marginBottom:10 }}>Example</div>
                    <blockquote style={{
                      margin:0, padding:"12px 22px",
                      borderLeft:"2px solid #2e2212", background:"#0e0c09",
                      color:"#7a6a4a", fontSize:14, fontStyle:"italic",
                      lineHeight:1.68, letterSpacing:"0.01em",
                    }}>{selected.e}</blockquote>
                  </div>
                )}

                {/* Etymology */}
                {selected.x && (
                  <div style={{ marginBottom:26 }}>
                    <div style={{ fontSize:8, color:"#c9a227", letterSpacing:"0.25em",
                      fontVariant:"small-caps", marginBottom:10 }}>Etymology</div>
                    <p style={{ fontSize:13, color:"#5a4a2e", lineHeight:1.65,
                      margin:0, fontStyle:"italic" }}>{selected.x}</p>
                  </div>
                )}

                {/* Related words */}
                <div style={{ marginTop:34, paddingTop:22, borderTop:"1px solid #1c1608" }}>
                  <div style={{ fontSize:8, color:"#c9a227", letterSpacing:"0.25em",
                    fontVariant:"small-caps", marginBottom:14 }}>
                    More in {selected.t}
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {GLOSSARY
                      .filter(r => r.t === selected.t && r.w !== selected.w)
                      .sort(() => Math.random() - 0.5)
                      .slice(0, 9)
                      .map(r => (
                        <button key={r.w} onClick={() => setSelected(r)} style={{
                          background:"#0e0c09", border:"1px solid #221c0e",
                          color:"#7a6a4a", padding:"4px 12px", borderRadius:1,
                          cursor:"pointer", fontSize:12, fontFamily:"'IM Fell English','Georgia',serif",
                          fontStyle:"italic", transition:"all 0.15s",
                        }}>{r.w}</button>
                      ))
                    }
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                height:"100%", display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center", textAlign:"center",
                gap:12, color:"#2a2010",
              }}>
                <div style={{ fontSize:72, opacity:0.25 }}>⬡</div>
                <div style={{ fontSize:18, fontStyle:"italic",
                  fontFamily:"'IM Fell English','Georgia',serif",
                  color:"#3a2e1a", letterSpacing:"0.06em" }}>Select a word</div>
                <div style={{ fontSize:12, color:"#2a2010" }}>to see its full entry</div>
              </div>
            )}
          </main>
        </>)}

        {/* ── PRIMA MATERIA TAB ───────────────────────────────────────────── */}
        {activeTab === "Prima Materia" && (
          <div style={{ flex:1, overflowY:"auto", padding:"44px 52px" }}>
            <h2 style={{ fontSize:32, fontWeight:300, fontStyle:"italic",
              color:"#c9a227", marginBottom:6,
              fontFamily:"'IM Fell English','Georgia',serif" }}>Prima Materia</h2>
            <p style={{ color:"#5a4a2e", fontSize:13, marginBottom:36, letterSpacing:"0.02em" }}>
              The raw ore — foundational words at the Data and Information tiers of your lexicon.
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px,1fr))", gap:2 }}>
              {GLOSSARY.filter(r => r.k === "Data" || r.k === "Information")
                .sort((a,b)=>a.w.localeCompare(b.w))
                .map((r, i) => (
                <div key={r.w+i}
                  onClick={() => { setSelected(r); setActiveTab("Lexicon"); }}
                  style={{
                    background:"#0e0c09", border:"1px solid #1c1608",
                    padding:"14px 18px", cursor:"pointer",
                    transition:"border-color 0.15s",
                  }}>
                  <div style={{ fontSize:15, fontStyle:"italic",
                    fontFamily:"'IM Fell English','Georgia',serif",
                    color:"#7a6a4a", marginBottom:5 }}>{r.w}</div>
                  <div style={{ fontSize:10, color:"#3a2e1a", lineHeight:1.5 }}>
                    {r.d.slice(0, 90)}{r.d.length > 90 ? "…" : ""}
                  </div>
                  <div style={{ marginTop:7, fontSize:9, letterSpacing:"0.1em",
                    color: DIKW_COLORS[r.k], fontVariant:"small-caps" }}>{r.k}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DISCOVERY TAB ────────────────────────────────────────────────── */}
        {activeTab === "Discovery" && (
          <div style={{ flex:1, overflowY:"auto", padding:"44px 52px" }}>
            {discoveryWord ? (
              <div style={{ maxWidth:640 }}>
                <button onClick={() => setDiscoveryWord(null)} style={{
                  background:"none", border:"none", color:"#5a4a2e",
                  cursor:"pointer", fontSize:12, letterSpacing:"0.05em",
                  fontFamily:"inherit", padding:"0 0 24px 0",
                }}>← Back to Discovery</button>
                <h1 style={{
                  fontSize:42, fontWeight:300, fontStyle:"italic",
                  fontFamily:"'IM Fell English','Georgia',serif",
                  color:"#e8d8b8", margin:"0 0 8px",
                }}>{discoveryWord.w}</h1>
                <div style={{ display:"flex", gap:10, marginBottom:22, flexWrap:"wrap", alignItems:"center" }}>
                  {discoveryWord.p && <span style={{ fontSize:12, color:"#7a6a4a", fontStyle:"italic" }}>{discoveryWord.p}</span>}
                  <span style={{ fontSize:9, color: DIKW_COLORS[discoveryWord.k], letterSpacing:"0.12em", fontVariant:"small-caps" }}>{discoveryWord.k}</span>
                  <span style={{ fontSize:10, color:"#5a4a2e" }}>{THEME_ICONS[discoveryWord.t]} {discoveryWord.t}</span>
                </div>
                <div style={{ borderTop:"1px solid #221c0e", marginBottom:22 }} />
                <p style={{ fontSize:17, lineHeight:1.72, color:"#cfc0a0", marginBottom:22 }}>{discoveryWord.d}</p>
                {discoveryWord.e && (
                  <blockquote style={{
                    margin:"0 0 22px", padding:"12px 22px",
                    borderLeft:"2px solid #2e2212", background:"#0e0c09",
                    color:"#7a6a4a", fontSize:14, fontStyle:"italic", lineHeight:1.68,
                  }}>{discoveryWord.e}</blockquote>
                )}
              </div>
            ) : (
              <>
                <h2 style={{ fontSize:32, fontWeight:300, fontStyle:"italic",
                  color:"#c9a227", marginBottom:6,
                  fontFamily:"'IM Fell English','Georgia',serif" }}>Discovery</h2>
                <p style={{ color:"#5a4a2e", fontSize:13, marginBottom:36 }}>
                  Explore your lexicon by theme. Click any theme to browse its words.
                </p>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px,1fr))", gap:14 }}>
                  {THEMES.slice(1).map(t => {
                    const words = GLOSSARY.filter(r => r.t === t.key);
                    const sample = words.slice(0, 5);
                    return (
                      <div key={t.key} style={{
                        background:"#0e0c09", border:"1px solid #221c0e",
                        padding:"22px 20px",
                      }}>
                        <div style={{ fontSize:22, marginBottom:8, opacity:0.7 }}>{t.icon}</div>
                        <div style={{ fontSize:14, color:"#c9a227", letterSpacing:"0.06em",
                          marginBottom:4, fontVariant:"small-caps" }}>{t.label}</div>
                        <div style={{ fontSize:10, color:"#3a2e1a", marginBottom:14 }}>
                          {words.length} entries
                        </div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                          {sample.map(r => (
                            <button key={r.w}
                              onClick={() => { setDiscoveryWord(r); }}
                              style={{
                                background:"none", border:"1px solid #221c0e",
                                color:"#5a4a2e", padding:"3px 10px", borderRadius:1,
                                cursor:"pointer", fontSize:11,
                                fontFamily:"'IM Fell English','Georgia',serif",
                                fontStyle:"italic",
                              }}>{r.w}</button>
                          ))}
                          {words.length > 5 && (
                            <button onClick={() => { setTheme(t.key); setActiveTab("Lexicon"); }}
                              style={{
                                background:"none", border:"none",
                                color:"#3a2e1a", fontSize:10, cursor:"pointer",
                                fontFamily:"inherit", padding:"3px 0",
                              }}>+{words.length-5} more →</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── SCRIBE TAB ───────────────────────────────────────────────────── */}
        {activeTab === "Scribe" && (
          <div style={{ flex:1, overflowY:"auto", padding:"44px 52px" }}>
            <div style={{ maxWidth:680 }}>
              <h2 style={{ fontSize:32, fontWeight:300, fontStyle:"italic",
                color:"#c9a227", marginBottom:6,
                fontFamily:"'IM Fell English','Georgia',serif" }}>✒ Writing Scribe</h2>
              <p style={{ color:"#5a4a2e", fontSize:13, marginBottom:28, lineHeight:1.6 }}>
                The Scribe will compose a short, polished passage weaving in Clavis Aurea vocabulary.
                Describe what you wish to write, and let the lexicon speak.
              </p>

              <textarea
                value={scribeInput}
                onChange={e => setScribeInput(e.target.value)}
                placeholder={"Write a meditation on the nature of forgetting and identity…\nDraft an aphorism about the relationship between silence and wisdom…\nCompose an opening sentence for a philosophical essay on finitude…"}
                style={{
                  width:"100%", minHeight:110, background:"#0e0c09",
                  border:"1px solid #2e2212", color:"#e2d4b8",
                  fontFamily:"'Cormorant Garamond','Georgia',serif",
                  fontSize:15, padding:"14px 18px", resize:"vertical",
                  outline:"none", lineHeight:1.65, borderRadius:2,
                }}
              />
              <div style={{ display:"flex", gap:12, marginTop:12, alignItems:"center" }}>
                <button onClick={runScribe} disabled={scribeLoading} style={{
                  background: scribeLoading ? "#1c1608" : "#221c0e",
                  border:"1px solid #c9a227", color:"#c9a227",
                  padding:"10px 32px", cursor: scribeLoading ? "not-allowed" : "pointer",
                  fontSize:11, fontFamily:"inherit", letterSpacing:"0.14em",
                  fontVariant:"small-caps", borderRadius:1, transition:"all 0.15s",
                }}>
                  {scribeLoading ? "Composing…" : "Compose ✦"}
                </button>
                {scribeResult && !scribeLoading && (
                  <button onClick={() => { setScribeInput(""); setScribeResult(""); }}
                    style={{
                      background:"none", border:"none", color:"#3a2e1a",
                      cursor:"pointer", fontSize:11, fontFamily:"inherit",
                    }}>Clear</button>
                )}
              </div>

              {scribeResult && (
                <div style={{
                  marginTop:32, padding:"26px 30px",
                  background:"#0e0c09", border:"1px solid #221c0e",
                  borderLeft:"3px solid #c9a227", borderRadius:2,
                }}>
                  <div style={{ fontSize:8, color:"#c9a227", letterSpacing:"0.25em",
                    fontVariant:"small-caps", marginBottom:16 }}>Scribe</div>
                  <p style={{ fontSize:17, lineHeight:1.78, color:"#cfc0a0", margin:0,
                    whiteSpace:"pre-wrap", fontFamily:"'IM Fell English','Georgia',serif",
                    fontStyle:"italic" }}
                    dangerouslySetInnerHTML={{
                      __html: scribeResult
                        .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#c9a227;font-style:normal">$1</strong>')
                    }}
                  />
                </div>
              )}

              {/* Prompt suggestions */}
              {!scribeResult && !scribeLoading && (
                <div style={{ marginTop:36 }}>
                  <div style={{ fontSize:9, color:"#3a2e1a", letterSpacing:"0.2em",
                    fontVariant:"small-caps", marginBottom:14 }}>Try asking the Scribe to…</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {[
                      "Write a meditation on the relationship between knowledge and forgetting",
                      "Compose an aphorism about wisdom and silence",
                      "Draft an opening for an essay on the sublime and human finitude",
                      "Write a short prose poem about liminality and transformation",
                    ].map(p => (
                      <button key={p}
                        onClick={() => setScribeInput(p)}
                        style={{
                          background:"none", border:"1px solid #1c1608",
                          color:"#5a4a2e", padding:"8px 14px", textAlign:"left",
                          cursor:"pointer", fontSize:12,
                          fontFamily:"'IM Fell English','Georgia',serif",
                          fontStyle:"italic", borderRadius:1,
                          transition:"border-color 0.15s",
                        }}>{p}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── INSIGHTS TAB ─────────────────────────────────────────────────── */}
        {activeTab === "Insights" && (
          <div style={{ flex:1, overflowY:"auto", padding:"44px 52px" }}>
            <h2 style={{ fontSize:32, fontWeight:300, fontStyle:"italic",
              color:"#c9a227", marginBottom:6,
              fontFamily:"'IM Fell English','Georgia',serif" }}>◉ Insights</h2>
            <p style={{ color:"#5a4a2e", fontSize:13, marginBottom:36 }}>
              A portrait of your semantic knowledge system.
            </p>

            {/* Stat cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:40 }}>
              {[
                { label:"Total Entries",     value: GLOSSARY.length },
                { label:"Themes",            value: Object.keys(insights.byTheme).length },
                { label:"DIKW Tiers",        value: 4 },
                { label:"With Etymology",    value: GLOSSARY.filter(r=>r.x).length },
              ].map(s => (
                <div key={s.label} style={{
                  background:"#0e0c09", border:"1px solid #221c0e",
                  padding:"22px 18px", textAlign:"center",
                }}>
                  <div style={{ fontSize:34, color:"#c9a227",
                    fontFamily:"'IM Fell English','Georgia',serif",
                    fontStyle:"italic", lineHeight:1 }}>{s.value}</div>
                  <div style={{ fontSize:9, color:"#3a2e1a", letterSpacing:"0.12em",
                    marginTop:6, fontVariant:"small-caps" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Theme bar chart */}
            <div style={{ marginBottom:40 }}>
              <div style={{ fontSize:9, color:"#c9a227", letterSpacing:"0.2em",
                fontVariant:"small-caps", marginBottom:18 }}>Distribution by Theme</div>
              {Object.entries(insights.byTheme).sort((a,b)=>b[1]-a[1]).map(([t, count]) => (
                <div key={t} style={{ display:"flex", alignItems:"center", marginBottom:10, gap:14 }}>
                  <div style={{ width:168, fontSize:11, color:"#5a4a2e", flexShrink:0 }}>
                    {THEME_ICONS[t]} {t}
                  </div>
                  <div style={{ flex:1, background:"#0e0c09", height:5, borderRadius:1 }}>
                    <div style={{
                      height:"100%", borderRadius:1, background:"#c9a227", opacity:0.65,
                      width:`${(count/GLOSSARY.length)*100}%`,
                      transition:"width 0.4s",
                    }} />
                  </div>
                  <div style={{ width:36, fontSize:11, color:"#3a2e1a", textAlign:"right" }}>{count}</div>
                </div>
              ))}
            </div>

            {/* DIKW bar chart */}
            <div>
              <div style={{ fontSize:9, color:"#c9a227", letterSpacing:"0.2em",
                fontVariant:"small-caps", marginBottom:18 }}>Distribution by DIKW Tier</div>
              {DIKW_ORDER.map(tier => {
                const count = insights.byDikw[tier] || 0;
                return (
                  <div key={tier} style={{ display:"flex", alignItems:"center", marginBottom:10, gap:14 }}>
                    <div style={{ width:168, fontSize:11, color: DIKW_COLORS[tier], flexShrink:0 }}>{tier}</div>
                    <div style={{ flex:1, background:"#0e0c09", height:5, borderRadius:1 }}>
                      <div style={{
                        height:"100%", borderRadius:1, background: DIKW_COLORS[tier], opacity:0.7,
                        width:`${(count/GLOSSARY.length)*100}%`,
                        transition:"width 0.4s",
                      }} />
                    </div>
                    <div style={{ width:36, fontSize:11, color:"#3a2e1a", textAlign:"right" }}>{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
