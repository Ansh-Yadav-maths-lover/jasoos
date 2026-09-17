/* ============================================================
   Word DB — "English/Hinglish|Devanagari"
   Related words are kept ADJACENT so decoys land close.
   ============================================================ */
const CATRAW = [];
CATRAW.push({id:'food',e:'🍛',n:'Street Food|चाट-पकौड़ी|Street Food',w:`
Vada Pav|वडा पाव
Pav Bhaji|पाव भाजी
Misal Pav|मिसळ पाव
Samosa|समोसा
Kachori|कचौड़ी
Aloo Tikki|आलू टिक्की
Pani Puri|पानी पूरी
Bhel Puri|भेल पूरी
Sev Puri|सेव पूरी
Dahi Puri|दही पूरी
Papdi Chaat|पापड़ी चाट
Dahi Vada|दही वड़ा
Chole Bhature|छोले भटूरे
Rajma Chawal|राजमा चावल
Chole Kulche|छोले कुलचे
Masala Dosa|मसाला डोसा
Idli Sambar|इडली सांभर
Medu Vada|मेदू वड़ा
Uttapam|उत्तपम
Rava Dosa|रवा डोसा
Poha|पोहा
Upma|उपमा
Sabudana Khichdi|साबूदाना खिचड़ी
Litti Chokha|लिट्टी चोखा
Dal Baati|दाल बाटी
Kathi Roll|कठी रोल
Egg Roll|एग रोल
Momos|मोमोज़
Chowmein Thela|चाउमीन ठेला
Manchurian|मंचूरियन
Pav Sandwich|पाव सैंडविच
Bombay Toast|बॉम्बे टोस्ट
Bread Pakoda|ब्रेड पकौड़ा
Onion Pakoda|प्याज़ पकौड़ा
Mirchi Bajji|मिर्ची बज्जी
Chai aur Bhajiya|चाय और भजिया
Cutting Chai|कटिंग चाय
Filter Coffee|फ़िल्टर कॉफ़ी
Nimbu Pani|नींबू पानी
Sugarcane Juice|गन्ने का रस
Bhutta|भुट्टा
Chana Jor Garam|चना जोर गरम
Peanut Cone|मूंगफली का ठोंगा
Golgappa Wala|गोलगप्पे वाला
Tandoori Momo|तंदूरी मोमो
Frankie|फ्रैंकी
Dabeli|दाबेली
Khaman Dhokla|खमन ढोकला
`});
CATRAW.push({id:'khana',e:'🍲',n:'Ghar ka Khana|घर का खाना|Home Cooking',w:`
Dal Chawal|दाल चावल
Roti Sabzi|रोटी सब्ज़ी
Aloo Paratha|आलू पराठा
Gobi Paratha|गोभी पराठा
Thepla|थेपला
Puri Aloo|पूरी आलू
Khichdi|खिचड़ी
Kadhi Chawal|कढ़ी चावल
Sambar Rice|सांभर चावल
Curd Rice|दही चावल
Rasam|रसम
Bisi Bele Bath|बिसी बेले बाथ
Puliyogare|पुलियोगरे
Biryani|बिरयानी
Pulao|पुलाव
Tehri|तहरी
Butter Chicken|बटर चिकन
Chicken Curry|चिकन करी
Fish Curry|मछली करी
Egg Curry|अंडा करी
Mutton Rogan Josh|मटन रोगन जोश
Nihari|निहारी
Keema Pav|कीमा पाव
Paneer Butter Masala|पनीर बटर मसाला
Palak Paneer|पालक पनीर
Shahi Paneer|शाही पनीर
Malai Kofta|मलाई कोफ़्ता
Baingan Bharta|बैंगन भरता
Bhindi Fry|भिंडी फ्राई
Aloo Gobi|आलू गोभी
Sarson ka Saag|सरसों का साग
Makki ki Roti|मक्की की रोटी
Chana Masala|चना मसाला
Rajma|राजमा
Dal Makhani|दाल मखनी
Dal Tadka|दाल तड़का
Sambar Powder|सांभर पाउडर
Garam Masala|गरम मसाला
Achaar|अचार
Papad|पापड़
Chutney|चटनी
Raita|रायता
Salad Pyaz|सलाद प्याज़
Ghee ki Roti|घी की रोटी
Tiffin Dabba|टिफ़िन डब्बा
Sunday Special|संडे स्पेशल
Maa ke Haath ka Khana|माँ के हाथ का खाना
Bachi Hui Roti|बची हुई रोटी
`});
CATRAW.push({id:'mithai',e:'🍬',n:'Mithai|मिठाई|Sweets & Drinks',w:`
Gulab Jamun|गुलाब जामुन
Rasgulla|रसगुल्ला
Rasmalai|रसमलाई
Cham Cham|चमचम
Sandesh|संदेश
Mishti Doi|मिष्टी दोई
Jalebi|जलेबी
Imarti|इमरती
Balushahi|बालूशाही
Ghevar|घेवर
Malpua|मालपुआ
Motichoor Laddu|मोतीचूर लड्डू
Besan Laddu|बेसन लड्डू
Til Laddu|तिल लड्डू
Kaju Katli|काजू कतली
Soan Papdi|सोन पापड़ी
Mysore Pak|मैसूर पाक
Barfi|बर्फ़ी
Peda|पेड़ा
Petha|पेठा
Halwa|हलवा
Gajar ka Halwa|गाजर का हलवा
Sooji Halwa|सूजी हलवा
Kheer|खीर
Payasam|पायसम
Phirni|फिरनी
Shrikhand|श्रीखंड
Basundi|बासुंदी
Rabri|रबड़ी
Kulfi|कुल्फ़ी
Falooda|फ़ालूदा
Matka Kulfi|मटका कुल्फ़ी
Ice Gola|आइस गोला
Lassi|लस्सी
Chaas|छाछ
Thandai|ठंडाई
Aam Panna|आम पन्ना
Jaljeera|जलजीरा
Rooh Afza|रूह अफ़ज़ा
Mango Shake|मैंगो शेक
Masala Chai|मसाला चाय
Adrak Chai|अदरक वाली चाय
Kadak Chai|कड़क चाय
Tapri Chai|टपरी चाय
Coconut Water|नारियल पानी
Sol Kadhi|सोल कढ़ी
Badam Milk|बादाम दूध
Chukku Kappi|चुक्कु कॉफ़ी
`});
CATRAW.push({id:'films',e:'🎬',n:'Bollywood|बॉलीवुड|Bollywood Films',w:`
Sholay|शोले
Mother India|मदर इंडिया
Mughal-e-Azam|मुग़ल-ए-आज़म
Pyaasa|प्यासा
Anand|आनंद
Deewar|दीवार
Don|डॉन
Amar Akbar Anthony|अमर अकबर एंथनी
Mr India|मिस्टर इंडिया
Qayamat Se Qayamat Tak|क़यामत से क़यामत तक
Hum Aapke Hain Koun|हम आपके हैं कौन
DDLJ|दिलवाले दुल्हनिया ले जाएंगे
Kuch Kuch Hota Hai|कुछ कुछ होता है
Kabhi Khushi Kabhie Gham|कभी खुशी कभी ग़म
Devdas|देवदास
Lagaan|लगान
Swades|स्वदेस
Rang De Basanti|रंग दे बसंती
Taare Zameen Par|तारे ज़मीन पर
3 Idiots|थ्री इडियट्स
Munna Bhai MBBS|मुन्ना भाई एमबीबीएस
Lage Raho Munna Bhai|लगे रहो मुन्ना भाई
Hera Pheri|हेरा फेरी
Golmaal|गोलमाल
Andaz Apna Apna|अंदाज़ अपना अपना
Chupke Chupke|चुपके चुपके
Jaane Bhi Do Yaaro|जाने भी दो यारो
Chak De India|चक दे इंडिया
Dangal|दंगल
Bhaag Milkha Bhaag|भाग मिल्खा भाग
MS Dhoni Story|एम एस धोनी
83|83
Gully Boy|गली बॉय
Zindagi Na Milegi Dobara|ज़िंदगी न मिलेगी दोबारा
Queen|क्वीन
Piku|पीकू
Barfi|बर्फ़ी
Andhadhun|अंधाधुन
Drishyam|दृश्यम
Tumbbad|तुम्बाड़
Stree|स्त्री
Bhool Bhulaiyaa|भूल भुलैया
Bajrangi Bhaijaan|बजरंगी भाईजान
Padmaavat|पद्मावत
Gangs of Wasseypur|गैंग्स ऑफ़ वासेपुर
Sacred Kahani|सेक्रेड कहानी
Jawan|जवान
Pathaan|पठान
Animal|एनिमल
Laapataa Ladies|लापता लेडीज़
12th Fail|12वीं फेल
`});
