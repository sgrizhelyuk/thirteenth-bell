// The Thirteenth Bell — story data
// A mystical horror English quest. Level A2–B1.

window.CLUES = {
  photo: { name: "Scratched photo", ru: "Испорченное фото", img: "assets/OBJ_scratched_photo.png", note: "One face crossed out with ink" },
  diary_page: { name: "Diary page", ru: "Страница дневника", img: "assets/OBJ_diary_page.png", note: "\u201cThey count us, June.\u201d" },
  tally_marks: { name: "Chalk tally marks", ru: "Метки мелом", img: "assets/OBJ_tally_marks.png", note: "Rows and rows of small lines" },
  old_key: { name: "Old iron key", ru: "Старый железный ключ", img: "assets/OBJ_iron_key.png", note: "Sewn into a winter coat" },
  salt_pouch: { name: "Salt pouch", ru: "Мешочек с солью", img: "assets/OBJ_salt_pouch.png", note: "Salt at the door, salt in your pocket" },
  ledger_page: { name: "Ledger page", ru: "Страница книги записей", img: "assets/OBJ_ledger_page.png", note: "\u201cN. Bell \u2014 voce\u201d" },
  cat_tag: { name: "Brass tag", ru: "Латунная пластинка", img: "assets/OBJ_cat_tag.png", note: "Wren. The letters are worn smooth" }
};

window.SUSPECTS = [
  { name: "Headmistress Vale", ru: "Директриса Вейл", img: "assets/CH_vale.png", note: "Keeps the school ledger. And the rules." },
  { name: "Mr. Crane", ru: "Мистер Крейн", img: "assets/CH_crane.png", note: "Caretaker. Thirty years of keys and lanterns." },
  { name: "Mrs. Poole", ru: "Миссис Пул", img: "assets/CH_poole.png", note: "Cook. Forty years of salt and stories." },
  { name: "Mr. Quill", ru: "Мистер Куилл", img: "assets/CH_quill.png", note: "Librarian. Polishes the files." }
];

