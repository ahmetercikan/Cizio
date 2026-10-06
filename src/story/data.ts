/**
 * Hikaye kitabım: çocuğun çizimlerinden kurulan masallar.
 *
 * Her ders için iki cümle var: kahraman (masalın ilk resmi) ve arkadaş (yolda katılan). Cümleler sabittir ve
 * hangi sırayla seçilirse seçilsin birbirine uyar; böylece hepsi önceden Çizio'nun doğal sesiyle seslendirilir
 * (src/voice/lines.ts). Masal konuları (piknik, hazine avı…) başlangıç, ara ve bitiş cümlelerini verir.
 */
export interface StoryTheme {
  id: string;
  title: string;
  /** Kahramandan hemen sonra: macera başlar. */
  setup: string;
  /** Arkadaş sayfalarının sonuna sırayla eklenen ara cümleler. */
  middle: string[];
  ending: string;
  color: string;
}

export const STORY_OPEN = 'Bir varmış, bir yokmuş.';
export const STORY_CLOSE = 'Gökten üç elma düşmüş. Biri bu masalı çizene, biri okuyana, biri de dinleyene!';
export const STORY_START = 'Hikayemiz başlıyor!';
export const STORY_PICK = 'Masalına hangi resimler girsin? En az iki resim seç.';
export const STORY_THEME_PICK = 'Masalımız nerede geçsin?';

export const THEMES: StoryTheme[] = [
  {
    id: 'piknik',
    title: 'Büyük Piknik',
    color: '#7fcf63',
    setup: 'Bir sabah güneş gülümseyince, kocaman bir piknik sepeti hazırlayıp yola koyulmuş.',
    middle: ['Hep birlikte neşeyle yürümeye devam etmişler.', 'Yol boyunca şarkılar söyleyip el ele tutuşmuşlar.', 'Kelebekleri izleyerek, çiçekleri koklayarak ilerlemişler.'],
    ending: 'Sonunda çiçeklerle dolu yemyeşil bir çayıra varmışlar. Örtüyü sermişler, sepeti açmışlar ve doya doya yemişler. O gün herkes çok mutlu olmuş.',
  },
  {
    id: 'hazine',
    title: 'Hazine Avı',
    color: '#ffc83d',
    setup: 'Bir gün eline eski bir hazine haritası geçmiş. Haritada kocaman, kırmızı bir çarpı işareti varmış!',
    middle: ['Haritaya bakıp yola devam etmişler.', 'Ağaçların arasından geçip tepeleri aşmışlar.', 'Hazineye her adımda biraz daha yaklaşmışlar.'],
    ending: 'Sonunda çarpı işaretinin olduğu yeri kazmışlar ve parıl parıl parlayan bir sandık bulmuşlar. Sandıktan rengarenk boya kalemleri çıkmış! Hep birlikte en güzel resimlerini çizmişler.',
  },
  {
    id: 'uzay',
    title: 'Uzay Yolculuğu',
    color: '#7c5cff',
    setup: 'Bir gece gökyüzündeki yıldızlara bakarken, oraya gitmeye karar vermiş. Hemen parlak bir roket hazırlamış!',
    middle: ['Roket vınnn diye yükselmiş, bulutların üstüne çıkmış.', 'Yıldızların arasından süzülerek ilerlemişler.', 'Ay dedenin yanından el sallayarak geçmişler.'],
    ending: 'Sonunda gülümseyen minik bir gezegene konmuşlar. Gezegenin sakinleri onları sevinçle karşılamış. Hep birlikte yıldızları seyretmişler ve mutlu mutlu eve dönmüşler.',
  },
  {
    id: 'parti',
    title: 'Doğum Günü Partisi',
    color: '#e9487d',
    setup: 'Bir sabah kapısının önünde rengarenk bir davetiye bulmuş. Bugün büyük bir doğum günü partisi varmış!',
    middle: ['Partiye giderken yolda balonlar toplamışlar.', 'Birlikte güzel bir hediye paketlemişler.', 'Parti alanına yaklaştıkça neşeli bir müzik duyulmaya başlamış.'],
    ending: 'Partiye vardıklarında herkes sürpriz diye bağırmış. Kocaman bir pasta kesilmiş, hep birlikte dans etmişler. Bu, gelmiş geçmiş en güzel parti olmuş.',
  },
];

