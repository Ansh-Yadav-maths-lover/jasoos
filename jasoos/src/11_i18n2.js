const STR2 = `
room.title|Room|रूम|Room
room.code|Room Code|रूम कोड|Room Code
room.copied|Link copy ho gaya|लिंक कॉपी हो गया|Link copied
room.hint|Dost link kholein, naam likhein, bas.|दोस्त लिंक खोलें, नाम लिखें, बस।|Friends open the link, type a name, done.
room.in|Room mein|रूम में|In the room
room.none|Koi nahi aaya… link bhejo.|कोई नहीं आया… लिंक भेजो।|Nobody yet… send the link.
room.waithost|Host ke shuru karne ka intezaar…|होस्ट के शुरू करने का इंतज़ार…|Waiting for the host to start…
room.full|Room full hai (12 tak)|रूम भर गया (12 तक)|Room is full (max 12)
room.code4|4 letter ka code dalo|4 अक्षर का कोड डालो|Enter the 4-letter code
room.joinfail|Join fail — code check karo|जॉइन फेल — कोड जाँचो|Join failed — check the code
room.makefail|Room nahi bana — dobara try karo|रूम नहीं बना — दोबारा कोशिश करो|Couldn't create the room — try again
room.making|Room ban raha hai…|रूम बन रहा है…|Creating the room…
room.joining|Jud rahe hain…|जुड़ रहे हैं…|Joining…
room.gone|gaya|गया|left
room.dropped|{name} ka connection gaya…|{name} का कनेक्शन गया…|{name} lost connection…
room.dropout|{name} bahar ho gaya|{name} बाहर हो गया|{name} dropped out
room.newhost|Purana host chala gaya — ab tum host ho. Round dobara shuru karo.|पुराना होस्ट चला गया — अब तुम होस्ट हो। राउंड दोबारा शुरू करो।|The old host left — you are the host now. Start a fresh round.
room.nolink|Connection nahi jud raha — dobara join karo|कनेक्शन नहीं जुड़ रहा — दोबारा जॉइन करो|Can't reconnect — please join again
room.kick|Nikalo|निकालो|Remove
room.kicked|Host ne tumhe room se nikal diya|होस्ट ने तुम्हें रूम से निकाल दिया|The host removed you from the room
room.nextround|{name} agle round mein aayega|{name} अगले राउंड में आएगा|{name} joins next round
room.yourname|Tumhara naam|तुम्हारा नाम|Your name
room.avhint|Avatar tap karke badlo.|अवतार टैप करके बदलो।|Tap the avatar to change it.
room.go|Chalo|चलो|Continue
room.askcode|Room code|रूम कोड|Room code
room.codehint|Host se 4-letter code maango, ya uska link kholo.|होस्ट से 4 अक्षर का कोड मांगो, या उसका लिंक खोलो।|Ask the host for the 4-letter code, or open their link.
room.invite|Aa jao JASOOS khelne — room code {code}|आ जाओ जासूस खेलने — रूम कोड {code}|Come play JASOOS — room code {code}

pass.hand|Phone pass karo|फ़ोन पास करो|Pass the phone
pass.note|Sirf tum dekho. Baaki sab dur raho.|सिर्फ़ तुम देखो। बाकी सब दूर रहो।|Only you look. Everyone else, look away.
pass.iam|Main hoon {name} — dikhao|मैं हूँ {name} — दिखाओ|I'm {name} — show me

rev.mine|Tumhara card|तुम्हारा कार्ड|Your card
rev.of|{name} ka card|{name} का कार्ड|{name}'s card
rev.tap|Tap to reveal|खोलने के लिए टैप करो|Tap to reveal
rev.noword|— koi shabd nahi —|— कोई शब्द नहीं —|— no word —
rev.decoy|Yeh asli shabd NAHI hai. Milta-julta hai.|यह असली शब्द नहीं है। मिलता-जुलता है।|This is NOT the real word. It's a close one.
rev.ok|Samajh gaya|समझ गया|Got it
rev.hide|Chhupao & aage|छुपाओ और आगे|Hide & next
rev.allseen|Sabne dekh liya — khel shuru|सबने देख लिया — खेल शुरू|Everyone's seen it — let's play
rev.others|Baaki khiladi dekh rahe hain ({n}/{m})|बाकी खिलाड़ी देख रहे हैं ({n}/{m})|Others are still looking ({n}/{m})
rev.jodi|Doosra Jasoos: {name}|दूसरा जासूस: {name}|Your fellow Jasoos: {name}
spy.h1|Tumhe shabd nahi mila. Doosron ke clues sun kar bluff maaro.|तुम्हें शब्द नहीं मिला। दूसरों के क्लू सुनकर बहाना बनाओ।|You didn't get the word. Listen to the others and bluff.
spy.h2|Bas confidently kuch bolo. Koi shak na kare.|बस पूरे विश्वास से कुछ बोलो। किसी को शक न हो।|Just say something confidently. Don't let anyone suspect.
spy.h3|Sabse pehle bolna khatarnak hai. Sunte raho, phir bolo.|सबसे पहले बोलना ख़तरनाक है। सुनते रहो, फिर बोलो।|Going first is dangerous. Listen, then speak.
civ.h1|Ek shabd ka clue do — na bahut aasaan, na bahut mushkil.|एक शब्द का क्लू दो — न बहुत आसान, न बहुत मुश्किल।|Give a one-word clue — not too easy, not too cryptic.
civ.h2|Aisa clue jo Jasoos copy na kar sake.|ऐसा क्लू जो जासूस कॉपी न कर सके।|A clue the Jasoos can't copy.
civ.h3|Zyada obvious hua to Jasoos bach jayega.|ज़्यादा साफ़ बताया तो जासूस बच जाएगा।|Too obvious and the Jasoos slips away.

clue.turn|Baari hai|बारी है|Their turn
clue.myturn|Tumhari baari|तुम्हारी बारी|Your turn
clue.mycard|Mera card|मेरा कार्ड|My card
clue.ph|Tumhara clue…|तुम्हारा क्लू…|Your clue…
clue.phl|{name} ka clue…|{name} का क्लू…|{name}'s clue…
clue.send|Bolo|बोलो|Send
clue.said|{name} ne bol diya|{name} ने बोल दिया|{name} has spoken
clue.isaid|Main bol chuka|मैं बोल चुका|I've said mine
clue.wait|{name} ka clue aa raha hai…|{name} का क्लू आ रहा है…|Waiting for {name}'s clue…
clue.rule|Ek-do shabd. Secret word bolna mana hai.|एक-दो शब्द। गुप्त शब्द बोलना मना है।|One or two words. Saying the secret word is banned.
clue.banned|Secret word nahi bol sakte!|गुप्त शब्द नहीं बोल सकते!|You can't say the secret word!
clue.write|Kuch likho|कुछ लिखो|Write something
clue.empty|Ek shabd ka clue do — aisa jo saabit kare tum jaante ho, par Jasoos ko na bataye.|एक शब्द का क्लू दो — ऐसा जो साबित करे तुम जानते हो, पर जासूस को न बताए।|Give a one-word clue that proves you know it, without handing it to the Jasoos.
clue.onephone|Sab ek phone par — card yahan nahi dikha sakte|सब एक फ़ोन पर — कार्ड यहाँ नहीं दिखा सकते|Everyone's on one phone — can't show the card here

dis.title|Bahes — Discussion|बहस — डिस्कशन|Debate time
dis.note|Sab clues upar hain. Kis par shak hai? Baat karo, phir vote.|सब क्लू ऊपर हैं। किस पर शक है? बात करो, फिर वोट।|All the clues are above. Who looks off? Talk it out, then vote.
dis.tovote|Vote karo|वोट करो|Go to vote
dis.noclues|Koi clue record nahi hua — zubaani yaad karo.|कोई क्लू रिकॉर्ड नहीं हुआ — ज़ुबानी याद करो।|No clues were logged — go from memory.

vote.title|Vote|वोट|Vote
vote.hands|Haath uthao|हाथ उठाओ|Show of hands
vote.who|Kis ko bahar karna hai?|किसको बाहर करना है?|Who's getting voted out?
vote.tapcount|Har khiladi ke vote ko yahan tap karke count karo.|हर खिलाड़ी के वोट को यहाँ टैप करके गिनो।|Tap to count each player's vote.
vote.left|{n} vote bache|{n} वोट बचे|{n} votes left
vote.alldone|Sab vote ho gaye|सब वोट हो गए|All votes in
vote.progress|{n} / {m} voted|{n} / {m} ने वोट किया|{n} / {m} voted
vote.locked|Vote lock ho gaya. Baaki ka intezaar…|वोट लॉक हो गया। बाकी का इंतज़ार…|Vote locked. Waiting for the rest…
vote.out|Tum bahar ho — dekhte raho.|तुम बाहर हो — देखते रहो।|You're out — just watch.
vote.nobody|Koi nahi / skip|कोई नहीं / छोड़ें|Nobody / skip
vote.reset|Reset|रीसेट|Reset
vote.result|Nateeja dekho|नतीजा देखो|See the result
vote.full|Poore vote ho gaye — Reset karo ya Nateeja dekho|पूरे वोट हो गए — रीसेट करो या नतीजा देखो|All votes counted — reset or see the result
vote.busy|Baaki khiladi vote kar rahe hain…|बाकी खिलाड़ी वोट कर रहे हैं…|Others are still voting…

ej.pre|Bahar nikala gaya|बाहर निकाला गया|Voted out
ej.prenone|Vote ka nateeja|वोट का नतीजा|Vote result
ej.tie|Tie — koi nahi|टाई — कोई नहीं|Tie — nobody
ej.nonev|Koi bahar nahi gaya|कोई बाहर नहीं गया|Nobody went out
ej.nonen|Barabar vote. Ek aur round khelo.|बराबर वोट। एक और राउंड खेलो।|Votes tied. Play another round.
ej.wasspy|YEH JASOOS THA!|यही जासूस था!|THAT WAS THE JASOOS!
ej.wasspyn|Nagriko ne pakad liya.|नागरिकों ने पकड़ लिया।|The citizens caught them.
ej.wasciv|Yeh NAGRIK tha|यह नागरिक था|That was a CITIZEN
ej.wascivn|Bekaar mein ek nagrik chala gaya. Jasoos abhi bhi andar hai.|बेकार में एक नागरिक चला गया। जासूस अभी भी अंदर है।|An innocent is gone. The Jasoos is still among you.

gs.pre|Jasoos ka aakhri mauka|जासूस का आख़िरी मौका|The Jasoos' last chance
gs.mine|Secret word guess karo|गुप्त शब्द बताओ|Guess the secret word
gs.other|{name} guess kar raha hai…|{name} अनुमान लगा रहा है…|{name} is guessing…
gs.noteM|Sahi guess = Jasoos ne bazi palat di. Galat = Nagrik jeet gaye.|सही बताया = जासूस ने बाज़ी पलट दी। ग़लत = नागरिक जीत गए।|Right answer = the Jasoos steals it. Wrong = the citizens win.
gs.noteO|Jasoos pakda gaya, par ek mauka mila hai. Dua karo galat guess kare.|जासूस पकड़ा गया, पर एक मौका मिला है। दुआ करो ग़लत बताए।|The Jasoos is caught but gets one shot. Pray they get it wrong.
gs.final|Final answer|फ़ाइनल जवाब|Final answer
gs.give|Phone {name} ko do|फ़ोन {name} को दो|Hand the phone to {name}

end.civ|Nagrik jeet gaye!|नागरिक जीत गए!|Citizens win!
end.civn|Jasoos pakda gaya. Izzat bach gayi.|जासूस पकड़ा गया। इज़्ज़त बच गई।|The Jasoos was caught. Honour intact.
end.spy|Jasoos jeet gaya!|जासूस जीत गया!|The Jasoos wins!
end.spyn|Bilkul saamne tha aur kisi ko shak nahi hua.|बिल्कुल सामने था और किसी को शक नहीं हुआ।|Right in front of you, and nobody suspected.
end.steal|Jasoos ne baazi palat di!|जासूस ने बाज़ी पलट दी!|The Jasoos stole it!
end.stealn|Pakda gaya… par secret word sahi guess kar liya.|पकड़ा गया… पर गुप्त शब्द सही बता दिया।|Caught… but named the secret word anyway.
end.guessed|Guess|अनुमान|Guess
end.wordwas|Secret word tha|गुप्त शब्द था|The secret word was
end.score|Scoreboard|स्कोरबोर्ड|Scoreboard
end.again|Agla round|अगला राउंड|Next round
end.hostnext|Host agla round shuru karega…|होस्ट अगला राउंड शुरू करेगा…|The host will start the next round…
end.finish|Khatam — ghar jao|खत्म — होम जाओ|Finish — go home
end.sharecard|Nateeja share karo|नतीजा शेयर करो|Share the result

wait.title|Round chal raha hai|राउंड चल रहा है|A round is running
wait.note|Agle round mein tum bhi khel loge — yahin ruko.|अगले राउंड में तुम भी खेलोगे — यहीं रुको।|You'll join the next round — hang on here.
wait.info|{n} khiladi khel rahe hain · Round {r}|{n} खिलाड़ी खेल रहे हैं · राउंड {r}|{n} players in game · Round {r}
wait.leave|Chhodo|छोड़ो|Leave
`;