window.STORY = {
  scenes: [
    {
      id: "prologue",
      chapter: "Prologue",
      title: "The Last Coach",
      objective: "Cross the causeway and remember the driver's warning.",
      objectiveRu: "Пересеки дамбу и запомни предупреждение водителя.",
      bg: "assets/BG_causeway_night.png",
      music: "dread",
      cast: { Nora: { img: "assets/CH_nora.png", side: "left" } },
      items: [
        { t: "The coach rocks in the wind. Rain freezes on the windows. Outside, black water is already licking at the road.", ru: "Экипаж качается на ветру. Дождь замерзает на окнах. Снаружи чёрная вода уже лижет дорогу." },
        { sp: "Pike", t: "Last crossing tonight. Mind the tide, kid.", ru: "Последний рейс на сегодня. Следи за приливом, малыш." },
        { sp: "Nora", t: "I have a letter. Winterhollow Academy.", ru: "У меня письмо. Академия Уинтерхоллоу." },
        {
          prompt: { sp: "Pike", t: "There is no good hour to arrive there. Tell me \u2014 do you believe in warnings?", ru: "В хороший час туда не приезжают. Скажи — ты веришь в предупреждения?" },
          opts: [
            { t: "I listen to every warning.", ru: "Я прислушиваюсь к каждому предупреждению.", ok: true, fb: "Smart. 'Listen to warnings' \u2014 a good collocation." },
            { t: "I don't believe in old stories.", ru: "Я не верю в старые истории.", fb: "Brave words. On this road, brave is expensive." },
            { t: "Warnings are for children.", ru: "Предупреждения — для детей.", fb: "Then remember this one like a child: the bell rings thirteen times here." }
          ]
        },
        { sp: "Pike", t: "When the bell rings thirteen, close your eyes and do not answer. And if you see a grey cat — follow it. It knows the way out.", ru: "Когда колокол ударит тринадцать раз — закрой глаза и не отвечай. А если увидишь серую кошку — иди за ней. Она знает дорогу." },
        { sp: "Nora", t: "Thirteen? A bell rings twelve.", ru: "Тринадцать? Колокол звонит двенадцать раз." },
        { sp: "Pike", t: "Not this bell.", ru: "Не этот колокол." },
        { sp: "Pike", t: "And if you hear your name tonight \u2014 it is not me calling.", ru: "И если услышишь своё имя сегодня — это не я зову." },
        {
          task: {
            kind: "tf", title: "True or False?", ru: "Верно или неверно?",
            stmts: [
              { t: "The road floods at high tide.", ru: "Дорога уходит под воду в прилив.", a: true },
              { t: "The driver's name is Crane.", ru: "Водителя зовут Крейн.", a: false }
            ]
          }
        },
        { vocab: { words: [["tide", "прилив"], ["warning", "предупреждение"], ["causeway", "дорога через воду"], ["crossing", "переправа"], ["bell", "колокол"], ["answer", "отвечать"]] } },
        { t: "The gates of Winterhollow rise out of the fog. Above them, a bell tower cuts the sky in two.", ru: "Ворота Уинтерхоллоу поднимаются из тумана. Над ними колокольня разрезает небо пополам." }
      ]
    },

    {
      id: "ch1",
      chapter: "Chapter 1",
      title: "The Iron Gate",
      objective: "Learn the five rules by heart.",
      objectiveRu: "Выучи пять правил наизусть.",
      bg: "assets/BG_gate.png",
      music: "dread",
      cast: { Nora: { img: "assets/CH_nora.png", side: "left" }, Crane: { img: "assets/CH_crane.png", side: "right" } },
      items: [
        { t: "The gate is open. A man with a lantern waits in the snow \u2014 as if he heard you coming an hour ago.", ru: "Ворота открыты. Человек с фонарём ждёт в снегу — будто услышал тебя ещё час назад." },
        { sp: "Crane", t: "Nora Bell. You are late.", ru: "Нора Белл. Ты опоздала." },
        { sp: "Nora", t: "The tide was close. How do you know my name?", ru: "Прилив был близко. Откуда вы знаете моё имя?" },
        { sp: "Crane", t: "The school knows. The school writes the letters.", ru: "Школа знает. Школа пишет письма." },
        {
          prompt: { sp: "Crane", t: "Before you step through: do you know our rules?", ru: "Прежде чем войти: ты знаешь наши правила?" },
          opts: [
            { t: "No, sir. Please, tell me the rules.", ru: "Нет, сэр. Пожалуйста, расскажите мне правила.", ok: true, fb: "Polite and honest. Good start." },
            { t: "Rules are boring.", ru: "Правила — это скучно.", fb: "Wrong tone. And 'boring' is a dangerous word here." },
            { t: "I can learn them tomorrow.", ru: "Я могу выучить их завтра.", fb: "Some rules have to be learned tonight. Note 'have to'." }
          ]
        },
        { sp: "Crane", t: "Five rules. Learn them by heart.", ru: "Пять правил. Выучи их наизусть." },
        { sp: "Crane", t: "One: after the last bell, the doors stay closed.", ru: "Первое: после последнего колокола двери остаются закрытыми." },
        { sp: "Crane", t: "Two: if you hear your name in the dark, do not say a word.", ru: "Второе: если услышишь своё имя в темноте — не говори ни слова." },
        { sp: "Crane", t: "Three: salt stays by your door. Four: never look at the tower when the bell rings.", ru: "Третье: соль стоит у двери. Четвёртое: никогда не смотри на башню, когда звенит колокол." },
        { sp: "Nora", t: "And five?", ru: "А пятое?" },
        { sp: "Crane", t: "Five: you must never leave your room on the night of the Long Bell.", ru: "Пятое: в ночь Долгого Колокола нельзя выходить из комнаты." },
        { sp: "Nora", t: "What happens if I break them?", ru: "Что будет, если я их нарушу?" },
        { sp: "Crane", t: "Nothing. For a while.", ru: "Ничего. Некоторое время." },
        { sp: "Crane", t: "And then you are not here.", ru: "А потом тебя здесь нет." },
        {
          task: {
            kind: "order", title: "Put the words in order", ru: "Расставь слова по порядку",
            words: ["you", "must", "follow", "the five rules", "."],
            answer: "you must follow the five rules ."
          }
        },
        {
          task: {
            kind: "quiz", title: "Choose the correct rule", ru: "Выбери правильное правило",
            q: "Which rule is written correctly?", ru: "Какое правило записано правильно?",
            opts: [
              "If someone calls your name, you must not answer.",
              "If someone calls your name, you must answer.",
              "If someone calls your name, you mustn't to answer."
            ], a: 0,
            why: "With 'must not' we don't use 'to'. And the rule says: never answer a voice in the dark."
          }
        },
        { vocab: { words: [["gate", "ворота"], ["rules", "правила"], ["by heart", "наизусть"], ["lantern", "фонарь"], ["tower", "башня"], ["step through", "войти"]] } }
      ]
    },

    {
      id: "ch2",
      chapter: "Chapter 2",
      title: "Room 13",
      objective: "Ask June about the room and the girl who left it.",
      objectiveRu: "Расспроси Джун о комнате и о девочке, которая её оставила.",
      bg: "assets/BG_room13.png",
      music: "mystery",
      cast: { Nora: { img: "assets/CH_nora.png", side: "left" }, June: { img: "assets/CH_june.png", side: "right" } },
      items: [
        { t: "Your room is at the end of the west corridor. The brass number says 13. The girl inside is awake, pretending not to be.", ru: "Твоя комната в конце западного коридора. Латунная цифра на двери — 13. Девочка внутри не спит, но делает вид, что спит." },
        { sp: "June", t: "You are the new one. Nora Bell. Here everyone is called by their full name. Like a list.", ru: "Ты новенькая. Нора Белл. Здесь всех называют по имени и фамилии. Как в списке." },
        { sp: "Nora", t: "You waited up for me.", ru: "Ты меня дождалась." },
        { sp: "June", t: "Now I wait every night. An old habit of this room.", ru: "Теперь я жду каждую ночь. Старая привычка этой комнаты." },
        {
          prompt: { sp: "June", t: "Quick \u2014 what did Crane tell you at the gate?", ru: "Быстро — что Крейн сказал тебе у ворот?" },
          opts: [
            { t: "Five rules. I remember all of them.", ru: "Пять правил. Я помню все.", ok: true, fb: "Good. Here, memory is a life skill." },
            { t: "He told me a lot of strange stories.", ru: "Он рассказал мне много странных историй.", fb: "Crane talks? Then you have heard more than most." },
            { t: "Nothing important.", ru: "Ничего важного.", fb: "Here, 'important' means something different." }
          ]
        },
        { sp: "June", t: "Lena lived here before you. She has left her diary, her lamp, her winter coat. People who leave take their things.", ru: "До тебя здесь жила Лена. Она оставила дневник, лампу, зимнее пальто. Кто уезжает — забирает свои вещи." },
        { sp: "Nora", t: "Where has she gone?", ru: "Куда она уехала?" },
        { sp: "June", t: "The letter says she has moved to a school in the south. The letter came two days after she was gone.", ru: "В письме сказано, что она перевелась в школу на юге. Письмо пришло через два дня после того, как она исчезла." },
        {
          task: {
            kind: "quiz", title: "Present Perfect", ru: "Present Perfect",
            q: "She ___ her diary in the room.", ru: "Она ___ свой дневник в комнате.",
            opts: ["has left", "have left", "has leaved"], a: 0,
            why: "With she/he/it we use 'has' + third form: has left. Not 'have', and never 'leaved'."
          }
        },
        {
          task: {
            kind: "quiz", title: "Past Simple or Present Perfect?", ru: "Past Simple или Present Perfect?",
            q: "The letter ___ two days later.", ru: "Письмо ___ два дня спустя.",
            opts: ["came", "has come", "comes"], a: 0,
            why: "We know the time (two days later) \u2014 finished past, so Past Simple: came."
          }
        },
        {
          task: {
            kind: "tf", title: "True or False?", ru: "Верно или неверно?",
            stmts: [
              { t: "June believes the letter about Lena.", ru: "Джун верит письму о Лене.", a: false },
              { t: "Lena left her winter coat.", ru: "Лена оставила зимнее пальто.", a: true }
            ]
          }
        },
        { t: "Outside, snow taps the window. For one second the tapping sounds like ten small fingers.", ru: "Снаружи в окно стучит снег. На секунду стук становится похож на прикосновение десяти маленьких пальчиков." },
        { vocab: { words: [["roommate", "соседка по комнате"], ["count", "считать"], ["leave / left", "оставить / уехать"], ["moved", "переехала"], ["coat", "пальто"], ["two days later", "через два дня"]] } }
      ]
    },

    {
      id: "ch3",
      chapter: "Chapter 3",
      title: "Paper and Wax",
      objective: "Survive your first interview with the headmistress.",
      objectiveRu: "Выдержи первый разговор с директрисой.",
      bg: "assets/BG_office.png",
      music: "mystery",
      cast: { Nora: { img: "assets/CH_nora.png", side: "left" }, Vale: { img: "assets/CH_vale.png", side: "right" } },
      items: [
        { t: "The next morning. The headmistress’s office smells of cold paper and old wax. The fire is burning, but the room is not warm.", ru: "На следующее утро. В кабинете директрисы пахнет холодной бумагой и старым воском. В камине горит огонь, но в комнате не тепло." },
        { sp: "Vale", t: "Miss Bell. My condolences on your loss. A scholarship at this hour of the year is unusual.", ru: "Мисс Белл. Примите мои соболезнования. Стипендия в такое время года — необычно." },
        { sp: "Vale", t: "You will find that Winterhollow has five rules and one hundred and one rituals. You may forget the rituals.", ru: "Вы обнаружите, что в Уинтерхоллоу пять правил и сто один ритуал. Ритуалы можете забыть." },
        { sp: "Nora", t: "And the rules?", ru: "А правила?" },
        { sp: "Vale", t: "Rules are paid for, Miss Bell. Every rule here costs something.", ru: "За правила платят, мисс Белл. Каждое правило здесь чего-то стоит." },
        {
          prompt: { sp: "Vale", t: "Why do you think we choose students like you?", ru: "Как вы думаете, почему мы выбираем таких учеников, как вы?" },
          opts: [
            { t: "Because nobody will ask where we go.", ru: "Потому что никто не спросит, куда мы уходим.", ok: true, fb: "Quiet and true. In this school the honest answer is the brave one." },
            { t: "Because we are the best students.", ru: "Потому что мы лучшие ученики.", fb: "You are new. You have not read the ledger." },
            { t: "I don't know. It was your choice.", ru: "Я не знаю. Это был ваш выбор.", fb: "Careful. Clever answers are expensive in this office." }
          ]
        },
        { note: { clue: "photo", title: "Clue found: the scratched photo", ru: "Улика: испорченное фото" }, t: "On her desk: an old photo of the school choir. One face is scratched off with a knife — so deep the paper has a hole.", ru: "На столе: старое фото школьного хора. Одно лицо выцарапано ножом — так глубоко, что в бумаге дыра." },
        { sp: "Vale", t: "They sang at the Long Bell every year. Most of them have moved away.", ru: "Они пели у Долгого Колокола каждый год. Большинство из них уехали." },
        {
          prompt: { sp: "Vale", t: "One question, Miss Bell. Later, there will be work by the fireplace.", ru: "Один вопрос, мисс Белл. Потом у камина будет работа." },
          opts: [
            { t: "Who was in the photo, ma'am?", ru: "Кто был на фото, мэм?", ok: true, fb: "She smiles, which is worse. 'A voice from long ago.'" },
            { t: "What is the Long Bell?", ru: "Что такое Долгий Колокол?", fb: "Not a what. A when." },
            { t: "Can I call my friend?", ru: "Можно я позвоню подруге?", fb: "From here? Letters only. And letters go through me." }
          ]
        },
        { t: "The headmistress smiles but does not answer the question, silently pointing to the door.", ru: "Директриса улыбается, но не отвечает на вопрос, молча указывая на дверь." },
        {
          task: {
            kind: "quiz", title: "must / mustn't", ru: "must / mustn't",
            q: "Students ___ keep the five rules.", ru: "Ученики ___ соблюдать пять правил.",
            opts: ["must", "mustn't", "doesn't have to"], a: 0,
            why: "'Must' = it is necessary. 'Mustn't' = it is forbidden \u2014 the opposite!"
          }
        },
        {
          task: {
            kind: "order", title: "Put the words in order", ru: "Расставь слова по порядку",
            words: ["you", "must", "not", "be", "late", "for", "the last bell", "."],
            answer: "you must not be late for the last bell ."
          }
        },
        { vocab: { words: [["condolences", "соболезнования"], ["unusual", "необычный"], ["ritual", "ритуал"], ["cost", "стоить"], ["choir", "хор"], ["move away", "уехать"]] } }
      ]
    },

    {
      id: "ch4",
      chapter: "Chapter 4",
      title: "The East Wing",
      objective: "Search the old classroom with your magnifying glass.",
      objectiveRu: "Обыщи старый класс лупой.",
      bg: "assets/BG_eastwing.png",
      music: "mystery",
      cast: { Nora: { img: "assets/CH_nora.png", side: "left" }, June: { img: "assets/CH_june.png", side: "right" } },
      items: [
        { t: "After lessons and tea, June takes you to the east wing. “The classroom where Lena studied,” she whispers. “Be careful — the third step.”", ru: "После уроков и чая Джун ведёт тебя в восточное крыло. «Класс, в котором училась Лена, — шепчет она. — Осторожно, третья ступенька.»" },
        { sp: "June", t: "Her desk, her chalk, her secret places. Look \u2014 and keep your voice down.", ru: "Её парта, её мел, её тайные места. Смотри — и говори тише." },
        {
          clues: {
            hotspots: [
              { id: "diary_page", x: 0.33, y: 0.72, w: 0.15, h: 0.14 },
              { id: "tally_marks", x: 0.7, y: 0.24, w: 0.11, h: 0.16 },
              { id: "old_key", x: 0.28, y: 0.46, w: 0.11, h: 0.13 }
            ],
            duds: [
              { x: 0.27, y: 0.6, w: 0.12, h: 0.1, msg: "Desks under sheets of dust. Nobody has sat here for a long time.", ru: "Парты под слоем пыли. Здесь давно никто не сидел." },
              { x: 0.52, y: 0.26, w: 0.1, h: 0.14, msg: "You breathe out \u2014 the air turns to frost. Something cold stood here once. But there is nothing to take.", ru: "Ты выдыхаешь — воздух превращается в иней. Что-то холодное стояло здесь когда-то. Но взять нечего." }
            ]
          }
        },
        { t: "You have found three small things. Each one is heavier than the last.", ru: "Ты нашла три маленькие вещи. Каждая тяжелее предыдущей." },
        {
          task: {
            kind: "quiz", title: "Prepositions of place", ru: "Предлоги места",
            q: "The tally marks are ___ the wardrobe.", ru: "Метки мелом ___ шкафом.",
            opts: ["behind", "on", "in"], a: 0,
            why: "'Behind the wardrobe' — the marks are hidden on the wall behind it."
          }
        },
        {
          task: {
            kind: "quiz", title: "Prepositions of place", ru: "Предлоги места",
            q: "The key was ___ the coat.", ru: "Ключ был ___ пальто.",
            opts: ["inside", "above", "between"], a: 0,
            why: "'Inside the coat' \u2014 sewn into the padding."
          }
        },
        {
          task: {
            kind: "quiz", title: "Prepositions of place", ru: "Предлоги места",
            q: "The cold spot is ___ the window.", ru: "Холодное пятно ___ окна.",
            opts: ["near", "under", "over"], a: 0,
            why: "'Near the window' \u2014 the open pane."
          }
        },
        {
          task: {
            kind: "tf", title: "True or False?", ru: "Верно или неверно?",
            stmts: [
              { t: "The key is small and old.", ru: "Ключ маленький и старый.", a: true },
              { t: "June wants to tell the teachers about the diary.", ru: "Джун хочет рассказать учителям о дневнике.", a: false }
            ]
          }
        },
        { vocab: { words: [["dust", "пыль"], ["wardrobe", "шкаф"], ["sewn", "пришито"], ["chalk", "мел"], ["cold spot", "холодное пятно"], ["mattress", "матрас"]] } }
      ]
    },

    {
      id: "ch5",
      chapter: "Chapter 5",
      title: "Salt and Juniper",
      objective: "Ask the cook about the legend \u2014 and take her gift.",
      objectiveRu: "Расспроси повариху о легенде — и возьми её подарок.",
      bg: "assets/BG_kitchen_night.png",
      music: "warm",
      cast: { Nora: { img: "assets/CH_nora.png", side: "left" }, Poole: { img: "assets/CH_poole.png", side: "right" }, Ash: { img: "assets/CH_ash.png", side: "center" } },
      items: [
        { t: "The kitchen is the only warm room in Winterhollow. Juniper, salt and smoke. A grey cat sits on the flour bin like he owns the building.", ru: "Кухня — единственная тёплая комната в Уинтерхоллоу. Можжевельник, соль и дым. Серый кот сидит на ящике с мукой, как будто дом принадлежит ему." },
        { sp: "Poole", t: "Sit, girl. Have you eaten? You have just arrived, and you have already seen the east wing. I know that face.", ru: "Садись, девочка. Ты ела? Ты только приехала — и уже побывала в восточном крыле. Я знаю это лицо." },
        { sp: "Nora", t: "You know what is happening here.", ru: "Вы знаете, что здесь происходит." },
        { sp: "Poole", t: "I have cooked here for forty years. I have never once met a spring without a small funeral of words.", ru: "Я готовлю здесь сорок лет. Я ни разу не встретила весну без маленьких похорон из слов." },
        {
          prompt: { sp: "Poole", t: "Choose your question carefully, girl. Some answers bite.", ru: "Выбирай вопрос осторожно, девочка. Некоторые ответы кусаются." },
          opts: [
            { t: "What happens on the night of the Long Bell?", ru: "Что происходит в ночь Долгого Колокола?", ok: true, fb: "She puts salt in your pocket. 'The bell takes a voice. One voice. Every winter.'" },
            { t: "Is there a ghost in the tower?", ru: "В башне есть призрак?", fb: "Ghost? No. A guest. And guests must be answered." },
            { t: "When is the next ferry?", ru: "Когда следующий паром?", fb: "Spring, child. If you are still on the list." }
          ]
        },
        { note: { clue: "salt_pouch", title: "Clue found: the salt pouch", ru: "Улика: мешочек с солью" }, t: "She fills a little cloth bag with salt and ties it tight. “Salt at the door. Salt in your pocket. Salt in your boot if the wind is wrong.”", ru: "Она наполняет маленький тканевый мешочек солью и крепко завязывает его: «Соль у двери. Соль в кармане. Соль в сапоге, если ветер дует не в ту сторону.»" },
        { t: "The grey cat walks over and presses one paw to your hand. His collar is old leather. The brass tag is worn almost smooth.", ru: "Серый кот подходит и кладёт лапу тебе на руку. Его ошейник сделан из старой кожи. Латунная бирка почти стёрлась." },
        { sp: "Ash", t: "Mrrrow.", ru: "Мррряу." },
        {
          task: {
            kind: "quiz", title: "Present Perfect: just", ru: "Present Perfect: just",
            q: "I ___ just baked the bread for tomorrow.", ru: "Я ___ испекла хлеб на завтра.",
            opts: ["have", "has", "am"], a: 0,
            why: "With I/you/we/they we use 'have just' + third form: have just baked."
          }
        },
        {
          task: {
            kind: "tf", title: "True or False?", ru: "Верно или неверно?",
            stmts: [
              { t: "Mrs. Poole has worked here for forty years.", ru: "Миссис Пул работает здесь сорок лет.", a: true },
              { t: "The cat is afraid of the kitchen.", ru: "Кот боится кухни.", a: false }
            ]
          }
        },
        {
          task: {
            kind: "order", title: "Put the words in order", ru: "Расставь слова по порядку",
            words: ["the", "bell", "remembers", "every voice", "."],
            answer: "the bell remembers every voice ."
          }
        },
        { vocab: { words: [["stove", "печь"], ["salt", "соль"], ["juniper", "можжевельник"], ["funeral", "похороны"], ["voice", "голос"], ["remember", "помнить"]] } }
      ]
    },

    {
      id: "ch6",
      chapter: "Chapter 6",
      title: "The Ledger",
      objective: "Find the old book \u2014 and your own name.",
      objectiveRu: "Найди старую книгу — и своё имя.",
      bg: "assets/BG_archive.png",
      music: "tension",
      cast: { Nora: { img: "assets/CH_nora.png", side: "left" }, Quill: { img: "assets/CH_quill.png", side: "right" } },
      items: [
        { t: "The archive is one locked room behind another locked room. Mr. Quill unlocks them both with hands that shake.", ru: "Архив — это одна запертая комната за другой запертой комнатой. Мистер Куилл дрожащими руками отпирает обе двери." },
        { sp: "Quill", t: "You are the Bell girl. I have already polished your file.", ru: "Ты — та самая Белл. Я уже изучил твоё досье." },
        { sp: "Nora", t: "I want to see the school ledger.", ru: "Я хочу посмотреть школьный журнал." },
        { sp: "Quill", t: "The ledger shows who came and who left. It does not show where. If you read it aloud, the school will hear you.", ru: "Книга показывает, кто пришёл и кто ушёл. Она не показывает куда. Если прочтёшь её вслух — школа услышит тебя." },
        {
          prompt: { sp: "Quill", t: "Why do you want the old book, Miss Bell?", ru: "Зачем тебе старая книга, мисс Белл?" },
          opts: [
            { t: "I need the truth. People are missing.", ru: "Мне нужна правда. Люди пропадают.", ok: true, fb: "'Missing' \u2014 good word. Sharp and quiet. He opens the ledger." },
            { t: "I want to see my name.", ru: "Я хочу увидеть своё имя.", fb: "You have just said something dangerous." },
            { t: "June told me to.", ru: "Джун попросила меня.", fb: "Never put your friend's name in a dark room." }
          ]
        },
        { note: { clue: "ledger_page", title: "Clue found: the ledger page", ru: "Улика: страница книги записей" }, t: "The last page is yesterday’s ink: “N. Bell — voce.” A line above it: “L. Marsh — transferred.” An older line, in different ink: “Wren — taken.”", ru: "Последняя страница — вчерашние чернила: «Н. Белл — голос». Строкой выше: «Л. Марш — переведена». Старая строка, другими чернилами: «Рен — забрана»." },
        { sp: "Quill", t: "If the name is written down, the bell will find the voice.", ru: "Если имя записано — колокол найдёт голос." },
        {
          task: {
            kind: "quiz", title: "First Conditional", ru: "First Conditional",
            q: "Choose the correct sentence:", ru: "Выбери правильное предложение:",
            opts: [
              "If the gate opens, we will run.",
              "If the gate will open, we run.",
              "If gate opens, we will run."
            ], a: 0,
            why: "First Conditional: If + Present Simple, ... will + verb. No 'will' after 'if', and don't forget 'the'."
          }
        },
        {
          task: {
            kind: "order", title: "Put the words in order", ru: "Расставь слова по порядку",
            words: ["if", "the", "bell", "rings", ",", "do", "not", "answer", "."],
            answer: "if the bell rings , do not answer ."
          }
        },
        {
          task: {
            kind: "tf", title: "True or False?", ru: "Верно или неверно?",
            stmts: [
              { t: "The ledger has your name in it.", ru: "В книге записей есть твоё имя.", a: true },
              { t: "Mr. Quill is happy to see you.", ru: "Мистер Куилл рад тебя видеть.", a: false }
            ]
          }
        },
        { vocab: { words: [["archive", "архив"], ["ledger", "книга записей"], ["shelf", "полка"], ["aloud", "вслух"], ["missing", "пропавший"], ["ink", "чернила"]] } }
      ]
    },

    {
      id: "ch7",
      chapter: "Chapter 7",
      title: "The Thirteenth Step",
      objective: "Follow the cat into the tower \u2014 and stay silent.",
      objectiveRu: "Иди за котом в башню — и молчи.",
      bg: "assets/BG_tower_stairs.png",
      music: "cold",
      cast: { Nora: { img: "assets/CH_nora.png", side: "left" }, Ash: { img: "assets/CH_ash.png", side: "center" } },
      items: [
        { t: "At midnight the corridor is a river of cold. The cat looks at you once \u2014 then walks. You follow.", ru: "В полночь коридор — река холода. Кот смотрит на тебя один раз — и идёт. Ты следуешь за ним." },
        { t: "Thirteen steps up. On the landing, the moon leans on the arrow slit. The bell rope has been cut. The bell still hangs above: immense and quiet.", ru: "Тринадцать ступеней вверх. На площадке луна оперлась на бойницу. Верёвка колокола перерезана. Сам колокол висит выше: огромный и тихий." },
        { t: "By a hook on the wall hangs a child's coat, tiny against the stone. A name is sewn inside: Wren.", ru: "На крюке у стены висит детское пальто — крошечное на фоне камня. Внутри вшито имя: Рен." },
        { note: { clue: "cat_tag", title: "Clue found: the brass tag", ru: "Улика: латунная пластинка" }, t: "Ash lets you read his tag at last: “Wren”. The letters are worn almost smooth. He has waited a long time.", ru: "Эш наконец-то позволяет прочитать свою бирку: «Рен». Буквы стёрлись почти до блеска. Он долго ждал." },
        { sp: "Nora", t: "You have waited here a long time, haven't you?", ru: "Ты ждёшь здесь очень давно, правда?" },
        { cast: { Visitor: { img: "assets/CH_visitor.png", side: "right" } }, t: "Below, a door creaks open in the dark hall. Someone is standing at the bottom of the stairs. The figure does not move.", ru: "Внизу в тёмном холле скрипит дверь. Кто-то стоит у подножия лестницы. Фигура не двигается." },
        {
          cast: { Visitor: { img: "assets/CH_visitor.png", side: "right" } },
          prompt: { sp: "Nora", t: "(Silence. The cat's ears turn. What do you do?)", ru: "(Тишина. Уши кота поворачиваются. Что ты сделаешь?)" },
          opts: [
            { t: "Hold your breath and stay still.", ru: "Затаись и не двигайся.", ok: true, fb: "The best choices in this school are usually the quietest." },
            { t: "Call out: 'Who is there?'", ru: "Крикни: «Кто там?»", fb: "You called. Something heard you. Rule Two remembers." },
            { t: "Run down the stairs.", ru: "Беги вниз по лестнице.", fb: "Fast is loud. Loud is an invitation." }
          ]
        },
        { dropChars: ["Visitor"] },
        {
          task: {
            kind: "quiz", title: "must not", ru: "must not",
            q: "You ___ touch the bell with your hands.", ru: "Тебе ___ трогать колокол руками.",
            opts: ["must not", "must", "have to"], a: 0,
            why: "It is forbidden: must not. 'Must' and 'have to' would mean the opposite."
          }
        },
        {
          task: {
            kind: "order", title: "Put the words in order", ru: "Расставь слова по порядку",
            words: ["we", "have", "to", "go", "back", "before", "the bell", "rings", "."],
            answer: "we have to go back before the bell rings ."
          }
        },
        {
          task: {
            kind: "tf", title: "True or False?", ru: "Верно или неверно?",
            stmts: [
              { t: "The bell rope has been cut.", ru: "Верёвка колокола перерезана.", a: true },
              { t: "Wren is a name sewn inside a small coat.", ru: "Рен — имя, вшитое в маленькое пальто.", a: true }
            ]
          }
        },
        { vocab: { words: [["rope", "верёвка"], ["step", "ступенька"], ["arrow slit", "бойница"], ["hold your breath", "затаить дыхание"], ["still", "неподвижный"], ["creak", "скрипеть"]] } }
      ]
    },

    {
      id: "ch8",
      chapter: "Chapter 8",
      title: "Thirteen",
      objective: "Name the debt and break it \u2014 with the right words.",
      objectiveRu: "Назови долг и разорви его — правильными словами.",
      bg: "assets/BG_tower_stairs.png",
      music: "climax",
      cast: { Nora: { img: "assets/CH_nora.png", side: "left" }, June: { img: "assets/CH_june.png", side: "center" }, Crane: { img: "assets/CH_crane.png", side: "right" } },
      items: [
        { t: "June waits at the tower door with a candle and a stolen key. Behind her stands Mr. Crane with his lantern. He looks ten years older.", ru: "Джун ждёт у двери башни со свечой и украденным ключом. За ней — мистер Крейн с фонарём. Он выглядит на десять лет старше." },
        { sp: "Crane", t: "Vale is coming. The Long Bell is at three. She will read the names aloud, and the bell will answer.", ru: "Скоро придёт Вейл. Долгий Колокол — в три. Она прочтёт имена вслух, и колокол ответит." },
        { sp: "June", t: "Lena's name is in that book. And yours is next, Nora.", ru: "Имя Лены в той книге. А твоё — следующее, Нора." },
        { sp: "Crane", t: "There is one way. Break the bell, burn the old page \u2014 but the debt looks for a keeper. Someone must stay. And the bell will take his voice.", ru: "Есть один способ. Разбей колокол, сожги старую страницу — но долг ищет хранителя. Кто-то должен остаться. И колокол заберёт его голос." },
        {
          prompt: { sp: "Crane", t: "When it calls your name, girl \u2014 what will you say?", ru: "Когда он позовёт твоё имя, девочка — что ты скажешь?" },
          opts: [
            { t: "I will say: 'You have no right to my voice. My name is mine.'", ru: "Я скажу: «У тебя нет права на мой голос. Моё имя — моё.»", ok: true, fb: "Crane closes his eyes. 'Strong words. Say them exactly.'" },
            { t: "I will say nothing and hide.", ru: "Я ничего не скажу и спрячусь.", fb: "Then it will look for your voice in the rooms of everyone who loves you." },
            { t: "I will run to the ferry.", ru: "Я побегу к парому.", fb: "The road is under water until spring. And it is faster than you." }
          ]
        },
        { bg: "assets/BG_bell_chamber.png" },
        { t: "Three o'clock. The bell swings by itself. Twelve slow strokes. Then the thirteenth stroke does not ring \u2014 it speaks. And the voice has your name inside it.", ru: "Три часа. Колокол качается сам. Двенадцать медленных ударов. Тринадцатый удар не звенит — он говорит. И в голосе — твоё имя." },
        {
          task: {
            kind: "multi", title: "Choose three clues that prove the bell is taking students", ru: "Выбери три улики, доказывающие, что колокол забирает учеников",
            opts: [
              "Lena's diary page \u2014 \u201cThey count us.\u201d",
              "The chalk tally marks behind the wardrobe.",
              "The page from the old ledger with names and dates.",
              "Mrs. Poole's salt pouch.",
              "The scratched photo from the headmistress's desk.",
              "Ash's brass tag with the name Wren.",
              "The small iron key."
            ], a: [0, 1, 2],
            why: "The diary, the tally marks and the ledger are all about counting and lists. The school keeps a list of voices."
          }
        },
        {
          task: {
            kind: "order", title: "Tell the story (Past Simple)", ru: "Расскажи историю (Past Simple)",
            words: ["Vale", "wrote", "my", "name", "in the old ledger", "."],
            answer: "Vale wrote my name in the old ledger ."
          }
        },
        {
          task: {
            kind: "quiz", title: "First Conditional", ru: "First Conditional",
            q: "If the bell rings thirteen times, ___.", ru: "Если колокол ударит тринадцать раз, ___.",
            opts: ["the gate will open", "the gate opens tomorrow", "the gate would open yesterday"], a: 0,
            why: "If + Present Simple, ... will + verb: the gate will open."
          }
        },
        { t: "Nora says the words. Crane puts the old page into his lantern. The flame eats the ink \u2014 and the bell cracks, once, like ice. The cold breaks. In the sudden quiet, June is crying and laughing at the same time.", ru: "Нора произносит слова. Крейн опускает старую страницу в фонарь. Пламя съедает чернила — и колокол трескается, один раз, как лёд. Холод отступает. В наступившей тишине Джун плачет и смеётся одновременно." },
        { t: "Mr. Crane does not speak. He only bows his head \u2014 the bow of a man who has finally paid.", ru: "Мистер Крейн не говорит. Он лишь склоняет голову — поклон человека, который наконец заплатил." },
        { vocab: { words: [["debt", "долг"], ["keeper", "хранитель"], ["burn", "сжечь"], ["right", "право"], ["own", "собственный"], ["voice", "голос"]] } }
      ]
    },

    {
      id: "epilogue",
      chapter: "Epilogue",
      title: "Spring Ferry",
      objective: "Say goodbye \u2014 and understand what stayed behind.",
      objectiveRu: "Попрощайся — и пойми, что осталось позади.",
      bg: "assets/BG_causeway_dawn.png",
      music: "dawn",
      cast: { Nora: { img: "assets/CH_nora.png", side: "left" }, June: { img: "assets/CH_june.png", side: "right" }, Ash: { img: "assets/CH_ash.png", side: "center" } },
      items: [
        { t: "At dawn the causeway is a ribbon of black water and melting ice. The ferry horn sounds across the lake. Winter is over \u2014 the quiet winter.", ru: "На рассвете дамба превращается в ленту чёрной воды и тающего льда. Над озером разносится гудок парома. Зима закончилась — тихая зима." },
        { sp: "June", t: "You did it. You said the words.", ru: "Ты сделала это. Ты сказала слова." },
        { t: "Mr. Crane raises his lantern at the gate. He does not speak. He will not speak again \u2014 the bell, broken or not, has his voice. He waves. It is enough.", ru: "Мистер Крейн поднимает фонарь у ворот. Он не говорит. Он больше не заговорит — колокол, сломанный или нет, забрал его голос. Он машет рукой. Этого достаточно." },
        { t: "Lena's coat still hangs in room 13. Some things cannot be returned. Some debts can be put down.", ru: "Пальто Лены всё ещё висит в комнате 13. Некоторые вещи вернуть нельзя. С некоторыми долгами можно расплатиться." },
        {
          task: {
            kind: "quiz", title: "Present Perfect", ru: "Present Perfect",
            q: "Choose the correct ending line:", ru: "Выбери правильную финальную строку:",
            opts: [
              "The bell has not rung since that night.",
              "The bell did not rang since that night.",
              "The bell is not ringing yesterday."
            ], a: 0,
            why: "Present Perfect with 'since' for a state from the past until now: has not rung since that night."
          }
        },
        { t: "Ash rides on your suitcase like a captain. There’s an old tag on his collar that says “Wren.” Wherever you go, he will be with you.", ru: "Эш едет на твоём чемодане, как капитан. На его ошейнике старая бирка с надписью «Рен». Куда бы ты ни поехала — он будет с тобой." },
        { t: "Months later, an envelope arrives with no stamp. Inside is one line: \u201cThe bell remembers.\u201d", ru: "Спустя месяцы приходит конверт без марки. Внутри одна строка: «Колокол помнит»." },
        { vocab: { words: [["dawn", "рассвет"], ["melting", "тающий"], ["horn", "гудок"], ["wave", "махать"], ["enough", "достаточно"], ["remembers", "помнит"]] } },
        { end: true }
      ]
    }
  ]
};
