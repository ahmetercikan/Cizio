/**
 * English Club'ın ek hikâyeleri (data.ts'teki ilk beşin devamı).
 *
 * Her hikâye bir konuyu pekiştirir: renkler, sayılar, hava, deniz, taşıtlar, kıyafetler, şekiller, uzay…
 * Resimler çizim derslerinden gelir; çocuk zaten çizdiği şeyleri hikâyede görür. Sayfalarda dokunmalı
 * küçük görevler vardır (bul, say, boya, arkasını aç), böylece çocuk dinlerken katılır.
 *
 * Kalıplar bilerek tekrar eder ("Where is the…?", "I can see a…", "One, two, three…"): tekrarlı girdi
 * bu yaşta en hızlı öğreten şeydir. React içermez; cümleleri `englishLines()` toplar.
 */
import type { SceneItem, Story } from './data';

const SUN = ['güneş', 'üst ışın', 'sağ ışın', 'alt ışın', 'sol ışın', 'çapraz ışın', 'sol göz', 'sağ göz', 'sol parıltı', 'sağ parıltı', 'güneşin ağzı', 'güneşin yanağı'];

/** Yan yana n tane aynı resim. */
const row = (lesson: string, n: number, y: number, s: number, parts?: string[]): SceneItem[] =>
  Array.from({ length: n }, (_, i) => ({ lesson, parts, x: 640 - ((n - 1) / 2) * (s * 0.95) + i * (s * 0.95), y, s }));