/** Ders → [kahraman, arkadaş]. */
export const STORY_LINES: Record<string, [string, string]> = {
  // Deniz
  ahtapot: ['Bir zamanlar denizin dibinde, sekiz kolu olan sevimli bir ahtapot yaşarmış. Kollarıyla herkese aynı anda sarılmayı çok severmiş.', 'Derken sekiz koluyla el sallayan sevimli bir ahtapot çıkagelmiş. Ben de gelebilir miyim, diye sormuş.'],
  balina: ['Bir zamanlar okyanusta kocaman, mavi bir balina yaşarmış. Sırtından fıskiye gibi su püskürtüp gökkuşakları yaparmış.', 'Az sonra dalgaların arasından kocaman bir mavi balina belirmiş. Fıs diye su püskürtüp onlara katılmış.'],
  'deniz-kabugu': ['Bir zamanlar kumsalda, içinde denizin sesini saklayan sihirli bir deniz kabuğu varmış.', 'Kumların arasında parlayan bir deniz kabuğu bulmuşlar. Kabuk, denizin şarkısını mırıldanarak onlarla gelmiş.'],
  denizanasi: ['Bir zamanlar denizde, ışıl ışıl parlayan bir denizanası yaşarmış. Suyun içinde dans eder gibi süzülürmüş.', 'Derken suyun içinde dans eden parlak bir denizanası görmüşler. O da süzüle süzüle onlara katılmış.'],
  denizati: ['Bir zamanlar mercanların arasında, kuyruğu kıvrık minik bir denizatı yaşarmış. Çok utangaç ama çok cesurmuş.', 'Mercanların arasından kıvrık kuyruklu minik bir denizatı çıkmış. Ben de sizinle geleyim, demiş.'],
  denizyildizi: ['Bir zamanlar kumsalda, beş kollu, gülümseyen bir deniz yıldızı varmış. Geceleri gökteki yıldızlara el sallarmış.', 'Kumların üstünde gülümseyen bir deniz yıldızı görmüşler. Beş koluyla el sallayıp onlara katılmış.'],
  kopekbaligi: ['Bir zamanlar okyanusta, herkesin dostu olan sevimli bir köpekbalığı yaşarmış. Kocaman gülüşüyle herkesi sevindirirmiş.', 'Derken dişlerini göstererek gülümseyen dost bir köpekbalığı çıkagelmiş. Korkmayın, ben çok iyiyim, demiş.'],
  'kumdan-kale': ['Bir zamanlar kumsalda, kuleleri bayraklı kocaman bir kumdan kale varmış. Dalgalar ona hep selam verirmiş.', 'Kumsalda kocaman bir kumdan kale görmüşler. Kalenin kapısı açılmış ve onları içeri davet etmiş.'],
  yengec: ['Bir zamanlar kumsalda, yan yan yürüyen neşeli bir yengeç yaşarmış. Kıskaçlarıyla çıt çıt diye şarkı söylermiş.', 'Derken yan yan yürüyen neşeli bir yengeç çıkagelmiş. Kıskaçlarını şaklatıp ben de varım, demiş.'],
  yunus: ['Bir zamanlar denizde, dalgaların üstünde zıplayan neşeli bir yunus yaşarmış. Herkesi güldürmeyi çok severmiş.', 'Az sonra dalgaların üstünden zıplayan neşeli bir yunus görmüşler. Takla atıp onlara katılmış.'],
  // Dinozorlar
  'dino-yumurta': ['Bir zamanlar çatırtıyla açılan bir yumurtadan minik bir dinozor çıkmış. Dünyayı merak eden çok meraklı bir yavruymuş.', 'Derken çat diye bir ses duymuşlar. Bir yumurtadan minik bir dinozor çıkmış ve hemen onların peşine takılmış.'],
  ejderha: ['Bir zamanlar bulutların üstünde, ateş yerine renkli baloncuklar üfleyen dost bir ejderha yaşarmış.', 'Gökyüzünden kanatlarını çırparak dost bir ejderha inmiş. Renkli baloncuklar üfleyerek onlara katılmış.'],
  stegozor: ['Bir zamanlar ormanda, sırtında dikenli plakalar olan sakin bir stegozor yaşarmış. Yaprak yemeyi çok severmiş.', 'Ağaçların arasından sırtı plakalı bir stegozor çıkmış. Yavaş yavaş yürüyüp onlara katılmış.'],
  trex: ['Bir zamanlar kolları kısa ama yüreği kocaman minik bir T-Rex varmış. Kükremeyi denese de hep gülermiş.', 'Derken kolları kısacık minik bir T-Rex çıkagelmiş. Kükremek istemiş ama kıkır kıkır gülmüş ve onlara katılmış.'],
  triceratops: ['Bir zamanlar üç boynuzlu, iri ama çok nazik bir triceratops yaşarmış. Arkadaşlarını hep korurmuş.', 'Az sonra üç boynuzlu nazik bir triceratops görmüşler. Ben sizi korurum, diyerek onlara katılmış.'],
  'ucan-dinozor': ['Bir zamanlar gökyüzünde süzülen, kanatları kocaman bir uçan dinozor varmış. Her yeri yukarıdan görürmüş.', 'Gökyüzünden süzülerek bir uçan dinozor inmiş. Yolu ben yukarıdan gösteririm, demiş.'],
  'uzun-boyun': ['Bir zamanlar boynu ağaçlar kadar uzun, sevimli bir dinozor varmış. En tepedeki yaprakları bile yiyebilirmiş.', 'Derken boynu ağaçlar kadar uzun bir dinozor eğilip merhaba demiş. O da onlarla gelmek istemiş.'],
  volkan: ['Bir zamanlar dinozor adasında, ateş yerine renkli şekerler fışkırtan şirin bir volkan varmış.', 'Yolda şirin bir volkanın yanından geçmişler. Volkan sevinçle havaya renkli şekerler fışkırtmış.'],
  // Doğa
  agac: ['Bir zamanlar bahçede, dalları kırmızı elmalarla dolu kocaman bir elma ağacı varmış. Gölgesinde herkesi dinlendirirmiş.', 'Yolda dalları elmalarla dolu bir ağaç görmüşler. Ağaç onlara en güzel elmalarından ikram etmiş.'],
  ari: ['Bir zamanlar çiçeklerin arasında, vız vız uçan çalışkan bir bal arısı yaşarmış. Herkese tatlı bal dağıtırmış.', 'Derken vız vız uçan çalışkan bir bal arısı çıkagelmiş. Herkese birer kaşık bal verip onlara katılmış.'],
  aycicegi: ['Bir zamanlar tarlada, yüzünü hep güneşe dönen uzun boylu bir ayçiçeği varmış. Gülümsemesi güneş kadar parlakmış.', 'Tarlada yüzünü güneşe dönmüş bir ayçiçeği görmüşler. Ayçiçeği başını sallayıp onlara iyi yolculuklar dilemiş.'],
  cicek: ['Bir zamanlar çayırda, beyaz yapraklı küçük bir papatya varmış. Her sabah çiğ damlalarıyla yüzünü yıkarmış.', 'Yolun kenarında beyaz yapraklı bir papatya görmüşler. Papatya onlara güzel kokusunu armağan etmiş.'],
  gokkusagi: ['Bir zamanlar yağmurdan sonra gökyüzünde beliren rengarenk bir gökkuşağı varmış. Herkesi renkleriyle sevindirirmiş.', 'Derken gökyüzünde rengarenk bir gökkuşağı belirmiş. Gökkuşağı onlara renkli bir köprü olmuş.'],
  'gunes-bulut': ['Bir zamanlar gökyüzünde birbirini çok seven bir güneş ile bir bulut yaşarmış. Biri ısıtır, biri gölge yaparmış.', 'Gökyüzünde gülümseyen bir güneş ile pamuk gibi bir bulut görmüşler. İkisi de onlara yolda eşlik etmiş.'],
  kaktus: ['Bir zamanlar pencerenin önünde, dikenli ama çok sevimli bir kaktüs varmış. Az suyla bile mutlu olurmuş.', 'Derken saksısıyla zıplayan sevimli bir kaktüs görmüşler. Dikenlerime dikkat edin, deyip onlara katılmış.'],
  kelebek: ['Bir zamanlar çiçekten çiçeğe uçan, kanatları rengarenk bir kelebek varmış. Kanatlarını her çırptığında renkler saçılırmış.', 'Az sonra kanatları rengarenk bir kelebek gelip omuzlarına konmuş. O da onlarla uçmak istemiş.'],
  lale: ['Bir zamanlar bahçede, kırmızı yapraklı zarif bir lale varmış. Baharın gelişini herkese o haber verirmiş.', 'Yolda kırmızı yapraklı zarif bir lale görmüşler. Lale, bahar geldi, diye onlara gülümsemiş.'],
  mantar: ['Bir zamanlar ormanda, şapkası benekli küçük bir mantar varmış. Şapkasının altında yağmurdan saklananlara yer açarmış.', 'Derken şapkası benekli küçük bir mantar görmüşler. Mantar onları şapkasının altında biraz dinlendirmiş.'],
  yaprak: ['Bir zamanlar sonbaharda, dalından süzülerek dans eden turuncu bir yaprak varmış. Rüzgarla uçmayı çok severmiş.', 'Rüzgarla süzülen turuncu bir yaprak önlerine konmuş. Yaprak da rüzgarla dans ederek onlara katılmış.'],
  // Hayvanlar
  aslan: ['Bir zamanlar ormanda, yelesi güneş gibi parlayan cesur bir aslan yaşarmış. Kükremesi güçlü ama kalbi çok yumuşakmış.', 'Derken yelesi güneş gibi parlayan bir aslan çıkagelmiş. Güçlü bir sesle kükreyip ben de geliyorum, demiş.'],
  ayi: ['Bir zamanlar yumuşacık, sarılmayı çok seven bir oyuncak ayı varmış. Herkese kocaman sarılırmış.', 'Az sonra yumuşacık bir oyuncak ayı görmüşler. Herkese kocaman sarılıp onlara katılmış.'],
  balik: ['Bir zamanlar derede, pulları parıl parıl parlayan minik bir balık yaşarmış. Hızlı yüzmeyi çok severmiş.', 'Derenin içinden pulları parlayan minik bir balık zıplamış. Ben de geliyorum, diye yüzerek onlara katılmış.'],
  baykus: ['Bir zamanlar ormanda, kocaman gözlü bilge bir baykuş yaşarmış. Geceleri yıldızları sayarmış.', 'Derken bir dalın üstünde kocaman gözlü bilge bir baykuş görmüşler. Baykuş onlara yolu göstermek için peşlerine takılmış.'],
  fil: ['Bir zamanlar savanada, hortumu uzun minik bir fil yaşarmış. Hortumuyla su püskürtüp herkesi serinletirmiş.', 'Az sonra hortumunu sallayan minik bir fil görmüşler. Herkese su püskürtüp kıkırdayarak onlara katılmış.'],
  kaplumbaga: ['Bir zamanlar evini sırtında taşıyan yavaş ama çok sabırlı bir kaplumbağa yaşarmış.', 'Yolda ağır ağır yürüyen sabırlı bir kaplumbağa görmüşler. Beni bekleyin, ben de geliyorum, demiş.'],
  kedi: ['Bir zamanlar pamuk gibi yumuşacık, sevimli bir kedi varmış. En sevdiği şey güneşte uyumakmış.', 'Derken kuyruğunu sallayan sevimli bir kedi çıkagelmiş. Miyav, ben de gelebilir miyim, diye sormuş.'],
  kopek: ['Bir zamanlar kuyruğunu hiç durmadan sallayan sadık bir köpek varmış. Arkadaşlarını hiç yalnız bırakmazmış.', 'Az sonra kuyruğunu sallayan sadık bir köpek koşa koşa gelmiş. Hav hav diye havlayıp onlara katılmış.'],
  kurbaga: ['Bir zamanlar gölün kenarında, zıpzıp zıplayan yeşil bir kurbağa yaşarmış. Vrak vrak diye şarkı söylermiş.', 'Derken gölden zıplayan yeşil bir kurbağa çıkmış. Vrak vrak, beni de alın, demiş.'],
  panda: ['Bir zamanlar bambu ormanında, tombul ve çok tatlı bir panda yaşarmış. Bambu yemeyi ve takla atmayı severmiş.', 'Bambuların arasından tombul bir panda yuvarlanarak gelmiş. Takla atıp onlara katılmış.'],
  penguen: ['Bir zamanlar buzulların üstünde, paytak paytak yürüyen sevimli bir penguen yaşarmış.', 'Derken buzların üstünde kayarak gelen sevimli bir penguen görmüşler. Paytak paytak yürüyüp onlara katılmış.'],
  tavsan: ['Bir zamanlar çayırda, kulakları upuzun bir tavşan yaşarmış. Havuç yemeyi ve hoplamayı çok severmiş.', 'Az sonra hoplaya zıplaya uzun kulaklı bir tavşan gelmiş. Herkese birer havuç verip onlara katılmış.'],
  tilki: ['Bir zamanlar ormanda, kuyruğu kabarık, çok zeki bir tilki yaşarmış. Bilmeceler sormayı çok severmiş.', 'Derken kuyruğu kabarık zeki bir tilki çıkagelmiş. Size yolda bilmeceler sorarım, deyip onlara katılmış.'],
  zurafa: ['Bir zamanlar savanada, boynu upuzun sevimli bir zürafa yaşarmış. Bulutlara bile uzanabilirmiş.', 'Az sonra boynu upuzun bir zürafa görmüşler. Yolu ben yukarıdan görürüm, deyip onlara katılmış.'],
  // İş makineleri
  'beton-mikseri': ['Bir zamanlar şantiyede, kazanı fırıl fırıl dönen çalışkan bir beton mikseri varmış.', 'Derken kazanı fırıl fırıl dönen bir beton mikseri gelmiş. Yolda size köprü yaparım, demiş.'],
  'cop-kamyonu': ['Bir zamanlar şehirde, her yeri tertemiz yapan yardımsever bir çöp kamyonu varmış.', 'Az sonra yolları temizleyen yardımsever bir çöp kamyonu görmüşler. O da onlarla gelmek istemiş.'],
  dozer: ['Bir zamanlar şantiyede, önündeki kocaman bıçakla toprağı düzelten güçlü bir buldozer varmış.', 'Derken güçlü bir buldozer gelip önlerindeki taşları kenara itmiş. Yol açıldı, haydi gidelim, demiş.'],
  forklift: ['Bir zamanlar depoda, çatalıyla ağır kutuları kaldıran becerikli bir forklift varmış.', 'Az sonra çatalıyla kutuları kaldıran bir forklift görmüşler. Yüklerinizi ben taşırım, deyip onlara katılmış.'],
  itfaiye: ['Bir zamanlar şehirde, merdiveni uzun, kırmızı bir itfaiye aracı varmış. Herkese yardım etmeye hep hazırmış.', 'Derken siren çalarak kırmızı bir itfaiye aracı gelmiş. Bir ihtiyacınız olursa ben buradayım, demiş.'],
  kamyon: ['Bir zamanlar şantiyede, damperini kaldırıp kum boşaltan kocaman bir kamyon varmış.', 'Az sonra damperi kumla dolu bir kamyon gelmiş. Hepinizi arkama alırım, deyip onlara katılmış.'],
  kepce: ['Bir zamanlar şantiyede, kocaman koluyla toprak kazan çalışkan bir kepçe varmış.', 'Derken kocaman koluyla toprak kazan bir kepçe görmüşler. Kepçesini sallayarak onlara katılmış.'],
  silindir: ['Bir zamanlar yollarda, kocaman silindiriyle yolları dümdüz yapan bir yol silindiri varmış.', 'Az sonra yolları düzelten bir silindir gelmiş. Önünüzdeki yolu dümdüz yaparım, demiş.'],
  traktor: ['Bir zamanlar köyde, tarlaları süren güçlü ve neşeli bir traktör varmış.', 'Derken tarladan neşeli bir traktör gelmiş. Hepinizi römorkuma bindiririm, deyip onlara katılmış.'],
  vinc: ['Bir zamanlar şantiyede, gökyüzüne uzanan upuzun bir kule vinç varmış. Ağır yükleri havaya kaldırırmış.', 'Az sonra gökyüzüne uzanan bir kule vinç görmüşler. Vinç onları yukarı kaldırıp çevreyi göstermiş.'],
  // Karakterler
  canavar: ['Bir zamanlar yatağın altında, hiç de korkunç olmayan tüylü, sevimli bir canavar yaşarmış.', 'Derken tüylü, sevimli bir canavar çıkagelmiş. Ben korkutmam, sadece arkadaş isterim, demiş.'],
  hayalet: ['Bir zamanlar eski bir evde, bö demek yerine merhaba diyen sevimli bir hayalet yaşarmış.', 'Az sonra süzülerek sevimli bir hayalet gelmiş. Bö yerine merhaba deyip onlara katılmış.'],
  kahraman: ['Bir zamanlar pelerini rüzgarda dalgalanan, herkese yardım eden bir süper kahraman varmış.', 'Derken gökyüzünden pelerinli bir süper kahraman inmiş. Yardıma hazırım, deyip onlara katılmış.'],
  korsan: ['Bir zamanlar denizlerde, altın yerine arkadaşlık biriktiren minik bir korsan yaşarmış.', 'Az sonra şapkalı minik bir korsan gelmiş. Ahoy arkadaşlar, ben de geliyorum, demiş.'],
  peri: ['Bir zamanlar çiçeklerin arasında, sihirli değneğiyle her yere ışıltı saçan bir peri kız yaşarmış.', 'Derken ışıltılar saçan bir peri kız belirmiş. Sihirli değneğini sallayıp onlara katılmış.'],
  prenses: ['Bir zamanlar şatoda, maceraya bayılan cesur bir prenses yaşarmış.', 'Az sonra tacı parıldayan cesur bir prenses gelmiş. Ben de maceraya katılmak istiyorum, demiş.'],
  robot: ['Bir zamanlar düğmeleri yanıp sönen, bip bip diye konuşan neşeli bir robot varmış.', 'Derken bip bip diye konuşan neşeli bir robot çıkagelmiş. Yol hesaplanıyor, deyip onlara katılmış.'],
  sovalye: ['Bir zamanlar parlak zırhlı, kalbi iyilikle dolu cesur bir şövalye yaşarmış.', 'Az sonra parlak zırhlı cesur bir şövalye gelmiş. Sizi ben koruyacağım, deyip onlara katılmış.'],
  uzayli: ['Bir zamanlar uzak bir gezegenden gelen, uzay gemisiyle dolaşan sevimli bir uzaylı varmış.', 'Derken gökyüzünden bir uzay gemisi inmiş. İçinden sevimli bir uzaylı çıkıp merhaba dünyalılar, demiş.'],
  // Nesneler
  araba: ['Bir zamanlar düt düt diye korna çalan minik, kırmızı bir araba varmış. Yolculuğa çıkmayı çok severmiş.', 'Derken düt düt diye korna çalan minik bir araba gelmiş. Atlayın, sizi götüreyim, demiş.'],
  balon: ['Bir zamanlar rüzgarla gökyüzüne yükselen rengarenk balonlar varmış. Bulutlara dokunmayı hayal ederlermiş.', 'Az sonra gökyüzünden rengarenk balonlar süzülmüş. Herkes bir balon tutup onlarla birlikte yürümüş.'],
  'boya-kalemleri': ['Bir zamanlar her rengi ayrı, bir kutu dolusu neşeli boya kalemi varmış. Birlikte gökkuşakları çizerlermiş.', 'Derken bir kutu dolusu neşeli boya kalemi çıkagelmiş. Yolu rengarenk boyayarak onlara katılmışlar.'],
  canta: ['Bir zamanlar içi kitaplarla dolu, okula gitmeyi çok seven bir okul çantası varmış.', 'Az sonra içi kitaplarla dolu bir okul çantası görmüşler. Ben de bir şeyler öğrenmek istiyorum, deyip onlara katılmış.'],
  cupcake: ['Bir zamanlar pastanede, üstü kremalı, mis gibi kokan küçük bir kek varmış.', 'Derken mis gibi kokan, üstü kremalı bir kek görmüşler. Kek de onlarla partiye gelmek istemiş.'],
  dondurma: ['Bir zamanlar sıcak bir yaz gününde, gülümseyen soğuk bir dondurma varmış. Erimeden önce gezmek istermiş.', 'Az sonra gülümseyen bir dondurma gelmiş. Erimeden önce ben de gezmek istiyorum, demiş.'],
  ev: ['Bir zamanlar tepenin üstünde, bacası tüten şirin bir ev varmış. Kapısı herkese açıkmış.', 'Yolda bacası tüten şirin bir ev görmüşler. Ev kapısını açıp onlara biraz dinlenmeleri için yer vermiş.'],
  hediye: ['Bir zamanlar fiyonklu, içinde koca bir sürpriz saklayan bir hediye kutusu varmış.', 'Derken fiyonklu bir hediye kutusu görmüşler. Kutu, beni sonra açın, deyip onlara katılmış.'],
  kupa: ['Bir zamanlar soğuk bir kış gününde, içi sıcacık kakaoyla dolu gülümseyen bir kupa varmış.', 'Az sonra dumanı tüten sıcacık bir kupa görmüşler. Herkesi ısıtıp onlara katılmış.'],
  'pasta-dilimi': ['Bir zamanlar tabağın üstünde, tepesinde kırmızı bir çilek olan nefis bir pasta dilimi varmış.', 'Derken tepesinde çilek olan nefis bir pasta dilimi görmüşler. O da tatlı tatlı gülümseyip onlara katılmış.'],
  // Özel günler
  'anneler-gunu': ['Bir zamanlar içi sevgi dolu sözlerle yazılmış, kalpli bir anneler günü kartı varmış.', 'Az sonra kalpli bir anneler günü kartı bulmuşlar. Kartı en sevdikleri kişiye vermek için yanlarına almışlar.'],
  balkabagi: ['Bir zamanlar tarlada, kocaman gülümseyen turuncu bir balkabağı varmış.', 'Derken kocaman gülümseyen turuncu bir balkabağı yuvarlanarak gelmiş. O da onlarla gelmek istemiş.'],
  'dogum-gunu': ['Bir zamanlar mumları ışıl ışıl yanan, kat kat bir doğum günü pastası varmış.', 'Az sonra mumları yanan bir doğum günü pastası görmüşler. Hep birlikte bir dilek tutmuşlar.'],
  'kardan-adam': ['Bir zamanlar karlı bir bahçede, havuç burunlu, atkılı bir kardan adam varmış.', 'Derken havuç burunlu bir kardan adam kayarak gelmiş. Ben de geliyorum, ama güneşe dikkat, demiş.'],
  kravat: ['Bir zamanlar babasını çok seven birinin hazırladığı, desenli şık bir kravat varmış.', 'Az sonra desenli şık bir kravat bulmuşlar. Babalarına hediye etmek için yanlarına almışlar.'],
  'ogretmen-elma': ['Bir zamanlar öğretmenine hediye edilmeyi bekleyen kıpkırmızı, parlak bir elma varmış.', 'Derken kıpkırmızı parlak bir elma görmüşler. Öğretmenlerine götürmek için onu da yanlarına almışlar.'],
  'turk-bayragi': ['Bir zamanlar okulun bahçesinde, rüzgarda gururla dalgalanan al bayrağımız varmış.', 'Az sonra rüzgarda dalgalanan al bayrağımızı görmüşler. Hep birlikte ona selam vermişler.'],
  ucurtma: ['Bir zamanlar 23 Nisan gününde, gökyüzünde süzülen rengarenk bir uçurtma varmış.', 'Derken gökyüzünde rengarenk bir uçurtma belirmiş. İpini tutup onunla birlikte koşmuşlar.'],
  'yilbasi-agaci': ['Bir zamanlar ışıl ışıl süslerle donatılmış, tepesinde yıldız olan bir yılbaşı ağacı varmış.', 'Az sonra ışıl ışıl süslü bir yılbaşı ağacı görmüşler. Ağaç onlara parlak bir yıldız armağan etmiş.'],
  // Taşıtlar
  bisiklet: ['Bir zamanlar zili zırr diye çalan, pedalları fırıl fırıl dönen bir bisiklet varmış.', 'Derken zilini çalarak bir bisiklet gelmiş. Zırr zırr, ben de geliyorum, demiş.'],
  denizalti: ['Bir zamanlar denizin derinliklerini gezen sarı bir denizaltı varmış. Yuvarlak pencerelerinden balıkları izlermiş.', 'Az sonra sudan sarı bir denizaltı çıkmış. Pencerelerinden el sallayıp onlara katılmış.'],
  'hava-balonu': ['Bir zamanlar gökyüzünde süzülen, rengarenk bir sıcak hava balonu varmış. Sepetinden bütün dünyayı görürmüş.', 'Derken gökyüzünden rengarenk bir sıcak hava balonu inmiş. Sepetime binin, demiş.'],
  helikopter: ['Bir zamanlar pervaneleri fır fır dönen, yardımsever bir helikopter varmış.', 'Az sonra pervaneleri fır fır dönen bir helikopter gelmiş. Size yukarıdan yol gösteririm, demiş.'],
  otobus: ['Bir zamanlar çocukları her sabah okula götüren sarı, neşeli bir okul otobüsü varmış.', 'Derken sarı, neşeli bir okul otobüsü durmuş. Kapılarını açıp haydi binin, demiş.'],
  roket: ['Bir zamanlar yıldızlara gitmeyi hayal eden parlak bir uzay roketi varmış.', 'Az sonra parlak bir uzay roketi görmüşler. Geri sayım başladı, deyip onlara katılmış.'],
  tren: ['Bir zamanlar çuf çuf diye öten, vagonları rengarenk neşeli bir tren varmış.', 'Derken çuf çuf diye öten neşeli bir tren gelmiş. Herkes bir vagona binip yolculuğa devam etmiş.'],
  ucak: ['Bir zamanlar bulutların arasında süzülen minik bir uçak varmış. Kanatlarıyla kuşlara selam verirmiş.', 'Az sonra bulutların arasından minik bir uçak inmiş. Kanatlarını sallayıp onlara katılmış.'],
  yelkenli: ['Bir zamanlar mavi denizlerde, yelkenleri rüzgarla dolan küçük bir yelkenli tekne varmış.', 'Derken yelkenleri rüzgarla dolmuş bir tekne görmüşler. Haydi denize açılalım, demiş.'],
  // Temeller
  cizgiler: ['Bir zamanlar bahçenin kenarında, tahtaları rengarenk boyanmış neşeli bir çit varmış.', 'Yolda rengarenk boyanmış bir çit görmüşler. Çit onlara neşeyle el sallamış.'],
  daireler: ['Bir zamanlar yapraklar arasında, yuvarlak yuvarlak gövdeli tombul bir tırtıl yaşarmış.', 'Derken yuvarlak gövdeli tombul bir tırtıl kıvrılarak gelmiş. O da onlarla gelmek istemiş.'],
  dalgalar: ['Bir zamanlar dağların eteğinde, dalgaları hiç durmayan masmavi bir deniz varmış.', 'Az sonra karşılarına dağlar ve masmavi bir deniz çıkmış. Dalgalar onlara selam vermiş.'],
  kalpler: ['Bir zamanlar sevgi dolu, pıt pıt atan kocaman kalpler varmış. Herkese sevgi dağıtırlarmış.', 'Derken havada uçuşan kalpler görmüşler. Kalpler herkesin yüzünü gülümsetmiş.'],
  sekiller: ['Bir zamanlar kare, üçgen ve dikdörtgenlerden yapılmış şirin bir ev varmış.', 'Az sonra şekillerden yapılmış şirin bir ev görmüşler. Evin penceresi onlara göz kırpmış.'],
  spiral: ['Bir zamanlar evini sırtında taşıyan, kabuğu kıvrım kıvrım neşeli bir salyangoz yaşarmış.', 'Derken kabuğu kıvrım kıvrım neşeli bir salyangoz görmüşler. Yavaş yavaş da olsa onlara katılmış.'],
  yildiz: ['Bir zamanlar gökyüzünde, gülümseyen parlak bir yıldız varmış. Gece olunca herkese ışık tutarmış.', 'Az sonra gökten gülümseyen parlak bir yıldız inmiş. Yollarını aydınlatıp onlara katılmış.'],
  yuzler: ['Bir zamanlar bir kâğıdın üstünde, hep birlikte gülümseyen neşeli yüzler varmış.', 'Derken bir sürü gülen yüz görmüşler. Gülen yüzler onlara da gülümsemiş.'],
};

