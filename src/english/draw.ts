/**
 * Draw in English: çizim derslerinin İngilizce anlatımı.
 *
 * Ders çizimleri aynı kalır; yalnızca Çizio'nun anlattığı cümleler İngilizce olur. Çocuk zaten bildiği
 * bir şeyi çizerken "circle, line, big, small, under, next to" gibi kelimeleri doğal yoldan duyar —
 * çeviri ya da ezber olmadan. Bu yüzden cümleler kısa, buyurgan ve hep aynı kalıpları tekrar eder.
 *
 * Buradaki her ders `src/lessons/data` içindeki dersle aynı adım sayısına sahip olmalıdır; `draw.test.ts`
 * bunu denetler. React içermez: cümleleri `englishLines()` toplar ve `npm run voice` seslendirir.
 */

export interface DrawLesson {
  /** İngilizce ders adı. */
  title: string;
  /** Her adım için bir cümle (ders dosyasındaki adımlarla aynı sırada ve sayıda). */
  steps: string[];
}

export const EN_DRAW: Record<string, DrawLesson> = {
  kedi: {
    title: 'A Happy Cat',
    steps: [
      'Draw a big wide oval. This is the head of the cat.',
      'Put two pointy ears on top of the head. Think of triangles!',
      'Draw a smaller triangle inside each ear.',
      'Now draw two round eyes. Leave a little space between them.',
      'Draw a tiny triangle nose in the middle, and a smiling mouth under it.',
      'Last, add whiskers on both sides. Two on the left, two on the right!',
    ],
  },
  kopek: {
    title: 'A Good Dog',
    steps: [
      'Draw a big U for the body. Go down on the left, flat at the bottom, up on the right.',
      'Draw a big wide oval on top of the U. This is the head.',
      'Draw two long ears hanging down from the sides of the head. Like two drops!',
      'Add two round paws under the body, and a happy tail on the right side.',
      'Draw a light oval on the chest, an oval for the nose, and one spot over the left eye.',
      'Draw two round eyes above the nose oval. Put a tiny white shine in each one.',
      'Draw a big round nose on top of the oval. Add a smiling mouth under it.',
      'Draw a pink tongue under the mouth. Add two round cheeks on the sides.',
    ],
  },
  tavsan: {
    title: 'A Rabbit with Long Ears',
    steps: [
      'Draw a big round oval. This is the head of the rabbit.',
      'Draw two long ears on top of the head. Make them the same size!',
      'Draw a thinner, longer shape inside each ear.',
      'Draw two round eyes and put a tiny white shine in each one.',
      'Draw a tiny nose in the middle and a smiling mouth under it.',
      'Add two little teeth under the mouth and pink cheeks on the sides.',
    ],
  },
  ayi: {
    title: 'A Teddy Bear',
    steps: [
      'Draw a big U like a pear for the body. Start on the left, go down, come up on the right.',
      'Draw a big round head touching the two ends of the U.',
      'Add two round ears on top of the head. Draw a small circle inside each one.',
      'Draw two round arms on the sides and two round feet under the body.',
      'Draw a big light oval on the tummy, and a smaller oval for the nose.',
      'Draw a big pad inside each foot, and three tiny toes on each pad.',
      'Draw two bright eyes above the nose oval. Do not forget the tiny white shines!',
      'Draw a round nose and a smiling mouth in the oval. Add pink cheeks on the sides.',
    ],
  },
  aslan: {
    title: 'A Lion with a Mane',
    steps: [
      'Draw a big U for the body. Go down on the left, flat at the bottom, up on the right.',
      'Draw a big mane on top of the body. Make little bumps all around, like a flower.',
      'Draw a big round head in the middle of the mane.',
      'Add two round ears on top of the head, with a small circle inside each one.',
      'Draw two round paws under the body. Add two short lines on each paw for the toes.',
      'Draw a light oval on the chest. Add a tail on the right with a fluffy end.',
      'Draw a light oval for the nose under the head. Put a round nose on top of it.',
      'Draw two bright eyes above the nose oval. Add a tiny white shine in each one.',
      'Draw a smiling mouth under the nose and pink cheeks on the sides. The lion is happy!',
    ],
  },
  fil: {
    title: 'A Little Elephant',
    steps: [
      'Draw a big U for the body. Go down on the left, round at the bottom, up on the right.',
      'Draw two very big ears on the sides. Make them wide and round like fans!',
      'Draw a big round head between the ears. Leave a little space for the trunk.',
      'Draw a thick trunk going down. Curl the end up to the right and add two lines.',
      'Draw two short thick legs under the body. Add three tiny nails on each foot.',
      'Draw a smaller pink shape inside each ear.',
      'Draw two bright eyes on the sides of the trunk. Do not forget the shines!',
      'Add pink cheeks, a smiling mouth, and three tiny hairs on top of the head.',
    ],
  },
  zurafa: {
    title: 'A Sweet Giraffe',
    steps: [
      'Draw a wide oval at the top. This is the head of the giraffe.',
      'Draw a long neck with two lines going down. Join it to a round body.',
      'Draw two little horns on top of the head and two leaf ears on the sides.',
      'Draw two long legs under the body. Start at the body, go down, come back up.',
      'Add dark hooves at the end of the legs, and a small tail on the right.',
      'Draw a light oval for the nose. Put two tiny holes inside it.',
      'Draw two bright eyes above the nose oval. Add a tiny white shine in each one.',
      'Draw a smiling mouth in the oval and pink cheeks on the sides.',
      'Last, draw big and small spots on the neck and the body. Now it has a pattern!',
    ],
  },
  tilki: {
    title: 'A Clever Fox',
    steps: [
      'Draw a U for the body. Go down on the left, flat at the bottom, up on the right.',
      'Draw a wide dome on top of the body. Go up on the left and down on the right.',
      'Draw a white face under the dome. Make the top wavy and the chin pointy.',
      'Draw two big pointy ears on top of the head. Add a small triangle inside each one.',
      'Draw a big fluffy tail curling up on the right. Add two small paws under the body.',
      'Draw a zigzag line at the end of the tail. Draw a white chest too.',
      'Draw two bright eyes at the top of the face. Put a tiny white shine in each one.',
      'Draw a small nose on the chin, a smiling mouth, and pink cheeks.',
    ],
  },
  kurbaga: {
    title: 'A Jumping Frog',
    steps: [
      'Draw a very big wide oval. This is the head of the frog.',
      'Draw two round bumps on top of the head. The eyes will go here!',
      'Draw a small round body under the head. Add a light oval for the tummy.',
      'Draw two curved back legs on the sides. Add feet with three toes.',
      'Draw a big white circle inside each bump. The frog has very big eyes!',
      'Draw black dots inside the white circles. Put a tiny shine on top.',
      'Add two tiny nose holes, a very big smile, and pink cheeks.',
    ],
  },
  baykus: {
    title: 'An Owl with Big Eyes',
    steps: [
      'Draw a big egg shape with two pointy ears on top. This is the body of the owl.',
      'Draw a wing on each side, like two drops.',
      'Draw a big round tummy at the bottom of the body.',
      'Draw two very big circles under the ears. Owls have very big eyes!',
      'Draw black dots inside the circles and tiny white shines inside them.',
      'Draw a small triangle beak between the eyes, pointing down.',
      'Draw little U shapes on the tummy. These are the soft feathers!',
      'Draw a long branch under the owl, and two tiny feet on the branch.',
    ],
  },
  panda: {
    title: 'A Round Panda',
    steps: [
      'Draw a very big U for the body. Start on the left, go down, come up on the right.',
      'Draw a big round head touching the two ends of the U.',
      'Add two round ears on top of the head.',
      'Draw two oval spots on the face. These are the panda eye patches.',
      'Draw a bright white circle inside each spot. Now the eyes shine!',
      'Draw a small nose, a smiling mouth, and pink cheeks.',
      'Draw an oval arm on each side of the body. Like a big hug!',
      'Last, draw two round feet at the bottom.',
    ],
  },
  kaplumbaga: {
    title: 'A Turtle',
    steps: [
      'Draw a very big dome and close it with a flat line at the bottom.',
      'Draw a long strip under the dome. This is the edge of the shell.',
      'Draw a big round head on the right side.',
      'Add two short legs under the shell and a tiny tail on the left.',
      'Draw a big hexagon in the middle of the shell and smaller ones on the sides.',
      'Add two more tiny hexagons at the top. The same shape again makes a pattern!',
      'Draw a shiny eye, a smiling mouth and a pink cheek on the head.',
    ],
  },
  penguen: {
    title: 'A Penguin',
    steps: [
      'Draw a very big egg. Narrow at the top, wide at the bottom. This is the body.',
      'Draw a white face and tummy inside. Two bumps at the top, then go wider.',
      'Draw two wings on the sides, pointing down. The penguin is waving!',
      'Add two orange feet at the bottom and a tiny curl on top of the head.',
      'Draw two round eyes inside the white bumps. Add the tiny white shines too.',
      'Draw an orange beak between the eyes, pointing down. Add pink cheeks.',
      'Last, draw a smart bow tie on the neck. A circle and two triangles!',
    ],
  },
  ari: {
    title: 'A Honey Bee',
    steps: [
      'Draw a big round egg lying down. This is the body of the bee.',
      'Draw two thick stripes on the right half of the body. Make them curved.',
      'Draw a small pointy sting at the end of the body.',
      'Draw two round wings on top of the body, opening upwards.',
      'Draw two curly feelers on the head. Put a small ball at each end.',
      'Draw two round eyes on the left side of the body. Do not forget the shines.',
      'Draw a smiling mouth under the eyes and pink cheeks on the sides.',
      'Draw a little flower at the bottom right, with a yellow middle and a green stem. Bzzz!',
    ],
  },
  kelebek: {
    title: 'A Butterfly',
    steps: [
      'Draw a big round wing going up on the left. Then draw the same one on the right.',
      'Draw two smaller wings under the big ones. Make them round and bring them back.',
      'Draw a long thin oval in the middle for the body.',
      'Draw a round head on top of the body, with two curly feelers.',
      'Draw a big circle on each top wing and a small circle on each bottom wing.',
      'Draw two bright eyes on the head. Put a tiny white shine in each one.',
      'Draw a little smile and pink cheeks. The butterfly is ready to fly!',
    ],
  },
  balik: {
    title: 'A Little Fish',
    steps: [
      'Draw a big oval lying down. This is the body of the fish.',
      'Add a big tail on the right. Start at the body and finish at the body.',
      'Draw a curved fin on the back and a small fin in the middle.',
      'Draw a thick stripe near the tail. Go down, across, and then up.',
      'Draw a round eye on the left side, with a tiny white shine inside.',
      'Add a smiling mouth under the eye and a pink cheek.',
      'Last, draw three bubbles in front of the fish. Big, smaller, smallest!',
    ],
  },
  ahtapot: {
    title: 'A Friendly Octopus',
    steps: [
      'Draw a very big round head. Start at the top and go to the left.',
      'Draw three arms from the bottom left. Each one goes down, curls, and comes back.',
      'Now draw three arms on the right side. Curl these ends to the right.',
      'Draw two round eyes in the middle of the head. Add the tiny white shines.',
      'Draw a smiling mouth between the eyes and pink cheeks on the sides.',
      'Last, draw three round spots on top of the head. One big and two small.',
    ],
  },
  yildiz: {
    title: 'A Happy Star',
    steps: [
      'Start at the top. Make two pointy corners going down on the left.',
      'Now draw the right side the same way. Start at the top and meet at the bottom.',
      'Draw two round eyes in the middle. Make them the same size. Add the shines!',
      'Draw a smiling mouth under the eyes. Add pink cheeks on the sides.',
      'Draw sparkles on both sides of the star. One line up and down, one across!',
    ],
  },
  kalpler: {
    title: 'Hearts',
    steps: [
      'Start in the little dip at the top. Make a round bump to the left and go down to the point.',
      'Now make the second bump to the right. Meet at the same point at the bottom.',
      'Draw two round eyes in the middle of the heart. Put a tiny white shine in each one.',
      'Draw a very big smile under the eyes. Add pink cheeks on the sides.',
      'Draw a middle size heart on each side, under the big one.',
      'Draw a small purple heart under the point of the big heart.',
      'Draw two tiny yellow hearts in the top corners. Small shapes need careful hands!',
      'Draw a little curl at the top left. Now the heart is shining!',
    ],
  },
  'gunes-bulut': {
    title: 'The Sun and a Cloud',
    steps: [
      'Draw a big round circle in the top left corner. This is our sun!',
      'Draw four rays going out from the sun. Up, right, down and left.',
      'Now add four more rays, right between the first ones.',
      'Draw a fluffy cloud at the bottom right. Round on top, flat at the bottom.',
      'Draw two bright eyes and a very big smile on the sun.',
      'Add pink cheeks to the sun. Give the cloud happy closed eyes and a smile.',
    ],
  },
  cicek: {
    title: 'A Daisy',
    steps: [
      'Draw one long petal up, one right, one down and one left.',
      'Draw four more petals between them. Now your daisy has eight petals!',
      'Draw a round middle where all the petals start.',
      'Draw a long curvy stem going down from the bottom petal.',
      'Add a leaf on each side of the stem. Start at the stem and finish at the stem.',
      'Draw two bright eyes and a sweet smile in the middle. Your daisy is smiling!',
    ],
  },
  agac: {
    title: 'An Apple Tree',
    steps: [
      'Start at the bottom left and make round bumps going up, like a big green cloud.',
      'Draw a thick trunk going down from the leaves. Make it wider at the bottom.',
      'Draw two bright eyes in the middle of the leaves. The tree is waking up!',
      'Draw a very big smile under the eyes and pink cheeks on the sides.',
      'Now draw five round apples in the leaves. Put them here and there!',
      'Draw a little hole and two curved lines on the trunk. This is the bark.',
      'Last, draw zigzag grass on both sides of the trunk.',
    ],
  },
  ev: {
    title: 'A Lovely House',
    steps: [
      'Draw a big square for the wall. Start at the top and go around the four corners.',
      'Draw a big triangle roof on top of the square. Let it go over the sides a little.',
      'Draw a door in the middle of the wall, touching the ground. Add a little handle.',
      'Draw a square window on each side of the door. Make them the same size.',
      'Draw a plus sign in each window. Now there are four little panes.',
      'Add a chimney on the right of the roof, and a small round window in the middle.',
      'Draw curly smoke from the chimney. Add round bushes on both sides of the house.',
    ],
  },
  roket: {
    title: 'A Space Rocket',
    steps: [
      'Draw a long standing rectangle. This is the body of the rocket.',
      'Draw a pointy nose on top. Start on the left, meet at the top, go down on the right.',
      'Add a fin on each side of the body. Both go down.',
      'Draw a round window on the top half of the body, with a tiny shine inside.',
      'Draw a wavy flame coming out of the bottom. Add a smaller yellow flame inside.',
      'Draw a stripe on the body and shining stars on both sides. Ready for take off!',
    ],
  },
  ucak: {
    title: 'A Little Airplane',
    steps: [
      'Draw a long body. A round nose on the right and a tail going up on the left.',
      'Draw a tall tail at the left end. Start at the body, go up and come back.',
      'Draw a big wing under the body and a small wing on top.',
      'Draw three round windows in the middle of the body. Leave the same space between them.',
      'Draw a small circle on the nose, and a long propeller above and below it.',
      'Add two soft clouds in the sky. Our airplane is flying!',
    ],
  },
  araba: {
    title: 'A Little Car',
    steps: [
      'Draw a long body with round corners. The two half circles at the bottom are for the wheels.',
      'Draw a round cabin on top of the body. Go up on the left and down on the right.',
      'Draw two big wheels in the spaces. Put a small circle in the middle of each one.',
      'Draw two windows in the cabin. The back window on the left, the front one on the right.',
      'Draw two round eyes in the middle of the body. Do not forget the white shines.',
      'Draw a smiling mouth, pink cheeks, and a yellow light at the front.',
    ],
  },
  dondurma: {
    title: 'An Ice Cream',
    steps: [
      'Draw the cone like an upside down triangle. Go down on the left and up on the right.',
      'Start at the left end of the cone, make a very big dome and come down on the right.',
      'Now draw a wavy line under the ice cream. It is melting!',
      'Draw lines crossing on the cone. Little diamonds will appear, just like a waffle.',
      'Draw two round eyes in the middle of the ice cream. Put a tiny white shine in each one.',
      'Draw a very big smile under the eyes and pink cheeks on the sides.',
      'Draw a cherry and its stem on top. Then sprinkle some tiny candies!',
    ],
  },
  cupcake: {
    title: 'A Cupcake',
    steps: [
      'Draw the paper cup. Go down on the left, flat at the bottom, up on the right.',
      'Draw fluffy cream on top of the cup. Big bumps up high and small waves below.',
      'Draw three lines from top to bottom on the paper cup. These are the folds.',
      'Draw two round eyes on the cream. Add a tiny white shine in each one.',
      'Draw a sweet smile between the eyes and pink cheeks on the sides.',
      'Put a red cherry and its stem on top. Sprinkle some tiny candies on the cream!',
    ],
  },
};

export const drawLesson = (id: string) => EN_DRAW[id];
export const EN_DRAW_IDS = Object.keys(EN_DRAW);

/** Ders akışında kullanılan sabit cümlelerin İngilizcesi. */
export const DRAW_UI = {
  start: "Let's draw! Watch me first.",
  yourTurn: 'Your turn! Follow the orange line.',
  yourTurnPaper: 'Your turn! Draw it on your paper, then go on.',
  tryFirst: 'Try to draw it first!',
  color: 'Now the best part. Colour it!',
  photo: 'Take a photo of your drawing!',
  great: 'Great drawing!',
  done: 'Well done! You finished the lesson!',
  intro: 'Draw in English',
};

export const DRAW_LINES: string[] = [...new Set([
  ...Object.values(EN_DRAW).flatMap((l) => [l.title, ...l.steps]),
  ...Object.values(DRAW_UI),
])];