export const MORE_STORIES: Story[] = [
  // ---------------------------------------------------------------- renkler
  {
    id: 'rainbow', title: 'The Rainbow Hunt', tr: 'Gökkuşağı avı', bg: 'day',
    cover: [{ lesson: 'gokkusagi', x: 640, y: 300, s: 520 }, { lesson: 'mascot', x: 400, y: 400, s: 220 }],
    pages: [
      { bg: 'day', say: ['Look! A big rainbow.', 'Red, yellow, green and blue!'], items: [{ lesson: 'gokkusagi', x: 640, y: 290, s: 560 }] },
      {
        bg: 'day', say: ['I can see something red.'],
        items: [{ lesson: 'karpuz', id: 'red', x: 400, y: 400, s: 240 }, { lesson: 'yaprak', id: 'green', x: 880, y: 400, s: 220 }],
        act: { kind: 'tap', target: 'red', ask: 'Where is the red one?', yes: 'Yes! The watermelon is red!' },
      },
      {
        bg: 'day', say: ['Now I can see something yellow.'],
        items: [{ lesson: 'muz', id: 'yellow', x: 420, y: 400, s: 240 }, { lesson: 'balon', id: 'other', x: 860, y: 360, s: 220 }],
        act: { kind: 'tap', target: 'yellow', ask: 'Where is the yellow one?', yes: 'Yes! The banana is yellow!' },
      },
      {
        bg: 'day', say: ['Something green is hiding.'],
        items: [{ lesson: 'kurbaga', id: 'frog', x: 560, y: 420, s: 210, hidden: true }, { lesson: 'agac', id: 'tree', x: 500, y: 300, s: 440 }],
        act: { kind: 'reveal', cover: 'tree', hidden: 'frog', ask: 'Tap the tree!', yes: "It's a green frog! Hello, frog!" },
      },
      {
        bg: 'sky', say: ['And something blue is up high.'],
        items: [{ lesson: 'balon', id: 'balloon', x: 620, y: 300, s: 250, bare: true }],
        act: { kind: 'paint', target: 'balloon', ask: 'Make the balloon blue!', options: ['blue', 'red', 'yellow'], answer: 'blue', yes: 'A big blue balloon!' },
      },
      { bg: 'day', say: ['Red, yellow, green and blue.', 'What a colourful day!', 'The end.'], items: [{ lesson: 'gokkusagi', x: 640, y: 280, s: 540 }, { lesson: 'mascot', x: 640, y: 440, s: 220 }] },
    ],
  },

  // ---------------------------------------------------------------- sayılar
  {
    id: 'count', title: 'Count With Me', tr: 'Benimle say', bg: 'day',
    cover: [...row('ari', 3, 340, 170)],
    pages: [
      { bg: 'day', say: ['Can you count with me?', 'Here is one bee.'], items: [{ lesson: 'ari', x: 640, y: 340, s: 220 }] },
      { bg: 'day', say: ['Now there are two bees.', 'One, two!'], items: row('ari', 2, 340, 200) },
      {
        bg: 'day', say: ['Look at the flowers!'],
        items: row('cicek', 3, 400, 220),
        act: { kind: 'choose', ask: 'How many flowers?', options: [2, 3, 4], answer: 3, yes: 'Yes! One, two, three flowers!' },
      },
      {
        bg: 'sea', say: ['Little fish are swimming.'],
        items: row('balik', 4, 360, 190),
        act: { kind: 'choose', ask: 'How many fish?', options: [3, 4, 5], answer: 4, yes: 'Yes! Four little fish!' },
      },
      {
        bg: 'sky', say: ['And the stars come out.'],
        items: row('yildiz', 5, 300, 160),
        act: { kind: 'choose', ask: 'How many stars?', options: [4, 5, 6], answer: 5, yes: 'Yes! Five shining stars!' },
      },
      { bg: 'night', say: ['One, two, three, four, five.', 'You are a great counter!', 'The end.'], items: [{ lesson: 'mascot', x: 640, y: 380, s: 240 }, ...row('yildiz', 3, 190, 130)] },
    ],
  },

  // ---------------------------------------------------------------- çiftlik hayvanları
  {
    id: 'farm', title: 'The Noisy Farm', tr: 'Gürültülü çiftlik', bg: 'day',
    cover: [{ lesson: 'inek', x: 540, y: 380, s: 300 }, { lesson: 'tavuk', x: 820, y: 400, s: 200 }],
    pages: [
      { bg: 'day', say: ['Good morning, farm!', 'The sun is up.'], items: [{ lesson: 'gunes-bulut', parts: SUN, x: 760, y: 200, s: 420 }, { lesson: 'ev', x: 440, y: 360, s: 380 }] },
      {
        bg: 'day', say: ['Moo! Who says moo?'],
        items: [{ lesson: 'inek', id: 'cow', x: 420, y: 400, s: 280 }, { lesson: 'koyun', id: 'sheep', x: 840, y: 400, s: 250 }],
        act: { kind: 'tap', target: 'cow', ask: 'Where is the cow?', yes: 'Yes! The cow says moo!' },
      },
      {
        bg: 'day', say: ['Baa! Who says baa?'],
        items: [{ lesson: 'domuz', id: 'pig', x: 420, y: 410, s: 260 }, { lesson: 'koyun', id: 'sheep', x: 840, y: 400, s: 260 }],
        act: { kind: 'tap', target: 'sheep', ask: 'Where is the sheep?', yes: 'Yes! The sheep says baa!' },
      },
      {
        bg: 'day', say: ['Someone is hiding in the barn.'],
        items: [{ lesson: 'at', id: 'horse', x: 600, y: 390, s: 280, hidden: true }, { lesson: 'ev', id: 'barn', x: 540, y: 340, s: 420 }],
        act: { kind: 'reveal', cover: 'barn', hidden: 'horse', ask: 'Tap the barn!', yes: "It's a horse! Hello, horse!" },
      },
      {
        bg: 'day', say: ['Peep peep! Little chicks!'],
        items: row('civciv', 3, 420, 170),
        act: { kind: 'choose', ask: 'How many chicks?', options: [2, 3, 4], answer: 3, yes: 'Three happy chicks!' },
      },
      { bg: 'day', say: ['Moo, baa, neigh and peep!', 'What a noisy farm!', 'The end.'], items: [{ lesson: 'inek', x: 330, y: 400, s: 250 }, { lesson: 'koyun', x: 640, y: 410, s: 230 }, { lesson: 'at', x: 930, y: 390, s: 250 }] },
    ],
  },

  // ---------------------------------------------------------------- yiyecekler
  {
    id: 'lunch', title: "What's for Lunch?", tr: 'Öğle yemeğinde ne var?', bg: 'day',
    cover: [{ lesson: 'pizza', x: 560, y: 360, s: 300 }, { lesson: 'mascot', x: 840, y: 380, s: 220 }],
    pages: [
      { bg: 'day', say: ['I am hungry!', "What's for lunch?"], items: [{ lesson: 'mascot', x: 640, y: 360, s: 260 }] },
      {
        bg: 'day', say: ['Is it round and hot?'],
        items: [{ lesson: 'pizza', id: 'pizza', x: 420, y: 380, s: 290 }, { lesson: 'muz', id: 'banana', x: 860, y: 390, s: 230 }],
        act: { kind: 'tap', target: 'pizza', ask: 'Where is the pizza?', yes: 'Yes! Hot, round pizza!' },
      },
      {
        bg: 'day', say: ['Now something sweet.'],
        items: [{ lesson: 'sandvic', id: 'sandwich', x: 420, y: 390, s: 260 }, { lesson: 'cupcake', id: 'cake', x: 860, y: 370, s: 240 }],
        act: { kind: 'tap', target: 'cake', ask: 'Where is the cupcake?', yes: 'Yes! A sweet little cupcake!' },
      },
      {
        bg: 'day', say: ['How many apples can you see?'],
        items: row('ogretmen-elma', 2, 390, 230),
        act: { kind: 'choose', ask: 'How many apples?', options: [1, 2, 3], answer: 2, yes: 'Two red apples!' },
      },
      {
        bg: 'day', say: ['And for after lunch...'],
        items: [{ lesson: 'dondurma', id: 'ice', x: 640, y: 360, s: 260, hidden: true }, { lesson: 'canta', id: 'bag', x: 600, y: 360, s: 320 }],
        act: { kind: 'reveal', cover: 'bag', hidden: 'ice', ask: 'Open the bag!', yes: 'Ice cream! Yummy!' },
      },
      { bg: 'day', say: ['Pizza, cupcake, apples and ice cream.', 'Thank you! Yummy yummy!', 'The end.'], items: [{ lesson: 'pizza', x: 380, y: 380, s: 250 }, { lesson: 'dondurma', x: 640, y: 360, s: 220 }, { lesson: 'cupcake', x: 900, y: 370, s: 230 }] },
    ],
  },

  // ---------------------------------------------------------------- vücut ve hareket
  {
    id: 'wiggle', title: 'Wiggle and Giggle', tr: 'Kıpırda ve gül', bg: 'day',
    cover: [{ lesson: 'mascot', x: 640, y: 350, s: 300 }],
    pages: [
      { bg: 'day', say: ['Stand up, everybody!', "Let's move our body."], items: [{ lesson: 'mascot', x: 640, y: 350, s: 280 }] },
      { bg: 'day', say: ['Touch your head. Touch your nose.', 'Wiggle, wiggle!'], items: [{ lesson: 'mascot', x: 500, y: 350, s: 270 }, { lesson: 'yuzler', x: 870, y: 330, s: 300 }] },
      {
        bg: 'day', say: ['The bunny can hop. Can you hop?'],
        items: [{ lesson: 'tavsan', id: 'bunny', x: 420, y: 390, s: 250 }, { lesson: 'kaplumbaga', id: 'turtle', x: 860, y: 410, s: 250 }],
        act: { kind: 'tap', target: 'bunny', ask: 'Where is the bunny?', yes: 'Hop, hop, hop!' },
      },
      {
        bg: 'sea', say: ['The fish can swim. Can you swim?'],
        items: [{ lesson: 'balik', id: 'fish', x: 460, y: 360, s: 240 }, { lesson: 'yengec', id: 'crab', x: 850, y: 420, s: 220 }],
        act: { kind: 'tap', target: 'fish', ask: 'Where is the fish?', yes: 'Swim, swim, swim!' },
      },
      {
        bg: 'sky', say: ['The butterfly can fly. Can you fly?'],
        items: [{ lesson: 'kelebek', id: 'fly', x: 560, y: 300, s: 260 }, { lesson: 'bulut-yagmur', id: 'cloud', x: 880, y: 260, s: 300 }],
        act: { kind: 'tap', target: 'fly', ask: 'Where is the butterfly?', yes: 'Fly, fly, fly!' },
      },
      { bg: 'day', say: ['Now sit down and take a breath.', 'That was fun!', 'The end.'], items: [{ lesson: 'mascot', x: 640, y: 370, s: 280 }] },
    ],
  },

  // ---------------------------------------------------------------- duygular
  {
    id: 'feel', title: 'How Do You Feel?', tr: 'Nasıl hissediyorsun?', bg: 'day',
    cover: [{ lesson: 'yuzler', x: 640, y: 320, s: 420 }],
    pages: [
      { bg: 'day', say: ['Some days we are happy.', 'Some days we are sad.'], items: [{ lesson: 'yuzler', x: 640, y: 320, s: 460 }] },
      { bg: 'day', say: ['Chizio is happy today!', 'A big, big smile.'], items: [{ lesson: 'mascot', x: 640, y: 360, s: 280 }] },
      {
        bg: 'day', say: ['The little bear lost his toy.', 'He is sad.'],
        items: [{ lesson: 'ayi', id: 'bear', x: 420, y: 390, s: 270 }, { lesson: 'balon', id: 'toy', x: 870, y: 340, s: 220 }],
        act: { kind: 'tap', target: 'toy', ask: 'Where is the balloon?', yes: 'You found it! Now the bear is happy!' },
      },
      {
        bg: 'night', say: ['At night the little owl is sleepy.'],
        items: [{ lesson: 'baykus', id: 'owl', x: 560, y: 350, s: 260, asleep: true }, ...row('yildiz', 3, 180, 120)],
        act: { kind: 'tap', target: 'owl', ask: 'Where is the sleepy owl?', yes: 'Shhh! Good night, owl!' },
      },
      {
        bg: 'day', say: ['And sometimes we are surprised!'],
        items: [{ lesson: 'hediye', id: 'gift', x: 600, y: 370, s: 300 }, { lesson: 'kedi', id: 'cat', x: 640, y: 390, s: 220, hidden: true }],
        act: { kind: 'reveal', cover: 'gift', hidden: 'cat', ask: 'Open the present!', yes: 'Wow! A little cat! What a surprise!' },
      },
      { bg: 'day', say: ['Happy, sad, sleepy, surprised.', 'All feelings are okay.', 'The end.'], items: [{ lesson: 'mascot', x: 640, y: 370, s: 270 }, { lesson: 'yuzler', x: 300, y: 300, s: 300 }] },
    ],
  },

  // ---------------------------------------------------------------- deniz
  {
    id: 'sea', title: 'Under the Sea', tr: 'Denizin altında', bg: 'sea',
    cover: [{ lesson: 'ahtapot', x: 560, y: 340, s: 300 }, { lesson: 'balik', x: 840, y: 380, s: 200 }],
    pages: [
      { bg: 'sea', say: ['Down, down, down we go.', 'Under the blue sea!'], items: [{ lesson: 'denizalti', x: 640, y: 320, s: 420 }] },
      {
        bg: 'sea', say: ['Eight arms! Who is it?'],
        items: [{ lesson: 'ahtapot', id: 'octopus', x: 440, y: 340, s: 300 }, { lesson: 'yengec', id: 'crab', x: 860, y: 420, s: 230 }],
        act: { kind: 'tap', target: 'octopus', ask: 'Where is the octopus?', yes: 'Yes! The octopus has eight arms!' },
      },
      {
        bg: 'sea', say: ['Something big is swimming.'],
        items: [{ lesson: 'balina', id: 'whale', x: 580, y: 330, s: 420 }, { lesson: 'denizyildizi', id: 'star', x: 920, y: 440, s: 180 }],
        act: { kind: 'tap', target: 'whale', ask: 'Where is the whale?', yes: 'Yes! A big, big whale!' },
      },
      {
        bg: 'sea', say: ['Who is hiding behind the coral?'],
        items: [{ lesson: 'denizati', id: 'horse', x: 600, y: 360, s: 220, hidden: true }, { lesson: 'mercan', id: 'coral', x: 560, y: 370, s: 320 }],
        act: { kind: 'reveal', cover: 'coral', hidden: 'horse', ask: 'Tap the coral!', yes: "It's a sea horse! Hello!" },
      },
      {
        bg: 'sea', say: ['Count the starfish with me.'],
        items: row('denizyildizi', 3, 400, 190),
        act: { kind: 'choose', ask: 'How many starfish?', options: [2, 3, 4], answer: 3, yes: 'Three starfish!' },
      },
      { bg: 'sea', say: ['Up, up, up we go.', 'Bye bye, sea friends!', 'The end.'], items: [{ lesson: 'denizalti', x: 420, y: 300, s: 360 }, { lesson: 'ahtapot', x: 820, y: 390, s: 240 }] },
    ],
  },

  // ---------------------------------------------------------------- hava
  {
    id: 'weather', title: 'Sunny or Rainy?', tr: 'Güneşli mi, yağmurlu mu?', bg: 'day',
    cover: [{ lesson: 'gunes-bulut', x: 640, y: 300, s: 520 }],
    pages: [
      { bg: 'day', say: ["What's the weather today?", 'Look up at the sky!'], items: [{ lesson: 'gunes-bulut', x: 640, y: 290, s: 540 }] },
      {
        bg: 'day', say: ['The sun is warm and yellow.'],
        items: [{ lesson: 'gunes-bulut', parts: SUN, id: 'sun', x: 420, y: 290, s: 420 }, { lesson: 'bulut-yagmur', id: 'rain', x: 880, y: 280, s: 340 }],
        act: { kind: 'tap', target: 'sun', ask: 'Where is the sun?', yes: 'Yes! A warm sunny day!' },
      },
      {
        bg: 'sky', say: ['Oh no! Rain is coming.', 'Drip, drip, drop!'],
        items: [{ lesson: 'bulut-yagmur', id: 'rain', x: 620, y: 280, s: 420 }],
        act: { kind: 'tap', target: 'rain', ask: 'Tap the rainy cloud!', yes: 'Drip, drip! Rain, rain, go away!' },
      },
      {
        bg: 'day', say: ['We need something for the rain.'],
        items: [{ lesson: 'ucurtma', id: 'kite', x: 420, y: 320, s: 250 }, { lesson: 'canta', id: 'bag', x: 860, y: 380, s: 280 }],
        act: { kind: 'tap', target: 'bag', ask: 'Where is the bag?', yes: 'Good! Our things stay dry!' },
      },
      { bg: 'snow' as 'day', say: ['In winter the snow comes down.', 'Cold, white snow!'], items: [{ lesson: 'kardan-adam', x: 640, y: 360, s: 320 }, { lesson: 'kar-tanesi', x: 300, y: 220, s: 160 }] },
      { bg: 'day', say: ['Sunny, rainy, snowy.', 'Every day is a good day!', 'The end.'], items: [{ lesson: 'gokkusagi', x: 640, y: 280, s: 520 }, { lesson: 'mascot', x: 640, y: 440, s: 220 }] },
    ],
  },

  // ---------------------------------------------------------------- taşıtlar
  {
    id: 'go', title: "Let's Go!", tr: 'Hadi gidelim!', bg: 'day',
    cover: [{ lesson: 'araba', x: 560, y: 380, s: 320 }, { lesson: 'ucak', x: 860, y: 250, s: 260 }],
    pages: [
      { bg: 'day', say: ['How do you want to go?', 'We can go many ways!'], items: [{ lesson: 'mascot', x: 640, y: 370, s: 260 }] },
      {
        bg: 'day', say: ['On the road it goes vroom vroom.'],
        items: [{ lesson: 'araba', id: 'car', x: 430, y: 390, s: 300 }, { lesson: 'bisiklet', id: 'bike', x: 870, y: 390, s: 260 }],
        act: { kind: 'tap', target: 'car', ask: 'Where is the car?', yes: 'Vroom vroom! Off we go!' },
      },
      {
        bg: 'sky', say: ['Up in the sky it goes whoosh.'],
        items: [{ lesson: 'ucak', id: 'plane', x: 460, y: 280, s: 300 }, { lesson: 'hava-balonu', id: 'balloon', x: 880, y: 300, s: 280 }],
        act: { kind: 'tap', target: 'plane', ask: 'Where is the airplane?', yes: 'Whoosh! Up in the sky!' },
      },
      {
        bg: 'sea', say: ['On the water it goes splash.'],
        items: [{ lesson: 'yelkenli', id: 'boat', x: 440, y: 340, s: 300 }, { lesson: 'denizalti', id: 'sub', x: 880, y: 380, s: 300 }],
        act: { kind: 'tap', target: 'boat', ask: 'Where is the sailing boat?', yes: 'Splash! Over the waves!' },
      },
      {
        bg: 'day', say: ['How many wheels can you count?'],
        items: [{ lesson: 'bisiklet', x: 640, y: 380, s: 360 }],
        act: { kind: 'choose', ask: 'How many wheels?', options: [1, 2, 3], answer: 2, yes: 'Two wheels! Ring ring!' },
      },
      { bg: 'day', say: ['Car, plane, boat and bike.', 'Where will you go today?', 'The end.'], items: [{ lesson: 'araba', x: 340, y: 390, s: 250 }, { lesson: 'ucak', x: 640, y: 250, s: 230 }, { lesson: 'yelkenli', x: 930, y: 380, s: 250 }] },
    ],
  },

  // ---------------------------------------------------------------- kıyafetler
  {
    id: 'dress', title: 'Getting Dressed', tr: 'Giyiniyoruz', bg: 'day',
    cover: [{ lesson: 'mascot', x: 560, y: 360, s: 280 }, { lesson: 'kravat', x: 860, y: 350, s: 200 }],
    pages: [
      { bg: 'day', say: ['Good morning!', 'Time to get dressed.'], items: [{ lesson: 'mascot', x: 640, y: 360, s: 280 }] },
      {
        bg: 'day', say: ['It is sunny. What do we wear?'],
        items: [{ lesson: 'kravat', id: 'tie', x: 420, y: 350, s: 220 }, { lesson: 'canta', id: 'bag', x: 860, y: 370, s: 280 }],
        act: { kind: 'tap', target: 'bag', ask: 'Where is the bag?', yes: 'Take your bag! We are ready!' },
      },
      {
        bg: 'day', say: ['Our clothes have colours too.'],
        items: [{ lesson: 'kravat', id: 'tie', x: 640, y: 350, s: 250, bare: true }],
        act: { kind: 'paint', target: 'tie', ask: 'Make the tie red!', options: ['red', 'green', 'blue'], answer: 'red', yes: 'A smart red tie!' },
      },
      {
        bg: 'day', say: ['Something is hiding in the bag.'],
        items: [{ lesson: 'kitap', id: 'book', x: 640, y: 380, s: 240, hidden: true }, { lesson: 'canta', id: 'bag', x: 600, y: 370, s: 320 }],
        act: { kind: 'reveal', cover: 'bag', hidden: 'book', ask: 'Open the bag!', yes: "It's a book! Let's read together!" },
      },
      { bg: 'day', say: ['Now we are ready.', 'Have a lovely day!', 'The end.'], items: [{ lesson: 'mascot', x: 500, y: 370, s: 270 }, { lesson: 'canta', x: 840, y: 380, s: 250 }] },
    ],
  },

  // ---------------------------------------------------------------- şekiller
  {
    id: 'shapes', title: 'Shape Town', tr: 'Şekiller kasabası', bg: 'day',
    cover: [{ lesson: 'sekiller', x: 640, y: 320, s: 440 }],
    pages: [
      { bg: 'day', say: ['Welcome to Shape Town!', 'Circles, squares and triangles.'], items: [{ lesson: 'sekiller', x: 640, y: 320, s: 480 }] },
      {
        bg: 'day', say: ['The house has a triangle roof.'],
        items: [{ lesson: 'ev', id: 'house', x: 460, y: 350, s: 380 }, { lesson: 'daireler', id: 'circles', x: 880, y: 320, s: 300 }],
        act: { kind: 'tap', target: 'house', ask: 'Where is the house?', yes: 'Yes! A square with a triangle on top!' },
      },
      {
        bg: 'day', say: ['The sun is a big circle.'],
        items: [{ lesson: 'gunes-bulut', parts: SUN, id: 'sun', x: 480, y: 290, s: 420 }, { lesson: 'kalpler', id: 'hearts', x: 900, y: 340, s: 300 }],
        act: { kind: 'tap', target: 'sun', ask: 'Where is the circle?', yes: 'Yes! The sun is a circle!' },
      },
      {
        bg: 'day', say: ['And here are the hearts.'],
        items: [{ lesson: 'kalpler', id: 'hearts', x: 640, y: 330, s: 400, bare: true }],
        act: { kind: 'paint', target: 'hearts', ask: 'Make the hearts pink!', options: ['pink', 'green', 'brown'], answer: 'pink', yes: 'Lovely pink hearts!' },
      },
      {
        bg: 'day', say: ['Count the stars in Shape Town.'],
        items: row('yildiz', 4, 330, 170),
        act: { kind: 'choose', ask: 'How many stars?', options: [3, 4, 5], answer: 4, yes: 'Four pointy stars!' },
      },
      { bg: 'day', say: ['Shapes are everywhere!', 'Can you find a circle at home?', 'The end.'], items: [{ lesson: 'sekiller', x: 640, y: 320, s: 460 }] },
    ],
  },

  // ---------------------------------------------------------------- dinozorlar
  {
    id: 'dinoday', title: 'The Little Dino', tr: 'Küçük dinozor', bg: 'day',
    cover: [{ lesson: 'bebe-dino', x: 600, y: 370, s: 280 }, { lesson: 'dino-yumurta', x: 860, y: 400, s: 200 }],
    pages: [
      { bg: 'day', say: ['Crack, crack!', 'What is in the egg?'], items: [{ lesson: 'dino-yumurta', x: 640, y: 370, s: 300 }] },
      {
        bg: 'day', say: ['A little dino is coming out!'],
        items: [{ lesson: 'bebe-dino', id: 'baby', x: 600, y: 380, s: 260, hidden: true }, { lesson: 'dino-yumurta', id: 'egg', x: 600, y: 370, s: 320 }],
        act: { kind: 'reveal', cover: 'egg', hidden: 'baby', ask: 'Tap the egg!', yes: 'Hello, little dino!' },
      },
      {
        bg: 'day', say: ['The little dino looks for mum.'],
        items: [{ lesson: 'uzun-boyun', id: 'mum', x: 420, y: 330, s: 380 }, { lesson: 'trex', id: 'trex', x: 880, y: 370, s: 300 }],
        act: { kind: 'tap', target: 'mum', ask: 'Where is the long neck?', yes: 'Yes! Mum has a very long neck!' },
      },
      {
        bg: 'day', say: ['Stomp, stomp! Who is big and loud?'],
        items: [{ lesson: 'trex', id: 'trex', x: 460, y: 360, s: 320 }, { lesson: 'triceratops', id: 'tri', x: 880, y: 380, s: 300 }],
        act: { kind: 'tap', target: 'trex', ask: 'Where is the T-Rex?', yes: 'Roar! The T-Rex is very loud!' },
      },
      {
        bg: 'day', say: ['How many dinos can you count?'],
        items: row('bebe-dino', 3, 380, 210),
        act: { kind: 'choose', ask: 'How many dinos?', options: [2, 3, 4], answer: 3, yes: 'Three little dinos!' },
      },
      { bg: 'day', say: ['The little dino is happy now.', 'Good night, little dino.', 'The end.'], items: [{ lesson: 'uzun-boyun', x: 480, y: 330, s: 360 }, { lesson: 'bebe-dino', x: 820, y: 400, s: 230, asleep: true }] },
    ],
  },

  // ---------------------------------------------------------------- uzay
  {
    id: 'moon', title: 'To the Moon!', tr: "Ay'a gidiyoruz!", bg: 'sky',
    cover: [{ lesson: 'roket', x: 560, y: 330, s: 300 }, { lesson: 'ay-yildizlar', x: 860, y: 280, s: 300 }],
    pages: [
      { bg: 'day', say: ['Three, two, one...', 'Blast off!'], items: [{ lesson: 'roket', x: 640, y: 350, s: 320 }] },
      { bg: 'sky', say: ['Up, up and away!', 'Past the clouds we go.'], items: [{ lesson: 'roket', x: 520, y: 300, s: 280 }, { lesson: 'bulut-yagmur', id: 'cloud', x: 880, y: 260, s: 300 }] },
      {
        bg: 'night', say: ['Look at the night sky!'],
        items: [{ lesson: 'ay-yildizlar', id: 'moon', x: 480, y: 280, s: 340 }, { lesson: 'uzay-mekigi', id: 'shuttle', x: 900, y: 330, s: 280 }],
        act: { kind: 'tap', target: 'moon', ask: 'Where is the moon?', yes: 'Yes! The big round moon!' },
      },
      {
        bg: 'night', say: ['Someone is behind the rocket.'],
        items: [{ lesson: 'uzayli', id: 'alien', x: 640, y: 350, s: 260, hidden: true }, { lesson: 'uzay-araci', id: 'ufo', x: 600, y: 330, s: 360 }],
        act: { kind: 'reveal', cover: 'ufo', hidden: 'alien', ask: 'Tap the spaceship!', yes: 'An alien! Hello, friend!' },
      },
      {
        bg: 'night', say: ['Count the stars with the alien.'],
        items: row('yildiz', 5, 300, 150),
        act: { kind: 'choose', ask: 'How many stars?', options: [4, 5, 6], answer: 5, yes: 'Five bright stars!' },
      },
      { bg: 'night', say: ['Time to go home.', 'Bye bye, moon! Bye bye, alien!', 'The end.'], items: [{ lesson: 'roket', x: 420, y: 330, s: 260 }, { lesson: 'uzayli', x: 840, y: 370, s: 240 }] },
    ],
  },

  // ---------------------------------------------------------------- doğum günü
  {
    id: 'party', title: 'A Birthday Party', tr: 'Doğum günü partisi', bg: 'day',
    cover: [{ lesson: 'dogum-gunu', x: 600, y: 350, s: 320 }, { lesson: 'balon', x: 870, y: 290, s: 200 }],
    pages: [
      { bg: 'day', say: ['Today is a special day.', 'It is a birthday party!'], items: [{ lesson: 'dogum-gunu', x: 640, y: 350, s: 360 }] },
      {
        bg: 'day', say: ['Balloons everywhere!'],
        items: row('balon', 3, 300, 200),
        act: { kind: 'choose', ask: 'How many balloons?', options: [2, 3, 4], answer: 3, yes: 'Three happy balloons!' },
      },
      {
        bg: 'day', say: ['Make a balloon for the party.'],
        items: [{ lesson: 'balon', id: 'balloon', x: 640, y: 320, s: 260, bare: true }],
        act: { kind: 'paint', target: 'balloon', ask: 'Make the balloon yellow!', options: ['yellow', 'blue', 'green'], answer: 'yellow', yes: 'A big yellow balloon!' },
      },
      {
        bg: 'day', say: ['What is inside the present?'],
        items: [{ lesson: 'davul', id: 'drum', x: 640, y: 380, s: 250, hidden: true }, { lesson: 'hediye', id: 'gift', x: 600, y: 370, s: 320 }],
        act: { kind: 'reveal', cover: 'gift', hidden: 'drum', ask: 'Open the present!', yes: 'A drum! Boom boom boom!' },
      },
      {
        bg: 'day', say: ['Time for the cake!'],
        items: [{ lesson: 'dogum-gunu', id: 'cake', x: 440, y: 360, s: 320 }, { lesson: 'pizza', id: 'pizza', x: 880, y: 380, s: 260 }],
        act: { kind: 'tap', target: 'cake', ask: 'Where is the cake?', yes: 'Happy birthday to you!' },
      },
      { bg: 'day', say: ['Happy birthday!', 'What a lovely party!', 'The end.'], items: [{ lesson: 'mascot', x: 480, y: 370, s: 260 }, { lesson: 'dogum-gunu', x: 820, y: 360, s: 280 }] },
    ],
  },

  // ---------------------------------------------------------------- arkadaşlık
  {
    id: 'friend', title: 'The New Friend', tr: 'Yeni arkadaş', bg: 'day',
    cover: [{ lesson: 'mascot', x: 520, y: 370, s: 260 }, { lesson: 'kirpi', x: 820, y: 400, s: 230 }],
    pages: [
      { bg: 'day', say: ['Chizio is playing in the garden.', 'But he is all alone.'], items: [{ lesson: 'mascot', x: 640, y: 370, s: 270 }, { lesson: 'agac', x: 300, y: 320, s: 360 }] },
      {
        bg: 'day', say: ['Someone is behind the flower.'],
        items: [{ lesson: 'kirpi', id: 'hedge', x: 620, y: 410, s: 230, hidden: true }, { lesson: 'aycicegi', id: 'flower', x: 580, y: 330, s: 360 }],
        act: { kind: 'reveal', cover: 'flower', hidden: 'hedge', ask: 'Tap the flower!', yes: "It's a little hedgehog! Hello!" },
      },
      {
        bg: 'day', say: ['The hedgehog is shy.', 'Give him something nice.'],
        items: [{ lesson: 'ogretmen-elma', id: 'apple', x: 420, y: 380, s: 240 }, { lesson: 'kitap', id: 'book', x: 870, y: 380, s: 240 }],
        act: { kind: 'tap', target: 'apple', ask: 'Where is the apple?', yes: 'Thank you! The hedgehog smiles!' },
      },
      {
        bg: 'day', say: ['Now more friends are coming!'],
        items: [{ lesson: 'sincap', id: 'squirrel', x: 380, y: 390, s: 240 }, { lesson: 'tavsan', id: 'bunny', x: 640, y: 390, s: 240 }, { lesson: 'kirpi', id: 'hedge', x: 900, y: 400, s: 230 }],
        act: { kind: 'tap', target: 'squirrel', ask: 'Where is the squirrel?', yes: 'Hello, squirrel! Come and play!' },
      },
      {
        bg: 'day', say: ['How many friends are here?'],
        items: [{ lesson: 'sincap', x: 380, y: 390, s: 230 }, { lesson: 'tavsan', x: 640, y: 390, s: 230 }, { lesson: 'kirpi', x: 900, y: 400, s: 220 }],
        act: { kind: 'choose', ask: 'How many friends?', options: [2, 3, 4], answer: 3, yes: 'Three new friends!' },
      },
      { bg: 'day', say: ['Now nobody is alone.', 'Friends make every day better!', 'The end.'], items: [{ lesson: 'mascot', x: 640, y: 370, s: 260 }, { lesson: 'kirpi', x: 330, y: 410, s: 210 }, { lesson: 'tavsan', x: 930, y: 390, s: 230 }] },
    ],
  },

  // ---------------------------------------------------------------- uyku
  {
    id: 'bedtime', title: 'Good Night, Everyone', tr: 'İyi geceler herkese', bg: 'night',
    cover: [{ lesson: 'ay-yildizlar', x: 620, y: 290, s: 360 }, { lesson: 'mascot', x: 860, y: 390, s: 220 }],
    pages: [
      { bg: 'night', say: ['The sun goes down.', 'The moon comes up.'], items: [{ lesson: 'ay-yildizlar', x: 640, y: 290, s: 420 }] },
      {
        bg: 'night', say: ['The cat is sleepy.'],
        items: [{ lesson: 'kedi', id: 'cat', x: 460, y: 390, s: 250, asleep: true }, { lesson: 'baykus', id: 'owl', x: 880, y: 350, s: 260 }],
        act: { kind: 'tap', target: 'cat', ask: 'Where is the sleepy cat?', yes: 'Good night, cat!' },
      },
      {
        bg: 'night', say: ['But the owl is awake!', 'Owls like the night.'],
        items: [{ lesson: 'baykus', id: 'owl', x: 640, y: 340, s: 300 }],
        act: { kind: 'tap', target: 'owl', ask: 'Tap the owl!', yes: 'Hoo hoo! Hello, owl!' },
      },
      {
        bg: 'night', say: ['Count the stars and close your eyes.'],
        items: row('yildiz', 4, 260, 150),
        act: { kind: 'choose', ask: 'How many stars?', options: [3, 4, 5], answer: 4, yes: 'Four sleepy stars!' },
      },
      { bg: 'night', say: ['Good night, cat. Good night, owl.', 'Good night, you!', 'The end.'], items: [{ lesson: 'mascot', x: 640, y: 380, s: 260, asleep: true }, { lesson: 'ay-yildizlar', x: 280, y: 240, s: 280 }] },
    ],
  },
];
