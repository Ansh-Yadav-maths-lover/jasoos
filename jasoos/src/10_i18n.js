/* ============================================================
   JASOOS v2 — i18n
   One line per key:  key|hinglish|हिंदी|english
   ============================================================ */
const LANGS = [
  { id:'hin', name:'Hinglish',  sub:'Roman Hindi — sabse aasaan', flag:'🗣️' },
  { id:'hi',  name:'हिंदी',      sub:'देवनागरी में पूरा खेल',        flag:'🪔' },
  { id:'en',  name:'English',   sub:'For the whole gang',        flag:'🌐' },
];
const STR = `
ui.back|Peeche|पीछे|Back
ui.next|Aage|आगे|Next
ui.done|Ho gaya|हो गया|Done
ui.cancel|Cancel|रद्द करें|Cancel
ui.close|Band karo|बंद करें|Close
ui.save|Save karo|सेव करें|Save
ui.copy|Copy link|लिंक कॉपी करें|Copy link
ui.share|Share|शेयर|Share
ui.whatsapp|WhatsApp par bhejo|व्हाट्सएप पर भेजो|Send on WhatsApp
ui.you|tum|आप|you
ui.host|Host|होस्ट|Host
ui.guest|Guest|मेहमान|Guest
ui.skip|Skip|छोड़ें|Skip
ui.start|Shuru karo|शुरू करो|Start
ui.home|Ghar jao|होम|Home
ui.quit|Khel chhodo|खेल छोड़ें|Quit game
ui.retry|Dobara try karo|दोबारा कोशिश करें|Try again
ui.players|Khiladi|खिलाड़ी|Players
ui.round|Round|राउंड|Round
ui.rules|Kaise khelein|कैसे खेलें|How to play
ui.settings|Settings|सेटिंग्स|Settings
ui.cats|Categories|श्रेणियाँ|Categories
ui.stats|Stats|आंकड़े|Stats
ui.sound|Sound|आवाज़|Sound
ui.on|On|चालू|On
ui.off|Off|बंद|Off
ui.lang|Language|भाषा|Language
ui.selectall|Sab select|सभी चुनें|Select all
ui.clear|Clear|साफ़ करें|Clear
ui.waiting|Intezaar…|इंतज़ार…|Waiting…
ui.jasoos|JASOOS|जासूस|JASOOS
ui.nagrik|NAGRIK|नागरिक|CITIZEN
ui.bot|Bot|बॉट|Bot
ui.new|Naya|नया|New

home.tag|जासूस · The Desi Imposter|जासूस · देसी इम्पोस्टर|JASOOS · The Desi Imposter
home.sub|Sabko ek hi secret word milta hai — Jasoos ko nahi. Ek shabd ka clue do, phir sab vote karo.|सबको एक ही गुप्त शब्द मिलता है — जासूस को नहीं। एक शब्द का क्लू दो, फिर सब वोट करो।|Everyone gets the same secret word — except the Jasoos. Give one-word clues, then everyone votes.
home.p1|3–12 khiladi|3–12 खिलाड़ी|3–12 players
home.p2|{n} desi shabd|{n} देसी शब्द|{n} desi words
home.p3|{n} categories|{n} श्रेणियाँ|{n} categories
home.p4|Offline bhi|ऑफ़लाइन भी|Works offline
home.m1t|Ek Phone — Pass & Play|एक फ़ोन — पास एंड प्ले|One Phone — Pass & Play
home.m1s|Sab ek hi phone par. Ghar, bus, chhat — kahin bhi.|सब एक ही फ़ोन पर। घर, बस, छत — कहीं भी।|Everyone on one phone. Home, bus, rooftop — anywhere.
home.m2t|Online Room|ऑनलाइन रूम|Online Room
home.m2s|Sabke apne phone. Code bhejo, jud jao.|सबके अपने फ़ोन। कोड भेजो, जुड़ जाओ।|Everyone on their own phone. Send the code, join in.
home.m3t|Join Code|कोड से जुड़ो|Join with Code
home.m3s|Dost ne code bheja hai? Yahan dalo.|दोस्त ने कोड भेजा है? यहाँ डालो।|Got a code from a friend? Enter it here.
home.m4t|Akele Khelo — vs Bots|अकेले खेलो — बॉट्स के साथ|Solo — vs Bots
home.m4s|Koi nahi hai? 5 bot khiladi tumhare saath.|कोई नहीं है? 5 बॉट खिलाड़ी तुम्हारे साथ।|Nobody around? 5 bot players will play with you.
home.m5t|Aaj ka Jasoos|आज का जासूस|Daily Jasoos
home.m5s|Roz ek naya shabd. Poore India ke liye same.|रोज़ एक नया शब्द। पूरे भारत के लिए एक ही।|One new word every day — same for all of India.
home.m5done|Aaj khel liya · streak {n}|आज खेल लिया · स्ट्रीक {n}|Played today · streak {n}
home.install|Phone par app ki tarah install karo — offline bhi chalega|फ़ोन पर ऐप की तरह इंस्टॉल करो — ऑफ़लाइन भी चलेगा|Install it like an app — works offline too
home.installb|Install|इंस्टॉल|Install

ob.s1h|Ek shabd. Sab jhooth.|एक शब्द। सब झूठ।|One word. Everybody lies.
ob.s1p|Sabko ek hi secret word milta hai — jaise Vada Pav. Bas ek khiladi ko kuch nahi milta. Woh Jasoos hai.|सबको एक ही गुप्त शब्द मिलता है — जैसे वडा पाव। बस एक खिलाड़ी को कुछ नहीं मिलता। वही जासूस है।|Everyone gets the same secret word — like Vada Pav. One player gets nothing. That player is the Jasoos.
ob.s2h|Ek shabd ka clue|एक शब्द का क्लू|One-word clues
ob.s2p|Bari-bari se sab ek clue dete hain. Saabit karo ki tum jaante ho — par itna aasaan nahi ki Jasoos copy kar le.|बारी-बारी से सब एक क्लू देते हैं। साबित करो कि तुम जानते हो — पर इतना आसान नहीं कि जासूस कॉपी कर ले।|Everyone gives one clue in turn. Prove you know the word — but not so plainly that the Jasoos can copy you.
ob.s3h|Shak. Bahes. Vote.|शक। बहस। वोट।|Suspect. Argue. Vote.
ob.s3p|Clues ke baad khul kar bahes karo, phir sab milkar ek khiladi ko bahar karte hain.|क्लू के बाद खुलकर बहस करो, फिर सब मिलकर एक खिलाड़ी को बाहर करते हैं।|After the clues, argue it out — then everyone votes one player out.
ob.s4h|Jasoos ka aakhri daav|जासूस का आख़िरी दाँव|The Jasoos gets one last shot
ob.s4p|Jasoos pakda gaya? Use ek mauka milta hai — sahi word guess kiya to baazi palat gayi.|जासूस पकड़ा गया? उसे एक मौका मिलता है — सही शब्द बता दिया तो बाज़ी पलट गई।|Caught the Jasoos? They get one guess — name the secret word and they steal the win.
ob.go|Chalo khelein|चलो खेलें|Let's play
ob.pick|Bhasha chuno|भाषा चुनो|Choose your language

set.title|Khiladi & Settings|खिलाड़ी और सेटिंग्स|Players & Settings
set.addname|Naam likho…|नाम लिखो…|Type a name…
set.add|Add|जोड़ें|Add
set.need3|Kam se kam 3 khiladi|कम से कम 3 खिलाड़ी|At least 3 players
set.need3b|3 khiladi chahiye|3 खिलाड़ी चाहिए|Need 3 players
set.max|Max 12 khiladi|अधिकतम 12 खिलाड़ी|Max 12 players
set.dupe|Yeh naam already hai|यह नाम पहले से है|That name is taken
set.typename|Naam likho|नाम लिखो|Type a name
set.empty|Kam se kam 3 khiladi add karo.|कम से कम 3 खिलाड़ी जोड़ो।|Add at least 3 players.
set.catnote|Shabd unhi categories se aayenge jo tum on rakhoge.|शब्द उन्हीं श्रेणियों से आएंगे जो तुम चालू रखोगे।|Words come only from the categories you switch on.
set.catmin|Kam se kam ek category|कम से कम एक श्रेणी|Keep at least one category
set.hostonly|Sirf host settings badal sakta hai|केवल होस्ट सेटिंग्स बदल सकता है|Only the host can change settings
set.spies|Jasoos kitne|जासूस कितने|Number of Jasoos
set.spiesS|Imposters ki ginti|इम्पोस्टर की गिनती|How many imposters
set.hide|Jasoos ko kya mile|जासूस को क्या मिले|What the Jasoos gets
set.hideS|Blank = kuch nahi · Dhokha = milta-julta shabd|खाली = कुछ नहीं · धोखा = मिलता-जुलता शब्द|Blank = nothing · Decoy = a similar word
set.blank|Blank|खाली|Blank
set.decoy|Dhokha|धोखा|Decoy
set.rounds|Clue rounds|क्लू राउंड|Clue rounds
set.roundsS|Vote se pehle kitne round|वोट से पहले कितने राउंड|Rounds before the vote
set.turnT|Turn timer|टर्न टाइमर|Turn timer
set.turnTS|Har clue ke liye|हर क्लू के लिए|Per clue
set.discT|Bahes ka time|बहस का समय|Discussion time
set.discTS|Vote se pehle khuli bahes|वोट से पहले खुली बहस|Open debate before the vote
set.steal|Steal chance|स्टील चांस|Steal chance
set.stealS|Pakde jane par Jasoos guess kar sakta hai|पकड़े जाने पर जासूस अनुमान लगा सकता है|A caught Jasoos may guess the word
set.log|Clue kaise|क्लू कैसे|Clue entry
set.logS|Type = phone par likho · Bolo = sirf zubaani|टाइप = फ़ोन पर लिखो · बोलो = सिर्फ़ ज़ुबानी|Type = write on the phone · Speak = out loud only
set.type|Type|टाइप|Type
set.talk|Bolo|बोलो|Speak
set.script|Shabd ki bhasha|शब्द की भाषा|Word script
set.scriptS|Card par shabd kaise dikhe|कार्ड पर शब्द कैसे दिखे|How words appear on the card
set.both|Dono|दोनों|Both
set.diff|Bot ka dimaag|बॉट का दिमाग़|Bot difficulty
set.diffS|Bots kitna tez khelenge|बॉट कितना तेज़ खेलेंगे|How sharp the bots play
set.easy|Aasaan|आसान|Easy
set.normal|Theek|ठीक|Normal
set.hard|Kadak|कड़क|Hard
`;
