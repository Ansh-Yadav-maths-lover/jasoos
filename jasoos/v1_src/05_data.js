/* ============================================================
   JASOOS — desi imposter party game
   ============================================================ */
const CATS = [
  { id:'food', name:'Street Food', hi:'चाट-पकौड़ी', e:'🍛', words:[
    'Vada Pav','Pani Puri','Pav Bhaji','Bhel Puri','Samosa','Masala Dosa','Idli Sambar','Jalebi',
    'Chole Bhature','Biryani','Momos','Kachori','Misal Pav','Rajma Chawal','Aloo Tikki','Dahi Vada',
    'Gulab Jamun','Rasgulla','Kulfi','Falooda','Cutting Chai','Filter Coffee','Litti Chokha','Poha',
    'Sev Puri','Egg Roll','Butter Chicken','Thepla']},
  { id:'films', name:'Bollywood', hi:'फ़िल्में', e:'🎬', words:[
    'Sholay','DDLJ','3 Idiots','Dangal','Gully Boy','Lagaan','Zindagi Na Milegi Dobara','Queen',
    'Andhadhun','Baahubali','RRR','KGF','Kantara','Om Shanti Om','Munna Bhai MBBS','Swades',
    'Chak De India','Rang De Basanti','Taare Zameen Par','Barfi','Piku','Drishyam','Tumbbad','Hera Pheri',
    'Golmaal','Pushpa','Jawan','Stree']},
  { id:'cricket', name:'Cricket', hi:'क्रिकेट', e:'🏏', words:[
    'Sachin Tendulkar','Virat Kohli','MS Dhoni','Rohit Sharma','Kapil Dev','Rahul Dravid','Jasprit Bumrah',
    'Yuvraj Singh','Sourav Ganguly','Harmanpreet Kaur','Smriti Mandhana','IPL Auction','Wankhede Stadium',
    'Eden Gardens','Helicopter Shot','Doosra','Gully Cricket','Third Umpire','Toss','DRS Review',
    'Ranji Trophy','World Cup 2011','Chinnaswamy','Nightwatchman','Maiden Over','Chak De Chant']},
  { id:'tyohar', name:'Festivals', hi:'त्योहार', e:'🪔', words:[
    'Diwali','Holi','Navratri Garba','Durga Puja','Ganesh Chaturthi','Onam','Pongal','Baisakhi',
    'Eid ki Sewaiyan','Raksha Bandhan','Karva Chauth','Lohri','Bihu','Chhath Puja','Janmashtami',
    'Dussehra','Gudi Padwa','Ugadi','Makar Sankranti','Guru Nanak Jayanti','Christmas in Goa','Teej',
    'Ratha Yatra','Ganpati Visarjan']},
  { id:'jagah', name:'Places', hi:'जगहें', e:'🕌', words:[
    'Taj Mahal','Golden Temple','Varanasi Ghat','Gateway of India','Hawa Mahal','Charminar','India Gate',
    'Qutub Minar','Meenakshi Temple','Kerala Backwaters','Leh Ladakh','Goa Beach','Hampi Ruins',
    'Darjeeling Toy Train','Marina Beach','Rishikesh Rafting','Andaman Islands','Udaipur Lake',
    'Shillong','Rann of Kutch','Jim Corbett','Mumbai Marine Drive','Kolkata Tram','Jaisalmer Fort']},
  { id:'shaadi', name:'Shaadi', hi:'शादी', e:'💍', words:[
    'Sangeet Night','Baraat','Mehendi','Haldi','Pandit ji','Shehnai','Dulha ki Ghodi','Joota Chupai',
    'Bidaai','Buffet Queue','Nagin Dance','Wedding Drone','Chaat Counter','DJ Wala','Varmala','Mandap',
    'Gift Envelope','Ladies Sangeet','Ice Cream Stall','Group Photo','Antakshari','Reception Stage',
    'Pheras','Shagun ka Lifafa']},
  { id:'ghar', name:'Ghar', hi:'घर', e:'🏠', words:[
    'Pressure Cooker Whistle','Ceiling Fan','Desert Cooler','Inverter','Mixer Grinder','Steel Dabba',
    'Amul Butter','Desi Ghee','Rangoli','Tulsi Plant','Charpai','Godrej Almari','Mummy ki Chappal',
    'Naphthalene Balls','Water Filter','Sunday Oil Massage','Neighbour Aunty','Doodhwala','Sunday Biryani',
    'Bhagwan ka Photo','Sil Batta','Wall Clock','Bucket Bath','Achaar ka Martban']},
  { id:'safar', name:'Transport', hi:'सफ़र', e:'🛺', words:[
    'Auto Rickshaw','Mumbai Local','Metro Card','Sleeper Coach','Tatkal Booking','Platform Chai Wala',
    'Highway Dhaba','Toll Plaza','Bus Conductor','Cycle Rickshaw','Scooty','Bullet Bike','Traffic Police',
    'Speed Breaker','Cow on Road','Sharing Cab','Petrol Pump','Railway Announcement','Ola Cancel',
    'Roof Luggage','Volvo Bus','Ghat Road','Reserved Seat','Horn OK Please']},
  { id:'tv', name:'TV & Web', hi:'टीवी', e:'📺', words:[
    'Ramayan','Mahabharat','Shaktimaan','Sarabhai vs Sarabhai','CID','Taarak Mehta','Kaun Banega Crorepati',
    'Bigg Boss','Sacred Games','Panchayat','Mirzapur','Scam 1992','The Family Man','Kota Factory',
    'Shark Tank India','Doordarshan','Chitrahaar','Malgudi Days','Roadies','Indian Idol','Crime Patrol',
    'Chota Bheem','Saas Bahu Serial','Cricket Highlights']},
  { id:'sangeet', name:'Music', hi:'संगीत', e:'🎶', words:[
    'Lata Mangeshkar','Kishore Kumar','Arijit Singh','AR Rahman','Ilaiyaraaja','Shreya Ghoshal','Sonu Nigam',
    'Qawwali','Bhangra','Garba Beat','Tabla','Sitar','Harmonium','Dholak','Carnatic Concert','Bhajan',
    'Punjabi Wedding Song','Item Number','Antakshari','Baraat Band','Auto Speaker Song','Item Girl Hook',
    'Sufi Night','Rap Battle']},
  { id:'padhai', name:'School Days', hi:'पढ़ाई', e:'🎒', words:[
    'Board Exam','Tuition Class','Chalk Duster','Assembly Prayer','Canteen Samosa','Xerox Shop','Rank List',
    'Kota Coaching','JEE Preparation','School Bus','Uniform Tie','Homework Copy','Maam ki Daant','Bunking Class',
    'Sports Day','Farewell Party','Marksheet','Compass Box','Class Monitor','Lunch Box Swap','Hostel Mess',
    'Attendance Shortage','Practical File','Result Day']},
  { id:'bazaar', name:'Bazaar', hi:'बाज़ार', e:'🛒', words:[
    'Kirana Store','Bargaining','Sabziwala','Paan Shop','Chai Tapri','Barber Shop','Darzi','Mochi',
    'Cyber Cafe','Medical Store','Sweet Shop','Flower Seller','Sarojini Market','Fake Branded Shoes',
    'Sunday Bazaar','Weighing Scale','Free Dhaniya','Loose Change','Bhaiya Ek Aur','Cash Only Board',
    'Roadside Sunglasses','Bhelpuri Cart','Fruit Cart','Kabadiwala']},
  { id:'desi', name:'Desi Life', hi:'देसी लाइफ', e:'🤝', words:[
    'Jugaad','Chalta Hai','Log Kya Kahenge','Sharma ji ka Beta','Aunty ji ke Sawal','Timepass','Adjust Kar Lo',
    'Setting Hai','Sarkari Naukri','Nimbu Mirchi','Nazar Utarna','Kal Karenge','Ho Jayega Bhai','WhatsApp Forward',
    'Good Morning Message','Family Group','Shaadi ka Pressure','Bandh','Cousin Comparison','Chai pe Charcha',
    'Rishtedaar Advice','Late Marriage Taunt','Free Wifi Hunt','Discount Ka Chakkar']},
  { id:'katha', name:'Mythology', hi:'पौराणिक', e:'🕉️', words:[
    'Hanuman','Ravan','Sita','Krishna','Arjun','Bheem','Draupadi','Karna','Shiva','Ganesha','Durga','Laxmi',
    'Saraswati','Narad Muni','Chanakya','Ashoka','Akbar','Birbal','Tenali Raman','Shakuni','Eklavya',
    'Sudama','Abhimanyu','Vibhishan']},
];
const AVS = ['🙂','😎','🤠','🧐','😼','🐯','🦚','🐘','🦁','🐒','🦜','🐊','🦋','🐝','🐢','🦉','🐧','🐬','🦄','🐙','🍁','⭐'];
const NAMES = ['Rahul','Priya','Bunty','Pinky','Chotu','Guddu','Neha','Arjun','Meera','Bablu','Tina','Raju','Sanju','Aisha','Vicky','Dolly'];
const SPY_HINTS = [
  'Tumhe shabd nahi mila. Doosron ke clues sun kar bluff maaro.',
  'Bas confidently kuch bolo. Koi shak na kare.',
  'Sabse pehle bolna khatarnak hai. Sunte raho, phir bolo.',
];
const CIV_HINTS = [
  'Ek shabd ka clue do — na bahut aasaan, na bahut mushkil.',
  'Aisa clue jo Jasoos copy na kar sake.',
  'Zyada obvious hua to Jasoos bach jayega.',
];
const TIPS = [
  '🪔 Clue itna asaan mat do ki Jasoos copy kar le',
  '🏏 Pehla clue bolna sabse mushkil hota hai',
  '🔍 Jasoos ko dhoondhne ke liye clue ka logic poochho',
  '💍 Do Jasoos ho to woh ek doosre ko nahi jaante',
  '🎬 Silence bhi ek clue hai',
  '🛺 Bahut safe clue dena bhi shak paida karta hai',
];
const rnd = a => a[Math.floor(Math.random()*a.length)];
const shuffle = a => { const b=a.slice(); for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; };
const catById = id => CATS.find(c=>c.id===id);
const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm = s => String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