/** Ders dışı (serbest) çizim için. */
export const FREE_LINES: [string, string] = [
  'Bir zamanlar rengarenk çizgilerden yapılmış, çok özel bir resim varmış.',
  'Derken rengarenk, sihirli bir resim çıkagelmiş. Ben de gelebilir miyim, diye sormuş.',
];

export const linesFor = (lessonId?: string): [string, string] => (lessonId && STORY_LINES[lessonId]) || FREE_LINES;

/** Masalın sayfaları: her sayfa bir resim ve sırayla okunacak cümleler. Son sayfada bütün resimler birlikte. */
export function buildStory(arts: { lessonId?: string }[], theme: StoryTheme): { art: number | 'all'; lines: string[] }[] {
  const pages: { art: number | 'all'; lines: string[] }[] = [];
  arts.forEach((a, i) => {
    const [hero, friend] = linesFor(a.lessonId);
    if (i === 0) pages.push({ art: 0, lines: [STORY_OPEN, hero, theme.setup] });
    else pages.push({ art: i, lines: [friend, theme.middle[(i - 1) % theme.middle.length]] });
  });
  pages.push({ art: 'all', lines: [theme.ending, STORY_CLOSE] });
  return pages;
}

/** Seslendirilecek bütün sabit masal cümleleri (src/voice/lines.ts). */
export const STORY_VOICE_LINES: string[] = [
  STORY_OPEN, STORY_CLOSE, STORY_START, STORY_PICK, STORY_THEME_PICK,
  ...THEMES.flatMap((t) => [t.setup, ...t.middle, t.ending]),
  ...Object.values(STORY_LINES).flat(),
  ...FREE_LINES,
];
